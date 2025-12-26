
import fs from 'fs';
import path from 'path';
import { Database } from './kv';
import { hashPassword } from './auth';

const DB_PATH = path.join(process.cwd(), 'data/db.json');

/**
 * Ensure the directory exists
 */
function ensureDirectory() {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

/**
 * Read the database from local JSON file
 */
export async function readDb(): Promise<Database | null> {
    try {
        if (!fs.existsSync(DB_PATH)) {
            // If file doesn't exist, initialize it
            await initializeDb();
        }

        const fileContent = await fs.promises.readFile(DB_PATH, 'utf-8');
        const db = JSON.parse(fileContent);

        // Auto-fix: Inject admin if missing
        if (!db.users || db.users.length === 0) {
            console.log('Detectada DB sin usuarios. Inyectando administrador...');
            await initializeDb();
            // Re-read after init
            const newContent = await fs.promises.readFile(DB_PATH, 'utf-8');
            return JSON.parse(newContent);
        }

        return db;
    } catch (error) {
        console.error('Error reading local DB:', error);
        return null;
    }
}

/**
 * Write the database to local JSON file atomically
 * Writes to a temp file first, then renames to avoid partial writes/corruption
 */
export async function writeDb(data: Database): Promise<boolean> {
    const TEMP_PATH = `${DB_PATH}.tmp`;
    try {
        ensureDirectory();
        // Write to temp file first
        await fs.promises.writeFile(TEMP_PATH, JSON.stringify(data, null, 2), 'utf-8');
        // Atomic rename
        await fs.promises.rename(TEMP_PATH, DB_PATH);
        return true;
    } catch (error) {
        console.error('Error writing local DB:', error);
        return false;
    }
}

/**
 * Initialize database with default structure if empty
 */
export async function initializeDb(): Promise<void> {
    // Check if file exists mainly to avoid overwrite
    let existing: Database | null = null;
    let fileExists = false;

    try {
        if (fs.existsSync(DB_PATH)) {
            fileExists = true;
            const content = fs.readFileSync(DB_PATH, 'utf-8');
            // Verify content is not empty
            if (content.trim()) {
                existing = JSON.parse(content);
            }
        }
    } catch (e) {
        console.error('Error reading DB for init:', e);
        // CRITICAL: If file exists but read failed, DO NOT OVERWRITE.
        if (fileExists) return;
    }

    const hashedPassword = await hashPassword('2426Seba');
    const adminUser = {
        id: 1,
        username: 'gerencia',
        email: 'gerencia@panificadora.cl',
        password: hashedPassword,
        role: 'manager',
        nombre: 'Administrador',
        permissions: ['all']
    };

    if (!existing && !fileExists) {
        // Only verify Create fresh DB if file physically does not exist
        const defaultDb: Database = {
            users: [adminUser],
            orders: [],
            ventas: [],
            payments: [],
            rendimientos: [],
            insumoTransactions: [],
            bankTransactions: [],
            cajaChica: [],
            maestroAreas: [],
            maestroInsumos: [],
            gastosGenerales: [],
            maestroClientes: [],
            maestroProveedores: [],
            maestroTrabajadores: [],
            equipos: [],
            mantenimientos: [],
            vehiculos: [],
            mantenimientosVehiculos: [],
            empresasClientes: [],
            casinosSucursales: [],
            productosCatalogo: [],
            preciosClientes: [],
            pedidosClientes: [],
            detallesPedidos: [],
            colegios: [],
        };
        await writeDb(defaultDb);
    } else if (existing && (!existing.users || existing.users.length === 0)) {
        // Inject admin into existing DB
        existing.users = [adminUser];
        await writeDb(existing);
    }
}

/**
 * Get a specific collection from the database
 */
export async function getCollection(collectionName: string): Promise<any[]> {
    const db = await readDb();
    return db?.[collectionName] || [];
}

/**
 * Update a specific collection in the database
 */
export async function updateCollection(collectionName: string, data: any[]): Promise<boolean> {
    const db = await readDb();
    if (!db) return false;

    db[collectionName] = data;
    return await writeDb(db);
}
