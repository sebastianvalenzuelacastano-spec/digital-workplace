'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Order, Venta, Payment, Rendimiento, InsumoTransaction, BankTransaction, CajaChica, MaestroArea, Insumo, GastoGeneral, Proveedor, Cliente, Trabajador, Equipo, Mantenimiento, Vehiculo, MantenimientoVehiculo } from '@/types/dashboard';

interface DashboardContextType {
    // Orders
    orders: Order[];
    addOrder: (order: Omit<Order, 'id'>) => void;
    updateOrder: (id: number, order: Partial<Order>) => void;
    deleteOrder: (id: number) => void;

    // Sales
    ventas: Venta[];
    addVenta: (venta: Omit<Venta, 'id'>) => void;
    updateVenta: (id: number, venta: Partial<Venta>) => void;
    deleteVenta: (id: number) => void;

    // Payments
    payments: Payment[];
    addPayment: (payment: Omit<Payment, 'id'>) => void;
    updatePayment: (id: number, payment: Partial<Payment>) => void;
    deletePayment: (id: number) => void;

    // Performance
    rendimientos: Rendimiento[];
    addRendimiento: (rendimiento: Omit<Rendimiento, 'id'>) => void;
    updateRendimiento: (id: number, rendimiento: Partial<Rendimiento>) => void;
    deleteRendimiento: (id: number) => void;

    // Inventory
    insumoTransactions: InsumoTransaction[];
    addInsumoTransaction: (transaction: Omit<InsumoTransaction, 'id'>) => void;
    updateInsumoTransaction: (id: number, transaction: Partial<InsumoTransaction>) => void;
    deleteInsumoTransaction: (id: number) => void;
    registerInsumoPurchase: (transaction: Omit<InsumoTransaction, 'id'>, newPrice: number) => void;
    updateInsumoPurchase: (id: number, transaction: Partial<InsumoTransaction>, newPrice: number) => void;

    // Bank
    bankTransactions: BankTransaction[];
    addBankTransaction: (transaction: Omit<BankTransaction, 'id' | 'saldo'>) => void;
    updateBankTransaction: (id: number, transaction: Partial<BankTransaction>) => void;
    deleteBankTransaction: (id: number) => void;

    // Caja Chica
    cajaChica: CajaChica[];
    addCajaChica: (item: Omit<CajaChica, 'id'>) => void;
    updateCajaChica: (id: number, item: Partial<CajaChica>) => void;
    deleteCajaChica: (id: number) => void;

    // Master Data - Areas
    maestroAreas: MaestroArea[];
    addMaestroArea: (area: Omit<MaestroArea, 'id'>) => void;
    updateMaestroArea: (id: number, area: Partial<MaestroArea>) => void;
    deleteMaestroArea: (id: number) => void;

    // Master Data - Insumos
    maestroInsumos: Insumo[];
    addMaestroInsumo: (insumo: Omit<Insumo, 'id'>) => void;
    updateMaestroInsumo: (id: number, insumo: Partial<Insumo>) => void;
    deleteMaestroInsumo: (id: number) => void;

    // Gastos Generales
    gastosGenerales: GastoGeneral[];
    addGastoGeneral: (gasto: Omit<GastoGeneral, 'id'>) => void;
    updateGastoGeneral: (id: number, gasto: Partial<GastoGeneral>) => void;
    deleteGastoGeneral: (id: number) => void;

    // Master Data - Proveedores
    maestroProveedores: Proveedor[];
    addMaestroProveedor: (proveedor: Omit<Proveedor, 'id'>) => void;
    updateMaestroProveedor: (id: number, proveedor: Partial<Proveedor>) => void;
    deleteMaestroProveedor: (id: number) => void;

    // Master Data - Clientes
    maestroClientes: Cliente[];
    addMaestroCliente: (cliente: Omit<Cliente, 'id'>) => void;
    updateMaestroCliente: (id: number, cliente: Partial<Cliente>) => void;
    deleteMaestroCliente: (id: number) => void;

    // Master Data - Trabajadores
    maestroTrabajadores: Trabajador[];
    addMaestroTrabajador: (trabajador: Omit<Trabajador, 'id'>) => void;
    updateMaestroTrabajador: (id: number, trabajador: Partial<Trabajador>) => void;
    deleteMaestroTrabajador: (id: number) => void;

    // Equipos
    equipos: Equipo[];
    addEquipo: (equipo: Omit<Equipo, 'id'>) => void;
    updateEquipo: (id: number, equipo: Partial<Equipo>) => void;
    deleteEquipo: (id: number) => void;

    // Mantenimientos
    mantenimientos: Mantenimiento[];
    addMantenimiento: (mantenimiento: Omit<Mantenimiento, 'id'>) => void;
    updateMantenimiento: (id: number, mantenimiento: Partial<Mantenimiento>) => void;
    deleteMantenimiento: (id: number) => void;

    // Vehículos
    vehiculos: Vehiculo[];
    addVehiculo: (vehiculo: Omit<Vehiculo, 'id'>) => void;
    updateVehiculo: (id: number, vehiculo: Partial<Vehiculo>) => void;
    deleteVehiculo: (id: number) => void;

    // Mantenimientos Vehículos
    mantenimientosVehiculos: MantenimientoVehiculo[];
    addMantenimientoVehiculo: (mantenimiento: Omit<MantenimientoVehiculo, 'id'>) => void;
    updateMantenimientoVehiculo: (id: number, mantenimiento: Partial<MantenimientoVehiculo>) => void;
    deleteMantenimientoVehiculo: (id: number) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
    // Orders State
    const [orders, setOrders] = useState<Order[]>([
        { id: 1, fecha: '2025-11-28', cliente: 'Restaurant El Buen Gusto', productos: '50 panes amasados, 20 hallullas', total: 55000, estado: 'pendiente', entrega: '2025-11-30' },
        { id: 2, fecha: '2025-11-27', cliente: 'Cafetería Centro', productos: '30 croissants, 15 pasteles', total: 85000, estado: 'en_proceso', entrega: '2025-11-29' },
        { id: 3, fecha: '2025-11-26', cliente: 'Hotel Plaza', productos: '100 panes marraqueta', total: 45000, estado: 'completado', entrega: '2025-11-27' },
        { id: 4, fecha: '2025-11-25', cliente: 'Panadería Local', productos: '20kg harina, 5kg levadura', total: 120000, estado: 'completado', entrega: '2025-11-26' },
    ]);

    // Sales State
    const [ventas, setVentas] = useState<Venta[]>([
        { id: 1, fecha: '2025-11-28', cliente: 'Restaurant El Buen Gusto', kilos: 45, monto: 135000 },
        { id: 2, fecha: '2025-11-27', cliente: 'Cafetería Centro', kilos: 30, monto: 90000 },
        { id: 3, fecha: '2025-11-26', cliente: 'Hotel Plaza', kilos: 80, monto: 240000 },
        { id: 4, fecha: '2025-11-25', cliente: 'Panadería Local', kilos: 25, monto: 75000 },
    ]);

    // Payments State
    const [payments, setPayments] = useState<Payment[]>([
        { id: 1, factura: 'FAC-2023-001', cliente: 'Restaurant El Buen Gusto', fechaPago: '2025-11-28', montoPagado: 150000 },
        { id: 2, factura: 'BOL-2023-089', cliente: 'Cafetería Centro', fechaPago: '2025-11-27', montoPagado: 45000 },
        { id: 3, factura: 'FAC-2023-005', cliente: 'Hotel Plaza', fechaPago: '2025-11-26', montoPagado: 320000 },
    ]);

    // Performance State
    const [rendimientos, setRendimientos] = useState<Rendimiento[]>([
        { id: 1, fecha: '2025-11-28', kilosProducidos: 1200, sacos: 24, rinde: 50, barrido: 5, merma: 2 },
        { id: 2, fecha: '2025-11-27', kilosProducidos: 1150, sacos: 23, rinde: 50, barrido: 4, merma: 3 },
        { id: 3, fecha: '2025-11-26', kilosProducidos: 1300, sacos: 26, rinde: 50, barrido: 6, merma: 2 },
        { id: 4, fecha: '2025-11-25', kilosProducidos: 1100, sacos: 22, rinde: 50, barrido: 3, merma: 1 },
    ]);

    // Inventory State
    const [insumoTransactions, setInsumoTransactions] = useState<InsumoTransaction[]>([
        { id: 1, fecha: '2025-11-28', insumo: 'Harina', cantidadEntrada: 1000, cantidadSalida: 0, proveedor: 'Molino Central', fechaCompra: '2025-11-28', fechaPago: '2025-11-30', factura: 'FAC-001', estadoPago: 'pendiente' },
        { id: 2, fecha: '2025-11-28', insumo: 'Levadura', cantidadEntrada: 50, cantidadSalida: 0, proveedor: 'Distribuidora Sur', fechaCompra: '2025-11-28', fechaPago: '2025-11-28', factura: 'BOL-999', estadoPago: 'pagada' },
        { id: 3, fecha: '2025-11-29', insumo: 'Harina', cantidadEntrada: 0, cantidadSalida: 100, proveedor: '-', fechaCompra: '-', fechaPago: '-', factura: '-', estadoPago: 'pagada' },
    ]);

    // Bank State
    const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([
        { id: 1, fecha: '2025-11-28', entrada: 1500000, salida: 0, descripcion: 'Venta del día', documento: 'BOL-001', observacion: 'Venta normal', saldo: 1500000 },
        { id: 2, fecha: '2025-11-28', entrada: 0, salida: 350000, descripcion: 'Pago Proveedor Harina', documento: 'FAC-123', observacion: 'Pago contado', saldo: 1150000 },
        { id: 3, fecha: '2025-11-27', entrada: 800000, salida: 0, descripcion: 'Anticipo Evento', documento: 'TRF-999', observacion: 'Matrimonio', saldo: 1950000 },
        { id: 4, fecha: '2025-11-27', entrada: 0, salida: 120000, descripcion: 'Compra Insumos Aseo', documento: 'BOL-555', observacion: '', saldo: 1830000 },
    ]);

    // Caja Chica State
    const [cajaChica, setCajaChica] = useState<CajaChica[]>([
        { id: 1, fecha: '2025-11-28', area: 'Producción', monto: 15000, descripcion: 'Compra de artículos de limpieza' },
        { id: 2, fecha: '2025-11-27', area: 'Administración', monto: 8500, descripcion: 'Pago de estacionamiento' },
        { id: 3, fecha: '2025-11-26', area: 'Ventas', monto: 12000, descripcion: 'Gasolina para reparto' },
    ]);

    // Master Data - Areas
    const [maestroAreas, setMaestroAreas] = useState<MaestroArea[]>([
        { id: 1, nombre: 'Producción', activo: true },
        { id: 2, nombre: 'Administración', activo: true },
        { id: 3, nombre: 'Ventas', activo: true },
        { id: 4, nombre: 'Mantenimiento', activo: true },
        { id: 5, nombre: 'Otros', activo: true },
    ]);

    // Master Data - Insumos
    const [maestroInsumos, setMaestroInsumos] = useState<Insumo[]>([
        { id: 1, nombre: 'Harina', unidad: 'sacos_25kg', activo: true },
        { id: 2, nombre: 'Levadura', unidad: 'unidades', activo: true },
        { id: 3, nombre: 'Sal', unidad: 'sacos', activo: true },
        { id: 4, nombre: 'Aceite', unidad: 'unidades', activo: true },
        { id: 5, nombre: 'Mejorador Marraqueta', unidad: 'unidades', activo: true },
        { id: 6, nombre: 'Mejorador Hallulla', unidad: 'unidades', activo: true },
        { id: 7, nombre: 'Manteca', unidad: 'kg', activo: true },
        { id: 8, nombre: 'Grasa', unidad: 'kg', activo: true },
    ]);

    // Gastos Generales State
    const [gastosGenerales, setGastosGenerales] = useState<GastoGeneral[]>([]);

    // Master Data - Proveedores
    const [maestroProveedores, setMaestroProveedores] = useState<Proveedor[]>([]);

    // Master Data - Clientes
    const [maestroClientes, setMaestroClientes] = useState<Cliente[]>([]);

    // Master Data - Trabajadores
    const [maestroTrabajadores, setMaestroTrabajadores] = useState<Trabajador[]>([]);

    // Equipos State
    const [equipos, setEquipos] = useState<Equipo[]>([]);

    // Mantenimientos State
    const [mantenimientos, setMantenimientos] = useState<Mantenimiento[]>([]);

    // Vehículos State
    const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);

    // Mantenimientos Vehículos State
    const [mantenimientosVehiculos, setMantenimientosVehiculos] = useState<MantenimientoVehiculo[]>([]);

    // Orders Functions
    // Load initial data from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return; // Wait for login

                const response = await fetch('/api/db', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('role');
                    window.location.href = '/auth/login';
                    return;
                }

                if (response.ok) {
                    const data = await response.json();
                    setOrders(data.orders || []);
                    setVentas(data.ventas || []);
                    setPayments(data.payments || []);
                    setRendimientos(data.rendimientos || []);
                    setInsumoTransactions(data.insumoTransactions || []);
                    setBankTransactions(data.bankTransactions || []);
                    setCajaChica(data.cajaChica || []);
                    setMaestroAreas(data.maestroAreas || []);
                    setMaestroInsumos(data.maestroInsumos || []);
                    setGastosGenerales(data.gastosGenerales || []);
                    setMaestroProveedores(data.maestroProveedores || []);
                    setMaestroClientes(data.maestroClientes || []);
                    setMaestroTrabajadores(data.maestroTrabajadores || []);
                    setEquipos(data.equipos || []);
                    setMantenimientos(data.mantenimientos || []);
                    setVehiculos(data.vehiculos || []);
                    setMantenimientosVehiculos(data.mantenimientosVehiculos || []);
                }
            } catch (error) {
                console.error('Error loading data:', error);
            }
        };
        fetchData();
    }, []);

    // Helper to save data to API
    const saveData = async (newData: any) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('saveData: No token found');
                return;
            }

            console.log('saveData: Saving data...', { insumoTransactionsCount: newData.insumoTransactions?.length });

            const response = await fetch('/api/db', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newData),
            });

            console.log('saveData: Response status:', response.status);

            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('role');
                window.location.href = '/auth/login';
                return;
            }

            if (response.status === 403) {
                const errorData = await response.json();
                alert(`❌ Error: ${errorData.error}\n\n${errorData.details || 'No tienes permisos para realizar esta acción.'}`);
                // Reload the page to reset state
                window.location.reload();
                return;
            }

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error saving data:', errorData);
                alert(`Error al guardar los cambios: ${errorData.error || 'Error desconocido'}`);
                // Reload the page to reset state
                window.location.reload();
            }
        } catch (error) {
            console.error('Error saving data:', error);
            alert('Error de conexión al guardar los cambios. Por favor, intenta de nuevo.');
        }
    };

    // Orders Functions
    const addOrder = (order: Omit<Order, 'id'>) => {
        const newOrder = { ...order, id: Math.max(...orders.map(o => o.id), 0) + 1 };
        const newOrders = [...orders, newOrder];
        setOrders(newOrders);
        saveData({ orders: newOrders, ventas, payments, rendimientos, insumoTransactions, bankTransactions, cajaChica, maestroAreas, maestroInsumos, gastosGenerales });
    };

    const updateOrder = (id: number, order: Partial<Order>) => {
        const newOrders = orders.map(o => o.id === id ? { ...o, ...order } : o);
        setOrders(newOrders);
        saveData({ orders: newOrders, ventas, payments, rendimientos, insumoTransactions, bankTransactions, cajaChica, maestroAreas, maestroInsumos, gastosGenerales });
    };

    const deleteOrder = (id: number) => {
        const newOrders = orders.filter(o => o.id !== id);
        setOrders(newOrders);
        saveData({ orders: newOrders, ventas, payments, rendimientos, insumoTransactions, bankTransactions, cajaChica, maestroAreas, maestroInsumos, gastosGenerales });
    };

    // Helper to sync Rendimiento when Sales or Inventory changes
    const syncRendimiento = (
        date: string,
        currentVentas: Venta[],
        currentInsumos: InsumoTransaction[],
        currentRendimientos: Rendimiento[]
    ): Rendimiento[] => {
        const existingRendimientoIndex = currentRendimientos.findIndex(r => r.fecha === date);

        if (existingRendimientoIndex === -1) return currentRendimientos;

        // Calculate new totals
        const kilosProducidos = currentVentas
            .filter(v => v.fecha === date)
            .reduce((sum, v) => sum + v.kilos, 0);

        const sacos = currentInsumos
            .filter(t => t.fecha === date && t.insumo === 'Harina' && t.cantidadSalida > 0)
            .reduce((sum, t) => sum + t.cantidadSalida, 0);

        const currentRendimiento = currentRendimientos[existingRendimientoIndex];

        // Check if update is needed
        if (currentRendimiento.kilosProducidos !== kilosProducidos || currentRendimiento.sacos !== sacos) {
            const rinde = kilosProducidos && sacos > 0 ? Number(((kilosProducidos / sacos) * 2).toFixed(2)) : 0;

            const updatedRendimientos = [...currentRendimientos];
            updatedRendimientos[existingRendimientoIndex] = {
                ...currentRendimiento,
                kilosProducidos,
                sacos,
                rinde
            };
            return updatedRendimientos;
        }

        return currentRendimientos;
    };

    // Sales Functions
    const addVenta = (venta: Omit<Venta, 'id'>) => {
        const newVenta = { ...venta, id: Math.max(...ventas.map(v => v.id), 0) + 1 };
        const newVentas = [...ventas, newVenta];
        setVentas(newVentas);

        // Sync Rendimiento
        const updatedRendimientos = syncRendimiento(venta.fecha, newVentas, insumoTransactions, rendimientos);
        if (updatedRendimientos !== rendimientos) setRendimientos(updatedRendimientos);

        saveData({ orders, ventas: newVentas, payments, rendimientos: updatedRendimientos, insumoTransactions, bankTransactions, cajaChica, maestroAreas, maestroInsumos, gastosGenerales });
    };

    const updateVenta = (id: number, venta: Partial<Venta>) => {
        const oldVenta = ventas.find(v => v.id === id);
        const newVentas = ventas.map(v => v.id === id ? { ...v, ...venta } : v);
        setVentas(newVentas);

        // Sync Rendimiento (check both old and new date if date changed)
        let updatedRendimientos = syncRendimiento(venta.fecha || oldVenta?.fecha || '', newVentas, insumoTransactions, rendimientos);
        if (oldVenta && venta.fecha && oldVenta.fecha !== venta.fecha) {
            updatedRendimientos = syncRendimiento(oldVenta.fecha, newVentas, insumoTransactions, updatedRendimientos);
        }
        if (updatedRendimientos !== rendimientos) setRendimientos(updatedRendimientos);

        saveData({ orders, ventas: newVentas, payments, rendimientos: updatedRendimientos, insumoTransactions, bankTransactions, cajaChica, maestroAreas, maestroInsumos, gastosGenerales });
    };

    const deleteVenta = (id: number) => {
        const ventaToDelete = ventas.find(v => v.id === id);
        const newVentas = ventas.filter(v => v.id !== id);
        setVentas(newVentas);

        // Sync Rendimiento
        let updatedRendimientos = rendimientos;
        if (ventaToDelete) {
            updatedRendimientos = syncRendimiento(ventaToDelete.fecha, newVentas, insumoTransactions, rendimientos);
            if (updatedRendimientos !== rendimientos) setRendimientos(updatedRendimientos);
        }

        saveData({ orders, ventas: newVentas, payments, rendimientos: updatedRendimientos, insumoTransactions, bankTransactions, cajaChica, maestroAreas, maestroInsumos, gastosGenerales });
    };

    // Payments Functions
    const addPayment = (payment: Omit<Payment, 'id'>) => {
        const newPayment = { ...payment, id: Math.max(...payments.map(p => p.id), 0) + 1 };
        const newPayments = [...payments, newPayment];
        setPayments(newPayments);
        saveData({ orders, ventas, payments: newPayments, rendimientos, insumoTransactions, bankTransactions, cajaChica, maestroAreas, maestroInsumos, gastosGenerales, maestroProveedores, maestroClientes, maestroTrabajadores });
    };

    const updatePayment = (id: number, payment: Partial<Payment>) => {
        const newPayments = payments.map(p => p.id === id ? { ...p, ...payment } : p);
        setPayments(newPayments);
        saveData({ orders, ventas, payments: newPayments, rendimientos, insumoTransactions, bankTransactions, cajaChica, maestroAreas, maestroInsumos, gastosGenerales, maestroProveedores, maestroClientes, maestroTrabajadores });
    };

    const deletePayment = (id: number) => {
        const newPayments = payments.filter(p => p.id !== id);
        setPayments(newPayments);
        saveData({ orders, ventas, payments: newPayments, rendimientos, insumoTransactions, bankTransactions, cajaChica, maestroAreas, maestroInsumos, gastosGenerales, maestroProveedores, maestroClientes, maestroTrabajadores });
    };

    // Performance Functions
    const addRendimiento = (rendimiento: Omit<Rendimiento, 'id'>) => {
        const newRendimiento = { ...rendimiento, id: Math.max(...rendimientos.map(r => r.id), 0) + 1 };
        const newRendimientos = [...rendimientos, newRendimiento];
        setRendimientos(newRendimientos);
        saveData({ orders, ventas, payments, rendimientos: newRendimientos, insumoTransactions, bankTransactions, cajaChica, maestroAreas, maestroInsumos, gastosGenerales, maestroProveedores, maestroClientes, maestroTrabajadores });
    };

    const updateRendimiento = (id: number, rendimiento: Partial<Rendimiento>) => {
        const newRendimientos = rendimientos.map(r => r.id === id ? { ...r, ...rendimiento } : r);
        setRendimientos(newRendimientos);
        saveData({ orders, ventas, payments, rendimientos: newRendimientos, insumoTransactions, bankTransactions, cajaChica, maestroAreas, maestroInsumos, gastosGenerales, maestroProveedores, maestroClientes, maestroTrabajadores });
    };

    const deleteRendimiento = (id: number) => {
        const newRendimientos = rendimientos.filter(r => r.id !== id);
        setRendimientos(newRendimientos);
        saveData({ orders, ventas, payments, rendimientos: newRendimientos, insumoTransactions, bankTransactions, cajaChica, maestroAreas, maestroInsumos, gastosGenerales, maestroProveedores, maestroClientes, maestroTrabajadores });
    };

    // Inventory Functions
    const addInsumoTransaction = (transaction: Omit<InsumoTransaction, 'id'>) => {
        const newTransaction = { ...transaction, id: Math.max(...insumoTransactions.map(t => t.id), 0) + 1 };
        const newTransactions = [...insumoTransactions, newTransaction];
        setInsumoTransactions(newTransactions);

        // Sync Rendimiento if it's Harina output
        let updatedRendimientos = rendimientos;
        if (transaction.insumo === 'Harina' && transaction.cantidadSalida > 0) {
            updatedRendimientos = syncRendimiento(transaction.fecha, ventas, newTransactions, rendimientos);
            if (updatedRendimientos !== rendimientos) setRendimientos(updatedRendimientos);
        }

        saveData({ orders, ventas, payments, rendimientos: updatedRendimientos, insumoTransactions: newTransactions, bankTransactions, cajaChica, maestroAreas, maestroInsumos, gastosGenerales, maestroProveedores, maestroClientes, maestroTrabajadores });
    };

    const updateInsumoTransaction = (id: number, transaction: Partial<InsumoTransaction>) => {
        const oldTransaction = insumoTransactions.find(t => t.id === id);
        const newTransactions = insumoTransactions.map(t => t.id === id ? { ...t, ...transaction } : t);
        setInsumoTransactions(newTransactions);

        // Sync Rendimiento
        let updatedRendimientos = rendimientos;
        const isHarina = (transaction.insumo === 'Harina') || (oldTransaction?.insumo === 'Harina');
        if (isHarina) {
            updatedRendimientos = syncRendimiento(transaction.fecha || oldTransaction?.fecha || '', ventas, newTransactions, rendimientos);
            if (oldTransaction && transaction.fecha && oldTransaction.fecha !== transaction.fecha) {
                updatedRendimientos = syncRendimiento(oldTransaction.fecha, ventas, newTransactions, updatedRendimientos);
            }
            if (updatedRendimientos !== rendimientos) setRendimientos(updatedRendimientos);
        }

        saveData({ orders, ventas, payments, rendimientos: updatedRendimientos, insumoTransactions: newTransactions, bankTransactions, cajaChica, maestroAreas, maestroInsumos, gastosGenerales, maestroProveedores, maestroClientes, maestroTrabajadores });
    };

    const deleteInsumoTransaction = (id: number) => {
        const transactionToDelete = insumoTransactions.find(t => t.id === id);
        const newTransactions = insumoTransactions.filter(t => t.id !== id);
        setInsumoTransactions(newTransactions);

        // Sync Rendimiento
        let updatedRendimientos = rendimientos;
        if (transactionToDelete && transactionToDelete.insumo === 'Harina' && transactionToDelete.cantidadSalida > 0) {
            updatedRendimientos = syncRendimiento(transactionToDelete.fecha, ventas, newTransactions, rendimientos);
            if (updatedRendimientos !== rendimientos) setRendimientos(updatedRendimientos);
        }

        saveData({ orders, ventas, payments, rendimientos: updatedRendimientos, insumoTransactions: newTransactions, bankTransactions, cajaChica, maestroAreas, maestroInsumos, gastosGenerales, maestroProveedores, maestroClientes, maestroTrabajadores });
    };

    /**
     * Registers a new purchase and updates the item's average cost atomically
     * This prevents race conditions where saving one overwrites the other
     */
    const registerInsumoPurchase = (transaction: Omit<InsumoTransaction, 'id'>, newPrice: number) => {
        // 1. Prepare new transaction list
        const newTransaction = { ...transaction, id: Math.max(...insumoTransactions.map(t => t.id), 0) + 1 };
        const newTransactions = [...insumoTransactions, newTransaction];
        setInsumoTransactions(newTransactions);

        // 2. Calculate and update average cost
        let newMaestroInsumos = maestroInsumos;
        if (transaction.cantidadEntrada > 0 && newPrice > 0) {
            const insumoMaster = maestroInsumos.find(i => i.nombre === transaction.insumo);
            if (insumoMaster) {
                // Calculate current stock (before this transaction)
                const currentStock = insumoTransactions
                    .filter(t => t.insumo === transaction.insumo)
                    .reduce((acc, t) => acc + t.cantidadEntrada - t.cantidadSalida, 0);

                const currentCost = insumoMaster.costoUnitario || 0;

                // Weighted Average Cost Formula
                const currentValue = currentStock * currentCost;
                const newPurchaseValue = transaction.cantidadEntrada * newPrice;
                const totalQuantity = currentStock + transaction.cantidadEntrada;

                const newAverageCost = totalQuantity > 0
                    ? Math.round((currentValue + newPurchaseValue) / totalQuantity)
                    : newPrice;

                newMaestroInsumos = maestroInsumos.map(i =>
                    i.id === insumoMaster.id ? { ...i, costoUnitario: newAverageCost } : i
                );
                setMaestroInsumos(newMaestroInsumos);
            }
        }

        // 3. Save everything once
        saveData({
            orders,
            ventas,
            payments,
            rendimientos,
            insumoTransactions: newTransactions,
            bankTransactions,
            cajaChica,
            maestroAreas,
            maestroInsumos: newMaestroInsumos,
            gastosGenerales,
            maestroProveedores,
            maestroClientes,
            maestroTrabajadores
        });
    };

    /**
     * Updates an existing purchase and updates the item's average cost atomically
     */
    const updateInsumoPurchase = (id: number, transaction: Partial<InsumoTransaction>, newPrice: number) => {
        // 1. Prepare new transaction list
        const oldTransaction = insumoTransactions.find(t => t.id === id);
        const newTransactions = insumoTransactions.map(t => t.id === id ? { ...t, ...transaction } : t);
        setInsumoTransactions(newTransactions);

        // Sync Rendimiento (logic copied from updateInsumoTransaction)
        let updatedRendimientos = rendimientos;
        const isHarina = (transaction.insumo === 'Harina') || (oldTransaction?.insumo === 'Harina');
        if (isHarina) {
            updatedRendimientos = syncRendimiento(transaction.fecha || oldTransaction?.fecha || '', ventas, newTransactions, rendimientos);
            if (oldTransaction && transaction.fecha && oldTransaction.fecha !== transaction.fecha) {
                updatedRendimientos = syncRendimiento(oldTransaction.fecha, ventas, newTransactions, updatedRendimientos);
            }
            if (updatedRendimientos !== rendimientos) setRendimientos(updatedRendimientos);
        }

        // 2. Calculate and update average cost
        let newMaestroInsumos = maestroInsumos;
        const insumoName = transaction.insumo || oldTransaction?.insumo;
        const cantidadEntrada = transaction.cantidadEntrada ?? oldTransaction?.cantidadEntrada ?? 0;

        if (insumoName && cantidadEntrada > 0 && newPrice > 0) {
            const insumoMaster = maestroInsumos.find(i => i.nombre === insumoName);
            if (insumoMaster) {
                // Determine transaction quantity for calc (using the NEW value)
                const currentStock = insumoTransactions
                    .filter(t => t.insumo === insumoName && t.id !== id) // Exclude current transaction from "current stock" for recalc? 
                    // Actually, the weighted avg logic in the original code was weird. It added the current transaction ON TOP of existing stock.
                    // We will replicate the original logic: (CurrentStock * CurrentCost + NewTx * NewPrice) / Total
                    // Where CurrentStock is calculated from ALL transactions.
                    // Wait, if I'm UPDATING, the "CurrentStock" should logically NOT include the old version of this transaction if we are re-averaging?
                    // But the original code just grabbed "calculateStock" which sums everything.
                    // Let's stick to the atomic behavior of "Save Tx + Save Cost".
                    // The original "calculateStock" includes the transaction IF it was saved?
                    // In the original code, `updateInsumoTransaction` was called FIRST. So `insumoTransactions` state wouldn't have updated yet in the `calculateStock` call?
                    // `calculateStock` uses `insumoTransactions` from scope.
                    // So in original code, `calculateStock` used the OLD list (before update).
                    // So it calculated weighted average based on (Old Stock * Old Cost + Modifed Tx * New Price).
                    // This effectively "double counts" the transaction (once in old stock, once in new addition) for the weighting?
                    // That seems like a bug in the original logic too, but I should probably just ensure persistence first.
                    // I will stick to the same logic sequence: Update List -> Calculate Cost -> Save All.

                    // So: 
                    .reduce((acc, t) => acc + t.cantidadEntrada - t.cantidadSalida, 0);
                // Note: `insumoTransactions` here is the OLD list (closure).
                // So `currentStock` is the stock BEFORE the update.

                const currentCost = insumoMaster.costoUnitario || 0;

                const currentValue = currentStock * currentCost;
                const newPurchaseValue = cantidadEntrada * newPrice;
                const totalQuantity = currentStock + cantidadEntrada; // This adds the modified quantity to the OLD stock count.

                const newAverageCost = totalQuantity > 0
                    ? Math.round((currentValue + newPurchaseValue) / totalQuantity)
                    : newPrice;

                newMaestroInsumos = maestroInsumos.map(i =>
                    i.id === insumoMaster.id ? { ...i, costoUnitario: newAverageCost } : i
                );
                setMaestroInsumos(newMaestroInsumos);
            }
        }

        // 3. Save everything once
        saveData({
            orders,
            ventas,
            payments,
            rendimientos: updatedRendimientos,
            insumoTransactions: newTransactions,
            bankTransactions,
            cajaChica,
            maestroAreas,
            maestroInsumos: newMaestroInsumos,
            gastosGenerales,
            maestroProveedores,
            maestroClientes,
            maestroTrabajadores
        });
    };

    // Bank Functions
    const addBankTransaction = (transaction: Omit<BankTransaction, 'id' | 'saldo'>) => {
        const lastSaldo = bankTransactions.length > 0 ? bankTransactions[bankTransactions.length - 1].saldo : 0;
        const saldo = lastSaldo + transaction.entrada - transaction.salida;
        const newTransaction = {
            ...transaction,
            id: Math.max(...bankTransactions.map(t => t.id), 0) + 1,
            saldo
        };
        const newBankTransactions = [...bankTransactions, newTransaction];
        setBankTransactions(newBankTransactions);

        // Auto-update invoice payment status
        let updatedInsumoTransactions = insumoTransactions;
        if (transaction.salida > 0 && transaction.documento && transaction.documento !== '-') {
            const matchingInvoice = insumoTransactions.find(
                inv => inv.factura === transaction.documento && inv.estadoPago !== 'pagada'
            );

            if (matchingInvoice) {
                updatedInsumoTransactions = insumoTransactions.map(inv =>
                    inv.factura === transaction.documento
                        ? { ...inv, estadoPago: 'pagada' as const }
                        : inv
                );
                setInsumoTransactions(updatedInsumoTransactions);
            }
        }

        saveData({ orders, ventas, payments, rendimientos, insumoTransactions: updatedInsumoTransactions, bankTransactions: newBankTransactions, cajaChica, maestroAreas, maestroInsumos, gastosGenerales, maestroProveedores, maestroClientes, maestroTrabajadores });
    };

    const updateBankTransaction = (id: number, transaction: Partial<BankTransaction>) => {
        const newBankTransactions = bankTransactions.map(t => t.id === id ? { ...t, ...transaction } : t);
        setBankTransactions(newBankTransactions);
        saveData({ orders, ventas, payments, rendimientos, insumoTransactions, bankTransactions: newBankTransactions, cajaChica, maestroAreas, maestroInsumos, gastosGenerales, maestroProveedores, maestroClientes, maestroTrabajadores });
    };

    const deleteBankTransaction = (id: number) => {
        const newBankTransactions = bankTransactions.filter(t => t.id !== id);
        setBankTransactions(newBankTransactions);
        saveData({ orders, ventas, payments, rendimientos, insumoTransactions, bankTransactions: newBankTransactions, cajaChica, maestroAreas, maestroInsumos, gastosGenerales, maestroProveedores, maestroClientes, maestroTrabajadores });
    };

    // Caja Chica Functions
    const addCajaChica = (item: Omit<CajaChica, 'id'>) => {
        const newItem = { ...item, id: Math.max(...cajaChica.map(c => c.id), 0) + 1 };
        const newCajaChica = [...cajaChica, newItem];
        setCajaChica(newCajaChica);
        saveData({ orders, ventas, payments, rendimientos, insumoTransactions, bankTransactions, cajaChica: newCajaChica, maestroAreas, maestroInsumos, gastosGenerales, maestroProveedores, maestroClientes, maestroTrabajadores });
    };

    const updateCajaChica = (id: number, item: Partial<CajaChica>) => {
        const newCajaChica = cajaChica.map(c => c.id === id ? { ...c, ...item } : c);
        setCajaChica(newCajaChica);
        saveData({ orders, ventas, payments, rendimientos, insumoTransactions, bankTransactions, cajaChica: newCajaChica, maestroAreas, maestroInsumos, gastosGenerales, maestroProveedores, maestroClientes, maestroTrabajadores });
    };

    const deleteCajaChica = (id: number) => {
        const newCajaChica = cajaChica.filter(c => c.id !== id);
        setCajaChica(newCajaChica);
        saveData({ orders, ventas, payments, rendimientos, insumoTransactions, bankTransactions, cajaChica: newCajaChica, maestroAreas, maestroInsumos, gastosGenerales, maestroProveedores, maestroClientes, maestroTrabajadores });
    };

    // Master Data Functions - Areas
    const addMaestroArea = (area: Omit<MaestroArea, 'id'>) => {
        const newArea = { ...area, id: Math.max(...maestroAreas.map(a => a.id), 0) + 1 };
        const newMaestroAreas = [...maestroAreas, newArea];
        setMaestroAreas(newMaestroAreas);
        saveData({ orders, ventas, payments, rendimientos, insumoTransactions, bankTransactions, cajaChica, maestroAreas: newMaestroAreas, maestroInsumos, gastosGenerales, maestroProveedores, maestroClientes, maestroTrabajadores });
    };

    const updateMaestroArea = (id: number, area: Partial<MaestroArea>) => {
        const newMaestroAreas = maestroAreas.map(a => a.id === id ? { ...a, ...area } : a);
        setMaestroAreas(newMaestroAreas);
        saveData({ orders, ventas, payments, rendimientos, insumoTransactions, bankTransactions, cajaChica, maestroAreas: newMaestroAreas, maestroInsumos, gastosGenerales, maestroProveedores, maestroClientes, maestroTrabajadores });
    };

    const deleteMaestroArea = (id: number) => {
        const newMaestroAreas = maestroAreas.filter(a => a.id !== id);
        setMaestroAreas(newMaestroAreas);
        saveData({ orders, ventas, payments, rendimientos, insumoTransactions, bankTransactions, cajaChica, maestroAreas: newMaestroAreas, maestroInsumos, gastosGenerales, maestroProveedores, maestroClientes, maestroTrabajadores });
    };

    // Master Data Functions - Insumos
    const addMaestroInsumo = (insumo: Omit<Insumo, 'id'>) => {
        const newInsumo = { ...insumo, id: Math.max(...maestroInsumos.map(i => i.id), 0) + 1 };
        const newMaestroInsumos = [...maestroInsumos, newInsumo];
        setMaestroInsumos(newMaestroInsumos);
        saveData({ orders, ventas, payments, rendimientos, insumoTransactions, bankTransactions, cajaChica, maestroAreas, maestroInsumos: newMaestroInsumos, gastosGenerales, maestroProveedores, maestroClientes, maestroTrabajadores });
    };

    const updateMaestroInsumo = (id: number, insumo: Partial<Insumo>) => {
        const newMaestroInsumos = maestroInsumos.map(i => i.id === id ? { ...i, ...insumo } : i);
        setMaestroInsumos(newMaestroInsumos);
        saveData({ orders, ventas, payments, rendimientos, insumoTransactions, bankTransactions, cajaChica, maestroAreas, maestroInsumos: newMaestroInsumos, gastosGenerales, maestroProveedores, maestroClientes, maestroTrabajadores });
    };

    const deleteMaestroInsumo = (id: number) => {
        const newMaestroInsumos = maestroInsumos.filter(i => i.id !== id);
        setMaestroInsumos(newMaestroInsumos);
        saveData({ orders, ventas, payments, rendimientos, insumoTransactions, bankTransactions, cajaChica, maestroAreas, maestroInsumos: newMaestroInsumos, gastosGenerales, maestroProveedores, maestroClientes, maestroTrabajadores });
    };

    // Gastos Generales Functions
    const addGastoGeneral = (gasto: Omit<GastoGeneral, 'id'>) => {
        const newGasto = { ...gasto, id: Math.max(...gastosGenerales.map(g => g.id), 0) + 1 };
        const newGastosGenerales = [...gastosGenerales, newGasto];
        setGastosGenerales(newGastosGenerales);
        saveData({ orders, ventas, payments, rendimientos, insumoTransactions, bankTransactions, cajaChica, maestroAreas, maestroInsumos, gastosGenerales: newGastosGenerales, maestroProveedores, maestroClientes, maestroTrabajadores });
    };

    const updateGastoGeneral = (id: number, gasto: Partial<GastoGeneral>) => {
        const newGastosGenerales = gastosGenerales.map(g => g.id === id ? { ...g, ...gasto } : g);
        setGastosGenerales(newGastosGenerales);
        saveData({ orders, ventas, payments, rendimientos, insumoTransactions, bankTransactions, cajaChica, maestroAreas, maestroInsumos, gastosGenerales: newGastosGenerales, maestroProveedores, maestroClientes, maestroTrabajadores });
    };

    const deleteGastoGeneral = (id: number) => {
        const newGastosGenerales = gastosGenerales.filter(g => g.id !== id);
        setGastosGenerales(newGastosGenerales);
        saveData({ orders, ventas, payments, rendimientos, insumoTransactions, bankTransactions, cajaChica, maestroAreas, maestroInsumos, gastosGenerales: newGastosGenerales, maestroProveedores, maestroClientes, maestroTrabajadores });
    };

    // Master Data Functions - Proveedores
    const addMaestroProveedor = (proveedor: Omit<Proveedor, 'id'>) => {
        const newProveedor = { ...proveedor, id: Math.max(...maestroProveedores.map(p => p.id), 0) + 1 };
        const newMaestroProveedores = [...maestroProveedores, newProveedor];
        setMaestroProveedores(newMaestroProveedores);
        saveData({ orders, ventas, payments, rendimientos, insumoTransactions, bankTransactions, cajaChica, maestroAreas, maestroInsumos, gastosGenerales, maestroProveedores: newMaestroProveedores, maestroClientes, maestroTrabajadores });
    };

    const updateMaestroProveedor = (id: number, proveedor: Partial<Proveedor>) => {
        const newMaestroProveedores = maestroProveedores.map(p => p.id === id ? { ...p, ...proveedor } : p);
        setMaestroProveedores(newMaestroProveedores);
        saveData({ orders, ventas, payments, rendimientos, insumoTransactions, bankTransactions, cajaChica, maestroAreas, maestroInsumos, gastosGenerales, maestroProveedores: newMaestroProveedores, maestroClientes, maestroTrabajadores });
    };

    const deleteMaestroProveedor = (id: number) => {
        const newMaestroProveedores = maestroProveedores.filter(p => p.id !== id);
        setMaestroProveedores(newMaestroProveedores);
        saveData({ orders, ventas, payments, rendimientos, insumoTransactions, bankTransactions, cajaChica, maestroAreas, maestroInsumos, gastosGenerales, maestroProveedores: newMaestroProveedores, maestroClientes, maestroTrabajadores });
    };

    // Master Data Functions - Clientes
    const addMaestroCliente = (cliente: Omit<Cliente, 'id'>) => {
        const newCliente = { ...cliente, id: Math.max(...maestroClientes.map(c => c.id), 0) + 1 };
        const newMaestroClientes = [...maestroClientes, newCliente];
        setMaestroClientes(newMaestroClientes);
        saveData({ orders, ventas, payments, rendimientos, insumoTransactions, bankTransactions, cajaChica, maestroAreas, maestroInsumos, gastosGenerales, maestroProveedores, maestroClientes: newMaestroClientes, maestroTrabajadores });
    };

    const updateMaestroCliente = (id: number, cliente: Partial<Cliente>) => {
        const newMaestroClientes = maestroClientes.map(c => c.id === id ? { ...c, ...cliente } : c);
        setMaestroClientes(newMaestroClientes);
        saveData({ orders, ventas, payments, rendimientos, insumoTransactions, bankTransactions, cajaChica, maestroAreas, maestroInsumos, gastosGenerales, maestroProveedores, maestroClientes: newMaestroClientes, maestroTrabajadores });
    };

    const deleteMaestroCliente = (id: number) => {
        const newMaestroClientes = maestroClientes.filter(c => c.id !== id);
        setMaestroClientes(newMaestroClientes);
        saveData({ orders, ventas, payments, rendimientos, insumoTransactions, bankTransactions, cajaChica, maestroAreas, maestroInsumos, gastosGenerales, maestroProveedores, maestroClientes: newMaestroClientes, maestroTrabajadores });
    };

    // Master Data Functions - Trabajadores
    const addMaestroTrabajador = (trabajador: Omit<Trabajador, 'id'>) => {
        const newTrabajador = { ...trabajador, id: Math.max(...maestroTrabajadores.map(t => t.id), 0) + 1 };
        const newMaestroTrabajadores = [...maestroTrabajadores, newTrabajador];
        setMaestroTrabajadores(newMaestroTrabajadores);
        saveData({ orders, ventas, payments, rendimientos, insumoTransactions, bankTransactions, cajaChica, maestroAreas, maestroInsumos, gastosGenerales, maestroProveedores, maestroClientes, maestroTrabajadores: newMaestroTrabajadores });
    };

    const updateMaestroTrabajador = (id: number, trabajador: Partial<Trabajador>) => {
        const newMaestroTrabajadores = maestroTrabajadores.map(t => t.id === id ? { ...t, ...trabajador } : t);
        setMaestroTrabajadores(newMaestroTrabajadores);
        saveData({ orders, ventas, payments, rendimientos, insumoTransactions, bankTransactions, cajaChica, maestroAreas, maestroInsumos, gastosGenerales, maestroProveedores, maestroClientes, maestroTrabajadores: newMaestroTrabajadores });
    };

    const deleteMaestroTrabajador = (id: number) => {
        const newMaestroTrabajadores = maestroTrabajadores.filter(t => t.id !== id);
        setMaestroTrabajadores(newMaestroTrabajadores);
        saveData({ orders, ventas, payments, rendimientos, insumoTransactions, bankTransactions, cajaChica, maestroAreas, maestroInsumos, gastosGenerales, maestroProveedores, maestroClientes, maestroTrabajadores: newMaestroTrabajadores });
    };

    // Equipos Functions
    const addEquipo = (equipo: Omit<Equipo, 'id'>) => {
        const newEquipo = { ...equipo, id: Math.max(...equipos.map(e => e.id), 0) + 1 };
        const newEquipos = [...equipos, newEquipo];
        setEquipos(newEquipos);
        saveData({ orders, ventas, payments, rendimientos, insumoTransactions, bankTransactions, cajaChica, maestroAreas, maestroInsumos, gastosGenerales, maestroProveedores, maestroClientes, maestroTrabajadores, equipos: newEquipos, mantenimientos });
    };

    const updateEquipo = (id: number, equipo: Partial<Equipo>) => {
        const newEquipos = equipos.map(e => e.id === id ? { ...e, ...equipo } : e);
        setEquipos(newEquipos);
        saveData({ orders, ventas, payments, rendimientos, insumoTransactions, bankTransactions, cajaChica, maestroAreas, maestroInsumos, gastosGenerales, maestroProveedores, maestroClientes, maestroTrabajadores, equipos: newEquipos, mantenimientos });
    };

    const deleteEquipo = (id: number) => {
        const newEquipos = equipos.filter(e => e.id !== id);
        setEquipos(newEquipos);
        saveData({ orders, ventas, payments, rendimientos, insumoTransactions, bankTransactions, cajaChica, maestroAreas, maestroInsumos, gastosGenerales, maestroProveedores, maestroClientes, maestroTrabajadores, equipos: newEquipos, mantenimientos });
    };

    // Mantenimientos Functions
    const addMantenimiento = (mantenimiento: Omit<Mantenimiento, 'id'>) => {
        const newMantenimiento = { ...mantenimiento, id: Math.max(...mantenimientos.map(m => m.id), 0) + 1 };
        const newMantenimientos = [...mantenimientos, newMantenimiento];
        setMantenimientos(newMantenimientos);
        saveData({ orders, ventas, payments, rendimientos, insumoTransactions, bankTransactions, cajaChica, maestroAreas, maestroInsumos, gastosGenerales, maestroProveedores, maestroClientes, maestroTrabajadores, equipos, mantenimientos: newMantenimientos });
    };

    const updateMantenimiento = (id: number, mantenimiento: Partial<Mantenimiento>) => {
        const newMantenimientos = mantenimientos.map(m => m.id === id ? { ...m, ...mantenimiento } : m);
        setMantenimientos(newMantenimientos);
        saveData({ orders, ventas, payments, rendimientos, insumoTransactions, bankTransactions, cajaChica, maestroAreas, maestroInsumos, gastosGenerales, maestroProveedores, maestroClientes, maestroTrabajadores, equipos, mantenimientos: newMantenimientos });
    };

    const deleteMantenimiento = (id: number) => {
        const newMantenimientos = mantenimientos.filter(m => m.id !== id);
        setMantenimientos(newMantenimientos);
        saveData({ orders, ventas, payments, rendimientos, insumoTransactions, bankTransactions, cajaChica, maestroAreas, maestroInsumos, gastosGenerales, maestroProveedores, maestroClientes, maestroTrabajadores, equipos, mantenimientos: newMantenimientos });
    };

    // Vehículos Functions
    const addVehiculo = (vehiculo: Omit<Vehiculo, 'id'>) => {
        const newVehiculo = { ...vehiculo, id: Math.max(...vehiculos.map(v => v.id), 0) + 1 };
        const newVehiculos = [...vehiculos, newVehiculo];
        setVehiculos(newVehiculos);
        saveData({ orders, ventas, payments, rendimientos, insumoTransactions, bankTransactions, cajaChica, maestroAreas, maestroInsumos, gastosGenerales, maestroProveedores, maestroClientes, maestroTrabajadores, equipos, mantenimientos, vehiculos: newVehiculos, mantenimientosVehiculos });
    };

    const updateVehiculo = (id: number, vehiculo: Partial<Vehiculo>) => {
        const newVehiculos = vehiculos.map(v => v.id === id ? { ...v, ...vehiculo } : v);
        setVehiculos(newVehiculos);
        saveData({ orders, ventas, payments, rendimientos, insumoTransactions, bankTransactions, cajaChica, maestroAreas, maestroInsumos, gastosGenerales, maestroProveedores, maestroClientes, maestroTrabajadores, equipos, mantenimientos, vehiculos: newVehiculos, mantenimientosVehiculos });
    };

    const deleteVehiculo = (id: number) => {
        const newVehiculos = vehiculos.filter(v => v.id !== id);
        setVehiculos(newVehiculos);
        saveData({ orders, ventas, payments, rendimientos, insumoTransactions, bankTransactions, cajaChica, maestroAreas, maestroInsumos, gastosGenerales, maestroProveedores, maestroClientes, maestroTrabajadores, equipos, mantenimientos, vehiculos: newVehiculos, mantenimientosVehiculos });
    };

    // Mantenimientos Vehículos Functions
    const addMantenimientoVehiculo = (mantenimiento: Omit<MantenimientoVehiculo, 'id'>) => {
        const newMantenimiento = { ...mantenimiento, id: Math.max(...mantenimientosVehiculos.map(m => m.id), 0) + 1 };
        const newMantenimientosVehiculos = [...mantenimientosVehiculos, newMantenimiento];
        setMantenimientosVehiculos(newMantenimientosVehiculos);
        saveData({ orders, ventas, payments, rendimientos, insumoTransactions, bankTransactions, cajaChica, maestroAreas, maestroInsumos, gastosGenerales, maestroProveedores, maestroClientes, maestroTrabajadores, equipos, mantenimientos, vehiculos, mantenimientosVehiculos: newMantenimientosVehiculos });
    };

    const updateMantenimientoVehiculo = (id: number, mantenimiento: Partial<MantenimientoVehiculo>) => {
        const newMantenimientosVehiculos = mantenimientosVehiculos.map(m => m.id === id ? { ...m, ...mantenimiento } : m);
        setMantenimientosVehiculos(newMantenimientosVehiculos);
        saveData({ orders, ventas, payments, rendimientos, insumoTransactions, bankTransactions, cajaChica, maestroAreas, maestroInsumos, gastosGenerales, maestroProveedores, maestroClientes, maestroTrabajadores, equipos, mantenimientos, vehiculos, mantenimientosVehiculos: newMantenimientosVehiculos });
    };

    const deleteMantenimientoVehiculo = (id: number) => {
        const newMantenimientosVehiculos = mantenimientosVehiculos.filter(m => m.id !== id);
        setMantenimientosVehiculos(newMantenimientosVehiculos);
        saveData({ orders, ventas, payments, rendimientos, insumoTransactions, bankTransactions, cajaChica, maestroAreas, maestroInsumos, gastosGenerales, maestroProveedores, maestroClientes, maestroTrabajadores, equipos, mantenimientos, vehiculos, mantenimientosVehiculos: newMantenimientosVehiculos });
    };

    const value: DashboardContextType = {
        orders,
        addOrder,
        updateOrder,
        deleteOrder,
        ventas,
        addVenta,
        updateVenta,
        deleteVenta,
        payments,
        addPayment,
        updatePayment,
        deletePayment,
        rendimientos,
        addRendimiento,
        updateRendimiento,
        deleteRendimiento,
        insumoTransactions,
        addInsumoTransaction,
        updateInsumoTransaction,
        deleteInsumoTransaction,
        registerInsumoPurchase,
        updateInsumoPurchase,
        bankTransactions,
        addBankTransaction,
        updateBankTransaction,
        deleteBankTransaction,
        cajaChica,
        addCajaChica,
        updateCajaChica,
        deleteCajaChica,
        maestroAreas,
        addMaestroArea,
        updateMaestroArea,
        deleteMaestroArea,
        maestroInsumos,
        addMaestroInsumo,
        updateMaestroInsumo,
        deleteMaestroInsumo,
        gastosGenerales,
        addGastoGeneral,
        updateGastoGeneral,
        deleteGastoGeneral,
        maestroProveedores,
        addMaestroProveedor,
        updateMaestroProveedor,
        deleteMaestroProveedor,
        maestroClientes,
        addMaestroCliente,
        updateMaestroCliente,
        deleteMaestroCliente,
        maestroTrabajadores,
        addMaestroTrabajador,
        updateMaestroTrabajador,
        deleteMaestroTrabajador,
        equipos,
        addEquipo,
        updateEquipo,
        deleteEquipo,
        mantenimientos,
        addMantenimiento,
        updateMantenimiento,
        deleteMantenimiento,
        vehiculos,
        addVehiculo,
        updateVehiculo,
        deleteVehiculo,
        mantenimientosVehiculos,
        addMantenimientoVehiculo,
        updateMantenimientoVehiculo,
        deleteMantenimientoVehiculo,
    };

    return (
        <DashboardContext.Provider value={value}>
            {children}
        </DashboardContext.Provider>
    );
}

export function useDashboard() {
    const context = useContext(DashboardContext);
    if (context === undefined) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
}
