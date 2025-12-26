import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';
import { headers } from 'next/headers';

// Force dynamic - never cache this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const isAuthenticated = async () => {
    const headersList = await headers();
    const token = headersList.get('authorization')?.split(' ')[1];
    if (!token) return false;
    return verifyToken(token) !== null;
};

export async function GET() {
    if (!await isAuthenticated()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const supabase = createServerClient();

        // Load all necessary data from Supabase
        const [
            trabajadoresRes,
            areasRes,
            proveedoresRes,
            insumosRes,
            clientesRes
        ] = await Promise.all([
            supabase.from('trabajadores').select('*').order('nombre'),
            supabase.from('areas').select('*').order('nombre'),
            supabase.from('proveedores').select('*').order('nombre'),
            supabase.from('insumos').select('*').order('nombre'),
            supabase.from('clientes').select('*').order('nombre')
        ]);

        // Map to camelCase format expected by frontend
        const data = {
            maestroTrabajadores: (trabajadoresRes.data || []).map((t: any) => ({
                id: t.id,
                rut: t.rut || '',
                nombre: t.nombre,
                cargo: t.cargo || '',
                telefono: t.telefono || '',
                email: t.email || '',
                fechaIngreso: t.fecha_ingreso,
                activo: t.activo !== false
            })),
            maestroAreas: (areasRes.data || []).map((a: any) => ({
                id: a.id,
                nombre: a.nombre,
                activo: a.activo !== false
            })),
            maestroProveedores: (proveedoresRes.data || []).map((p: any) => ({
                id: p.id,
                rut: p.rut || '',
                nombre: p.nombre,
                contacto: p.contacto || '',
                telefono: p.telefono || '',
                email: p.email || '',
                direccion: p.direccion || '',
                activo: p.activo !== false
            })),
            maestroInsumos: (insumosRes.data || []).map((i: any) => ({
                id: i.id,
                nombre: i.nombre,
                unidad: i.unidad || 'kg',
                costoUnitario: i.costo_unitario || 0,
                tieneImpuestoAdicional: i.tiene_impuesto_adicional || false,
                stockMinimo: i.stock_minimo || 0,
                activo: i.activo !== false
            })),
            maestroClientes: (clientesRes.data || []).map((c: any) => ({
                id: c.id,
                rut: c.rut || '',
                nombre: c.nombre,
                tipo: c.tipo || 'empresa',
                contacto: c.contacto || '',
                telefono: c.telefono || '',
                email: c.email || '',
                direccion: c.direccion || '',
                activo: c.activo !== false
            }))
        };

        return NextResponse.json(data);

    } catch (error) {
        console.error('Error in /api/db GET:', error);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const headersList = await headers();
    const token = headersList.get('authorization')?.split(' ')[1];

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token) as any;
    if (!decoded) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // POST is deprecated - use individual APIs instead
    return NextResponse.json({
        error: 'POST to /api/db is deprecated. Use individual APIs instead.',
        message: 'Data should be saved via specific endpoints like /api/supabase-db'
    }, { status: 400 });
}
