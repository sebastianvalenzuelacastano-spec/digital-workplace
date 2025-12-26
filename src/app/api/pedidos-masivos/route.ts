import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

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
        const body = await request.json();
        const { casinoId, empresaId, casinoNombre, empresaNombre, pedidos } = body;

        console.log('Bulk orders request:', { casinoId, empresaId, pedidosCount: pedidos?.length });

        if (!casinoId || !Array.isArray(pedidos) || pedidos.length === 0) {
            console.error('Validation failed:', { casinoId, hasPedidos: Array.isArray(pedidos), count: pedidos?.length });
            return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
        }

        const supabase = createServerClient();
        const fechaHoy = new Date().toISOString().split('T')[0];
        const horaHoy = new Date().toTimeString().split(' ')[0].substring(0, 5);
        let createdCount = 0;
        const errors: Array<{ fecha: string; error: string }> = [];

        for (const pedido of pedidos as PedidoMasivo[]) {
            console.log('Processing pedido:', { fecha: pedido.fecha, productosCount: pedido.productos?.length });

            if (!pedido.productos || pedido.productos.length === 0) {
                console.log('Skipping pedido with no productos');
                continue;
            }

            const total = pedido.productos.reduce((sum, p) => sum + (p.cantidad * p.precio), 0);

            // Create order in Supabase
            const { data: newPedido, error: pedidoError } = await supabase
                .from('pedidos')
                .insert({
                    casino_id: parseInt(String(casinoId)),
                    casino_nombre: casinoNombre || null,
                    empresa_id: empresaId ? parseInt(String(empresaId)) : 1,
                    empresa_nombre: empresaNombre || null,
                    fecha_pedido: fechaHoy,
                    hora_pedido: horaHoy,
                    fecha_entrega: pedido.fecha,
                    hora_entrega: pedido.hora,
                    total: total,
                    estado: 'pendiente',
                    origen_pedido: 'web',
                    observaciones: '',
                    repartidor: null,
                    notificado_email: false,
                    notificado_whatsapp: false,
                    es_recurrente: false
                })
                .select()
                .single();

            if (pedidoError) {
                console.error('Error creating pedido:', pedidoError);
                errors.push({ fecha: pedido.fecha, error: pedidoError.message || pedidoError.code });
                continue;
            }

            console.log('Created pedido:', newPedido.id);
            createdCount++;

            // Create details in Supabase
            const detalles = pedido.productos.map(producto => ({
                pedido_id: newPedido.id,
                producto_id: producto.productoId,
                producto_nombre: producto.nombre,
                cantidad: producto.cantidad,
                precio_unitario: producto.precio,
                subtotal: producto.cantidad * producto.precio,
                unidad: producto.unidad
            }));

            const { error: detalleError } = await supabase
                .from('detalle_pedidos')
                .insert(detalles);

            if (detalleError) {
                console.error('Error creating detalles:', detalleError);
            }
        }

        return NextResponse.json({ success: true, count: createdCount, errors: errors.length > 0 ? errors : undefined });

    } catch (error) {
        console.error('Error creating bulk orders:', error);
        return NextResponse.json({ error: 'Error al crear los pedidos' }, { status: 500 });
    }
}
