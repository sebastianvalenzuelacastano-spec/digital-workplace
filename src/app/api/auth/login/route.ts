import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { comparePassword, signToken } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();
        const supabase = createServerClient();

        // Find user by email or username
        const { data: users, error } = await supabase
            .from('admin_users')
            .select('*')
            .or(`email.eq.${username},username.eq.${username}`)
            .eq('activo', true);

        if (error) {
            console.error('Login query error:', error);
            return NextResponse.json({ error: 'Error de base de datos' }, { status: 500 });
        }

        const user = users?.[0];

        if (user) {
            const isValid = await comparePassword(password, user.password_hash);

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
                        name: user.nombre,
                        mustChangePassword: user.must_change_password
                    }
                });
            }
        }

        return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Error de autenticación' }, { status: 500 });
    }
}
