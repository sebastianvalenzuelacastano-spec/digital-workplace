import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        const db = await readDb();

        if (!db || !db.users) {
            return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
        }

        // Find admin user
        const adminIndex = db.users.findIndex((u: any) => u.email === 'admin@example.com' || u.username === 'admin');

        if (adminIndex === -1) {
            // Create new admin user
            const hashedPassword = await bcrypt.hash('admin123', 10);
            db.users.push({
                id: 1,
                username: 'admin',
                email: 'admin@pansansebastian.cl',
                password: hashedPassword,
                role: 'manager',
                name: 'Administrador'
            });
        } else {
            // Update existing admin password
            const hashedPassword = await bcrypt.hash('admin123', 10);
            db.users[adminIndex].password = hashedPassword;
            db.users[adminIndex].email = 'admin@pansansebastian.cl';
        }

        await writeDb(db);

        return NextResponse.json({
            success: true,
            message: 'Admin user created/updated',
            credentials: {
                email: 'admin@pansansebastian.cl',
                password: 'admin123'
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
