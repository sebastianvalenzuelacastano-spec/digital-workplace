import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        const db = readDb();
        if (!db) {
            return NextResponse.json({ error: 'Database not found' }, { status: 500 });
        }

        const email = 'gerencia';
        const password = '2426Seba';
        const role = 'manager';
        const name = 'Gerencia';

        // Check if user exists
        const existingUser = db.users.find((u: any) => u.email === email);
        if (existingUser) {
            return NextResponse.json({ message: 'User already exists', user: existingUser });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            id: db.users.length + 1,
            email,
            password: hashedPassword,
            role,
            name
        };

        db.users.push(newUser);
        writeDb(db);

        return NextResponse.json({ message: 'User created successfully', user: newUser });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error', details: String(error) }, { status: 500 });
    }
}
