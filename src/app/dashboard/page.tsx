'use client';

import { useEffect, useState } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { isSameMonth } from '@/lib/dateUtils';
import StockAlerts from '@/components/StockAlerts';
import PaymentReminders from '@/components/PaymentReminders';
import DashboardCharts from '@/components/DashboardCharts';

export default function DashboardPage() {
    const [role, setRole] = useState<string | null>(null);
    const { orders, ventas, insumoTransactions, bankTransactions, rendimientos, maestroInsumos } = useDashboard();

    useEffect(() => {
        setRole(localStorage.getItem('role'));
    }, []);

    // Helper to get current month/year
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Calculate pending orders
    const pendingOrders = orders.filter(o => o.estado === 'pendiente').length;

    // Calculate monthly sales
    const ventasMes = ventas
        .filter(v => isSameMonth(v.fecha, currentMonth, currentYear))
        .reduce((sum, v) => sum + v.monto, 0);

    // Calculate monthly performance metrics
    const rendimientosMes = rendimientos.filter(r => isSameMonth(r.fecha, currentMonth, currentYear));

    const avgRinde = rendimientosMes.length > 0
        ? rendimientosMes.reduce((sum, r) => sum + r.rinde, 0) / rendimientosMes.length
        : 0;

    const totalBarrido = rendimientosMes.reduce((sum, r) => sum + r.barrido, 0);
    const totalMerma = rendimientosMes.reduce((sum, r) => sum + r.merma, 0);

    // Calculate stock for all items
    const calculateStock = (itemName: string) => {
        return insumoTransactions
            .filter(t => t.insumo === itemName)
            .reduce((acc, t) => acc + t.cantidadEntrada - t.cantidadSalida, 0);
    };

    const getInsumoUnidad = (insumoNombre: string) => {
        const insumo = maestroInsumos.find(i => i.nombre === insumoNombre);
        const labels: Record<string, string> = {
            'sacos_25kg': 'Sacos (25kg)',
            'kg': 'kg',
            'unidades': 'unidades',
            'sacos': 'Sacos'
        };
        return insumo ? (labels[insumo.unidad] || insumo.unidad) : '';
    };

    // Current bank balance
    const currentBalance = bankTransactions.length > 0
        ? bankTransactions[bankTransactions.length - 1].saldo
        : 0;

    return (
        <div>
            <h1 style={{ marginBottom: '2rem' }}>Bienvenido al Panel de Control</h1>
            <p style={{ marginBottom: '2rem' }}>Rol actual: <strong>{role === 'manager' ? 'Administrador' : 'Empleado'}</strong></p>

            {/* Stock Alerts */}
            <StockAlerts />

            {/* Payment Reminders */}
            <PaymentReminders />

            {/* Key Metrics Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', borderLeft: '4px solid var(--color-primary)' }}>
                    <h3 style={{ fontSize: '1rem', color: '#666' }}>Ventas Mes Actual</h3>
                    <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#333' }}>${ventasMes.toLocaleString()}</p>
                </div>
                <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', borderLeft: '4px solid #4caf50' }}>
                    <h3 style={{ fontSize: '1rem', color: '#666' }}>Rendimiento Promedio</h3>
                    <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#333' }}>{avgRinde.toFixed(2)} <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>kg/saco</span></p>
                </div>
                <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', borderLeft: '4px solid #ff9800' }}>
                    <h3 style={{ fontSize: '1rem', color: '#666' }}>Barrido Total (Mes)</h3>
                    <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#333' }}>{totalBarrido.toFixed(2)} <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>kg</span></p>
                </div>
                <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', borderLeft: '4px solid #f44336' }}>
                    <h3 style={{ fontSize: '1rem', color: '#666' }}>Merma Total (Mes)</h3>
                    <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#333' }}>{totalMerma.toFixed(2)} <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>kg</span></p>
                </div>
                {role === 'manager' && (
                    <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', borderLeft: '4px solid var(--color-secondary)' }}>
                        <h3 style={{ fontSize: '1rem', color: '#666' }}>Saldo Banco</h3>
                        <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#333' }}>${currentBalance.toLocaleString()}</p>
                    </div>
                )}
                <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', borderLeft: '4px solid #2196f3' }}>
                    <h3 style={{ fontSize: '1rem', color: '#666' }}>Pedidos Pendientes</h3>
                    <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#333' }}>{pendingOrders}</p>
                </div>
            </div>

            {/* Dashboard Charts */}
            <DashboardCharts />

            {/* Stock Summary Section */}
            <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Stock de Insumos</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                {maestroInsumos.filter(i => i.activo).map(insumo => {
                    const stock = calculateStock(insumo.nombre);
                    const isLow = stock < 10; // Threshold for visual warning
                    return (
                        <div key={insumo.id} style={{
                            backgroundColor: '#fff',
                            padding: '1rem',
                            borderRadius: '8px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            border: isLow ? '1px solid #f44336' : '1px solid transparent'
                        }}>
                            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>{insumo.nombre}</p>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: isLow ? '#f44336' : '#333' }}>
                                    {stock}
                                </span>
                                <span style={{ fontSize: '0.9rem', color: '#888' }}>
                                    {getInsumoUnidad(insumo.nombre)}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
