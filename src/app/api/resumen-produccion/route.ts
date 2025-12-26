import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import type { PedidoCliente, DetallePedido } from '@/types/dashboard';

// GET - Get production summary for a specific date
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const fecha = searchParams.get('fecha');

    if (!fecha) {
        return NextResponse.json({ error: 'Fecha requerida' }, { status: 400 });
    }

    try {
        const supabase = createServerClient();

        // Get all orders for the specified delivery date from Supabase
        const { data: pedidosDelDia, error: pedidosError } = await supabase
            .from('pedidos')
            .select('*')
            .eq('fecha_entrega', fecha)
            .neq('estado', 'cancelado');

        if (pedidosError) {
            console.error('Error fetching pedidos:', pedidosError);
            return NextResponse.json({ error: 'Error al cargar pedidos' }, { status: 500 });
        }

        // Get all order IDs
        const pedidoIds = (pedidosDelDia || []).map((p: any) => p.id);

        // Get all details for these orders
        let detalles: any[] = [];
        if (pedidoIds.length > 0) {
            const { data: detallesData, error: detallesError } = await supabase
                .from('detalle_pedidos')
                .select('*')
                .in('pedido_id', pedidoIds);

            if (detallesError) {
                console.error('Error fetching detalles:', detallesError);
            } else {
                detalles = detallesData || [];
            }
        }

        // Aggregate by product AND unit (to avoid mixing Kg with Un)
        const resumenPorProducto: Record<string, {
            productoId: number;
            productoNombre: string;
            unidad: string;
            cantidadTotal: number;
            subtotalTotal: number;
        }> = {};

        for (const detalle of detalles) {
            // Create a unique key combining product ID and unit
            const key = `${detalle.producto_id}-${detalle.unidad || 'Un'}`;

            if (!resumenPorProducto[key]) {
                resumenPorProducto[key] = {
                    productoId: detalle.producto_id,
                    productoNombre: detalle.producto_nombre,
                    unidad: detalle.unidad || 'Un',
                    cantidadTotal: 0,
                    subtotalTotal: 0
                };
            }
            resumenPorProducto[key].cantidadTotal += detalle.cantidad || 0;
            resumenPorProducto[key].subtotalTotal += detalle.subtotal || 0;
        }

        // Convert to array and sort by product name, then by unit
        const resumen = Object.values(resumenPorProducto).sort((a, b) => {
            const nameCompare = a.productoNombre.localeCompare(b.productoNombre);
            if (nameCompare !== 0) return nameCompare;
            return a.unidad.localeCompare(b.unidad);
        });

        // Calculate totals
        const totales = {
            totalPedidos: (pedidosDelDia || []).length,
            totalProductos: resumen.length,
            totalUnidades: resumen.reduce((sum, p) => sum + p.cantidadTotal, 0),
            totalMonto: resumen.reduce((sum, p) => sum + p.subtotalTotal, 0)
        };

        // Also return orders by casino for the detailed view
        // Map Supabase snake_case to expected camelCase
        const pedidosPorCasino = (pedidosDelDia || []).map((pedido: any) => {
            const detallesPedido = detalles
                .filter((d: any) => d.pedido_id === pedido.id)
                .map((d: any) => ({
                    id: d.id,
                    pedidoId: d.pedido_id,
                    productoId: d.producto_id,
                    productoNombre: d.producto_nombre || 'Sin nombre',
                    cantidad: d.cantidad || 0,
                    precioUnitario: d.precio_unitario || 0,
                    subtotal: d.subtotal || 0,
                    unidad: d.unidad || 'Un'
                }));

            return {
                id: pedido.id,
                casinoId: pedido.casino_id,
                casinoNombre: pedido.casino_nombre || 'Sin asignar',
                empresaId: pedido.empresa_id,
                empresaNombre: pedido.empresa_nombre || '',
                fechaPedido: pedido.fecha_pedido,
                fechaEntrega: pedido.fecha_entrega,
                horaPedido: pedido.hora_pedido || '',
                horaEntrega: pedido.hora_entrega || '',
                estado: pedido.estado || 'pendiente',
                total: pedido.total || 0,
                observaciones: pedido.observaciones || '',
                repartidor: pedido.repartidor || '',
                origenPedido: pedido.origen_pedido || 'web',
                detalles: detallesPedido
            };
        });

        return NextResponse.json({
            fecha,
            resumenProduccion: resumen,
            totales,
            pedidosPorCasino
        });

    } catch (error) {
        console.error('Error in resumen-produccion:', error);
        return NextResponse.json({ error: 'Error al procesar resumen' }, { status: 500 });
    }
}
