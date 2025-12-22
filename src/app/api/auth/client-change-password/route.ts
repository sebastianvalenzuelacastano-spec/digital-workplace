import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { hashPassword, comparePassword } from '@/lib/auth';
import type { CasinoSucursal } from '@/types/dashboard';

export async function POST(request: Request) {
    const { casinoId, currentPassword, newPassword } = await request.json();
    const db = await readDb();

    if (!db || !db.casinosSucursales) {
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Find casino
    const index = db.casinosSucursales.findIndex((c: CasinoSucursal) => c.id === casinoId);
    if (index === -1) {
        return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const casino = db.casinosSucursales[index];

    // Verify current password
    const isValid = await comparePassword(currentPassword, casino.passwordHash);
    if (!isValid) {
        return NextResponse.json({ error: 'Contraseña actual incorrecta' }, { status: 401 });
    }

    // Validate new password
    if (!newPassword || newPassword.length < 6) {
        return NextResponse.json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' }, { status: 400 });
    }

    // Hash and save new password
    const newPasswordHash = await hashPassword(newPassword);
    db.casinosSucursales[index].passwordHash = newPasswordHash;
    db.casinosSucursales[index].mustChangePassword = false;

    writeDb(db);

    return NextResponse.json({ success: true, message: 'Contraseña actualizada correctamente' });
}
