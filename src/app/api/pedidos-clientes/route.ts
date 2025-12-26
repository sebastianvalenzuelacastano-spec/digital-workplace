import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// GET - List orders with filters
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const fecha = searchParams.get('fecha');
    const casinoId = searchParams.get('casinoId');
    const empresaId = searchParams.get('empresaId');
    const estado = searchParams.get('estado');

    const supabase = createServerClient();

    // Build query
    let query = supabase.from('pedidos').select('*');

    if (fecha) {
        query = query.eq('fecha_entrega', fecha);
    }
    if (casinoId) {
        query = query.eq('casino_id', parseInt(casinoId));
    }
    if (empresaId) {
        query = query.eq('empresa_id', parseInt(empresaId));
    }
    if (estado) {
        query = query.eq('estado', estado);
    }

    const { data: pedidos, error } = await query.order('fecha_entrega', { ascending: false });

    if (error) {
        console.error('Error fetching pedidos:', error);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Get all details for these orders
    const pedidoIds = pedidos.map(p => p.id);
    const { data: detalles } = await supabase
        .from('detalle_pedidos')
        .select('*')
        .in('pedido_id', pedidoIds.length > 0 ? pedidoIds : [-1]);

    // Map to frontend format with detalles
    const pedidosWithDetails = pedidos.map(p => ({
        id: p.id,
        casinoId: p.casino_id,
        empresaId: p.empresa_id,
        casinoNombre: p.casino_nombre,
        empresaNombre: p.empresa_nombre,
        fechaPedido: p.fecha_pedido,
        fechaEntrega: p.fecha_entrega,
        horaPedido: p.hora_pedido,
        horaEntrega: p.hora_entrega,
        estado: p.estado,
        total: p.total,
        observaciones: p.observaciones,
        esRecurrente: p.es_recurrente,
        diasRecurrencia: p.dias_recurrencia,
        repartidor: p.repartidor,
        origenPedido: p.origen_pedido,
        notificadoEmail: p.notificado_email,
        notificadoWhatsapp: p.notificado_whatsapp,
        detalles: (detalles || [])
            .filter(d => d.pedido_id === p.id)
            .map(d => ({
                id: d.id,
                pedidoId: d.pedido_id,
                productoId: d.producto_id,
                productoNombre: d.producto_nombre,
                cantidad: d.cantidad,
                unidad: d.unidad,
                precioUnitario: d.precio_unitario,
                subtotal: d.subtotal
            }))
    }));

    return NextResponse.json(pedidosWithDetails);
}

// POST - Create new order
export async function POST(request: Request) {
    const data = await request.json();
    const supabase = createServerClient();

    // Get casino info
    const { data: casino } = await supabase
        .from('casinos_sucursales')
        .select('*')
        .eq('id', data.casinoId)
        .single();

    if (!casino) {
        return NextResponse.json({ error: 'Casino no encontrado' }, { status: 400 });
    }

    // Get empresa info
    const { data: empresa } = await supabase
        .from('empresas_clientes')
        .select('*')
        .eq('id', casino.empresa_id)
        .single();

    // Check order deadline (18:00)
    const now = new Date();
    const currentHour = now.getHours();
    const orderDate = now.toISOString().split('T')[0];

    const [y, m, d] = data.fechaEntrega.split('-').map(Number);
    const deliveryDate = new Date(y, m - 1, d);

    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    if (currentHour >= 18) {
        const minDelivery = new Date(now);
        minDelivery.setDate(minDelivery.getDate() + 2);
        minDelivery.setHours(0, 0, 0, 0);

        if (deliveryDate < minDelivery) {
            return NextResponse.json({
                error: 'Después de las 18:00, el pedido mínimo es para pasado mañana'
            }, { status: 400 });
        }
    } else {
        if (deliveryDate < tomorrow) {
            return NextResponse.json({
                error: 'La fecha de entrega debe ser al menos mañana'
            }, { status: 400 });
        }
    }

    // Create order
    const { data: newOrder, error: orderError } = await supabase
        .from('pedidos')
        .insert({
            casino_id: data.casinoId,
            casino_nombre: casino.nombre,
            empresa_id: casino.empresa_id,
            empresa_nombre: empresa?.nombre || '',
            fecha_pedido: orderDate,
            fecha_entrega: data.fechaEntrega,
            hora_pedido: now.toTimeString().slice(0, 5),
            hora_entrega: data.horaEntrega || null,
            estado: 'pendiente',
            total: 0,
            observaciones: data.observaciones || '',
            es_recurrente: data.esRecurrente || false,
            dias_recurrencia: data.diasRecurrencia || null,
            notificado_email: false,
            notificado_whatsapp: false,
            origen_pedido: data.origenPedido || 'web',
            repartidor: data.repartidor || null
        })
        .select()
        .single();

    if (orderError) {
        console.error('Error creating order:', orderError);
        return NextResponse.json({ error: 'Error al crear el pedido' }, { status: 500 });
    }

    // Create order items
    let total = 0;
    const detallesData = data.items.map((item: any) => {
        const subtotal = item.cantidad * item.precioUnitario;
        total += subtotal;
        return {
            pedido_id: newOrder.id,
            producto_id: item.productoId,
            producto_nombre: item.productoNombre,
            cantidad: item.cantidad,
            unidad: item.unidad,
            precio_unitario: item.precioUnitario,
            subtotal
        };
    });

    const { data: newDetalles, error: detError } = await supabase
        .from('detalle_pedidos')
        .insert(detallesData)
        .select();

    if (detError) {
        console.error('Error creating detalles:', detError);
    }

    // Update order total
    await supabase.from('pedidos').update({ total }).eq('id', newOrder.id);

    // Map response
    const response = {
        id: newOrder.id,
        casinoId: newOrder.casino_id,
        empresaId: newOrder.empresa_id,
        casinoNombre: newOrder.casino_nombre,
        empresaNombre: newOrder.empresa_nombre,
        fechaPedido: newOrder.fecha_pedido,
        fechaEntrega: newOrder.fecha_entrega,
        horaPedido: newOrder.hora_pedido,
        horaEntrega: newOrder.hora_entrega,
        estado: newOrder.estado,
        total: total,
        observaciones: newOrder.observaciones,
        detalles: (newDetalles || []).map(d => ({
            id: d.id,
            pedidoId: d.pedido_id,
            productoId: d.producto_id,
            productoNombre: d.producto_nombre,
            cantidad: d.cantidad,
            unidad: d.unidad,
            precioUnitario: d.precio_unitario,
            subtotal: d.subtotal
        }))
    };

    return NextResponse.json(response, { status: 201 });
}

// PUT - Update order status and details
export async function PUT(request: Request) {
    const data = await request.json();
    const supabase = createServerClient();

    // Update pedido
    const updateData: any = {};
    if (data.estado !== undefined) updateData.estado = data.estado;
    if (data.repartidor !== undefined) updateData.repartidor = data.repartidor;
    if (data.horaEntrega !== undefined) updateData.hora_entrega = data.horaEntrega;
    if (data.observaciones !== undefined) updateData.observaciones = data.observaciones;
    if (data.notificadoEmail !== undefined) updateData.notificado_email = data.notificadoEmail;
    if (data.notificadoWhatsapp !== undefined) updateData.notificado_whatsapp = data.notificadoWhatsapp;

    const { error: updateError } = await supabase
        .from('pedidos')
        .update(updateData)
        .eq('id', data.id);

    if (updateError) {
        console.error('Error updating pedido:', updateError);
        return NextResponse.json({ error: 'Error al actualizar el pedido' }, { status: 500 });
    }

    // Handle detalles update if provided
    if (data.detalles && Array.isArray(data.detalles)) {
        // Delete old detalles
        await supabase.from('detalle_pedidos').delete().eq('pedido_id', data.id);

        // Insert new detalles
        let total = 0;
        const newDetalles = data.detalles.map((det: any) => {
            const subtotal = (det.cantidad || 0) * (det.precioUnitario || 0);
            total += subtotal;
            return {
                pedido_id: data.id,
                producto_id: det.productoId,
                producto_nombre: det.productoNombre,
                cantidad: det.cantidad,
                unidad: det.unidad || 'Kg',
                precio_unitario: det.precioUnitario || 0,
                subtotal
            };
        });

        await supabase.from('detalle_pedidos').insert(newDetalles);
        await supabase.from('pedidos').update({ total }).eq('id', data.id);
    }

    // Get updated order
    const { data: updatedPedido } = await supabase
        .from('pedidos')
        .select('*')
        .eq('id', data.id)
        .single();

    return NextResponse.json(updatedPedido ? {
        id: updatedPedido.id,
        casinoId: updatedPedido.casino_id,
        empresaId: updatedPedido.empresa_id,
        estado: updatedPedido.estado,
        total: updatedPedido.total
    } : { success: true });
}

// DELETE - Cancel order
export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '0');
    const supabase = createServerClient();

    const { error } = await supabase
        .from('pedidos')
        .update({ estado: 'cancelado' })
        .eq('id', id);

    if (error) {
        console.error('Error canceling pedido:', error);
        return NextResponse.json({ error: 'Error al cancelar el pedido' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
