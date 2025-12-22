import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(request: Request) {
    const { username, newPassword } = await request.json();
    const db = await readDb();

    if (!db || !db.users) {
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const userIndex = db.users.findIndex((u: any) => u.username === username);

    if (userIndex !== -1) {
        db.users[userIndex].password = await hashPassword(newPassword);
        db.users[userIndex].mustChangePassword = false;
        writeDb(db);
        return NextResponse.json({ success: true });
    } else {
        return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }
}
