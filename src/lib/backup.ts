import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'src/data/db.json');
const backupDir = path.join(process.cwd(), 'src/data/backups');

/**
 * Create a backup of the database
 * Returns the backup filename
 */
export const createBackup = (): string => {
    // Ensure backup directory exists
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }

    // Read current database
    const dbData = fs.readFileSync(dbPath, 'utf-8');

    // Create timestamp-based filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFilename = `db_backup_${timestamp}.json`;
    const backupPath = path.join(backupDir, backupFilename);

    // Write backup file
    fs.writeFileSync(backupPath, dbData);

    // Clean up old backups (keep last 30)
    cleanOldBackups(30);

    return backupFilename;
};

/**
 * List all available backups
 */
export const listBackups = (): { filename: string; date: string; size: number }[] => {
    if (!fs.existsSync(backupDir)) {
        return [];
    }

    const files = fs.readdirSync(backupDir)
        .filter(f => f.startsWith('db_backup_') && f.endsWith('.json'))
        .map(filename => {
            const filePath = path.join(backupDir, filename);
            const stats = fs.statSync(filePath);
            return {
                filename,
                date: stats.mtime.toISOString(),
                size: stats.size
            };
        })
        .sort((a, b) => b.date.localeCompare(a.date)); // Newest first

    return files;
};

/**
 * Restore a specific backup
 */
export const restoreBackup = (filename: string): boolean => {
    const backupPath = path.join(backupDir, filename);

    if (!fs.existsSync(backupPath)) {
        return false;
    }

    // Create a backup of current state before restoring
    createBackup();

    // Read backup and write to main db
    const backupData = fs.readFileSync(backupPath, 'utf-8');
    fs.writeFileSync(dbPath, backupData);

    return true;
};

/**
 * Clean up old backups, keeping only the most recent 'keepCount' backups
 */
const cleanOldBackups = (keepCount: number): void => {
    if (!fs.existsSync(backupDir)) return;

    const files = fs.readdirSync(backupDir)
        .filter(f => f.startsWith('db_backup_') && f.endsWith('.json'))
        .map(filename => {
            const filePath = path.join(backupDir, filename);
            const stats = fs.statSync(filePath);
            return { filename, mtime: stats.mtime };
        })
        .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

    // Delete files beyond keepCount
    files.slice(keepCount).forEach(file => {
        fs.unlinkSync(path.join(backupDir, file.filename));
    });
};
