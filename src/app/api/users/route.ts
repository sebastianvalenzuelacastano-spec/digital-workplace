import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { verifyToken, hashPassword } from '@/lib/auth';
import { headers } from 'next/headers';

const isAuthenticatedManager = async () => {
    const headersList = await headers();
    const token = headersList.get('authorization')?.split(' ')[1];
    if (!token) return false;
    const decoded = verifyToken(token) as any;
    return decoded && decoded.role === 'manager';
};

export async function GET() {
    if (!await isAuthenticatedManager()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const db = await readDb();
    if (!db || !db.users) {
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
    // Return users without passwords
    const users = db.users.map(({ password, ...user }: any) => user);
    return NextResponse.json(users);
}

export async function POST(request: Request) {
    if (!await isAuthenticatedManager()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { username, nombre, role, password, permissions } = await request.json();
    const db = await readDb();

    if (db.users.find((u: any) => u.username === username)) {
        return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
    }

    const newUser = {
        id: Date.now(),
        username,
        nombre,
        role,
        permissions: permissions || [], // Default to empty if not provided
        password: await hashPassword(password),
        mustChangePassword: true // Force password change for new users
    };

    db.users.push(newUser);
    writeDb(db);

    const { password: _, ...userWithoutPassword } = newUser;
    return NextResponse.json(userWithoutPassword);
}

export async function PUT(request: Request) {
    if (!await isAuthenticatedManager()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id, username, nombre, role, permissions } = await request.json();
    const db = await readDb();
    const index = db.users.findIndex((u: any) => u.id === id);

    if (index === -1) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if username is taken by another user
    const existingUser = db.users.find((u: any) => u.username === username && u.id !== id);
    if (existingUser) {
        return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
    }

    db.users[index] = { ...db.users[index], username, nombre, role, permissions };
    writeDb(db);

    const { password: _, ...userWithoutPassword } = db.users[index];
    return NextResponse.json(userWithoutPassword);
}

export async function DELETE(request: Request) {
    if (!await isAuthenticatedManager()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get('id'));

    const db = await readDb();
    const index = db.users.findIndex((u: any) => u.id === id);

    if (index === -1) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent deleting the last manager
    const managers = db.users.filter((u: any) => u.role === 'manager');
    if (db.users[index].role === 'manager' && managers.length <= 1) {
        return NextResponse.json({ error: 'Cannot delete the last manager' }, { status: 400 });
    }

    db.users.splice(index, 1);
    writeDb(db);

    return NextResponse.json({ success: true });
}

export async function PATCH(request: Request) {
    // Used for Admin resetting password
    if (!await isAuthenticatedManager()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id, newPassword } = await request.json();
    const db = await readDb();
    const index = db.users.findIndex((u: any) => u.id === id);

    if (index === -1) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    db.users[index].password = await hashPassword(newPassword);
    db.users[index].mustChangePassword = true; // Force change on next login
    writeDb(db);

    return NextResponse.json({ success: true });
}
