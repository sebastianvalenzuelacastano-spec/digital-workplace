import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const casinoId = searchParams.get('casinoId');

        const db = await readDb();
        if (!db || !db.reclamos) {
            return NextResponse.json([]);
        }

        let reclamos = db.reclamos;

        // Filter by casinoId if provided (for clients)
        if (casinoId) {
            reclamos = reclamos.filter((r: any) => r.casinoId === parseInt(casinoId));
        }

        // Sort by date desc
        reclamos.sort((a: any, b: any) => {
            const dateA = new Date(`${a.fechaIncidente} ${a.horaIncidente}`);
            const dateB = new Date(`${b.fechaIncidente} ${b.horaIncidente}`);
            return dateB.getTime() - dateA.getTime();
        });

        return NextResponse.json(reclamos);
    } catch (error) {
        console.error('Error loading reclamos:', error);
        return NextResponse.json({ error: 'Error al cargar reclamos' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { casinoId, empresaId, fechaIncidente, horaIncidente, tipo, area, email, descripcion, imagenes } = await request.json();

        // Validation
        if (!casinoId || !fechaIncidente || !horaIncidente || !tipo || !area || !email || !descripcion) {
            return NextResponse.json({ error: 'Campos requeridos faltantes' }, { status: 400 });
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
        }

        const db = await readDb();
        if (!db) {
            return NextResponse.json({ error: 'Error de base de datos' }, { status: 500 });
        }

        if (!db.reclamos) db.reclamos = [];

        const maxId = db.reclamos.length > 0
            ? Math.max(...db.reclamos.map((r: any) => r.id))
            : 0;

        const newReclamo = {
            id: maxId + 1,
            casinoId: parseInt(casinoId),
            empresaId: parseInt(empresaId),
            fechaIncidente,
            horaIncidente,
            tipo, // 'Reclamo' o 'Sugerencia'
            area, // 'Administración', 'Despacho', 'Producción'
            email,
            descripcion,
            imagenes: imagenes || [], // Array of base64 or URLs
            estado: 'Pendiente', // Pendiente, En Revisión, Resuelto
            fechaCreacion: new Date().toISOString().split('T')[0],
            horaCreacion: new Date().toTimeString().split(' ')[0].substring(0, 5),
            respuesta: null,
            fechaRespuesta: null
        };

        db.reclamos.push(newReclamo);
        await writeDb(db);

        return NextResponse.json(newReclamo);
    } catch (error) {
        console.error('Error creating reclamo:', error);
        return NextResponse.json({ error: 'Error al crear reclamo' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const { id, estado, respuesta } = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
        }

        const db = await readDb();
        if (!db || !db.reclamos) {
            return NextResponse.json({ error: 'Reclamo no encontrado' }, { status: 404 });
        }

        const index = db.reclamos.findIndex((r: any) => r.id === id);
        if (index === -1) {
            return NextResponse.json({ error: 'Reclamo no encontrado' }, { status: 404 });
        }

        // Update fields
        if (estado) db.reclamos[index].estado = estado;
        if (respuesta !== undefined) {
            db.reclamos[index].respuesta = respuesta;
            db.reclamos[index].fechaRespuesta = new Date().toISOString().split('T')[0];
        }

        await writeDb(db);

        return NextResponse.json(db.reclamos[index]);
    } catch (error) {
        console.error('Error updating reclamo:', error);
        return NextResponse.json({ error: 'Error al actualizar reclamo' }, { status: 500 });
    }
}
