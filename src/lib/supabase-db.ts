/**
 * Supabase Database Service
 * Provides CRUD operations for all tables
 */
import { supabase } from './supabase';

// =============================================
// INSUMOS (Maestro)
// =============================================
export async function getInsumos() {
    const { data, error } = await supabase
        .from('insumos')
        .select('*')
        .order('nombre');

    if (error) throw error;

    // Map to match existing interface
    return data.map(i => ({
        id: i.id,
        nombre: i.nombre,
        unidad: i.unidad,
        costoUnitario: i.costo_unitario,
        tieneImpuestoAdicional: i.tiene_impuesto_adicional,
        stockMinimo: i.stock_minimo,
        activo: i.activo
    }));
}

export async function addInsumo(insumo: any) {
    const { data, error } = await supabase
        .from('insumos')
        .insert({
            nombre: insumo.nombre,
            unidad: insumo.unidad || 'kg',
            costo_unitario: insumo.costoUnitario || 0,
            tiene_impuesto_adicional: insumo.tieneImpuestoAdicional || false,
            stock_minimo: insumo.stockMinimo || 0,
            activo: insumo.activo ?? true
        })
        .select()
        .single();

    if (error) throw error;
    return { ...data, costoUnitario: data.costo_unitario, tieneImpuestoAdicional: data.tiene_impuesto_adicional, stockMinimo: data.stock_minimo };
}

export async function updateInsumo(id: number, updates: any) {
    const { error } = await supabase
        .from('insumos')
        .update({
            nombre: updates.nombre,
            unidad: updates.unidad,
            costo_unitario: updates.costoUnitario,
            tiene_impuesto_adicional: updates.tieneImpuestoAdicional,
            stock_minimo: updates.stockMinimo,
            activo: updates.activo
        })
        .eq('id', id);

    if (error) throw error;
}

export async function deleteInsumo(id: number) {
    const { error } = await supabase.from('insumos').delete().eq('id', id);
    if (error) throw error;
}

// =============================================
// PROVEEDORES
// =============================================
export async function getProveedores() {
    const { data, error } = await supabase
        .from('proveedores')
        .select('*')
        .order('nombre');

    if (error) throw error;
    return data;
}

export async function addProveedor(proveedor: any) {
    const { data, error } = await supabase
        .from('proveedores')
        .insert(proveedor)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateProveedor(id: number, updates: any) {
    const { error } = await supabase.from('proveedores').update(updates).eq('id', id);
    if (error) throw error;
}

export async function deleteProveedor(id: number) {
    const { error } = await supabase.from('proveedores').delete().eq('id', id);
    if (error) throw error;
}

// =============================================
// CLIENTES
// =============================================
export async function getClientes() {
    const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('nombre');

    if (error) throw error;
    return data;
}

export async function addCliente(cliente: any) {
    const { data, error } = await supabase
        .from('clientes')
        .insert(cliente)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateCliente(id: number, updates: any) {
    const { error } = await supabase.from('clientes').update(updates).eq('id', id);
    if (error) throw error;
}

export async function deleteCliente(id: number) {
    const { error } = await supabase.from('clientes').delete().eq('id', id);
    if (error) throw error;
}

// =============================================
// TRABAJADORES
// =============================================
export async function getTrabajadores() {
    const { data, error } = await supabase
        .from('trabajadores')
        .select('*')
        .order('nombre');

    if (error) throw error;

    // Map to match existing interface
    return data.map(t => ({
        id: t.id,
        rut: t.rut,
        nombre: t.nombre,
        cargo: t.cargo,
        telefono: t.telefono,
        email: t.email,
        fechaIngreso: t.fecha_ingreso,
        activo: t.activo
    }));
}

export async function addTrabajador(trabajador: any) {
    const { data, error } = await supabase
        .from('trabajadores')
        .insert({
            rut: trabajador.rut,
            nombre: trabajador.nombre,
            cargo: trabajador.cargo,
            telefono: trabajador.telefono,
            email: trabajador.email,
            fecha_ingreso: trabajador.fechaIngreso,
            activo: trabajador.activo ?? true
        })
        .select()
        .single();

    if (error) throw error;
    return { ...data, fechaIngreso: data.fecha_ingreso };
}

export async function updateTrabajador(id: number, updates: any) {
    const { error } = await supabase
        .from('trabajadores')
        .update({
            rut: updates.rut,
            nombre: updates.nombre,
            cargo: updates.cargo,
            telefono: updates.telefono,
            email: updates.email,
            fecha_ingreso: updates.fechaIngreso,
            activo: updates.activo
        })
        .eq('id', id);

    if (error) throw error;
}

export async function deleteTrabajador(id: number) {
    const { error } = await supabase.from('trabajadores').delete().eq('id', id);
    if (error) throw error;
}

// =============================================
// AREAS
// =============================================
export async function getAreas() {
    const { data, error } = await supabase
        .from('areas')
        .select('*')
        .order('nombre');

    if (error) throw error;
    return data;
}

export async function addArea(area: any) {
    const { data, error } = await supabase
        .from('areas')
        .insert(area)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateArea(id: number, updates: any) {
    const { error } = await supabase.from('areas').update(updates).eq('id', id);
    if (error) throw error;
}

export async function deleteArea(id: number) {
    const { error } = await supabase.from('areas').delete().eq('id', id);
    if (error) throw error;
}

// =============================================
// INSUMO TRANSACTIONS (Inventory)
// =============================================
export async function getInsumoTransactions() {
    const { data, error } = await supabase
        .from('insumo_transactions')
        .select('*')
        .order('fecha', { ascending: false });

    if (error) throw error;

    // Map to match existing interface
    return data.map(t => ({
        id: t.id,
        fecha: t.fecha,
        insumo: t.insumo_nombre,
        cantidadEntrada: t.cantidad_entrada,
        cantidadSalida: t.cantidad_salida,
        proveedor: t.proveedor_nombre,
        fechaCompra: t.fecha_compra,
        fechaPago: t.fecha_pago,
        fechaVencimiento: t.fecha_vencimiento,
        factura: t.factura,
        estadoPago: t.estado_pago,
        precioUnitario: t.precio_unitario
    }));
}

export async function addInsumoTransaction(transaction: any) {
    const { data, error } = await supabase
        .from('insumo_transactions')
        .insert({
            fecha: transaction.fecha,
            insumo_nombre: transaction.insumo,
            cantidad_entrada: transaction.cantidadEntrada || 0,
            cantidad_salida: transaction.cantidadSalida || 0,
            proveedor_nombre: transaction.proveedor,
            fecha_compra: transaction.fechaCompra || null,
            fecha_pago: transaction.fechaPago || null,
            fecha_vencimiento: transaction.fechaVencimiento || null,
            factura: transaction.factura,
            estado_pago: transaction.estadoPago || 'pendiente',
            precio_unitario: transaction.precioUnitario
        })
        .select()
        .single();

    if (error) throw error;

    return {
        id: data.id,
        fecha: data.fecha,
        insumo: data.insumo_nombre,
        cantidadEntrada: data.cantidad_entrada,
        cantidadSalida: data.cantidad_salida,
        proveedor: data.proveedor_nombre,
        fechaCompra: data.fecha_compra,
        fechaPago: data.fecha_pago,
        fechaVencimiento: data.fecha_vencimiento,
        factura: data.factura,
        estadoPago: data.estado_pago,
        precioUnitario: data.precio_unitario
    };
}

export async function updateInsumoTransaction(id: number, updates: any) {
    const { error } = await supabase
        .from('insumo_transactions')
        .update({
            fecha: updates.fecha,
            insumo_nombre: updates.insumo,
            cantidad_entrada: updates.cantidadEntrada,
            cantidad_salida: updates.cantidadSalida,
            proveedor_nombre: updates.proveedor,
            fecha_compra: updates.fechaCompra,
            fecha_pago: updates.fechaPago,
            fecha_vencimiento: updates.fechaVencimiento,
            factura: updates.factura,
            estado_pago: updates.estadoPago,
            precio_unitario: updates.precioUnitario
        })
        .eq('id', id);

    if (error) throw error;
}

export async function deleteInsumoTransaction(id: number) {
    const { error } = await supabase.from('insumo_transactions').delete().eq('id', id);
    if (error) throw error;
}

// =============================================
// BANK TRANSACTIONS
// =============================================
export async function getBankTransactions() {
    const { data, error } = await supabase
        .from('bank_transactions')
        .select('*')
        .order('fecha', { ascending: false });

    if (error) throw error;

    // Map to match existing interface
    return data.map(t => ({
        id: t.id,
        fecha: t.fecha,
        entrada: t.entrada,
        salida: t.salida,
        descripcion: t.descripcion,
        documento: t.documento,
        observacion: t.observacion,
        saldo: t.saldo,
        areaPago: t.area_pago,
        proveedor: t.proveedor_nombre,
        cliente: t.cliente_nombre
    }));
}

export async function addBankTransaction(transaction: any) {
    // Calculate new saldo
    const { data: lastTx } = await supabase
        .from('bank_transactions')
        .select('saldo')
        .order('id', { ascending: false })
        .limit(1)
        .single();

    const lastSaldo = lastTx?.saldo || 0;
    const newSaldo = lastSaldo + (transaction.entrada || 0) - (transaction.salida || 0);

    const { data, error } = await supabase
        .from('bank_transactions')
        .insert({
            fecha: transaction.fecha,
            entrada: transaction.entrada || 0,
            salida: transaction.salida || 0,
            descripcion: transaction.descripcion,
            documento: transaction.documento,
            observacion: transaction.observacion,
            saldo: newSaldo,
            area_pago: transaction.areaPago,
            proveedor_nombre: transaction.proveedor,
            cliente_nombre: transaction.cliente
        })
        .select()
        .single();

    if (error) throw error;

    return {
        id: data.id,
        fecha: data.fecha,
        entrada: data.entrada,
        salida: data.salida,
        descripcion: data.descripcion,
        documento: data.documento,
        observacion: data.observacion,
        saldo: data.saldo,
        areaPago: data.area_pago,
        proveedor: data.proveedor_nombre,
        cliente: data.cliente_nombre
    };
}

export async function updateBankTransaction(id: number, updates: any) {
    const { error } = await supabase
        .from('bank_transactions')
        .update({
            fecha: updates.fecha,
            entrada: updates.entrada,
            salida: updates.salida,
            descripcion: updates.descripcion,
            documento: updates.documento,
            observacion: updates.observacion,
            area_pago: updates.areaPago,
            proveedor_nombre: updates.proveedor,
            cliente_nombre: updates.cliente
        })
        .eq('id', id);

    if (error) throw error;
}

export async function deleteBankTransaction(id: number) {
    const { error } = await supabase.from('bank_transactions').delete().eq('id', id);
    if (error) throw error;
}

// =============================================
// VENTAS
// =============================================
export async function getVentas() {
    const { data, error } = await supabase
        .from('ventas')
        .select('*')
        .order('fecha', { ascending: false });

    if (error) throw error;
    return data;
}

export async function addVenta(venta: any) {
    const { data, error } = await supabase
        .from('ventas')
        .insert(venta)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateVenta(id: number, updates: any) {
    const { error } = await supabase.from('ventas').update(updates).eq('id', id);
    if (error) throw error;
}

export async function deleteVenta(id: number) {
    const { error } = await supabase.from('ventas').delete().eq('id', id);
    if (error) throw error;
}

// =============================================
// RENDIMIENTOS
// =============================================
export async function getRendimientos() {
    const { data, error } = await supabase
        .from('rendimientos')
        .select('*')
        .order('fecha', { ascending: false });

    if (error) throw error;

    // Map to match existing interface
    return data.map(r => ({
        id: r.id,
        fecha: r.fecha,
        kilosProducidos: r.kilos_producidos,
        sacos: r.sacos,
        rinde: r.rinde,
        barrido: r.barrido,
        merma: r.merma
    }));
}

export async function addRendimiento(rendimiento: any) {
    const { data, error } = await supabase
        .from('rendimientos')
        .insert({
            fecha: rendimiento.fecha,
            kilos_producidos: rendimiento.kilosProducidos,
            sacos: rendimiento.sacos,
            rinde: rendimiento.rinde,
            barrido: rendimiento.barrido,
            merma: rendimiento.merma
        })
        .select()
        .single();

    if (error) throw error;
    return { ...data, kilosProducidos: data.kilos_producidos };
}

export async function updateRendimiento(id: number, updates: any) {
    const { error } = await supabase
        .from('rendimientos')
        .update({
            fecha: updates.fecha,
            kilos_producidos: updates.kilosProducidos,
            sacos: updates.sacos,
            rinde: updates.rinde,
            barrido: updates.barrido,
            merma: updates.merma
        })
        .eq('id', id);

    if (error) throw error;
}

export async function deleteRendimiento(id: number) {
    const { error } = await supabase.from('rendimientos').delete().eq('id', id);
    if (error) throw error;
}

// =============================================
// CAJA CHICA
// =============================================
export async function getCajaChica() {
    const { data, error } = await supabase
        .from('caja_chica')
        .select('*')
        .order('fecha', { ascending: false });

    if (error) throw error;

    // Map to match existing interface
    return data.map(c => ({
        id: c.id,
        fecha: c.fecha,
        area: c.area_nombre,
        monto: c.monto,
        descripcion: c.descripcion,
        proveedor: c.proveedor_nombre,
        trabajador: c.trabajador_nombre,
        metodoPago: c.metodo_pago || 'efectivo'
    }));
}

export async function addCajaChica(item: any) {
    const { data, error } = await supabase
        .from('caja_chica')
        .insert({
            fecha: item.fecha,
            area_nombre: item.area,
            monto: item.monto,
            descripcion: item.descripcion,
            proveedor_nombre: item.proveedor,
            trabajador_nombre: item.trabajador,
            metodo_pago: item.metodoPago || 'efectivo'
        })
        .select()
        .single();

    if (error) throw error;
    return { ...data, area: data.area_nombre, proveedor: data.proveedor_nombre, trabajador: data.trabajador_nombre, metodoPago: data.metodo_pago };
}

export async function updateCajaChica(id: number, updates: any) {
    const { error } = await supabase
        .from('caja_chica')
        .update({
            fecha: updates.fecha,
            area_nombre: updates.area,
            monto: updates.monto,
            descripcion: updates.descripcion,
            proveedor_nombre: updates.proveedor,
            trabajador_nombre: updates.trabajador,
            metodo_pago: updates.metodoPago
        })
        .eq('id', id);

    if (error) throw error;
}

export async function deleteCajaChica(id: number) {
    const { error } = await supabase.from('caja_chica').delete().eq('id', id);
    if (error) throw error;
}

// =============================================
// GASTOS GENERALES
// =============================================
export async function getGastosGenerales() {
    const { data, error } = await supabase
        .from('gastos_generales')
        .select('*')
        .order('fecha', { ascending: false });

    if (error) throw error;
    return data;
}

export async function addGastoGeneral(gasto: any) {
    const { data, error } = await supabase
        .from('gastos_generales')
        .insert(gasto)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateGastoGeneral(id: number, updates: any) {
    const { error } = await supabase.from('gastos_generales').update(updates).eq('id', id);
    if (error) throw error;
}

export async function deleteGastoGeneral(id: number) {
    const { error } = await supabase.from('gastos_generales').delete().eq('id', id);
    if (error) throw error;
}
