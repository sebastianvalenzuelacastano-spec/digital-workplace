import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import type { CasinoSucursal } from '@/types/dashboard';

// GET - List casinos (optionally filter by empresaId)
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const empresaId = searchParams.get('empresaId');
    const db = await readDb();

    if (!db || !db.casinosSucursales) {
        return NextResponse.json([]);
    }

    let casinos = db.casinosSucursales;

    if (empresaId) {
        casinos = casinos.filter((c: CasinoSucursal) => c.empresaId === parseInt(empresaId));
    }

    // Don't return password hashes
    const safeCasinos = casinos.map((c: CasinoSucursal) => {
        const { passwordHash, ...safeData } = c;
        return safeData;
    });

    return NextResponse.json(safeCasinos);
}

// POST - Create new casino
export async function POST(request: Request) {
    const data = await request.json();
    const db = await readDb();

    if (!db) {
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!db.casinosSucursales) {
        db.casinosSucursales = [];
    }

    // Check if username already exists
    const existingUsername = db.casinosSucursales.find(
        (c: CasinoSucursal) => c.username === data.username
    );
    if (existingUsername) {
        return NextResponse.json({ error: 'Usuario ya existe' }, { status: 400 });
    }

    // Verify empresa exists
    const empresa = db.empresasClientes?.find((e: any) => e.id === data.empresaId);
    if (!empresa) {
        return NextResponse.json({ error: 'Empresa no encontrada' }, { status: 400 });
    }

    const newId = db.casinosSucursales.length > 0
        ? Math.max(...db.casinosSucursales.map((c: CasinoSucursal) => c.id)) + 1
        : 1;

    // Hash the password
    const passwordHash = await hashPassword(data.password);

    const newCasino: CasinoSucursal = {
        id: newId,
        empresaId: data.empresaId,
        nombre: data.nombre,
        username: data.username,
        passwordHash,
        direccion: data.direccion || '',
        telefono: data.telefono || '',
        email: data.email || '',
        whatsapp: data.whatsapp || '',
        activo: true,
        mustChangePassword: true // Provisional password - must change on first login
    };

    db.casinosSucursales.push(newCasino);
    writeDb(db);

    // Return without password hash
    const { passwordHash: _, ...safeCasino } = newCasino;
    return NextResponse.json(safeCasino, { status: 201 });
}

// PUT - Update casino
export async function PUT(request: Request) {
    const data = await request.json();
    const db = await readDb();

    if (!db || !db.casinosSucursales) {
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const index = db.casinosSucursales.findIndex((c: CasinoSucursal) => c.id === data.id);
    if (index === -1) {
        return NextResponse.json({ error: 'Casino no encontrado' }, { status: 404 });
    }

    // Check if username already exists for another casino
    const existingUsername = db.casinosSucursales.find(
        (c: CasinoSucursal) => c.username === data.username && c.id !== data.id
    );
    if (existingUsername) {
        return NextResponse.json({ error: 'Usuario ya existe' }, { status: 400 });
    }

    // If password is being updated, hash it
    let updateData = { ...data };
    if (data.password) {
        updateData.passwordHash = await hashPassword(data.password);
        delete updateData.password;
    }

    db.casinosSucursales[index] = {
        ...db.casinosSucursales[index],
        ...updateData
    };

    writeDb(db);

    // Return without password hash
    const { passwordHash: _, ...safeCasino } = db.casinosSucursales[index];
    return NextResponse.json(safeCasino);
}

// DELETE - Deactivate casino (soft delete)
export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '0');
    const db = await readDb();

    if (!db || !db.casinosSucursales) {
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const index = db.casinosSucursales.findIndex((c: CasinoSucursal) => c.id === id);
    if (index === -1) {
        return NextResponse.json({ error: 'Casino no encontrado' }, { status: 404 });
    }

    // Soft delete - just deactivate
    db.casinosSucursales[index].activo = false;
    writeDb(db);

    return NextResponse.json({ success: true });
}
