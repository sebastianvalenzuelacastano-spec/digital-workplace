import fs from 'fs';
import path from 'path';

// The global dbPath and its initialization logic are removed as per the new readDb implementation.

export function readDb() {
    // Use persistent DB if configured, otherwise default
    const dbPath = process.env.DB_PATH || path.join(process.cwd(), 'src/data/db.json');

    // If persistent DB path is configured but doesn't exist, initialize it from default
    if (process.env.DB_PATH && !fs.existsSync(dbPath)) {
        const defaultDbPath = path.join(process.cwd(), 'src/data/db.json');
        try {
            const defaultDb = JSON.parse(fs.readFileSync(defaultDbPath, 'utf-8'));
            fs.writeFileSync(dbPath, JSON.stringify(defaultDb, null, 2));
            console.log('readDb: initialized persistent DB from default');
        } catch (error) {
            console.error('readDb: Error initializing persistent DB:', error);
            // Fallback to default DB if initialization fails
            return JSON.parse(fs.readFileSync(defaultDbPath, 'utf-8'));
        }
        return JSON.parse(data);
    } catch (error) {
        console.error('readDb error:', error);
        return null;
    }
};

export const writeDb = (data: any) => {
    console.log('writeDb called - insumoTransactions count:', data.insumoTransactions?.length);
    console.log('writeDb - first transaction:', data.insumoTransactions?.[0]?.factura);
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    console.log('writeDb - file written successfully');
};
