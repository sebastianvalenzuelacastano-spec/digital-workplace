import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function GET() {
    try {
        const db = await readDb();
        if (!db) {
            return NextResponse.json([]);
        }
        // Sort alphabetically by name
        const productos = (db.productos || []).sort((a: any, b: any) =>
            a.nombre.localeCompare(b.nombre, 'es')
        );
        return NextResponse.json(productos);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const db = await readDb();
        const body = await request.json();

        if (!db || !db.productos) {
            return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
        }

        const newId = db.productos.length > 0
            ? Math.max(...db.productos.map((p: any) => p.id)) + 1
            : 1;

        const newProduct = {
            id: newId,
            nombre: body.nombre,
            descripcion: body.descripcion,
            categoria: body.categoria,
            imagen: body.imagen || '',
            destacado: body.destacado || false,
            activo: body.activo !== undefined ? body.activo : true,
            orden: body.orden || newId
        };

        db.productos.push(newProduct);
        await writeDb(db);

        return NextResponse.json(newProduct, { status: 201 });
    } catch (error) {
        console.error('POST productos error:', error);
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const db = await readDb();
        const body = await request.json();
        const { id } = body;

        if (!db || !db.productos) {
            return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
        }

        const index = db.productos.findIndex((p: any) => p.id === id);
        if (index === -1) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        db.productos[index] = {
            ...db.productos[index],
            ...body
        };

        await writeDb(db);
        return NextResponse.json(db.productos[index]);
    } catch (error) {
        console.error('PUT productos error:', error);
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const db = await readDb();
        const { searchParams } = new URL(request.url);
        const id = parseInt(searchParams.get('id') || '');

        if (!db || !db.productos) {
            return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
        }

        const index = db.productos.findIndex((p: any) => p.id === id);
        if (index === -1) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        db.productos.splice(index, 1);
        await writeDb(db);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('DELETE productos error:', error);
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}
