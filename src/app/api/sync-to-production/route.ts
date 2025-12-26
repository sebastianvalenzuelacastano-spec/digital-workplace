import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

// Database key - MUST match the one in src/lib/kv.ts
const DB_KEY = 'panificadora:db';

// POST endpoint to sync data from local to Vercel KV
// Send the entire db.json in the body
export async function POST(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const key = searchParams.get('key');

        // Security - require key
        if (key !== 'SYNC_2426') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();

        if (!data || typeof data !== 'object') {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }

        // Save to Vercel KV
        await kv.set(DB_KEY, data);

        // Get summary of what was synced
        const summary = {
            users: data.users?.length || 0,
            empresasClientes: data.empresasClientes?.length || 0,
            casinosSucursales: data.casinosSucursales?.length || 0,
            productosCatalogo: data.productosCatalogo?.length || 0,
            preciosClientes: data.preciosClientes?.length || 0,
            pedidosClientes: data.pedidosClientes?.length || 0,
            ventas: data.ventas?.length || 0,
            rendimientos: data.rendimientos?.length || 0,
            cajaChica: data.cajaChica?.length || 0,
            colegios: data.colegios?.length || 0,
            reclamos: data.reclamos?.length || 0
        };

        return NextResponse.json({
            success: true,
            message: 'Data synced successfully',
            summary
        });

    } catch (error) {
        console.error('Error syncing data:', error);
        return NextResponse.json({
            error: 'Failed to sync data',
            details: String(error)
        }, { status: 500 });
    }
}
