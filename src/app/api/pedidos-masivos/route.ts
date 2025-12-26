import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

interface ProductoEnPedido {
    productoId: number;
    nombre: string;
    cantidad: number;
    precio: number;
    unidad: string;
}

interface PedidoMasivo {
    fecha: string;
    hora: string;
    productos: ProductoEnPedido[];
}

export async function POST(request: Request) {
    try {
        const { casinoId, empresaId, pedidos } = await request.json();

        if (!casinoId || !empresaId || !Array.isArray(pedidos) || pedidos.length === 0) {
            return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
        }

        const db = await readDb();
        if (!db) {
            return NextResponse.json({ error: 'Error de base de datos' }, { status: 500 });
        }

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

        const fechaHoy = new Date().toISOString().split('T')[0];
        const horaHoy = new Date().toTimeString().split(' ')[0].substring(0, 5);

        pedidos.forEach((pedido: PedidoMasivo) => {
            if (pedido.productos.length === 0) return; // Skip if no products

            pedidoId++;
            createdCount++;

            const total = pedido.productos.reduce((sum, p) => sum + (p.cantidad * p.precio), 0);

            // Create order - db.pedidosClientes is guaranteed to exist
            if (db.pedidosClientes) {
                db.pedidosClientes.push({
                    id: pedidoId,
                    casinoId: parseInt(casinoId),
                    empresaId: parseInt(empresaId),
                    fechaPedido: fechaHoy,
                    horaPedido: horaHoy,
                    fechaEntrega: pedido.fecha,
                    horaEntrega: pedido.hora,
                    total: total,
                    estado: 'Pendiente',
                    origenPedido: 'Pedidos Múltiples',
                    observaciones: '',
                    repartidor: null,
                    notificadoEmail: false
                });
            }

            // Create details - db.detallesPedido is guaranteed to exist
            if (db.detallesPedido) {
                pedido.productos.forEach((producto) => {
                    detalleId++;
                    db.detallesPedido!.push({
                        id: detalleId,
                        pedidoId: pedidoId,
                        productoId: producto.productoId,
                        nombreProducto: producto.nombre,
                        cantidad: producto.cantidad,
                        precioUnitario: producto.precio,
                        subtotal: producto.cantidad * producto.precio,
                        unidad: producto.unidad
                    });
                });
            }
        });

        await writeDb(db);

        return NextResponse.json({ success: true, count: createdCount });

    } catch (error) {
        console.error('Error creating bulk orders:', error);
        return NextResponse.json({ error: 'Error al crear los pedidos' }, { status: 500 });
    }
}
