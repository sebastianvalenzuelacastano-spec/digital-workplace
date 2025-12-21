import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import type { EmpresaCliente } from '@/types/dashboard';

// GET - List all client companies
export async function GET() {
    const db = readDb();

    if (!db || !db.empresasClientes) {
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json(db.empresasClientes);
}

// POST - Create new client company
export async function POST(request: Request) {
    const data = await request.json();
    const db = readDb();

    if (!db) {
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!db.empresasClientes) {
        db.empresasClientes = [];
    }

    // Check if RUT already exists
    const existingRut = db.empresasClientes.find((e: EmpresaCliente) => e.rut === data.rut);
    if (existingRut) {
        return NextResponse.json({ error: 'RUT ya existe' }, { status: 400 });
    }

    const newId = db.empresasClientes.length > 0
        ? Math.max(...db.empresasClientes.map((e: EmpresaCliente) => e.id)) + 1
        : 1;

    const newEmpresa: EmpresaCliente = {
        id: newId,
        rut: data.rut,
        nombre: data.nombre,
        contacto: data.contacto || '',
        telefono: data.telefono || '',
        email: data.email || '',
        activo: true
    };

    db.empresasClientes.push(newEmpresa);
    writeDb(db);

    return NextResponse.json(newEmpresa, { status: 201 });
}

// PUT - Update client company
export async function PUT(request: Request) {
    const data = await request.json();
    const db = readDb();

    if (!db || !db.empresasClientes) {
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const index = db.empresasClientes.findIndex((e: EmpresaCliente) => e.id === data.id);
    if (index === -1) {
        return NextResponse.json({ error: 'Empresa no encontrada' }, { status: 404 });
    }

    // Check if RUT already exists for another company
    const existingRut = db.empresasClientes.find(
        (e: EmpresaCliente) => e.rut === data.rut && e.id !== data.id
    );
    if (existingRut) {
        return NextResponse.json({ error: 'RUT ya existe' }, { status: 400 });
    }

    db.empresasClientes[index] = {
        ...db.empresasClientes[index],
        ...data
    };

    writeDb(db);
    return NextResponse.json(db.empresasClientes[index]);
}

// DELETE - Deactivate client company (soft delete)
export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '0');
    const db = readDb();

    if (!db || !db.empresasClientes) {
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const index = db.empresasClientes.findIndex((e: EmpresaCliente) => e.id === id);
    if (index === -1) {
        return NextResponse.json({ error: 'Empresa no encontrada' }, { status: 404 });
    }

    // Soft delete - just deactivate
    db.empresasClientes[index].activo = false;
    writeDb(db);

    return NextResponse.json({ success: true });
}
