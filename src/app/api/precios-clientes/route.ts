import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import type { PrecioCliente } from '@/types/dashboard';

// GET - Get prices for a specific empresa
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const empresaId = searchParams.get('empresaId');
    const db = await readDb();

    if (!db || !db.preciosClientes) {
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!empresaId) {
        return NextResponse.json(db.preciosClientes);
    }

    const precios = db.preciosClientes.filter(
        (p: PrecioCliente) => p.empresaId === parseInt(empresaId)
    );

    return NextResponse.json(precios);
}

// POST - Create or update prices for a company (bulk)
export async function POST(request: Request) {
    const data = await request.json();
    const db = await readDb();

    if (!db) {
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!db.preciosClientes) {
        db.preciosClientes = [];
    }

    // data can be a single price or an array of prices
    const precios = Array.isArray(data) ? data : [data];

    for (const precio of precios) {
        // Check if price already exists for this empresa+producto
        const existingIndex = db.preciosClientes.findIndex(
            (p: PrecioCliente) => p.empresaId === precio.empresaId && p.productoId === precio.productoId
        );

        if (existingIndex >= 0) {
            // Update existing price
            db.preciosClientes[existingIndex] = {
                ...db.preciosClientes[existingIndex],
                precioNeto: precio.precioNeto,
                nombreProducto: precio.nombreProducto || db.preciosClientes[existingIndex].nombreProducto
            };
        } else {
            // Create new price
            const newId = db.preciosClientes.length > 0
                ? Math.max(...db.preciosClientes.map((p: PrecioCliente) => p.id)) + 1
                : 1;

            const newPrecio: PrecioCliente = {
                id: newId,
                empresaId: precio.empresaId,
                productoId: precio.productoId,
                nombreProducto: precio.nombreProducto || '',
                precioNeto: precio.precioNeto
            };

            db.preciosClientes.push(newPrecio);
        }
    }

    writeDb(db);
    return NextResponse.json({ success: true, count: precios.length });
}

// DELETE - Remove a price entry
export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '0');
    const db = await readDb();

    if (!db || !db.preciosClientes) {
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const index = db.preciosClientes.findIndex((p: PrecioCliente) => p.id === id);
    if (index === -1) {
        return NextResponse.json({ error: 'Precio no encontrado' }, { status: 404 });
    }

    db.preciosClientes.splice(index, 1);
    writeDb(db);

    return NextResponse.json({ success: true });
}
