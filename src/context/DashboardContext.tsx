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
    const [orders, setOrders] = useState<Order[]>([]);

    // Sales State
    const [ventas, setVentas] = useState<Venta[]>([]);

    // Payments State
    const [payments, setPayments] = useState<Payment[]>([]);

    // Performance State
    const [rendimientos, setRendimientos] = useState<Rendimiento[]>([]);

    // Inventory State
    const [insumoTransactions, setInsumoTransactions] = useState<InsumoTransaction[]>([]);

    // Bank State
    const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([]);

    // Caja Chica State
    const [cajaChica, setCajaChica] = useState<CajaChica[]>([]);

    // Master Data - Areas
    const [maestroAreas, setMaestroAreas] = useState<MaestroArea[]>([]);

    // Master Data - Insumos
    const [maestroInsumos, setMaestroInsumos] = useState<Insumo[]>([]);

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
    // Load initial data from API (now using Supabase)
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return; // Wait for login

                // Use new Supabase-based API
                const response = await fetch('/api/supabase-db', {
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

    // Helper to perform CRUD operations via Supabase API
    const supabaseCrud = async (action: 'add' | 'update' | 'delete', table: string, data?: any, id?: number) => {
        try {
            const response = await fetch('/api/supabase-db', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, table, id, data }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Supabase CRUD error:', errorData);
                alert(`Error al guardar: ${errorData.details || errorData.error}`);
                return null;
            }

            const result = await response.json();
            return result.data || result;
        } catch (error) {
            console.error('Error in supabaseCrud:', error);
            alert('Error de conexión. Por favor, intenta de nuevo.');
            return null;
        }
    };

    // Legacy saveData - still used for some complex operations
    // TODO: Migrate remaining uses to supabaseCrud
    const saveData = async (newData: any) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('saveData: No token found');
                return;
            }

            // For now, use the old API for complex batch operations
            // Individual CRUD should use supabaseCrud instead
            const response = await fetch('/api/db', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newData),
            });

            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('role');
                window.location.href = '/auth/login';
                return;
            }

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error saving data:', errorData);
                alert(`Error al guardar: ${errorData.error || 'Error desconocido'}`);
            }
        } catch (error) {
            console.error('Error saving data:', error);
            alert('Error de conexión al guardar los cambios.');
        }
    };

    // Orders Functions
    const addOrder = (order: Omit<Order, 'id'>) => {
        const newOrder = { ...order, id: Math.max(...orders.map(o => o.id), 0) + 1 };
        const newOrders = [...orders, newOrder];
        setOrders(newOrders);
        saveData({ orders: newOrders });
    };

    const updateOrder = (id: number, order: Partial<Order>) => {
        const newOrders = orders.map(o => o.id === id ? { ...o, ...order } : o);
        setOrders(newOrders);
        saveData({ orders: newOrders });
    };

    const deleteOrder = (id: number) => {
        const newOrders = orders.filter(o => o.id !== id);
        setOrders(newOrders);
        saveData({ orders: newOrders });
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
    const addVenta = async (venta: Omit<Venta, 'id'>) => {
        const result = await supabaseCrud('add', 'ventas', venta);
        if (result) {
            setVentas(prev => [...prev, result]);
        }
    };

    const updateVenta = async (id: number, venta: Partial<Venta>) => {
        await supabaseCrud('update', 'ventas', venta, id);
        setVentas(prev => prev.map(v => v.id === id ? { ...v, ...venta } : v));
    };

    const deleteVenta = async (id: number) => {
        await supabaseCrud('delete', 'ventas', undefined, id);
        setVentas(prev => prev.filter(v => v.id !== id));
    };

    // Payments Functions
    const addPayment = (payment: Omit<Payment, 'id'>) => {
        const newPayment = { ...payment, id: Math.max(...payments.map(p => p.id), 0) + 1 };
        const newPayments = [...payments, newPayment];
        setPayments(newPayments);
        saveData({ payments: newPayments });
    };

    const updatePayment = (id: number, payment: Partial<Payment>) => {
        const newPayments = payments.map(p => p.id === id ? { ...p, ...payment } : p);
        setPayments(newPayments);
        saveData({ payments: newPayments });
    };

    const deletePayment = (id: number) => {
        const newPayments = payments.filter(p => p.id !== id);
        setPayments(newPayments);
        saveData({ payments: newPayments });
    };

    // Performance Functions
    const addRendimiento = async (rendimiento: Omit<Rendimiento, 'id'>) => {
        const result = await supabaseCrud('add', 'rendimientos', rendimiento);
        if (result) {
            setRendimientos(prev => [...prev, result]);
        }
    };

    const updateRendimiento = async (id: number, rendimiento: Partial<Rendimiento>) => {
        await supabaseCrud('update', 'rendimientos', rendimiento, id);
        setRendimientos(prev => prev.map(r => r.id === id ? { ...r, ...rendimiento } : r));
    };

    const deleteRendimiento = async (id: number) => {
        await supabaseCrud('delete', 'rendimientos', undefined, id);
        setRendimientos(prev => prev.filter(r => r.id !== id));
    };

    // Inventory Functions
    const addInsumoTransaction = async (transaction: Omit<InsumoTransaction, 'id'>) => {
        const result = await supabaseCrud('add', 'insumoTransactions', transaction);
        if (result) {
            setInsumoTransactions(prev => [...prev, result]);
        }
    };

    const updateInsumoTransaction = async (id: number, transaction: Partial<InsumoTransaction>) => {
        await supabaseCrud('update', 'insumoTransactions', transaction, id);
        setInsumoTransactions(prev => prev.map(t => t.id === id ? { ...t, ...transaction } : t));
    };

    const deleteInsumoTransaction = async (id: number) => {
        await supabaseCrud('delete', 'insumoTransactions', undefined, id);
        setInsumoTransactions(prev => prev.filter(t => t.id !== id));
    };

    /**
     * Registers a new purchase and updates the item's average cost atomically
     */
    const registerInsumoPurchase = async (transaction: Omit<InsumoTransaction, 'id'>, newPrice: number) => {
        // 1. Add transaction to Supabase
        const result = await supabaseCrud('add', 'insumoTransactions', transaction);
        if (!result) return;

        setInsumoTransactions(prev => [...prev, result]);

        // 2. Calculate and update average cost
        if (transaction.cantidadEntrada > 0 && newPrice > 0) {
            const insumoMaster = maestroInsumos.find(i => i.nombre === transaction.insumo);
            if (insumoMaster) {
                const currentStock = insumoTransactions
                    .filter(t => t.insumo === transaction.insumo)
                    .reduce((acc, t) => acc + t.cantidadEntrada - t.cantidadSalida, 0);

                const currentCost = insumoMaster.costoUnitario || 0;
                const currentValue = currentStock * currentCost;
                const newPurchaseValue = transaction.cantidadEntrada * newPrice;
                const totalQuantity = currentStock + transaction.cantidadEntrada;

                const newAverageCost = totalQuantity > 0
                    ? Math.round((currentValue + newPurchaseValue) / totalQuantity)
                    : newPrice;

                await supabaseCrud('update', 'maestroInsumos', { costoUnitario: newAverageCost }, insumoMaster.id);
                setMaestroInsumos(prev => prev.map(i =>
                    i.id === insumoMaster.id ? { ...i, costoUnitario: newAverageCost } : i
                ));
            }
        }
    };

    /**
     * Updates an existing purchase and updates the item's average cost atomically
     */
    const updateInsumoPurchase = async (id: number, transaction: Partial<InsumoTransaction>, newPrice: number) => {
        // 1. Update transaction in Supabase
        await supabaseCrud('update', 'insumoTransactions', transaction, id);
        setInsumoTransactions(prev => prev.map(t => t.id === id ? { ...t, ...transaction } : t));

        // 2. Calculate and update average cost
        const oldTransaction = insumoTransactions.find(t => t.id === id);
        const insumoName = transaction.insumo || oldTransaction?.insumo;
        const cantidadEntrada = transaction.cantidadEntrada ?? oldTransaction?.cantidadEntrada ?? 0;

        if (insumoName && cantidadEntrada > 0 && newPrice > 0) {
            const insumoMaster = maestroInsumos.find(i => i.nombre === insumoName);
            if (insumoMaster) {
                const currentStock = insumoTransactions
                    .filter(t => t.insumo === insumoName)
                    .reduce((acc, t) => acc + t.cantidadEntrada - t.cantidadSalida, 0);

                const currentCost = insumoMaster.costoUnitario || 0;
                const currentValue = currentStock * currentCost;
                const newPurchaseValue = cantidadEntrada * newPrice;
                const totalQuantity = currentStock + cantidadEntrada;

                const newAverageCost = totalQuantity > 0
                    ? Math.round((currentValue + newPurchaseValue) / totalQuantity)
                    : newPrice;

                await supabaseCrud('update', 'maestroInsumos', { costoUnitario: newAverageCost }, insumoMaster.id);
                setMaestroInsumos(prev => prev.map(i =>
                    i.id === insumoMaster.id ? { ...i, costoUnitario: newAverageCost } : i
                ));
            }
        }
    };

    // Bank Functions
    const addBankTransaction = async (transaction: Omit<BankTransaction, 'id' | 'saldo'>) => {
        // Add to Supabase (saldo calculated in API)
        const result = await supabaseCrud('add', 'bankTransactions', transaction);
        if (result) {
            setBankTransactions(prev => [...prev, result]);

            // Auto-update invoice payment status in Supabase
            if (transaction.salida > 0 && transaction.documento && transaction.documento !== '-') {
                const matchingInvoice = insumoTransactions.find(
                    inv => inv.factura === transaction.documento && inv.estadoPago !== 'pagada'
                );
                if (matchingInvoice) {
                    await supabaseCrud('update', 'insumoTransactions', { estadoPago: 'pagada' }, matchingInvoice.id);
                    setInsumoTransactions(prev => prev.map(inv =>
                        inv.factura === transaction.documento ? { ...inv, estadoPago: 'pagada' as const } : inv
                    ));
                }
            }
        }
    };

    const updateBankTransaction = async (id: number, transaction: Partial<BankTransaction>) => {
        await supabaseCrud('update', 'bankTransactions', transaction, id);
        setBankTransactions(prev => prev.map(t => t.id === id ? { ...t, ...transaction } : t));
    };

    const deleteBankTransaction = async (id: number) => {
        await supabaseCrud('delete', 'bankTransactions', undefined, id);
        setBankTransactions(prev => prev.filter(t => t.id !== id));
    };

    // Caja Chica Functions
    const addCajaChica = async (item: Omit<CajaChica, 'id'>) => {
        const result = await supabaseCrud('add', 'cajaChica', item);
        if (result) {
            setCajaChica(prev => [...prev, result]);
        }
    };

    const updateCajaChica = async (id: number, item: Partial<CajaChica>) => {
        await supabaseCrud('update', 'cajaChica', item, id);
        setCajaChica(prev => prev.map(c => c.id === id ? { ...c, ...item } : c));
    };

    const deleteCajaChica = async (id: number) => {
        await supabaseCrud('delete', 'cajaChica', undefined, id);
        setCajaChica(prev => prev.filter(c => c.id !== id));
    };

    // Master Data Functions - Areas
    const addMaestroArea = async (area: Omit<MaestroArea, 'id'>) => {
        const result = await supabaseCrud('add', 'maestroAreas', area);
        if (result) {
            setMaestroAreas(prev => [...prev, result]);
        }
    };

    const updateMaestroArea = async (id: number, area: Partial<MaestroArea>) => {
        await supabaseCrud('update', 'maestroAreas', area, id);
        setMaestroAreas(prev => prev.map(a => a.id === id ? { ...a, ...area } : a));
    };

    const deleteMaestroArea = async (id: number) => {
        await supabaseCrud('delete', 'maestroAreas', undefined, id);
        setMaestroAreas(prev => prev.filter(a => a.id !== id));
    };

    // Master Data Functions - Insumos
    const addMaestroInsumo = async (insumo: Omit<Insumo, 'id'>) => {
        const result = await supabaseCrud('add', 'maestroInsumos', insumo);
        if (result) {
            setMaestroInsumos(prev => [...prev, result]);
        }
    };

    const updateMaestroInsumo = async (id: number, insumo: Partial<Insumo>) => {
        await supabaseCrud('update', 'maestroInsumos', insumo, id);
        setMaestroInsumos(prev => prev.map(i => i.id === id ? { ...i, ...insumo } : i));
    };

    const deleteMaestroInsumo = async (id: number) => {
        await supabaseCrud('delete', 'maestroInsumos', undefined, id);
        setMaestroInsumos(prev => prev.filter(i => i.id !== id));
    };

    // Gastos Generales Functions
    const addGastoGeneral = async (gasto: Omit<GastoGeneral, 'id'>) => {
        const result = await supabaseCrud('add', 'gastosGenerales', gasto);
        if (result) {
            setGastosGenerales(prev => [...prev, result]);
        }
    };

    const updateGastoGeneral = async (id: number, gasto: Partial<GastoGeneral>) => {
        await supabaseCrud('update', 'gastosGenerales', gasto, id);
        setGastosGenerales(prev => prev.map(g => g.id === id ? { ...g, ...gasto } : g));
    };

    const deleteGastoGeneral = async (id: number) => {
        await supabaseCrud('delete', 'gastosGenerales', undefined, id);
        setGastosGenerales(prev => prev.filter(g => g.id !== id));
    };

    // Master Data Functions - Proveedores
    const addMaestroProveedor = async (proveedor: Omit<Proveedor, 'id'>) => {
        const result = await supabaseCrud('add', 'maestroProveedores', proveedor);
        if (result) {
            setMaestroProveedores(prev => [...prev, result]);
        }
    };

    const updateMaestroProveedor = async (id: number, proveedor: Partial<Proveedor>) => {
        await supabaseCrud('update', 'maestroProveedores', proveedor, id);
        setMaestroProveedores(prev => prev.map(p => p.id === id ? { ...p, ...proveedor } : p));
    };

    const deleteMaestroProveedor = async (id: number) => {
        await supabaseCrud('delete', 'maestroProveedores', undefined, id);
        setMaestroProveedores(prev => prev.filter(p => p.id !== id));
    };

    // Master Data Functions - Clientes
    const addMaestroCliente = async (cliente: Omit<Cliente, 'id'>) => {
        const result = await supabaseCrud('add', 'maestroClientes', cliente);
        if (result) {
            setMaestroClientes(prev => [...prev, result]);
        }
    };

    const updateMaestroCliente = async (id: number, cliente: Partial<Cliente>) => {
        await supabaseCrud('update', 'maestroClientes', cliente, id);
        setMaestroClientes(prev => prev.map(c => c.id === id ? { ...c, ...cliente } : c));
    };

    const deleteMaestroCliente = async (id: number) => {
        await supabaseCrud('delete', 'maestroClientes', undefined, id);
        setMaestroClientes(prev => prev.filter(c => c.id !== id));
    };

    // Master Data Functions - Trabajadores
    const addMaestroTrabajador = async (trabajador: Omit<Trabajador, 'id'>) => {
        const result = await supabaseCrud('add', 'maestroTrabajadores', trabajador);
        if (result) {
            setMaestroTrabajadores(prev => [...prev, result]);
        }
    };

    const updateMaestroTrabajador = async (id: number, trabajador: Partial<Trabajador>) => {
        await supabaseCrud('update', 'maestroTrabajadores', trabajador, id);
        setMaestroTrabajadores(prev => prev.map(t => t.id === id ? { ...t, ...trabajador } : t));
    };

    const deleteMaestroTrabajador = async (id: number) => {
        await supabaseCrud('delete', 'maestroTrabajadores', undefined, id);
        setMaestroTrabajadores(prev => prev.filter(t => t.id !== id));
    };

    // Equipos Functions
    const addEquipo = (equipo: Omit<Equipo, 'id'>) => {
        const newEquipo = { ...equipo, id: Math.max(...equipos.map(e => e.id), 0) + 1 };
        const newEquipos = [...equipos, newEquipo];
        setEquipos(newEquipos);
        saveData({ equipos: newEquipos });
    };

    const updateEquipo = (id: number, equipo: Partial<Equipo>) => {
        const newEquipos = equipos.map(e => e.id === id ? { ...e, ...equipo } : e);
        setEquipos(newEquipos);
        saveData({ equipos: newEquipos });
    };

    const deleteEquipo = (id: number) => {
        const newEquipos = equipos.filter(e => e.id !== id);
        setEquipos(newEquipos);
        saveData({ equipos: newEquipos });
    };

    // Mantenimientos Functions
    const addMantenimiento = (mantenimiento: Omit<Mantenimiento, 'id'>) => {
        const newMantenimiento = { ...mantenimiento, id: Math.max(...mantenimientos.map(m => m.id), 0) + 1 };
        const newMantenimientos = [...mantenimientos, newMantenimiento];
        setMantenimientos(newMantenimientos);
        saveData({ mantenimientos: newMantenimientos });
    };

    const updateMantenimiento = (id: number, mantenimiento: Partial<Mantenimiento>) => {
        const newMantenimientos = mantenimientos.map(m => m.id === id ? { ...m, ...mantenimiento } : m);
        setMantenimientos(newMantenimientos);
        saveData({ mantenimientos: newMantenimientos });
    };

    const deleteMantenimiento = (id: number) => {
        const newMantenimientos = mantenimientos.filter(m => m.id !== id);
        setMantenimientos(newMantenimientos);
        saveData({ mantenimientos: newMantenimientos });
    };

    // Vehículos Functions
    const addVehiculo = (vehiculo: Omit<Vehiculo, 'id'>) => {
        const newVehiculo = { ...vehiculo, id: Math.max(...vehiculos.map(v => v.id), 0) + 1 };
        const newVehiculos = [...vehiculos, newVehiculo];
        setVehiculos(newVehiculos);
        saveData({ vehiculos: newVehiculos });
    };

    const updateVehiculo = (id: number, vehiculo: Partial<Vehiculo>) => {
        const newVehiculos = vehiculos.map(v => v.id === id ? { ...v, ...vehiculo } : v);
        setVehiculos(newVehiculos);
        saveData({ vehiculos: newVehiculos });
    };

    const deleteVehiculo = (id: number) => {
        const newVehiculos = vehiculos.filter(v => v.id !== id);
        setVehiculos(newVehiculos);
        saveData({ vehiculos: newVehiculos });
    };

    // Mantenimientos Vehículos Functions
    const addMantenimientoVehiculo = (mantenimiento: Omit<MantenimientoVehiculo, 'id'>) => {
        const newMantenimiento = { ...mantenimiento, id: Math.max(...mantenimientosVehiculos.map(m => m.id), 0) + 1 };
        const newMantenimientosVehiculos = [...mantenimientosVehiculos, newMantenimiento];
        setMantenimientosVehiculos(newMantenimientosVehiculos);
        saveData({ mantenimientosVehiculos: newMantenimientosVehiculos });
    };

    const updateMantenimientoVehiculo = (id: number, mantenimiento: Partial<MantenimientoVehiculo>) => {
        const newMantenimientosVehiculos = mantenimientosVehiculos.map(m => m.id === id ? { ...m, ...mantenimiento } : m);
        setMantenimientosVehiculos(newMantenimientosVehiculos);
        saveData({ mantenimientosVehiculos: newMantenimientosVehiculos });
    };

    const deleteMantenimientoVehiculo = (id: number) => {
        const newMantenimientosVehiculos = mantenimientosVehiculos.filter(m => m.id !== id);
        setMantenimientosVehiculos(newMantenimientosVehiculos);
        saveData({ mantenimientosVehiculos: newMantenimientosVehiculos });
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
