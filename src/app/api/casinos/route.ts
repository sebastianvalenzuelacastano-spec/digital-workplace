import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { hashPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET - List casinos from Supabase
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const empresaId = searchParams.get('empresaId');

    try {
        const supabase = createServerClient();

        let query = supabase.from('casinos_sucursales').select('*');

        if (empresaId) {
            query = query.eq('empresa_id', parseInt(empresaId));
        }

        const { data, error } = await query.order('nombre');

        if (error) {
            console.error('Error fetching casinos:', error);
            return NextResponse.json([]);
        }

        // Map to camelCase and remove password
        const casinos = (data || []).map((c: any) => ({
            id: c.id,
            empresaId: c.empresa_id,
            empresaNombre: c.empresa_nombre || '',
            nombre: c.nombre,
            username: c.username,
            direccion: c.direccion || '',
            telefono: c.telefono || '',
            email: c.email || '',
            whatsapp: c.whatsapp || '',
            activo: c.activo !== false,
            mustChangePassword: c.must_change_password || false
        }));

        return NextResponse.json(casinos);

    } catch (error) {
        console.error('Error in casinos GET:', error);
        return NextResponse.json([]);
    }
}

// POST - Create new casino
export async function POST(request: Request) {
    try {
        const data = await request.json();
        const supabase = createServerClient();

        // Get empresa name
        const { data: empresa } = await supabase
            .from('empresas_clientes')
            .select('nombre')
            .eq('id', data.empresaId)
            .single();

        const passwordHash = await hashPassword(data.password);

        const { data: newCasino, error } = await supabase
            .from('casinos_sucursales')
            .insert({
                empresa_id: data.empresaId,
                empresa_nombre: empresa?.nombre || '',
                nombre: data.nombre,
                username: data.username,
                password_hash: passwordHash,
                direccion: data.direccion || '',
                telefono: data.telefono || '',
                email: data.email || '',
                whatsapp: data.whatsapp || '',
                activo: true,
                must_change_password: true
            })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                return NextResponse.json({ error: 'Usuario ya existe' }, { status: 400 });
            }
            console.error('Error creating casino:', error);
            return NextResponse.json({ error: 'Error al crear casino' }, { status: 500 });
        }

        return NextResponse.json({
            id: newCasino.id,
            empresaId: newCasino.empresa_id,
            nombre: newCasino.nombre,
            username: newCasino.username,
            direccion: newCasino.direccion,
            telefono: newCasino.telefono,
            email: newCasino.email,
            whatsapp: newCasino.whatsapp,
            activo: newCasino.activo,
            mustChangePassword: newCasino.must_change_password
        }, { status: 201 });

    } catch (error) {
        console.error('Error in casinos POST:', error);
        return NextResponse.json({ error: 'Error al crear' }, { status: 500 });
    }
}

// PUT - Update casino
export async function PUT(request: Request) {
    try {
        const data = await request.json();
        const supabase = createServerClient();

        const updateData: any = {
            nombre: data.nombre,
            username: data.username,
            direccion: data.direccion || '',
            telefono: data.telefono || '',
            email: data.email || '',
            whatsapp: data.whatsapp || '',
            activo: data.activo
        };

        // Hash password if provided
        if (data.password) {
            updateData.password_hash = await hashPassword(data.password);
            updateData.must_change_password = false;
        }

        const { error } = await supabase
            .from('casinos_sucursales')
            .update(updateData)
            .eq('id', data.id);

        if (error) {
            if (error.code === '23505') {
                return NextResponse.json({ error: 'Usuario ya existe' }, { status: 400 });
            }
            console.error('Error updating casino:', error);
            return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error in casinos PUT:', error);
        return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
    }
}

// DELETE - Deactivate casino
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = parseInt(searchParams.get('id') || '0');
        const supabase = createServerClient();

        const { error } = await supabase
            .from('casinos_sucursales')
            .update({ activo: false })
            .eq('id', id);

        if (error) {
            console.error('Error deleting casino:', error);
            return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error in casinos DELETE:', error);
        return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 });
    }
}
