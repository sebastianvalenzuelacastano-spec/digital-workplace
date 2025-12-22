import { NextResponse } from 'next/server';
import { readDb } from '@/lib/db';
import { comparePassword, signToken } from '@/lib/auth';

export async function POST(request: Request) {
    const { username, password } = await request.json();
    const db = await readDb();

    if (!db || !db.users) {
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Support both email and username for backward compatibility
    const user = db.users.find((u: any) => u.email === username || u.username === username);

    if (user) {
        const isValid = await comparePassword(password, user.password);

        if (isValid) {
            const token = signToken({
                id: user.id,
                username: user.email || user.username,
                role: user.role,
                permissions: user.permissions || []
            });

            return NextResponse.json({
                success: true,
                token,
                user: {
                    id: user.id,
                    username: user.email || user.username,
                    role: user.role,
                    permissions: user.permissions || [],
                    name: user.name,
                    mustChangePassword: user.mustChangePassword
                }
            });
        }
    }

    return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
}
