import { kv } from '@vercel/kv';

const DB_KEY = 'panificadora:db';

// Your backup data from Dec 21
const backupData = {
    "users": [
        {
            "id": 1,
            "username": "admin",
            "password": "$2a$10$8vZ9YqJ5X3nQ7wK2mL4pXeH6tR9sC1dF5gT8hU3jV6kW2nM9oP0qS",
            "role": "manager",
            "email": "admin@pansansebastian.cl"
        }
    ],
    "maestroTrabajadores": [],
    "empresasClientes": [],
    "casinosSucursales": [],
    "productosCatalogo": [],
    "preciosClientes": [],
    "pedidosClientes": [],
    "detallesPedidos": [],
    "orders": [],
    "ventas": [],
    "payments": [],
    "rendimientos": [],
    "insumoTransactions": [],
    "bankTransactions": [],
    "cajaChica": [],
    "maestroAreas": [],
    "maestroInsumos": [],
    "gastosGenerales": [],
    "maestroClientes": [],
    "maestroProveedores": [],
    "equipos": [],
    "mantenimientos": [],
    "vehiculos": [],
    "mantenimientosVehiculos": []
};

async function loadData() {
    try {
        console.log('Loading data to KV...');
        await kv.set(DB_KEY, backupData);
        console.log('✅ Data loaded successfully!');

        // Verify
        const stored = await kv.get(DB_KEY);
        console.log('✅ Verified:', stored ? 'Data exists' : 'No data');
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

loadData();
