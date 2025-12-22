import { NextResponse } from 'next/server';
import { readDb } from '@/lib/db';
import type { PedidoCliente, DetallePedido } from '@/types/dashboard';

// GET - Get production summary for a specific date
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const fecha = searchParams.get('fecha');

    if (!fecha) {
        return NextResponse.json({ error: 'Fecha requerida' }, { status: 400 });
    }

    let db = await readDb();

    // Initialize database if it doesn't exist
    if (!db) {
        console.log('Database not found in resumen-produccion, initializing...');
        const { initializeDb } = await import('@/lib/db');
        await initializeDb();
        db = await readDb();

        if (!db) {
            return NextResponse.json({ error: 'Failed to initialize database' }, { status: 500 });
        }
    }

    // Initialize collections if they don't exist
    if (!db.pedidosClientes) {
        db.pedidosClientes = [];
    }
    if (!db.detallesPedidos) {
        db.detallesPedidos = [];
    }

    // Get all orders for the specified delivery date
    const pedidosDelDia = db.pedidosClientes.filter(
        (p: PedidoCliente) => p.fechaEntrega === fecha && p.estado !== 'cancelado'
    );

    // Get all order IDs
    const pedidoIds = pedidosDelDia.map((p: PedidoCliente) => p.id);

    // Get all details for these orders
    const detalles = db.detallesPedidos.filter(
        (d: DetallePedido) => pedidoIds.includes(d.pedidoId)
    );

    // Aggregate by product
    const resumenPorProducto: Record<number, {
        productoId: number;
        productoNombre: string;
        cantidadTotal: number;
        subtotalTotal: number;
    }> = {};

    for (const detalle of detalles) {
        if (!resumenPorProducto[detalle.productoId]) {
            resumenPorProducto[detalle.productoId] = {
                productoId: detalle.productoId,
                productoNombre: detalle.productoNombre,
                cantidadTotal: 0,
                subtotalTotal: 0
            };
        }
        resumenPorProducto[detalle.productoId].cantidadTotal += detalle.cantidad;
        resumenPorProducto[detalle.productoId].subtotalTotal += detalle.subtotal;
    }

    // Convert to array and sort by product name
    const resumen = Object.values(resumenPorProducto).sort((a, b) =>
        a.productoNombre.localeCompare(b.productoNombre)
    );

    // Calculate totals
    const totales = {
        totalPedidos: pedidosDelDia.length,
        totalProductos: resumen.length,
        totalUnidades: resumen.reduce((sum, p) => sum + p.cantidadTotal, 0),
        totalMonto: resumen.reduce((sum, p) => sum + p.subtotalTotal, 0)
    };

    // Also return orders by casino for the detailed view
    const pedidosPorCasino = pedidosDelDia.map((pedido: PedidoCliente) => {
        const detallesPedido = (db.detallesPedidos || []).filter(
            (d: DetallePedido) => d.pedidoId === pedido.id
        );
        return {
            ...pedido,
            detalles: detallesPedido
        };
    });

    return NextResponse.json({
        fecha,
        resumenProduccion: resumen,
        totales,
        pedidosPorCasino
    });
}
