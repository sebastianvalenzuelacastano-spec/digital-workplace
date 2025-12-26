import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// GET - List all client companies from Supabase
export async function GET() {
    try {
        const supabase = createServerClient();

        const { data, error } = await supabase
            .from('empresas_clientes')
            .select('*')
            .order('nombre');

        if (error) {
            console.error('Error fetching empresas:', error);
            return NextResponse.json([]);
        }

        // Map to camelCase
        const empresas = (data || []).map((e: any) => ({
            id: e.id,
            rut: e.rut || '',
            nombre: e.nombre,
            contacto: e.contacto || '',
            telefono: e.telefono || '',
            email: e.email || '',
            activo: e.activo !== false
        }));

        return NextResponse.json(empresas);

    } catch (error) {
        console.error('Error in empresas-clientes GET:', error);
        return NextResponse.json([]);
    }
}

// POST - Create new client company
export async function POST(request: Request) {
    try {
        const data = await request.json();
        const supabase = createServerClient();

        const { data: newEmpresa, error } = await supabase
            .from('empresas_clientes')
            .insert({
                rut: data.rut,
                nombre: data.nombre,
                contacto: data.contacto || '',
                telefono: data.telefono || '',
                email: data.email || '',
                activo: true
            })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') { // unique violation
                return NextResponse.json({ error: 'RUT ya existe' }, { status: 400 });
            }
            console.error('Error creating empresa:', error);
            return NextResponse.json({ error: 'Error al crear empresa' }, { status: 500 });
        }

        return NextResponse.json({
            id: newEmpresa.id,
            rut: newEmpresa.rut,
            nombre: newEmpresa.nombre,
            contacto: newEmpresa.contacto,
            telefono: newEmpresa.telefono,
            email: newEmpresa.email,
            activo: newEmpresa.activo
        }, { status: 201 });

    } catch (error) {
        console.error('Error in empresas-clientes POST:', error);
        return NextResponse.json({ error: 'Error al crear empresa' }, { status: 500 });
    }
}

// PUT - Update client company
export async function PUT(request: Request) {
    try {
        const data = await request.json();
        const supabase = createServerClient();

        const { error } = await supabase
            .from('empresas_clientes')
            .update({
                rut: data.rut,
                nombre: data.nombre,
                contacto: data.contacto || '',
                telefono: data.telefono || '',
                email: data.email || '',
                activo: data.activo
            })
            .eq('id', data.id);

        if (error) {
            if (error.code === '23505') {
                return NextResponse.json({ error: 'RUT ya existe' }, { status: 400 });
            }
            console.error('Error updating empresa:', error);
            return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error in empresas-clientes PUT:', error);
        return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
    }
}

// DELETE - Deactivate client company (soft delete)
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = parseInt(searchParams.get('id') || '0');
        const supabase = createServerClient();

        const { error } = await supabase
            .from('empresas_clientes')
            .update({ activo: false })
            .eq('id', id);

        if (error) {
            console.error('Error deleting empresa:', error);
            return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error in empresas-clientes DELETE:', error);
        return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 });
    }
}
