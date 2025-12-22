import { NextResponse } from 'next/server';
import { readDb, writeDb, initializeDb } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        let db = await readDb();

        console.log('Reset-admin: readDb result:', db ? 'Data exists' : 'null');

        // If database is empty, initialize it first
        if (!db) {
            console.log('Reset-admin: Initializing database...');
            await initializeDb();
            db = await readDb();

            if (!db) {
                return NextResponse.json({
                    error: 'Failed to initialize database',
                    debug: 'readDb returned null after initializeDb'
                }, { status: 500 });
            }
        }

        // Ensure users array exists
        if (!db.users) {
            db.users = [];
        }

        console.log('Reset-admin: Current users count:', db.users.length);

        // Find admin user
        const adminIndex = db.users.findIndex((u: any) => u.email === 'admin@example.com' || u.email === 'admin@pansansebastian.cl' || u.username === 'admin');

        const hashedPassword = await bcrypt.hash('admin123', 10);

        if (adminIndex === -1) {
            // Create new admin user
            console.log('Reset-admin: Creating new admin user');
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
            console.log('Reset-admin: Updating existing admin');
            db.users[adminIndex].password = hashedPassword;
            db.users[adminIndex].email = 'admin@pansansebastian.cl';
        }

        const writeSuccess = await writeDb(db);
        console.log('Reset-admin: Write result:', writeSuccess);

        if (!writeSuccess) {
            return NextResponse.json({
                error: 'Failed to write to database'
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Admin user created/updated',
            credentials: {
                email: 'admin@pansansebastian.cl',
                password: 'admin123'
            },
            debug: {
                usersCount: db.users.length,
                adminWasCreated: adminIndex === -1
            }
        });
    } catch (error: any) {
        console.error('Reset-admin error:', error);
        return NextResponse.json({
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
