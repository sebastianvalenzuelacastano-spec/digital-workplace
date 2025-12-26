import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
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

    try {
        const supabase = createServerClient();

        const { data, error } = await supabase
            .from('admin_users')
            .select('*')
            .order('nombre');

        if (error) {
            console.error('Error fetching users:', error);
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        // Return users without passwords
        const users = (data || []).map((u: any) => ({
            id: u.id,
            username: u.username,
            email: u.email,
            nombre: u.nombre,
            role: u.role,
            permissions: u.permissions || [],
            mustChangePassword: u.must_change_password,
            activo: u.activo
        }));

        return NextResponse.json(users);

    } catch (error) {
        console.error('Error in users GET:', error);
        return NextResponse.json({ error: 'Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    if (!await isAuthenticatedManager()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { username, nombre, role, password, permissions, email } = await request.json();
        const supabase = createServerClient();

        const passwordHash = await hashPassword(password);

        const { data: newUser, error } = await supabase
            .from('admin_users')
            .insert({
                username,
                email: email || username,
                nombre,
                role,
                permissions: permissions || [],
                password_hash: passwordHash,
                must_change_password: true,
                activo: true
            })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
            }
            console.error('Error creating user:', error);
            return NextResponse.json({ error: 'Error al crear usuario' }, { status: 500 });
        }

        return NextResponse.json({
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            nombre: newUser.nombre,
            role: newUser.role,
            permissions: newUser.permissions,
            mustChangePassword: newUser.must_change_password
        });

    } catch (error) {
        console.error('Error in users POST:', error);
        return NextResponse.json({ error: 'Error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    if (!await isAuthenticatedManager()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id, username, nombre, role, permissions, email } = await request.json();
        const supabase = createServerClient();

        const { error } = await supabase
            .from('admin_users')
            .update({
                username,
                email: email || username,
                nombre,
                role,
                permissions: permissions || []
            })
            .eq('id', id);

        if (error) {
            if (error.code === '23505') {
                return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
            }
            console.error('Error updating user:', error);
            return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error in users PUT:', error);
        return NextResponse.json({ error: 'Error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    if (!await isAuthenticatedManager()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const supabase = createServerClient();

        // Check if this is the last manager
        const { data: managers } = await supabase
            .from('admin_users')
            .select('id')
            .eq('role', 'manager')
            .eq('activo', true);

        if (managers && managers.length <= 1) {
            const userToDelete = managers.find((m: any) => m.id === id);
            if (userToDelete) {
                return NextResponse.json({ error: 'Cannot delete the last manager' }, { status: 400 });
            }
        }

        const { error } = await supabase
            .from('admin_users')
            .update({ activo: false })
            .eq('id', id);

        if (error) {
            console.error('Error deleting user:', error);
            return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error in users DELETE:', error);
        return NextResponse.json({ error: 'Error' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    // Used for Admin resetting password
    if (!await isAuthenticatedManager()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id, newPassword } = await request.json();
        const supabase = createServerClient();

        const passwordHash = await hashPassword(newPassword);

        const { error } = await supabase
            .from('admin_users')
            .update({
                password_hash: passwordHash,
                must_change_password: true
            })
            .eq('id', id);

        if (error) {
            console.error('Error resetting password:', error);
            return NextResponse.json({ error: 'Error al cambiar contraseña' }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error in users PATCH:', error);
        return NextResponse.json({ error: 'Error' }, { status: 500 });
    }
}
