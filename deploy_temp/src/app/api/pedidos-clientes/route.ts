import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import type { PedidoCliente, DetallePedido } from '@/types/dashboard';

// GET - List orders with filters
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const fecha = searchParams.get('fecha');
    const casinoId = searchParams.get('casinoId');
    const empresaId = searchParams.get('empresaId');
    const estado = searchParams.get('estado');
    const db = readDb();

    if (!db || !db.pedidosClientes) {
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    let pedidos = db.pedidosClientes;

    // Apply filters
    if (fecha) {
        pedidos = pedidos.filter((p: PedidoCliente) => p.fechaEntrega === fecha);
    }
    if (casinoId) {
        pedidos = pedidos.filter((p: PedidoCliente) => p.casinoId === parseInt(casinoId));
    }
    if (empresaId) {
        pedidos = pedidos.filter((p: PedidoCliente) => p.empresaId === parseInt(empresaId));
    }
    if (estado) {
        pedidos = pedidos.filter((p: PedidoCliente) => p.estado === estado);
    }

    // Include order details and update status if needed
    let hasUpdates = false;

    // Safe Chile Time calculation
    let currentHour = 0;
    let todayStr = "";

    try {
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: 'America/Santiago',
            hour12: false,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit'
        });

        const parts = formatter.formatToParts(new Date());
        const getPart = (type: string) => parts.find(p => p.type === type)?.value;

        // Construct YYYY-MM-DD
        todayStr = `${getPart('year')}-${getPart('month')}-${getPart('day')}`;
        currentHour = parseInt(getPart('hour') || '0', 10);
    } catch (e) {
        console.error("Error calculating Chile time:", e);
        // Fallback to UTC or server local if needed, or just skip update
    }

    const pedidosWithDetails = pedidos.map((pedido: PedidoCliente) => {
        // Auto-update to 'despachado' logic
        if (todayStr &&
            pedido.fechaEntrega === todayStr &&
            currentHour >= 15 &&
            ['pendiente', 'confirmado', 'en_produccion'].includes(pedido.estado)) {

            pedido.estado = 'despachado';

            // Update in the main array reference for persistence
            const dbIndex = db.pedidosClientes.findIndex((p: PedidoCliente) => p.id === pedido.id);
            if (dbIndex !== -1) {
                db.pedidosClientes[dbIndex].estado = 'despachado';
                hasUpdates = true;
            }
        }

        const detalles = (db.detallesPedidos || []).filter(
            (d: DetallePedido) => d.pedidoId === pedido.id
        );
        return { ...pedido, detalles };
    });

    if (hasUpdates) {
        writeDb(db);
    }

    return NextResponse.json(pedidosWithDetails);
}

// POST - Create new order
export async function POST(request: Request) {
    const data = await request.json();
    const db = readDb();

    if (!db) {
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!db.pedidosClientes) db.pedidosClientes = [];
    if (!db.detallesPedidos) db.detallesPedidos = [];

    // Validate casino exists
    const casino = db.casinosSucursales?.find((c: any) => c.id === data.casinoId);
    if (!casino) {
        return NextResponse.json({ error: 'Casino no encontrado' }, { status: 400 });
    }

    // Get empresa info
    const empresa = db.empresasClientes?.find((e: any) => e.id === casino.empresaId);

    // Check order deadline (18:00)
    const now = new Date();
    const currentHour = now.getHours();
    const orderDate = now.toISOString().split('T')[0];
    const deliveryDate = new Date(data.fechaEntrega);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (currentHour >= 18) {
        // After 18:00, minimum delivery is day after tomorrow
        const minDelivery = new Date(now);
        minDelivery.setDate(minDelivery.getDate() + 2);
        if (deliveryDate < minDelivery) {
            return NextResponse.json({
                error: 'Después de las 18:00, el pedido mínimo es para pasado mañana'
            }, { status: 400 });
        }
    } else {
        // Before 18:00, minimum delivery is tomorrow
        if (deliveryDate < tomorrow) {
            return NextResponse.json({
                error: 'La fecha de entrega debe ser al menos mañana'
            }, { status: 400 });
        }
    }

    // Create order
    const newOrderId = db.pedidosClientes.length > 0
        ? Math.max(...db.pedidosClientes.map((p: PedidoCliente) => p.id)) + 1
        : 1;

    const newOrder: PedidoCliente = {
        id: newOrderId,
        casinoId: data.casinoId,
        empresaId: casino.empresaId,
        casinoNombre: casino.nombre,
        empresaNombre: empresa?.nombre || '',
        fechaPedido: orderDate,
        fechaEntrega: data.fechaEntrega,
        horaPedido: now.toTimeString().slice(0, 5),
        estado: 'pendiente',
        total: 0,
        observaciones: data.observaciones || '',
        esRecurrente: data.esRecurrente || false,
        diasRecurrencia: data.diasRecurrencia || [],
        notificadoEmail: false,
        notificadoWhatsapp: false
    };

    // Create order items
    let total = 0;
    const detalles: DetallePedido[] = [];
    const baseDetailId = db.detallesPedidos.length > 0
        ? Math.max(...db.detallesPedidos.map((d: DetallePedido) => d.id)) + 1
        : 1;

    for (let i = 0; i < data.items.length; i++) {
        const item = data.items[i];
        const subtotal = item.cantidad * item.precioUnitario;
        total += subtotal;

        const detalle: DetallePedido = {
            id: baseDetailId + i,
            pedidoId: newOrderId,
            productoId: item.productoId,
            productoNombre: item.productoNombre,
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario,
            subtotal
        };
        detalles.push(detalle);
        db.detallesPedidos.push(detalle);
    }

    newOrder.total = total;
    db.pedidosClientes.push(newOrder);
    writeDb(db);

    // TODO: Send notifications (email & WhatsApp)
    // sendEmailNotification(newOrder, detalles, casino, empresa);
    // sendWhatsAppNotification(newOrder, casino);

    return NextResponse.json({ ...newOrder, detalles }, { status: 201 });
}

// PUT - Update order status
export async function PUT(request: Request) {
    const data = await request.json();
    const db = readDb();

    if (!db || !db.pedidosClientes) {
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const index = db.pedidosClientes.findIndex((p: PedidoCliente) => p.id === data.id);
    if (index === -1) {
        return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    db.pedidosClientes[index] = {
        ...db.pedidosClientes[index],
        ...data
    };

    writeDb(db);
    return NextResponse.json(db.pedidosClientes[index]);
}

// DELETE - Cancel order
export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '0');
    const db = readDb();

    if (!db || !db.pedidosClientes) {
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const index = db.pedidosClientes.findIndex((p: PedidoCliente) => p.id === id);
    if (index === -1) {
        return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    // Don't delete, just cancel
    db.pedidosClientes[index].estado = 'cancelado';
    writeDb(db);

    return NextResponse.json({ success: true });
}
