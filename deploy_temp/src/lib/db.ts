import fs from 'fs';
import path from 'path';

export function readDb() {
    // Use persistent DB if configured, otherwise default
    const dbPath = process.env.DB_PATH || path.join(process.cwd(), 'src/data/db.json');

    // If persistent DB path is configured but doesn't exist, initialize it from default
    if (process.env.DB_PATH && !fs.existsSync(dbPath)) {
        const defaultDbPath = path.join(process.cwd(), 'src/data/db.json');
        const defaultDb = JSON.parse(fs.readFileSync(defaultDbPath, 'utf-8'));
        fs.writeFileSync(dbPath, JSON.stringify(defaultDb, null, 2));
        console.log('readDb: initialized persistent DB from default');
    }

    console.log('readDb: reading fresh from disk');
    const data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

    // Ensure productos table exists (for backwards compatibility)
    if (!data.productos) {
        console.log('readDb: initializing missing productos table');
        data.productos = [];
        writeDb(data);
    }

    return data;
}

export function writeDb(data: any) {
    const dbPath = process.env.DB_PATH || path.join(process.cwd(), 'src/data/db.json');
    console.log('writeDb called');
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    console.log('writeDb - file written successfully');
}
