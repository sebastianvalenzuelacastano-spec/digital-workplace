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
    estado: 'pendiente' | 'en_proceso' | 'completado' | 'cancelado';
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
    taller: string;
    costo: number;
    proximoMantenimientoKm?: number;
    observaciones?: string;
}
