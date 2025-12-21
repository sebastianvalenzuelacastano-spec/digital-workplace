import { NextResponse } from 'next/server';
import { readDb } from '@/lib/db';
import { comparePassword, signToken } from '@/lib/auth';

export async function POST(request: Request) {
    const { username, password } = await request.json();
    const db = readDb();

    if (!db || !db.casinosSucursales) {
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Find casino by username
    const casino = db.casinosSucursales.find((c: any) => c.username === username && c.activo);

    if (!casino) {
        return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 401 });
    }

    // Verify password
    const isValid = await comparePassword(password, casino.passwordHash);

    if (!isValid) {
        return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
    }

    // Get empresa info
    const empresa = db.empresasClientes?.find((e: any) => e.id === casino.empresaId);

    if (!empresa || !empresa.activo) {
        return NextResponse.json({ error: 'Empresa no activa' }, { status: 401 });
    }

    // Generate token for client
    const token = signToken({
        id: casino.id,
        username: casino.username,
        role: 'cliente', // Special role for clients
        empresaId: empresa.id,
        empresaNombre: empresa.nombre,
        casinoNombre: casino.nombre
    });

    return NextResponse.json({
        success: true,
        token,
        cliente: {
            id: casino.id,
            username: casino.username,
            casinoNombre: casino.nombre,
            empresaId: empresa.id,
            empresaNombre: empresa.nombre,
            empresaRut: empresa.rut,
            mustChangePassword: casino.mustChangePassword || false
        }
    });
}
