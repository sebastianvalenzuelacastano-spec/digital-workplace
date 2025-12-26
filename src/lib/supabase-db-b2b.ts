/**
 * Supabase Database Service - B2B Module
 * CRUD operations for pedidos, productos, empresas, casinos
 */
import { supabase } from './supabase';

// =============================================
// EMPRESAS CLIENTES
// =============================================
export async function getEmpresasClientes() {
    const { data, error } = await supabase
        .from('empresas_clientes')
        .select('*')
        .order('nombre');

    if (error) throw error;
    return data;
}

export async function addEmpresaCliente(empresa: any) {
    const { data, error } = await supabase
        .from('empresas_clientes')
        .insert(empresa)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateEmpresaCliente(id: number, updates: any) {
    const { error } = await supabase.from('empresas_clientes').update(updates).eq('id', id);
    if (error) throw error;
}

export async function deleteEmpresaCliente(id: number) {
    const { error } = await supabase.from('empresas_clientes').delete().eq('id', id);
    if (error) throw error;
}

// =============================================
// CASINOS / SUCURSALES
// =============================================
export async function getCasinosSucursales() {
    const { data, error } = await supabase
        .from('casinos_sucursales')
        .select('*')
        .order('nombre');

    if (error) throw error;

    // Map to match existing interface
    return data.map(c => ({
        id: c.id,
        empresaId: c.empresa_id,
        nombre: c.nombre,
        username: c.username,
        passwordHash: c.password_hash,
        direccion: c.direccion,
        telefono: c.telefono,
        email: c.email,
        whatsapp: c.whatsapp,
        activo: c.activo,
        mustChangePassword: c.must_change_password
    }));
}

export async function addCasinoSucursal(casino: any) {
    const { data, error } = await supabase
        .from('casinos_sucursales')
        .insert({
            empresa_id: casino.empresaId,
            empresa_nombre: casino.empresaNombre,
            nombre: casino.nombre,
            username: casino.username,
            password_hash: casino.passwordHash,
            direccion: casino.direccion,
            telefono: casino.telefono,
            email: casino.email,
            whatsapp: casino.whatsapp,
            activo: casino.activo ?? true,
            must_change_password: casino.mustChangePassword ?? true
        })
        .select()
        .single();

    if (error) throw error;
    return { ...data, empresaId: data.empresa_id, passwordHash: data.password_hash, mustChangePassword: data.must_change_password };
}

export async function updateCasinoSucursal(id: number, updates: any) {
    const mappedUpdates: any = {};
    if (updates.empresaId !== undefined) mappedUpdates.empresa_id = updates.empresaId;
    if (updates.empresaNombre !== undefined) mappedUpdates.empresa_nombre = updates.empresaNombre;
    if (updates.nombre !== undefined) mappedUpdates.nombre = updates.nombre;
    if (updates.username !== undefined) mappedUpdates.username = updates.username;
    if (updates.passwordHash !== undefined) mappedUpdates.password_hash = updates.passwordHash;
    if (updates.direccion !== undefined) mappedUpdates.direccion = updates.direccion;
    if (updates.telefono !== undefined) mappedUpdates.telefono = updates.telefono;
    if (updates.email !== undefined) mappedUpdates.email = updates.email;
    if (updates.whatsapp !== undefined) mappedUpdates.whatsapp = updates.whatsapp;
    if (updates.activo !== undefined) mappedUpdates.activo = updates.activo;
    if (updates.mustChangePassword !== undefined) mappedUpdates.must_change_password = updates.mustChangePassword;

    const { error } = await supabase.from('casinos_sucursales').update(mappedUpdates).eq('id', id);
    if (error) throw error;
}

export async function deleteCasinoSucursal(id: number) {
    const { error } = await supabase.from('casinos_sucursales').delete().eq('id', id);
    if (error) throw error;
}

// Find casino by username for login
export async function findCasinoByUsername(username: string) {
    const { data, error } = await supabase
        .from('casinos_sucursales')
        .select('*')
        .eq('username', username)
        .single();

    if (error) return null;

    return {
        id: data.id,
        empresaId: data.empresa_id,
        nombre: data.nombre,
        username: data.username,
        passwordHash: data.password_hash,
        activo: data.activo,
        mustChangePassword: data.must_change_password
    };
}

// =============================================
// PRODUCTOS CATALOGO
// =============================================
export async function getProductosCatalogo() {
    const { data, error } = await supabase
        .from('productos_catalogo')
        .select('*')
        .order('nombre');

    if (error) throw error;

    // Map to match existing interface
    return data.map(p => ({
        id: p.id,
        nombre: p.nombre,
        descripcion: p.descripcion,
        unidad: p.unidad,
        precioBase: p.precio_base,
        categoria: p.categoria,
        imagenUrl: p.imagen_url,
        activo: p.activo,
        mostrarEnWeb: p.mostrar_en_web
    }));
}

export async function addProductoCatalogo(producto: any) {
    const { data, error } = await supabase
        .from('productos_catalogo')
        .insert({
            nombre: producto.nombre,
            descripcion: producto.descripcion,
            unidad: producto.unidad || 'unidad',
            precio_base: producto.precioBase || 0,
            categoria: producto.categoria,
            imagen_url: producto.imagenUrl,
            activo: producto.activo ?? true,
            mostrar_en_web: producto.mostrarEnWeb ?? false
        })
        .select()
        .single();

    if (error) throw error;
    return { ...data, precioBase: data.precio_base, imagenUrl: data.imagen_url, mostrarEnWeb: data.mostrar_en_web };
}

export async function updateProductoCatalogo(id: number, updates: any) {
    const mappedUpdates: any = {};
    if (updates.nombre !== undefined) mappedUpdates.nombre = updates.nombre;
    if (updates.descripcion !== undefined) mappedUpdates.descripcion = updates.descripcion;
    if (updates.unidad !== undefined) mappedUpdates.unidad = updates.unidad;
    if (updates.precioBase !== undefined) mappedUpdates.precio_base = updates.precioBase;
    if (updates.categoria !== undefined) mappedUpdates.categoria = updates.categoria;
    if (updates.imagenUrl !== undefined) mappedUpdates.imagen_url = updates.imagenUrl;
    if (updates.activo !== undefined) mappedUpdates.activo = updates.activo;
    if (updates.mostrarEnWeb !== undefined) mappedUpdates.mostrar_en_web = updates.mostrarEnWeb;

    const { error } = await supabase.from('productos_catalogo').update(mappedUpdates).eq('id', id);
    if (error) throw error;
}

export async function deleteProductoCatalogo(id: number) {
    const { error } = await supabase.from('productos_catalogo').delete().eq('id', id);
    if (error) throw error;
}

// =============================================
// PRECIOS CLIENTES
// =============================================
export async function getPreciosClientes() {
    const { data, error } = await supabase
        .from('precios_clientes')
        .select('*');

    if (error) throw error;

    return data.map(p => ({
        id: p.id,
        empresaId: p.empresa_id,
        productoId: p.producto_id,
        nombreProducto: p.producto_nombre,
        precioNeto: p.precio_neto,
        unidad: p.unidad
    }));
}

export async function addPrecioCliente(precio: any) {
    const { data, error } = await supabase
        .from('precios_clientes')
        .insert({
            empresa_id: precio.empresaId,
            producto_id: precio.productoId,
            producto_nombre: precio.nombreProducto,
            precio_neto: precio.precioNeto,
            unidad: precio.unidad
        })
        .select()
        .single();

    if (error) throw error;
    return { ...data, empresaId: data.empresa_id, productoId: data.producto_id, nombreProducto: data.producto_nombre, precioNeto: data.precio_neto };
}

export async function updatePrecioCliente(id: number, updates: any) {
    const { error } = await supabase
        .from('precios_clientes')
        .update({
            precio_neto: updates.precioNeto,
            unidad: updates.unidad
        })
        .eq('id', id);

    if (error) throw error;
}

export async function deletePrecioCliente(id: number) {
    const { error } = await supabase.from('precios_clientes').delete().eq('id', id);
    if (error) throw error;
}

// =============================================
// PEDIDOS
// =============================================
export async function getPedidosClientes() {
    const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .order('fecha_entrega', { ascending: false });

    if (error) throw error;

    return data.map(p => ({
        id: p.id,
        casinoId: p.casino_id,
        empresaId: p.empresa_id,
        casinoNombre: p.casino_nombre,
        empresaNombre: p.empresa_nombre,
        fechaPedido: p.fecha_pedido,
        fechaEntrega: p.fecha_entrega,
        horaPedido: p.hora_pedido,
        estado: p.estado,
        total: p.total,
        observaciones: p.observaciones,
        esRecurrente: p.es_recurrente,
        diasRecurrencia: p.dias_recurrencia,
        repartidor: p.repartidor,
        origenPedido: p.origen_pedido,
        horaEntrega: p.hora_entrega,
        notificadoEmail: p.notificado_email,
        notificadoWhatsapp: p.notificado_whatsapp
    }));
}

export async function addPedidoCliente(pedido: any) {
    const { data, error } = await supabase
        .from('pedidos')
        .insert({
            casino_id: pedido.casinoId,
            casino_nombre: pedido.casinoNombre,
            empresa_id: pedido.empresaId,
            empresa_nombre: pedido.empresaNombre,
            fecha_pedido: pedido.fechaPedido || new Date().toISOString(),
            fecha_entrega: pedido.fechaEntrega,
            hora_pedido: pedido.horaPedido,
            estado: pedido.estado || 'pendiente',
            total: pedido.total || 0,
            observaciones: pedido.observaciones,
            es_recurrente: pedido.esRecurrente || false,
            dias_recurrencia: pedido.diasRecurrencia,
            repartidor: pedido.repartidor,
            origen_pedido: pedido.origenPedido || 'manual',
            hora_entrega: pedido.horaEntrega,
            notificado_email: pedido.notificadoEmail || false,
            notificado_whatsapp: pedido.notificadoWhatsapp || false
        })
        .select()
        .single();

    if (error) throw error;

    return {
        id: data.id,
        casinoId: data.casino_id,
        empresaId: data.empresa_id,
        casinoNombre: data.casino_nombre,
        empresaNombre: data.empresa_nombre,
        fechaPedido: data.fecha_pedido,
        fechaEntrega: data.fecha_entrega,
        horaPedido: data.hora_pedido,
        estado: data.estado,
        total: data.total,
        observaciones: data.observaciones,
        esRecurrente: data.es_recurrente,
        diasRecurrencia: data.dias_recurrencia,
        repartidor: data.repartidor,
        origenPedido: data.origen_pedido,
        horaEntrega: data.hora_entrega,
        notificadoEmail: data.notificado_email,
        notificadoWhatsapp: data.notificado_whatsapp
    };
}

export async function updatePedidoCliente(id: number, updates: any) {
    const mappedUpdates: any = {};
    if (updates.casinoId !== undefined) mappedUpdates.casino_id = updates.casinoId;
    if (updates.casinoNombre !== undefined) mappedUpdates.casino_nombre = updates.casinoNombre;
    if (updates.empresaId !== undefined) mappedUpdates.empresa_id = updates.empresaId;
    if (updates.empresaNombre !== undefined) mappedUpdates.empresa_nombre = updates.empresaNombre;
    if (updates.fechaEntrega !== undefined) mappedUpdates.fecha_entrega = updates.fechaEntrega;
    if (updates.estado !== undefined) mappedUpdates.estado = updates.estado;
    if (updates.total !== undefined) mappedUpdates.total = updates.total;
    if (updates.observaciones !== undefined) mappedUpdates.observaciones = updates.observaciones;
    if (updates.repartidor !== undefined) mappedUpdates.repartidor = updates.repartidor;
    if (updates.horaEntrega !== undefined) mappedUpdates.hora_entrega = updates.horaEntrega;
    if (updates.notificadoEmail !== undefined) mappedUpdates.notificado_email = updates.notificadoEmail;
    if (updates.notificadoWhatsapp !== undefined) mappedUpdates.notificado_whatsapp = updates.notificadoWhatsapp;

    const { error } = await supabase.from('pedidos').update(mappedUpdates).eq('id', id);
    if (error) throw error;
}

export async function deletePedidoCliente(id: number) {
    // Delete details first (cascade should handle this, but just in case)
    await supabase.from('detalle_pedidos').delete().eq('pedido_id', id);
    const { error } = await supabase.from('pedidos').delete().eq('id', id);
    if (error) throw error;
}

// =============================================
// DETALLE PEDIDOS
// =============================================
export async function getDetallePedidos() {
    const { data, error } = await supabase
        .from('detalle_pedidos')
        .select('*');

    if (error) throw error;

    return data.map(d => ({
        id: d.id,
        pedidoId: d.pedido_id,
        productoId: d.producto_id,
        productoNombre: d.producto_nombre,
        cantidad: d.cantidad,
        unidad: d.unidad,
        precioUnitario: d.precio_unitario,
        subtotal: d.subtotal
    }));
}

export async function addDetallePedido(detalle: any) {
    const { data, error } = await supabase
        .from('detalle_pedidos')
        .insert({
            pedido_id: detalle.pedidoId,
            producto_id: detalle.productoId,
            producto_nombre: detalle.productoNombre,
            cantidad: detalle.cantidad,
            unidad: detalle.unidad,
            precio_unitario: detalle.precioUnitario,
            subtotal: detalle.subtotal
        })
        .select()
        .single();

    if (error) throw error;
    return { ...data, pedidoId: data.pedido_id, productoId: data.producto_id, productoNombre: data.producto_nombre, precioUnitario: data.precio_unitario };
}

export async function updateDetallePedido(id: number, updates: any) {
    const { error } = await supabase
        .from('detalle_pedidos')
        .update({
            cantidad: updates.cantidad,
            unidad: updates.unidad,
            precio_unitario: updates.precioUnitario,
            subtotal: updates.subtotal
        })
        .eq('id', id);

    if (error) throw error;
}

export async function deleteDetallePedido(id: number) {
    const { error } = await supabase.from('detalle_pedidos').delete().eq('id', id);
    if (error) throw error;
}

// Get details for a specific pedido
export async function getDetallesByPedidoId(pedidoId: number) {
    const { data, error } = await supabase
        .from('detalle_pedidos')
        .select('*')
        .eq('pedido_id', pedidoId);

    if (error) throw error;

    return data.map(d => ({
        id: d.id,
        pedidoId: d.pedido_id,
        productoId: d.producto_id,
        productoNombre: d.producto_nombre,
        cantidad: d.cantidad,
        unidad: d.unidad,
        precioUnitario: d.precio_unitario,
        subtotal: d.subtotal
    }));
}
