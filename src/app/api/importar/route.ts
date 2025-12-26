import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

interface ProductoImport {
    nombre: string;
    categoria?: string;
    precioBase?: number;
    activo?: string | boolean | number;
}

interface TrabajadorImport {
    rut: string;
    nombre: string;
    cargo?: string;
    telefono?: string;
    email?: string;
    activo?: string | boolean | number;
}

interface EmpresaImport {
    rut: string;
    nombre: string;
    contacto?: string;
    telefono?: string;
    email?: string;
}

function parseActivo(value: string | boolean | number | undefined): boolean {
    if (value === undefined) return true;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value === 1;
    const str = String(value).toLowerCase().trim();
    return str === 'si' || str === 'sí' || str === 'yes' || str === 'true' || str === '1';
}

export async function POST(request: Request) {
    try {
        const { type, data } = await request.json();
        const db = await readDb();

        if (!db) {
            return NextResponse.json({ error: 'Error de base de datos' }, { status: 500 });
        }

        let count = 0;
        const errors: string[] = [];

        switch (type) {
            case 'productos':
                if (!db.productosCatalogo) db.productosCatalogo = [];
                const maxProdId = db.productosCatalogo.length > 0
                    ? Math.max(...db.productosCatalogo.map((p: { id: number }) => p.id))
                    : 0;

                (data as ProductoImport[]).forEach((item, index) => {
                    if (!item.nombre || item.nombre.trim() === '') {
                        errors.push(`Fila ${index + 2}: El nombre del producto es requerido`);
                        return;
                    }

                    db.productosCatalogo.push({
                        id: maxProdId + count + 1,
                        nombre: item.nombre.trim(),
                        categoria: item.categoria?.trim() || 'General',
                        precioKilo: 0,
                        activo: parseActivo(item.activo)
                    });
                    count++;
                });
                break;

            case 'trabajadores':
                if (!db.maestroTrabajadores) db.maestroTrabajadores = [];
                const maxTrabId = db.maestroTrabajadores.length > 0
                    ? Math.max(...db.maestroTrabajadores.map((t: { id: number }) => t.id))
                    : 0;

                (data as TrabajadorImport[]).forEach((item, index) => {
                    if (!item.nombre || item.nombre.trim() === '') {
                        errors.push(`Fila ${index + 2}: El nombre del trabajador es requerido`);
                        return;
                    }
                    if (!item.rut || item.rut.trim() === '') {
                        errors.push(`Fila ${index + 2}: El RUT es requerido`);
                        return;
                    }

                    // Check for duplicate RUT
                    const existingRut = db.maestroTrabajadores.find(
                        (t: { rut: string }) => t.rut === item.rut.trim()
                    );
                    if (existingRut) {
                        errors.push(`Fila ${index + 2}: RUT ${item.rut} ya existe`);
                        return;
                    }

                    db.maestroTrabajadores.push({
                        id: maxTrabId + count + 1,
                        rut: item.rut.trim(),
                        nombre: item.nombre.trim(),
                        cargo: item.cargo?.trim() || '',
                        telefono: item.telefono?.trim() || '',
                        email: item.email?.trim() || '',
                        activo: parseActivo(item.activo)
                    });
                    count++;
                });
                break;

            case 'empresas':
                if (!db.empresasClientes) db.empresasClientes = [];
                const maxEmpId = db.empresasClientes.length > 0
                    ? Math.max(...db.empresasClientes.map((e: { id: number }) => e.id))
                    : 0;

                (data as EmpresaImport[]).forEach((item, index) => {
                    if (!item.nombre || item.nombre.trim() === '') {
                        errors.push(`Fila ${index + 2}: El nombre de la empresa es requerido`);
                        return;
                    }
                    if (!item.rut || item.rut.trim() === '') {
                        errors.push(`Fila ${index + 2}: El RUT es requerido`);
                        return;
                    }

                    // Check for duplicate RUT
                    const existingRut = db.empresasClientes.find(
                        (e: { rut: string }) => e.rut === item.rut.trim()
                    );
                    if (existingRut) {
                        errors.push(`Fila ${index + 2}: RUT ${item.rut} ya existe`);
                        return;
                    }

                    db.empresasClientes.push({
                        id: maxEmpId + count + 1,
                        rut: item.rut.trim(),
                        nombre: item.nombre.trim(),
                        contacto: item.contacto?.trim() || '',
                        telefono: item.telefono?.trim() || '',
                        email: item.email?.trim() || '',
                        activo: true
                    });
                    count++;
                });
                break;

            default:
                return NextResponse.json({ error: 'Tipo de importación no válido' }, { status: 400 });
        }

        await writeDb(db);

        if (errors.length > 0 && count === 0) {
            return NextResponse.json({
                error: 'No se pudo importar ningún registro',
                errors
            }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            count,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error('Import error:', error);
        return NextResponse.json({ error: 'Error al procesar la importación' }, { status: 500 });
    }
}
