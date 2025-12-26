-- =============================================
-- PANIFICADORA SAN SEBASTIAN - SUPABASE SCHEMA
-- =============================================
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- MAESTROS (Reference Tables)
-- =============================================

-- Proveedores
CREATE TABLE IF NOT EXISTS proveedores (
  id SERIAL PRIMARY KEY,
  rut TEXT UNIQUE,
  nombre TEXT NOT NULL,
  contacto TEXT,
  telefono TEXT,
  email TEXT,
  direccion TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Clientes
CREATE TABLE IF NOT EXISTS clientes (
  id SERIAL PRIMARY KEY,
  rut TEXT UNIQUE,
  nombre TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('empresa', 'persona')) DEFAULT 'empresa',
  contacto TEXT,
  telefono TEXT,
  email TEXT,
  direccion TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Trabajadores
CREATE TABLE IF NOT EXISTS trabajadores (
  id SERIAL PRIMARY KEY,
  rut TEXT UNIQUE,
  nombre TEXT NOT NULL,
  cargo TEXT,
  telefono TEXT,
  email TEXT,
  fecha_ingreso DATE,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Áreas (para caja chica)
CREATE TABLE IF NOT EXISTS areas (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insumos (maestro)
CREATE TABLE IF NOT EXISTS insumos (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  unidad TEXT DEFAULT 'kg',
  costo_unitario DECIMAL(12,2) DEFAULT 0,
  tiene_impuesto_adicional BOOLEAN DEFAULT false,
  stock_minimo INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- TRANSACCIONES
-- =============================================

-- Transacciones de Insumos (Inventario)
CREATE TABLE IF NOT EXISTS insumo_transactions (
  id SERIAL PRIMARY KEY,
  fecha DATE NOT NULL,
  insumo_id INTEGER REFERENCES insumos(id) ON DELETE SET NULL,
  insumo_nombre TEXT, -- Cache for display
  cantidad_entrada DECIMAL(10,2) DEFAULT 0,
  cantidad_salida DECIMAL(10,2) DEFAULT 0,
  proveedor_id INTEGER REFERENCES proveedores(id) ON DELETE SET NULL,
  proveedor_nombre TEXT, -- Cache
  fecha_compra DATE,
  fecha_pago DATE,
  fecha_vencimiento DATE,
  factura TEXT,
  estado_pago TEXT CHECK (estado_pago IN ('pendiente', 'urgente', 'pagada')) DEFAULT 'pendiente',
  precio_unitario DECIMAL(12,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Movimientos Bancarios
CREATE TABLE IF NOT EXISTS bank_transactions (
  id SERIAL PRIMARY KEY,
  fecha DATE NOT NULL,
  entrada DECIMAL(12,2) DEFAULT 0,
  salida DECIMAL(12,2) DEFAULT 0,
  descripcion TEXT NOT NULL,
  documento TEXT,
  observacion TEXT,
  saldo DECIMAL(12,2) DEFAULT 0,
  area_pago TEXT,
  proveedor_id INTEGER REFERENCES proveedores(id) ON DELETE SET NULL,
  proveedor_nombre TEXT, -- Cache
  cliente_id INTEGER REFERENCES clientes(id) ON DELETE SET NULL,
  cliente_nombre TEXT, -- Cache
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Caja Chica
CREATE TABLE IF NOT EXISTS caja_chica (
  id SERIAL PRIMARY KEY,
  fecha DATE NOT NULL,
  area_id INTEGER REFERENCES areas(id) ON DELETE SET NULL,
  area_nombre TEXT, -- Cache
  monto DECIMAL(12,2) NOT NULL,
  descripcion TEXT,
  proveedor_id INTEGER REFERENCES proveedores(id) ON DELETE SET NULL,
  proveedor_nombre TEXT,
  trabajador_id INTEGER REFERENCES trabajadores(id) ON DELETE SET NULL,
  trabajador_nombre TEXT,
  metodo_pago TEXT CHECK (metodo_pago IN ('efectivo', 'tarjeta', 'cheque')) DEFAULT 'efectivo',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ventas
CREATE TABLE IF NOT EXISTS ventas (
  id SERIAL PRIMARY KEY,
  fecha DATE NOT NULL,
  cliente TEXT,
  kilos DECIMAL(10,2),
  monto DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Rendimientos
CREATE TABLE IF NOT EXISTS rendimientos (
  id SERIAL PRIMARY KEY,
  fecha DATE NOT NULL,
  kilos_producidos DECIMAL(10,2),
  sacos DECIMAL(10,2),
  rinde DECIMAL(10,2),
  barrido DECIMAL(10,2),
  merma DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Gastos Generales
CREATE TABLE IF NOT EXISTS gastos_generales (
  id SERIAL PRIMARY KEY,
  fecha DATE NOT NULL,
  descripcion TEXT NOT NULL,
  monto DECIMAL(12,2) NOT NULL,
  categoria TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- MÓDULO B2B (PEDIDOS)
-- =============================================

-- Empresas Clientes (B2B)
CREATE TABLE IF NOT EXISTS empresas_clientes (
  id SERIAL PRIMARY KEY,
  rut TEXT UNIQUE,
  nombre TEXT NOT NULL,
  contacto TEXT,
  telefono TEXT,
  email TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Casinos/Sucursales
CREATE TABLE IF NOT EXISTS casinos_sucursales (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER REFERENCES empresas_clientes(id) ON DELETE CASCADE,
  empresa_nombre TEXT, -- Cache
  nombre TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  direccion TEXT,
  telefono TEXT,
  email TEXT,
  whatsapp TEXT,
  activo BOOLEAN DEFAULT true,
  must_change_password BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Catálogo de Productos
CREATE TABLE IF NOT EXISTS productos_catalogo (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  unidad TEXT DEFAULT 'unidad',
  precio_base DECIMAL(12,2) DEFAULT 0,
  categoria TEXT,
  imagen_url TEXT,
  activo BOOLEAN DEFAULT true,
  mostrar_en_web BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Precios por Cliente
CREATE TABLE IF NOT EXISTS precios_clientes (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER REFERENCES empresas_clientes(id) ON DELETE CASCADE,
  producto_id INTEGER REFERENCES productos_catalogo(id) ON DELETE CASCADE,
  producto_nombre TEXT, -- Cache
  precio_neto DECIMAL(12,2) NOT NULL,
  unidad TEXT,
  UNIQUE(empresa_id, producto_id)
);

-- Pedidos
CREATE TABLE IF NOT EXISTS pedidos (
  id SERIAL PRIMARY KEY,
  casino_id INTEGER REFERENCES casinos_sucursales(id) ON DELETE SET NULL,
  casino_nombre TEXT, -- Cache
  empresa_id INTEGER REFERENCES empresas_clientes(id) ON DELETE SET NULL,
  empresa_nombre TEXT, -- Cache
  fecha_pedido TIMESTAMPTZ DEFAULT now(),
  fecha_entrega DATE NOT NULL,
  hora_pedido TEXT,
  estado TEXT CHECK (estado IN ('pendiente', 'confirmado', 'en_produccion', 'despachado', 'entregado', 'cancelado')) DEFAULT 'pendiente',
  total DECIMAL(12,2) DEFAULT 0,
  observaciones TEXT,
  es_recurrente BOOLEAN DEFAULT false,
  dias_recurrencia TEXT[],
  repartidor TEXT,
  origen_pedido TEXT CHECK (origen_pedido IN ('web', 'manual')) DEFAULT 'manual',
  hora_entrega TEXT,
  notificado_email BOOLEAN DEFAULT false,
  notificado_whatsapp BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Detalle de Pedidos
CREATE TABLE IF NOT EXISTS detalle_pedidos (
  id SERIAL PRIMARY KEY,
  pedido_id INTEGER REFERENCES pedidos(id) ON DELETE CASCADE,
  producto_id INTEGER REFERENCES productos_catalogo(id) ON DELETE SET NULL,
  producto_nombre TEXT,
  cantidad DECIMAL(10,2) NOT NULL,
  unidad TEXT,
  precio_unitario DECIMAL(12,2),
  subtotal DECIMAL(12,2)
);

-- =============================================
-- EQUIPOS Y VEHÍCULOS
-- =============================================

-- Equipos
CREATE TABLE IF NOT EXISTS equipos (
  id SERIAL PRIMARY KEY,
  codigo TEXT UNIQUE,
  nombre TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('Horno', 'Amasadora', 'Batidora', 'Refrigerador', 'Otro')),
  marca TEXT,
  modelo TEXT,
  numero_serie TEXT,
  fecha_compra DATE,
  proveedor TEXT,
  estado TEXT CHECK (estado IN ('Operativo', 'En Mantenimiento', 'Fuera de Servicio')) DEFAULT 'Operativo',
  ubicacion TEXT CHECK (ubicacion IN ('Producción', 'Bodega', 'Ventas')),
  garantia_hasta DATE,
  valor_compra DECIMAL(12,2),
  observaciones TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Mantenimientos de Equipos
CREATE TABLE IF NOT EXISTS mantenimientos (
  id SERIAL PRIMARY KEY,
  equipo_id INTEGER REFERENCES equipos(id) ON DELETE CASCADE,
  tipo TEXT CHECK (tipo IN ('Preventivo', 'Correctivo', 'Calibración')),
  fecha DATE NOT NULL,
  descripcion TEXT,
  tecnico TEXT,
  empresa_externa TEXT,
  repuestos TEXT,
  costo DECIMAL(12,2),
  proximo_mantenimiento DATE,
  observaciones TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Vehículos
CREATE TABLE IF NOT EXISTS vehiculos (
  id SERIAL PRIMARY KEY,
  patente TEXT UNIQUE NOT NULL,
  marca TEXT,
  modelo TEXT,
  anio INTEGER,
  tipo TEXT CHECK (tipo IN ('Camioneta', 'Furgón', 'Camión', 'Automóvil')),
  kilometraje INTEGER DEFAULT 0,
  proxima_revision_tecnica DATE,
  vencimiento_seguro DATE,
  vencimiento_permiso_circulacion DATE,
  estado TEXT CHECK (estado IN ('Operativo', 'En Taller', 'Fuera de Servicio')) DEFAULT 'Operativo',
  conductor_asignado TEXT,
  observaciones TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Mantenimientos de Vehículos
CREATE TABLE IF NOT EXISTS mantenimientos_vehiculos (
  id SERIAL PRIMARY KEY,
  vehiculo_id INTEGER REFERENCES vehiculos(id) ON DELETE CASCADE,
  tipo TEXT CHECK (tipo IN ('Preventivo', 'Correctivo', 'Cambio Aceite', 'Neumáticos')),
  fecha DATE NOT NULL,
  kilometraje INTEGER,
  descripcion TEXT,
  repuestos TEXT,
  taller TEXT,
  costo DECIMAL(12,2),
  proximo_mantenimiento_km INTEGER,
  observaciones TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- USUARIOS ADMINISTRATIVOS
-- =============================================

-- Usuarios del dashboard (administradores)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  nombre TEXT NOT NULL,
  role TEXT CHECK (role IN ('manager', 'employee')) DEFAULT 'employee',
  permissions TEXT[],
  must_change_password BOOLEAN DEFAULT false,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- REGISTRO DE COLEGIOS (MERMAS)
-- =============================================

CREATE TABLE IF NOT EXISTS registros_colegios (
  id SERIAL PRIMARY KEY,
  fecha DATE NOT NULL,
  repartidor TEXT NOT NULL,
  cliente TEXT NOT NULL,
  casino_id INTEGER REFERENCES casinos_sucursales(id) ON DELETE SET NULL,
  producto TEXT NOT NULL,
  peso_formula DECIMAL(10,2) NOT NULL,
  peso_real DECIMAL(10,2) NOT NULL,
  diferencia DECIMAL(10,2),
  porcentaje_merma DECIMAL(5,2),
  observaciones TEXT,
  creador TEXT,
  fecha_creacion TIMESTAMPTZ DEFAULT now()
);

-- Favoritos de Clientes
CREATE TABLE IF NOT EXISTS favoritos (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL,
  producto_id INTEGER REFERENCES productos_catalogo(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(client_id, producto_id)
);

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_insumo_trans_fecha ON insumo_transactions(fecha);
CREATE INDEX IF NOT EXISTS idx_insumo_trans_insumo ON insumo_transactions(insumo_id);
CREATE INDEX IF NOT EXISTS idx_bank_trans_fecha ON bank_transactions(fecha);
CREATE INDEX IF NOT EXISTS idx_pedidos_fecha ON pedidos(fecha_entrega);
CREATE INDEX IF NOT EXISTS idx_pedidos_casino ON pedidos(casino_id);
CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas(fecha);
CREATE INDEX IF NOT EXISTS idx_favoritos_client ON favoritos(client_id);

-- =============================================
-- RLS (Row Level Security) - Optional
-- =============================================
-- Enable RLS on tables that need it
-- ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Anyone can read ventas" ON ventas FOR SELECT USING (true);

-- =============================================
-- DONE!
-- =============================================
SELECT 'Schema created successfully!' as message;
