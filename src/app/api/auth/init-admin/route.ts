import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import bcrypt from 'bcryptjs';

// GET endpoint to reset/initialize admin user in production
// Access via: /api/auth/init-admin?key=RESET_2426
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const key = searchParams.get('key');

        // Simple security - require a key to reset
        if (key !== 'RESET_2426') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash('2426Seba', 10);

        // Create admin user
        const adminUser = {
            id: 1,
            username: 'gerencia',
            email: 'gerencia@panificadora.cl',
            password: hashedPassword,
            role: 'manager',
            nombre: 'Administrador',
            permissions: ['all']
        };

        // Get current database
        let db = await kv.get('panificadora_db');

        if (!db || typeof db !== 'object') {
            // Initialize fresh database
            db = {
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
                reclamos: []
            };
        } else {
            // Update existing database - add/update admin user
            const dbObj = db as any;
            if (!dbObj.users) dbObj.users = [];

            // Find and update or add admin
            const adminIndex = dbObj.users.findIndex((u: any) => u.username === 'gerencia');
            if (adminIndex >= 0) {
                dbObj.users[adminIndex] = adminUser;
            } else {
                dbObj.users.push(adminUser);
            }

            // Ensure colegios and reclamos collections exist
            if (!dbObj.colegios) dbObj.colegios = [];
            if (!dbObj.reclamos) dbObj.reclamos = [];

            db = dbObj;
        }

        // Save to Vercel KV
        await kv.set('panificadora_db', db);

        return NextResponse.json({
            success: true,
            message: 'Admin user initialized/reset successfully',
            username: 'gerencia',
            password: '2426Seba'
        });

    } catch (error) {
        console.error('Error initializing admin:', error);
        return NextResponse.json({
            error: 'Failed to initialize admin',
            details: String(error)
        }, { status: 500 });
    }
}
