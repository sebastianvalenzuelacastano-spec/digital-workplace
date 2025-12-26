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
        const { casinoId, empresaId, casinoNombre, empresaNombre, pedidos } = await request.json();

        if (!casinoId || !empresaId || !Array.isArray(pedidos) || pedidos.length === 0) {
            return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
        }

        const supabase = createServerClient();
        const fechaHoy = new Date().toISOString().split('T')[0];
        const horaHoy = new Date().toTimeString().split(' ')[0].substring(0, 5);
        let createdCount = 0;

        for (const pedido of pedidos as PedidoMasivo[]) {
            if (pedido.productos.length === 0) continue;

            const total = pedido.productos.reduce((sum, p) => sum + (p.cantidad * p.precio), 0);

            // Create order in Supabase
            const { data: newPedido, error: pedidoError } = await supabase
                .from('pedidos')
                .insert({
                    casino_id: parseInt(String(casinoId)),
                    casino_nombre: casinoNombre || null,
                    empresa_id: parseInt(String(empresaId)),
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
                continue;
            }

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

        return NextResponse.json({ success: true, count: createdCount });

    } catch (error) {
        console.error('Error creating bulk orders:', error);
        return NextResponse.json({ error: 'Error al crear los pedidos' }, { status: 500 });
    }
}
