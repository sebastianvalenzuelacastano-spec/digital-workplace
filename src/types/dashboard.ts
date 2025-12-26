export interface User {
    id: number;
    username: string;
    nombre: string;
    role: 'manager' | 'employee';
    permissions?: string[]; // Array of allowed paths/modules
    mustChangePassword?: boolean;
}

export interface Order {
    id: number;
    fecha: string;
    cliente: string;
    productos: string;
    total: number;
    estado: 'pendiente' | 'en_proceso' | 'completado' | 'cancelado' | 'despachado';
    entrega: string;
}

export interface Venta {
    id: number;
    fecha: string;
    cliente: string;
    kilos: number;
    monto: number;
}

export interface Payment {
    id: number;
    factura: string;
    cliente: string;
    fechaPago: string;
    montoPagado: number;
}

export interface Rendimiento {
    id: number;
    fecha: string;
    kilosProducidos: number;
    sacos: number;
    rinde: number;
    barrido: number;
    merma: number;
}

export interface InsumoTransaction {
    id: number;
    fecha: string;
    insumo: string;
    cantidadEntrada: number;
    cantidadSalida: number;
    proveedor: string;
    fechaCompra: string;
    fechaPago: string;
    fechaVencimiento?: string; // Expiry date of the product
    factura: string;
    estadoPago: 'pendiente' | 'urgente' | 'pagada';
    stockAcumulado?: number;
    precioUnitario?: number; // Price at purchase time
}

export interface Proveedor {
    id: number;
    rut: string;
    nombre: string;
    contacto: string;
    telefono: string;
    email: string;
    direccion: string;
    activo: boolean;
}

export interface Cliente {
    id: number;
    rut: string;
    nombre: string;
    tipo: 'empresa' | 'persona';
    contacto: string;
    telefono: string;
    email: string;
    direccion: string;
    activo: boolean;
}

export interface Trabajador {
    id: number;
    rut: string;
    nombre: string;
    cargo: string;
    telefono: string;
    email: string;
    fechaIngreso: string;
    activo: boolean;
}

export interface BankTransaction {
    id: number;
    fecha: string;
    entrada: number;
    salida: number;
    descripcion: string;
    documento: string;
    observacion: string;
    saldo: number;
    proveedor?: string; // Link to maestroProveedores
    cliente?: string; // Link to maestroClientes
}

export interface CajaChica {
    id: number;
    fecha: string;
    area: string;
    monto: number;
    descripcion: string;
    proveedor?: string; // Link to maestroProveedores
    trabajador?: string; // Link to maestroTrabajadores
}

// Master Data
export interface MaestroArea {
    id: number;
    nombre: string;
    activo: boolean;
}

export interface Insumo {
    id: number;
    nombre: string;
    unidad: string; // 'sacos_25kg' | 'kg' | 'unidades' | 'sacos'
    activo: boolean;
    costoUnitario?: number; // Net Cost (Valor Neto)
    tieneImpuestoAdicional?: boolean; // 12% additional tax (e.g. for Harina)
    stockMinimo?: number; // Minimum stock level for alerts
}

export interface GastoGeneral {
    id: number;
    fecha: string;
    descripcion: string;
    monto: number;
    categoria: string; // e.g., "Arriendo", "Servicios", "Sueldos"
}

// Equipment Management
export interface Equipo {
    id: number;
    codigo: string;
    nombre: string;
    tipo: 'Horno' | 'Amasadora' | 'Batidora' | 'Refrigerador' | 'Otro';
    marca: string;
    modelo: string;
    numeroSerie: string;
    fechaCompra: string;
    proveedor: string;
    estado: 'Operativo' | 'En Mantenimiento' | 'Fuera de Servicio';
    ubicacion: 'Producción' | 'Bodega' | 'Ventas';
    garantiaHasta?: string;
    valorCompra: number;
    observaciones?: string;
    activo: boolean;
}

export interface Mantenimiento {
    id: number;
    equipoId: number;
    tipo: 'Preventivo' | 'Correctivo' | 'Calibración';
    fecha: string;
    descripcion: string;
    tecnico: string;
    empresaExterna?: string;
    repuestos?: string; // spare parts used
    costo: number;
    proximoMantenimiento?: string;
    observaciones?: string;
}

// Vehicle Management
export interface Vehiculo {
    id: number;
    patente: string;
    marca: string;
    modelo: string;
    anio: number;
    tipo: 'Camioneta' | 'Furgón' | 'Camión' | 'Automóvil';
    kilometraje: number;
    proximaRevisionTecnica: string; // Date
    vencimientoSeguro: string; // Date
    vencimientoPermisoCirculacion: string; // Date
    estado: 'Operativo' | 'En Taller' | 'Fuera de Servicio';
    conductorAsignado?: string;
    observaciones?: string;
    activo: boolean;
}

export interface MantenimientoVehiculo {
    id: number;
    vehiculoId: number;
    tipo: 'Preventivo' | 'Correctivo' | 'Cambio Aceite' | 'Neumáticos';
    fecha: string;
    kilometraje: number;
    descripcion: string;
    repuestos?: string; // spare parts used
    taller: string;
    costo: number;
    proximoMantenimientoKm?: number;
    observaciones?: string;
}

// =============================================
// MÓDULO DE PEDIDOS PROFESIONAL (B2B)
// =============================================

// Empresa cliente (ej: Aramark, Compass, Sodexo)
export interface EmpresaCliente {
    id: number;
    rut: string;
    nombre: string;
    contacto: string;
    telefono: string;
    email: string;
    activo: boolean;
}

// Casino/Sucursal bajo una empresa
export interface CasinoSucursal {
    id: number;
    empresaId: number;
    nombre: string;
    username: string; // Login único
    passwordHash: string;
    direccion: string;
    telefono: string;
    email: string;
    whatsapp?: string;
    activo: boolean;
    mustChangePassword?: boolean; // For provisional passwords
}

// Precio personalizado por empresa
export interface PrecioCliente {
    id: number;
    empresaId: number;
    productoId: number; // ID del producto del catálogo
    nombreProducto: string; // Cache del nombre para facilitar consultas
    precioNeto: number;
    unidad?: 'unidad' | 'kg'; // Opcional - por defecto se usa la del producto
}

// Pedido de cliente
export interface PedidoCliente {
    id: number;
    casinoId: number;
    empresaId: number; // Denormalized for easier queries
    casinoNombre: string; // Cache
    empresaNombre: string; // Cache
    fechaPedido: string;
    fechaEntrega: string;
    horaPedido: string;
    estado: 'pendiente' | 'confirmado' | 'en_produccion' | 'entregado' | 'cancelado' | 'despachado';
    total: number;
    observaciones?: string;
    esRecurrente: boolean;
    diasRecurrencia?: string[]; // ['lunes', 'miercoles', 'viernes']
    notificadoEmail: boolean;
    notificadoWhatsapp: boolean;
    // Nuevos campos para gestión de entregas
    repartidor?: string; // Nombre del repartidor asignado
    origenPedido?: 'web' | 'manual'; // Origen del pedido
    horaEntrega?: string; // Hora estimada de entrega
}

// Detalle del pedido
export interface DetallePedido {
    id: number;
    pedidoId: number;
    productoId: number;
    productoNombre: string; // Cache
    cantidad: number;
    unidad?: string; // Unidad seleccionada (Kg, Un, etc.)
    precioUnitario: number;
    subtotal: number;
}

// Producto del catálogo (para pedidos)
export interface ProductoCatalogo {
    id: number;
    nombre: string;
    descripcion?: string;
    unidad: string; // 'unidad', 'kg', 'docena'
    precioBase: number; // Precio por defecto si no hay precio por cliente
    categoria: string;
    imagen?: string;
    activo: boolean;
}

// Registro de Colegios - Control de Mermas por Repartidor
export interface RegistroColegio {
    id: number;
    fecha: string;
    repartidor: string; // Nombre del repartidor (4 repartidores)
    cliente: string; // Nombre del colegio
    casinoId?: number; // Opcional si está en el sistema
    producto: string;
    pesoFormula: number; // Kg según fórmula (teórico)
    pesoReal: number; // Kg pesado (real)
    diferencia: number; // pesoReal - pesoFormula (puede ser positivo o negativo)
    porcentajeMerma: number; // ((pesoReal - pesoFormula) / pesoFormula) * 100
    observaciones?: string;
    creador: string; // Usuario que registró
    fechaCreacion: string;
}

