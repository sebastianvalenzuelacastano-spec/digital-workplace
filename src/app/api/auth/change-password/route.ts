import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { hashPassword } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const { username, newPassword } = await request.json();
        const supabase = createServerClient();

        const passwordHash = await hashPassword(newPassword);

        const { data, error } = await supabase
            .from('admin_users')
            .update({
                password_hash: passwordHash,
                must_change_password: false
            })
            .or(`username.eq.${username},email.eq.${username}`)
            .select();

        if (error) {
            console.error('Error changing password:', error);
            return NextResponse.json({ error: 'Error al cambiar contraseña' }, { status: 500 });
        }

        if (!data || data.length === 0) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Change password error:', error);
        return NextResponse.json({ error: 'Error' }, { status: 500 });
    }
}
