import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Migration endpoint - Run once to migrate data from local db.json to Supabase
// Access via: /api/migrate-to-supabase?key=MIGRATE_2426

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRycmVnc3pycGZpeHZ2c3NveW1rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Njc2NzE5MiwiZXhwIjoyMDgyMzQzMTkyfQ.DnCh5rlcvNHBfJTSLnG2aJevNK0KPbo0vNQI0_QxHNs';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (key !== 'MIGRATE_2426') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Create Supabase admin client
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

        // Read from local db.json file
        const dbPath = path.join(process.cwd(), 'data', 'db.json');
        const dbContent = fs.readFileSync(dbPath, 'utf-8');
        const db = JSON.parse(dbContent);

        const results: Record<string, { success: boolean; count: number; error?: string }> = {};

        // Helper to validate date strings
        const validDate = (d: any): string | null => {
            if (!d || d === '-' || d === '' || d === 'null') return null;
            return d;
        };

        // Helper to map estado values
        const validEstado = (e: string): string => {
            const validEstados = ['pendiente', 'confirmado', 'en_produccion', 'despachado', 'entregado', 'cancelado'];
            if (validEstados.includes(e)) return e;
            if (e === 'en_proceso') return 'en_produccion';
            if (e === 'completado') return 'entregado';
            return 'pendiente';
        };

        // Helper to validate origen_pedido
        const validOrigen = (o: any): string => {
            if (o === 'web' || o === 'manual') return o;
            return 'manual';
        };

        // 1. Migrate Proveedores
        if (db.maestroProveedores?.length > 0) {
            const { error } = await supabase.from('proveedores').upsert(
                db.maestroProveedores.map((p: any) => ({
                    id: p.id,
                    rut: p.rut || null,
                    nombre: p.nombre,
                    contacto: p.contacto || null,
                    telefono: p.telefono || null,
                    email: p.email || null,
                    direccion: p.direccion || null,
                    activo: p.activo ?? true
                })),
                { onConflict: 'id' }
            );
            results.proveedores = { success: !error, count: db.maestroProveedores.length, error: error?.message };
        }

        // 2. Migrate Clientes
        if (db.maestroClientes?.length > 0) {
            const { error } = await supabase.from('clientes').upsert(
                db.maestroClientes.map((c: any) => ({
                    id: c.id,
                    rut: c.rut || null,
                    nombre: c.nombre,
                    tipo: c.tipo || 'empresa',
                    contacto: c.contacto || null,
                    telefono: c.telefono || null,
                    email: c.email || null,
                    direccion: c.direccion || null,
                    activo: c.activo ?? true
                })),
                { onConflict: 'id' }
            );
            results.clientes = { success: !error, count: db.maestroClientes.length, error: error?.message };
        }

        // 3. Migrate Trabajadores
        if (db.maestroTrabajadores?.length > 0) {
            const { error } = await supabase.from('trabajadores').upsert(
                db.maestroTrabajadores.map((t: any) => ({
                    id: t.id,
                    rut: t.rut || null,
                    nombre: t.nombre,
                    cargo: t.cargo || null,
                    telefono: t.telefono || null,
                    email: t.email || null,
                    fecha_ingreso: t.fechaIngreso || null,
                    activo: t.activo ?? true
                })),
                { onConflict: 'id' }
            );
            results.trabajadores = { success: !error, count: db.maestroTrabajadores.length, error: error?.message };
        }

        // 4. Migrate Areas
        if (db.maestroAreas?.length > 0) {
            const { error } = await supabase.from('areas').upsert(
                db.maestroAreas.map((a: any) => ({
                    id: a.id,
                    nombre: a.nombre,
                    activo: a.activo ?? true
                })),
                { onConflict: 'id' }
            );
            results.areas = { success: !error, count: db.maestroAreas.length, error: error?.message };
        }

        // 5. Migrate Insumos
        if (db.maestroInsumos?.length > 0) {
            const { error } = await supabase.from('insumos').upsert(
                db.maestroInsumos.map((i: any) => ({
                    id: i.id,
                    nombre: i.nombre,
                    unidad: i.unidad || 'kg',
                    costo_unitario: i.costoUnitario || 0,
                    tiene_impuesto_adicional: i.tieneImpuestoAdicional ?? false,
                    stock_minimo: i.stockMinimo || 0,
                    activo: i.activo ?? true
                })),
                { onConflict: 'id' }
            );
            results.insumos = { success: !error, count: db.maestroInsumos.length, error: error?.message };
        }

        // 6. Migrate Empresas Clientes
        if (db.empresasClientes?.length > 0) {
            const { error } = await supabase.from('empresas_clientes').upsert(
                db.empresasClientes.map((e: any) => ({
                    id: e.id,
                    rut: e.rut || null,
                    nombre: e.nombre,
                    contacto: e.contacto || null,
                    telefono: e.telefono || null,
                    email: e.email || null,
                    activo: e.activo ?? true
                })),
                { onConflict: 'id' }
            );
            results.empresas_clientes = { success: !error, count: db.empresasClientes.length, error: error?.message };
        }

        // 7. Migrate Casinos/Sucursales
        if (db.casinosSucursales?.length > 0) {
            const { error } = await supabase.from('casinos_sucursales').upsert(
                db.casinosSucursales.map((c: any) => ({
                    id: c.id,
                    empresa_id: c.empresaId,
                    empresa_nombre: db.empresasClientes?.find((e: any) => e.id === c.empresaId)?.nombre || null,
                    nombre: c.nombre,
                    username: c.username,
                    password_hash: c.passwordHash,
                    direccion: c.direccion || null,
                    telefono: c.telefono || null,
                    email: c.email || null,
                    whatsapp: c.whatsapp || null,
                    activo: c.activo ?? true,
                    must_change_password: c.mustChangePassword ?? false
                })),
                { onConflict: 'id' }
            );
            results.casinos_sucursales = { success: !error, count: db.casinosSucursales.length, error: error?.message };
        }

        // 8. Migrate Productos Catalogo
        if (db.productosCatalogo?.length > 0) {
            const { error } = await supabase.from('productos_catalogo').upsert(
                db.productosCatalogo.map((p: any) => ({
                    id: p.id,
                    nombre: p.nombre,
                    descripcion: p.descripcion || null,
                    unidad: p.unidad || 'unidad',
                    precio_base: p.precioBase || 0,
                    categoria: p.categoria || null,
                    imagen_url: p.imagenUrl || p.imagen || null,
                    activo: p.activo ?? true,
                    mostrar_en_web: p.mostrarEnWeb ?? false
                })),
                { onConflict: 'id' }
            );
            results.productos_catalogo = { success: !error, count: db.productosCatalogo.length, error: error?.message };
        }

        // 9. Migrate Precios Clientes (skip FK validation - using producto_nombre instead)
        if (db.preciosClientes?.length > 0) {
            const validPrecios = db.preciosClientes.filter((p: any) =>
                db.productosCatalogo?.find((prod: any) => prod.id === p.productoId)
            );
            if (validPrecios.length > 0) {
                const { error } = await supabase.from('precios_clientes').upsert(
                    validPrecios.map((p: any) => ({
                        id: p.id,
                        empresa_id: p.empresaId,
                        producto_id: p.productoId,
                        producto_nombre: p.nombreProducto || null,
                        precio_neto: p.precioNeto || 0,
                        unidad: p.unidad || null
                    })),
                    { onConflict: 'id' }
                );
                results.precios_clientes = { success: !error, count: validPrecios.length, error: error?.message };
            } else {
                results.precios_clientes = { success: true, count: 0, error: 'Skipped - no valid products' };
            }
        }

        // 10. Migrate Ventas
        if (db.ventas?.length > 0) {
            const { error } = await supabase.from('ventas').upsert(
                db.ventas.map((v: any) => ({
                    id: v.id,
                    fecha: v.fecha,
                    cliente: v.cliente || null,
                    kilos: v.kilos || 0,
                    monto: v.monto || 0
                })),
                { onConflict: 'id' }
            );
            results.ventas = { success: !error, count: db.ventas.length, error: error?.message };
        }

        // 11. Migrate Rendimientos
        if (db.rendimientos?.length > 0) {
            const { error } = await supabase.from('rendimientos').upsert(
                db.rendimientos.map((r: any) => ({
                    id: r.id,
                    fecha: r.fecha,
                    kilos_producidos: r.kilosProducidos || 0,
                    sacos: r.sacos || 0,
                    rinde: r.rinde || 0,
                    barrido: r.barrido || 0,
                    merma: r.merma || 0
                })),
                { onConflict: 'id' }
            );
            results.rendimientos = { success: !error, count: db.rendimientos.length, error: error?.message };
        }

        // 12. Migrate Gastos Generales
        if (db.gastosGenerales?.length > 0) {
            const { error } = await supabase.from('gastos_generales').upsert(
                db.gastosGenerales.map((g: any) => ({
                    id: g.id,
                    fecha: g.fecha,
                    descripcion: g.descripcion,
                    monto: g.monto || 0,
                    categoria: g.categoria || null
                })),
                { onConflict: 'id' }
            );
            results.gastos_generales = { success: !error, count: db.gastosGenerales.length, error: error?.message };
        }

        // 13. Migrate Insumo Transactions
        if (db.insumoTransactions?.length > 0) {
            const { error } = await supabase.from('insumo_transactions').upsert(
                db.insumoTransactions.map((t: any) => ({
                    id: t.id,
                    fecha: validDate(t.fecha) || new Date().toISOString().split('T')[0],
                    insumo_nombre: t.insumo,
                    cantidad_entrada: t.cantidadEntrada || 0,
                    cantidad_salida: t.cantidadSalida || 0,
                    proveedor_nombre: t.proveedor || null,
                    fecha_compra: validDate(t.fechaCompra),
                    fecha_pago: validDate(t.fechaPago),
                    fecha_vencimiento: validDate(t.fechaVencimiento),
                    factura: t.factura || null,
                    estado_pago: t.estadoPago || 'pendiente',
                    precio_unitario: t.precioUnitario || null
                })),
                { onConflict: 'id' }
            );
            results.insumo_transactions = { success: !error, count: db.insumoTransactions.length, error: error?.message };
        }

        // 14. Migrate Bank Transactions
        if (db.bankTransactions?.length > 0) {
            const { error } = await supabase.from('bank_transactions').upsert(
                db.bankTransactions.map((t: any) => ({
                    id: t.id,
                    fecha: t.fecha,
                    entrada: t.entrada || 0,
                    salida: t.salida || 0,
                    descripcion: t.descripcion,
                    documento: t.documento || null,
                    observacion: t.observacion || null,
                    saldo: t.saldo || 0,
                    area_pago: t.areaPago || null,
                    proveedor_nombre: t.proveedor || null,
                    cliente_nombre: t.cliente || null
                })),
                { onConflict: 'id' }
            );
            results.bank_transactions = { success: !error, count: db.bankTransactions.length, error: error?.message };
        }

        // 15. Migrate Caja Chica
        if (db.cajaChica?.length > 0) {
            const { error } = await supabase.from('caja_chica').upsert(
                db.cajaChica.map((c: any) => ({
                    id: c.id,
                    fecha: c.fecha,
                    area_nombre: c.area,
                    monto: c.monto || 0,
                    descripcion: c.descripcion || null,
                    proveedor_nombre: c.proveedor || null,
                    trabajador_nombre: c.trabajador || null
                })),
                { onConflict: 'id' }
            );
            results.caja_chica = { success: !error, count: db.cajaChica.length, error: error?.message };
        }

        // 16. Migrate Pedidos
        if (db.pedidosClientes?.length > 0) {
            const { error } = await supabase.from('pedidos').upsert(
                db.pedidosClientes.map((p: any) => ({
                    id: p.id,
                    casino_id: p.casinoId,
                    casino_nombre: p.casinoNombre,
                    empresa_id: p.empresaId,
                    empresa_nombre: p.empresaNombre,
                    fecha_pedido: p.fechaPedido,
                    fecha_entrega: validDate(p.fechaEntrega) || new Date().toISOString().split('T')[0],
                    hora_pedido: p.horaPedido || null,
                    estado: validEstado(p.estado || 'pendiente'),
                    total: p.total || 0,
                    observaciones: p.observaciones || null,
                    es_recurrente: p.esRecurrente ?? false,
                    dias_recurrencia: p.diasRecurrencia || null,
                    repartidor: p.repartidor || null,
                    origen_pedido: validOrigen(p.origenPedido),
                    hora_entrega: p.horaEntrega || null,
                    notificado_email: p.notificadoEmail ?? false,
                    notificado_whatsapp: p.notificadoWhatsapp ?? false
                })),
                { onConflict: 'id' }
            );
            results.pedidos = { success: !error, count: db.pedidosClientes.length, error: error?.message };
        }

        // 17. Migrate Detalle Pedidos
        if (db.detallePedidos?.length > 0) {
            const { error } = await supabase.from('detalle_pedidos').upsert(
                db.detallePedidos.map((d: any) => ({
                    id: d.id,
                    pedido_id: d.pedidoId,
                    producto_id: d.productoId,
                    producto_nombre: d.productoNombre,
                    cantidad: d.cantidad || 0,
                    unidad: d.unidad || null,
                    precio_unitario: d.precioUnitario || 0,
                    subtotal: d.subtotal || 0
                })),
                { onConflict: 'id' }
            );
            results.detalle_pedidos = { success: !error, count: db.detallePedidos.length, error: error?.message };
        }

        // 18. Migrate Admin Users
        if (db.users?.length > 0) {
            const { error } = await supabase.from('admin_users').upsert(
                db.users.map((u: any) => ({
                    username: u.username,
                    password_hash: u.password || u.passwordHash || '',
                    nombre: u.nombre || u.username,
                    role: u.role || 'employee',
                    permissions: u.permissions || null,
                    must_change_password: u.mustChangePassword ?? false,
                    activo: true
                })),
                { onConflict: 'username' }
            );
            results.admin_users = { success: !error, count: db.users.length, error: error?.message };
        }

        return NextResponse.json({
            success: true,
            message: 'Migration completed',
            results
        });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
