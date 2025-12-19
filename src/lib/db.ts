import fs from 'fs';
import path from 'path';

const dbPath = process.env.DB_PATH || path.join(process.cwd(), 'src/data/db.json');

export const readDb = () => {
    try {
        if (!fs.existsSync(dbPath)) {
            console.log('readDb: file does not exist');
            return null;
        }
        // Always read fresh from disk - no caching
        const data = fs.readFileSync(dbPath, 'utf-8');
        console.log('readDb: reading fresh from disk');
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
