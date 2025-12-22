import { kv } from '@vercel/kv';

// Database key
const DB_KEY = 'panificadora:db';

// Type for the entire database
export interface Database {
    users?: any[];
    orders?: any[];
    ventas?: any[];
    payments?: any[];
    rendimientos?: any[];
    insumoTransactions?: any[];
    bankTransactions?: any[];
    cajaChica?: any[];
    maestroAreas?: any[];
    maestroInsumos?: any[];
    gastosGenerales?: any[];
    maestroClientes?: any[];
    maestroProveedores?: any[];
    maestroTrabajadores?: any[];
    equipos?: any[];
    mantenimientos?: any[];
    vehiculos?: any[];
    mantenimientosVehiculos?: any[];
    empresasClientes?: any[];
    casinosSucursales?: any[];
    productosCatalogo?: any[];
    preciosClientes?: any[];
    pedidosClientes?: any[];
    detallesPedidos?: any[];
    [key: string]: any;
}

/**
 * Read the entire database from Vercel KV
 */
export async function readDb(): Promise<Database | null> {
    try {
        const data = await kv.get<Database>(DB_KEY);
        return data;
    } catch (error) {
        console.error('Error reading from Vercel KV:', error);
        return null;
    }
}

/**
 * Write the entire database to Vercel KV
 */
export async function writeDb(data: Database): Promise<boolean> {
    try {
        await kv.set(DB_KEY, data);
        return true;
    } catch (error) {
        console.error('Error writing to Vercel KV:', error);
        return false;
    }
}

/**
 * Initialize database with default structure if empty
 */
export async function initializeDb(): Promise<void> {
    const existing = await readDb();
    if (!existing) {
        const defaultDb: Database = {
            users: [],
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
        };
        await writeDb(defaultDb);
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
