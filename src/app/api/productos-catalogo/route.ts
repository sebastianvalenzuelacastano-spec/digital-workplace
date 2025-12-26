import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// GET - List all catalog products from Supabase
export async function GET() {
    try {
        const supabase = createServerClient();

        const { data, error } = await supabase
            .from('productos_catalogo')
            .select('*')
            .order('nombre');

        if (error) {
            console.error('Error fetching productos:', error);
            return NextResponse.json([]);
        }

        // Map to camelCase expected by frontend
        const productos = (data || []).map((p: any) => ({
            id: p.id,
            nombre: p.nombre,
            descripcion: p.descripcion || '',
            categoria: p.categoria || '',
            imagen: p.imagen_url || '',
            precio: p.precio_base || 0,
            precioBase: p.precio_base || 0,
            destacado: false,
            activo: p.activo !== false,
            mostrarEnWeb: p.mostrar_en_web || false
        }));

        return NextResponse.json(productos);

    } catch (error) {
        console.error('Error in productos-catalogo GET:', error);
        return NextResponse.json([]);
    }
}

// POST - Create new catalog product
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const supabase = createServerClient();

        const { data: newProduct, error } = await supabase
            .from('productos_catalogo')
            .insert({
                nombre: body.nombre,
                descripcion: body.descripcion || '',
                categoria: body.categoria || '',
                imagen_url: body.imagen || '',
                precio_base: body.precioBase || body.precio || 0,
                activo: body.activo !== false,
                mostrar_en_web: body.mostrarEnWeb || false
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating producto:', error);
            return NextResponse.json({ error: 'Error al crear producto' }, { status: 500 });
        }

        return NextResponse.json({
            id: newProduct.id,
            nombre: newProduct.nombre,
            descripcion: newProduct.descripcion,
            categoria: newProduct.categoria,
            imagen: newProduct.imagen_url,
            precioBase: newProduct.precio_base,
            activo: newProduct.activo,
            mostrarEnWeb: newProduct.mostrar_en_web
        }, { status: 201 });

    } catch (error) {
        console.error('Error in productos-catalogo POST:', error);
        return NextResponse.json({ error: 'Error al crear producto' }, { status: 500 });
    }
}

// PUT - Update catalog product
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id } = body;
        const supabase = createServerClient();

        const { data: updated, error } = await supabase
            .from('productos_catalogo')
            .update({
                nombre: body.nombre,
                descripcion: body.descripcion || '',
                categoria: body.categoria || '',
                imagen_url: body.imagen || '',
                precio_base: body.precioBase || body.precio || 0,
                activo: body.activo !== false,
                mostrar_en_web: body.mostrarEnWeb || false
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating producto:', error);
            return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
        }

        return NextResponse.json({
            id: updated.id,
            nombre: updated.nombre,
            descripcion: updated.descripcion,
            categoria: updated.categoria,
            imagen: updated.imagen_url,
            precioBase: updated.precio_base,
            activo: updated.activo,
            mostrarEnWeb: updated.mostrar_en_web
        });

    } catch (error) {
        console.error('Error in productos-catalogo PUT:', error);
        return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
    }
}

// DELETE - Remove catalog product
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = parseInt(searchParams.get('id') || '');
        const supabase = createServerClient();

        const { error } = await supabase
            .from('productos_catalogo')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting producto:', error);
            return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error in productos-catalogo DELETE:', error);
        return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 });
    }
}
