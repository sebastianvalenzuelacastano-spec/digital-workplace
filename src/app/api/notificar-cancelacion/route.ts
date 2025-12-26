import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { pedidoId, casinoNombre, fechaEntrega, total, productos } = data;

        const supabase = createServerClient();

        // Get admin email from configuracion or use default
        const { data: config } = await supabase
            .from('configuracion')
            .select('*')
            .single();

        const adminEmail = config?.emailNotificaciones || 'panaderiamonserrat7@gmail.com';

        // Log the cancellation (could be stored in a notifications table)
        console.log(`
========================================
⚠️ PEDIDO CANCELADO POR CLIENTE
========================================
Pedido #${pedidoId?.toString().padStart(4, '0')}
Casino: ${casinoNombre}
Fecha Entrega: ${fechaEntrega}
Productos: ${productos}
Total: $${total?.toLocaleString() || 0}
Hora: ${new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' })}
========================================
        `);

        // Store notification in database for dashboard display
        await supabase.from('notificaciones').insert({
            tipo: 'cancelacion_pedido',
            titulo: `Pedido #${pedidoId?.toString().padStart(4, '0')} cancelado`,
            mensaje: `${casinoNombre} canceló su pedido para ${fechaEntrega}. Total: $${total?.toLocaleString() || 0}`,
            leida: false,
            fecha: new Date().toISOString()
        }).catch(() => {
            // Table might not exist yet, that's ok
            console.log('Notifications table not found, skipping DB notification');
        });

        // TODO: Here you could add email sending logic
        // Example with Resend, SendGrid, or similar:
        // await sendEmail({
        //     to: adminEmail,
        //     subject: `Pedido #${pedidoId} cancelado por ${casinoNombre}`,
        //     body: `El cliente ${casinoNombre} ha cancelado su pedido...`
        // });

        return NextResponse.json({ success: true, logged: true });

    } catch (error) {
        console.error('Error processing cancellation notification:', error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
