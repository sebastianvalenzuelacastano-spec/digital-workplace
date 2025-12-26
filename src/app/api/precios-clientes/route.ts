import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import type { PrecioCliente } from '@/types/dashboard';

// GET - Get prices for a specific empresa (now from Supabase)
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const empresaId = searchParams.get('empresaId');

    try {
        const supabase = createServerClient();

        let query = supabase.from('precios_clientes').select('*');

        if (empresaId) {
            query = query.eq('empresa_id', parseInt(empresaId));
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching precios:', error);
            return NextResponse.json([]);
        }

        // Map Supabase snake_case to camelCase expected by frontend
        const precios = (data || []).map((p: any) => ({
            id: p.id,
            empresaId: p.empresa_id,
            productoId: p.producto_id,
            productoNombre: p.producto_nombre || '',
            nombreProducto: p.producto_nombre || '', // Legacy field name
            precioNeto: p.precio_neto || 0,
            unidad: p.unidad || 'Kg'
        }));

        return NextResponse.json(precios);

    } catch (error) {
        console.error('Error in precios-clientes GET:', error);
        return NextResponse.json([]);
    }
}

// POST - Create or update prices for a company (bulk)
export async function POST(request: Request) {
    const data = await request.json();

    try {
        const supabase = createServerClient();
        const precios = Array.isArray(data) ? data : [data];

        for (const precio of precios) {
            // Upsert: insert or update on conflict
            const { error } = await supabase
                .from('precios_clientes')
                .upsert({
                    empresa_id: precio.empresaId,
                    producto_id: precio.productoId,
                    producto_nombre: precio.nombreProducto || precio.productoNombre || '',
                    precio_neto: precio.precioNeto,
                    unidad: precio.unidad || 'Kg'
                }, {
                    onConflict: 'empresa_id,producto_id'
                });

            if (error) {
                console.error('Error upserting precio:', error);
            }
        }

        return NextResponse.json({ success: true, count: precios.length });

    } catch (error) {
        console.error('Error in precios-clientes POST:', error);
        return NextResponse.json({ error: 'Error al guardar precios' }, { status: 500 });
    }
}

// DELETE - Remove a price entry
export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '0');

    try {
        const supabase = createServerClient();

        const { error } = await supabase
            .from('precios_clientes')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting precio:', error);
            return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error in precios-clientes DELETE:', error);
        return NextResponse.json({ error: 'Error al eliminar precio' }, { status: 500 });
    }
}
