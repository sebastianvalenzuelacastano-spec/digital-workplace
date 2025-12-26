import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import type { RegistroColegio } from '@/types/dashboard';

// GET - Obtener registros de colegios con filtros opcionales
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const repartidor = searchParams.get('repartidor');
        const fechaInicio = searchParams.get('fechaInicio');
        const fechaFin = searchParams.get('fechaFin');
        const cliente = searchParams.get('cliente');

        const db = await readDb();
        if (!db) {
            return NextResponse.json({ error: 'Error de base de datos' }, { status: 500 });
        }

        if (!db.colegios) db.colegios = [];

        let registros = db.colegios as RegistroColegio[];

        // Aplicar filtros
        if (repartidor && repartidor !== 'todos') {
            registros = registros.filter((r: RegistroColegio) => r.repartidor === repartidor);
        }

        if (fechaInicio) {
            registros = registros.filter((r: RegistroColegio) => r.fecha >= fechaInicio);
        }

        if (fechaFin) {
            registros = registros.filter((r: RegistroColegio) => r.fecha <= fechaFin);
        }

        if (cliente) {
            registros = registros.filter((r: RegistroColegio) =>
                r.cliente.toLowerCase().includes(cliente.toLowerCase())
            );
        }

        // Ordenar por fecha descendente
        registros.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

        return NextResponse.json(registros);
    } catch (error) {
        console.error('Error fetching colegios:', error);
        return NextResponse.json({ error: 'Error al obtener registros' }, { status: 500 });
    }
}

// POST - Crear nuevo registro
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { fecha, repartidor, pesoFormula, pesoReal, observaciones, creador } = body;

        // Validar campos requeridos (cliente y producto ya no son requeridos)
        if (!fecha || !repartidor || pesoFormula === undefined || pesoReal === undefined || !creador) {
            return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
        }

        // Validar que los pesos sean números positivos
        if (pesoFormula <= 0 || pesoReal <= 0) {
            return NextResponse.json({ error: 'Los pesos deben ser mayores a 0' }, { status: 400 });
        }

        const db = await readDb();
        if (!db) {
            return NextResponse.json({ error: 'Error de base de datos' }, { status: 500 });
        }

        if (!db.colegios) db.colegios = [];

        // Calcular diferencia y porcentaje de merma
        const diferencia = pesoReal - pesoFormula;
        const porcentajeMerma = ((pesoReal - pesoFormula) / pesoFormula) * 100;

        // Generar ID
        const maxId = db.colegios.length > 0
            ? Math.max(...db.colegios.map((c: RegistroColegio) => c.id))
            : 0;

        const nuevoRegistro: RegistroColegio = {
            id: maxId + 1,
            fecha,
            repartidor,
            cliente: 'Colegio Principal', // Valor fijo ya que es solo uno
            producto: 'Pan Total', // Valor fijo - se registra peso total
            pesoFormula: Number(pesoFormula),
            pesoReal: Number(pesoReal),
            diferencia: Number(diferencia.toFixed(2)),
            porcentajeMerma: Number(porcentajeMerma.toFixed(2)),
            observaciones: observaciones || null,
            creador,
            fechaCreacion: new Date().toISOString()
        };

        db.colegios.push(nuevoRegistro);
        await writeDb(db);

        return NextResponse.json(nuevoRegistro, { status: 201 });

    } catch (error) {
        console.error('Error creating colegio registro:', error);
        return NextResponse.json({ error: 'Error al crear registro' }, { status: 500 });
    }
}

// PUT - Actualizar registro existente
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, fecha, repartidor, cliente, producto, pesoFormula, pesoReal, observaciones } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
        }

        const db = await readDb();
        if (!db || !db.colegios) {
            return NextResponse.json({ error: 'Error de base de datos' }, { status: 500 });
        }

        const index = db.colegios.findIndex((c: RegistroColegio) => c.id === id);
        if (index === -1) {
            return NextResponse.json({ error: 'Registro no encontrado' }, { status: 404 });
        }

        // Recalcular si cambian los pesos
        const diferencia = pesoReal - pesoFormula;
        const porcentajeMerma = ((pesoReal - pesoFormula) / pesoFormula) * 100;

        db.colegios[index] = {
            ...db.colegios[index],
            fecha: fecha || db.colegios[index].fecha,
            repartidor: repartidor || db.colegios[index].repartidor,
            cliente: cliente || db.colegios[index].cliente,
            producto: producto || db.colegios[index].producto,
            pesoFormula: pesoFormula !== undefined ? Number(pesoFormula) : db.colegios[index].pesoFormula,
            pesoReal: pesoReal !== undefined ? Number(pesoReal) : db.colegios[index].pesoReal,
            diferencia: Number(diferencia.toFixed(2)),
            porcentajeMerma: Number(porcentajeMerma.toFixed(2)),
            observaciones: observaciones !== undefined ? observaciones : db.colegios[index].observaciones
        };

        await writeDb(db);

        return NextResponse.json(db.colegios[index]);

    } catch (error) {
        console.error('Error updating colegio registro:', error);
        return NextResponse.json({ error: 'Error al actualizar registro' }, { status: 500 });
    }
}

// DELETE - Eliminar registro
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = parseInt(searchParams.get('id') || '');

        if (!id) {
            return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
        }

        const db = await readDb();
        if (!db || !db.colegios) {
            return NextResponse.json({ error: 'Error de base de datos' }, { status: 500 });
        }

        const index = db.colegios.findIndex((c: RegistroColegio) => c.id === id);
        if (index === -1) {
            return NextResponse.json({ error: 'Registro no encontrado' }, { status: 404 });
        }

        db.colegios.splice(index, 1);
        await writeDb(db);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error deleting colegio registro:', error);
        return NextResponse.json({ error: 'Error al eliminar registro' }, { status: 500 });
    }
}
