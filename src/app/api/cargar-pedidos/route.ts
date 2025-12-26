import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

interface PedidoExcel {
    'Fecha Entrega': string;
    'Hora Entrega': string;
    'Producto': string;
    'Cantidad': number;
    'Unidad': string;
}

function parseFecha(fechaStr: string): string {
    // Expected format: DD/MM/YYYY
    const parts = fechaStr.split('/');
    if (parts.length !== 3) return '';

    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

export async function POST(request: Request) {
    try {
        const { pedidos, casinoId } = await request.json();

        if (!casinoId) {
            return NextResponse.json({ error: 'Casino ID requerido' }, { status: 400 });
        }

        if (!Array.isArray(pedidos) || pedidos.length === 0) {
            return NextResponse.json({ error: 'No hay pedidos para procesar' }, { status: 400 });
        }

        const db = await readDb();
        if (!db) {
            return NextResponse.json({ error: 'Error de base de datos' }, { status: 500 });
        }

        // Get client's casino
        const casino = db.casinos?.find((c: any) => c.id === casinoId);
        if (!casino) {
            return NextResponse.json({ error: 'Casino no encontrado' }, { status: 404 });
        }

        // Get client's available products with prices
        const preciosCliente = (db.preciosClientes || []).filter(
            (p: any) => p.empresaId === casino.empresaId
        );

        // Group pedidos by fecha + hora
        const pedidosAgrupados: Record<string, any[]> = {};
        const errors: string[] = [];

        pedidos.forEach((item: PedidoExcel, index) => {
            const rowNum = index + 2;

            // Validate fields
            if (!item['Fecha Entrega']) {
                errors.push(`Fila ${rowNum}: Fecha Entrega es requerida`);
                return;
            }
            if (!item['Hora Entrega']) {
                errors.push(`Fila ${rowNum}: Hora Entrega es requerida`);
                return;
            }
            if (!item['Producto']) {
                errors.push(`Fila ${rowNum}: Producto es requerido`);
                return;
            }
            if (!item['Cantidad'] || item['Cantidad'] <= 0) {
                errors.push(`Fila ${rowNum}: Cantidad debe ser mayor a 0`);
                return;
            }
            if (!item['Unidad']) {
                errors.push(`Fila ${rowNum}: Unidad es requerida`);
                return;
            }

            // Parse fecha
            const fechaEntrega = parseFecha(item['Fecha Entrega']);
            if (!fechaEntrega) {
                errors.push(`Fila ${rowNum}: Formato de fecha inválido (use DD/MM/YYYY)`);
                return;
            }

            // Find product
            const precioProducto = preciosCliente.find((p: any) =>
                p.nombreProducto.toLowerCase() === item['Producto'].toLowerCase()
            );

            if (!precioProducto) {
                errors.push(`Fila ${rowNum}: Producto "${item['Producto']}" no encontrado o no disponible`);
                return;
            }

            // Validate unit
            const unidad = item['Unidad'].trim();
            if (unidad !== 'Kg' && unidad !== 'Un') {
                errors.push(`Fila ${rowNum}: Unidad debe ser "Kg" o "Un"`);
                return;
            }

            // Group key: fecha + hora
            const key = `${fechaEntrega}_${item['Hora Entrega']}`;

            if (!pedidosAgrupados[key]) {
                pedidosAgrupados[key] = [];
            }

            pedidosAgrupados[key].push({
                productoId: precioProducto.productoId,
                nombreProducto: precioProducto.nombreProducto,
                cantidad: Number(item['Cantidad']),
                precio: precioProducto.precioNeto,
                unidad: unidad
            });
        });

        if (errors.length > 0 && Object.keys(pedidosAgrupados).length === 0) {
            return NextResponse.json({
                error: 'No se pudo procesar ningún pedido',
                errors
            }, { status: 400 });
        }

        // Create orders
        if (!db.pedidosClientes) db.pedidosClientes = [];
        if (!db.detallesPedido) db.detallesPedido = [];

        const maxPedidoId = db.pedidosClientes.length > 0
            ? Math.max(...db.pedidosClientes.map((p: any) => p.id))
            : 0;

        const maxDetalleId = db.detallesPedido.length > 0
            ? Math.max(...db.detallesPedido.map((d: any) => d.id))
            : 0;

        let pedidoId = maxPedidoId;
        let detalleId = maxDetalleId;
        let createdCount = 0;

        Object.entries(pedidosAgrupados).forEach(([key, detalles]) => {
            const [fecha, hora] = key.split('_');
            pedidoId++;
            createdCount++;

            const total = detalles.reduce((sum, d) => sum + (d.cantidad * d.precio), 0);

            // Create order - safely check db.pedidosClientes exists
            if (db.pedidosClientes) {
                db.pedidosClientes.push({
                    id: pedidoId,
                    casinoId: casino.id,
                    empresaId: casino.empresaId,
                    fechaPedido: new Date().toISOString().split('T')[0],
                    horaPedido: new Date().toTimeString().split(' ')[0].substring(0, 5),
                    fechaEntrega: fecha,
                    horaEntrega: hora,
                    total: total,
                    estado: 'Pendiente',
                    origenPedido: 'Carga Masiva',
                    observaciones: '',
                    repartidor: null,
                    notificadoEmail: false
                });
            }

            // Create details - safely check db.detallesPedido exists
            if (db.detallesPedido) {
                detalles.forEach((detalle) => {
                    detalleId++;
                    db.detallesPedido!.push({
                        id: detalleId,
                        pedidoId: pedidoId,
                        productoId: detalle.productoId,
                        nombreProducto: detalle.nombreProducto,
                        cantidad: detalle.cantidad,
                        precioUnitario: detalle.precio,
                        subtotal: detalle.cantidad * detalle.precio,
                        unidad: detalle.unidad
                    });
                });
            }
        });

        await writeDb(db);

        return NextResponse.json({
            success: true,
            count: createdCount,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error('Error processing bulk orders:', error);
        return NextResponse.json({ error: 'Error al procesar los pedidos' }, { status: 500 });
    }
}
