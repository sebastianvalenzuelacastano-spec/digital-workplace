'use client';

import { useState, useMemo } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import Modal from '@/components/Modal';
import type { GastoGeneral } from '@/types/dashboard';

export default function BalancePage() {
    const { ventas, cajaChica, insumoTransactions, maestroInsumos, gastosGenerales, addGastoGeneral, updateGastoGeneral, deleteGastoGeneral } = useDashboard();
    const [period, setPeriod] = useState<'daily' | 'monthly' | 'yearly'>('daily');
    // Use local time components to avoid timezone shift
    const today = new Date();
    const [selectedDate, setSelectedDate] = useState(
        `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    );

    // Modal State for Manual Expenses
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<Partial<GastoGeneral>>({
        fecha: '',
        descripcion: '',
        monto: 0,
        categoria: 'Otros'
    });

    // Helper to filter data by period
    const filterByPeriod = (dateString: string) => {
        if (!dateString) return false;

        if (period === 'daily') {
            // Exact string match for YYYY-MM-DD
            return dateString === selectedDate;
        } else if (period === 'monthly') {
            // Match YYYY-MM
            const [year, month] = dateString.split('-');
            const [selectedYear, selectedMonth] = selectedDate.split('-');
            return year === selectedYear && month === selectedMonth;
        } else {
            // Match YYYY
            const [year] = dateString.split('-');
            const [selectedYear] = selectedDate.split('-');
            return year === selectedYear;
        }
    };

    // Calculations
    const filteredSales = ventas.filter(v => filterByPeriod(v.fecha));
    const totalSales = filteredSales.reduce((sum, v) => sum + v.monto, 0);

    const filteredCajaChica = cajaChica.filter(c => filterByPeriod(c.fecha));
    const totalCajaChica = filteredCajaChica.reduce((sum, c) => sum + c.monto, 0);

    const filteredInsumoUsage = insumoTransactions.filter(t => t.cantidadSalida > 0 && filterByPeriod(t.fecha));
    const totalInsumoCost = filteredInsumoUsage.reduce((sum, t) => {
        const insumo = maestroInsumos.find(i => i.nombre === t.insumo);
        const netCost = insumo?.costoUnitario || 0;
        const taxRate = 0.19 + (insumo?.tieneImpuestoAdicional ? 0.12 : 0);
        const grossCost = netCost * (1 + taxRate);
        return sum + (t.cantidadSalida * grossCost);
    }, 0);

    const filteredGastosGenerales = gastosGenerales.filter(g => filterByPeriod(g.fecha));
    const totalGastosGenerales = filteredGastosGenerales.reduce((sum, g) => sum + g.monto, 0);

    const totalExpenses = totalCajaChica + totalInsumoCost + totalGastosGenerales;
    const balance = totalSales - totalExpenses;

    // Handlers for Manual Expenses
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            updateGastoGeneral(editingId, {
                fecha: formData.fecha || '',
                descripcion: formData.descripcion || '',
                monto: Number(formData.monto) || 0,
                categoria: formData.categoria || 'Otros'
            });
        } else {
            addGastoGeneral({
                fecha: formData.fecha || '',
                descripcion: formData.descripcion || '',
                monto: Number(formData.monto) || 0,
                categoria: formData.categoria || 'Otros'
            });
        }
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({ fecha: '', descripcion: '', monto: 0, categoria: 'Otros' });
    };

    const handleEdit = (item: GastoGeneral) => {
        setEditingId(item.id);
        setFormData(item);
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Estás seguro de eliminar este gasto?')) {
            deleteGastoGeneral(id);
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#333' }}>Balance Financiero</h1>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value as any)}
                        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                    >
                        <option value="daily">Diario</option>
                        <option value="monthly">Mensual</option>
                        <option value="yearly">Anual</option>
                    </select>
                    <input
                        type={period === 'yearly' ? 'number' : period === 'monthly' ? 'month' : 'date'}
                        value={period === 'yearly' ? selectedDate.split('-')[0] : period === 'monthly' ? selectedDate.slice(0, 7) : selectedDate}
                        onChange={(e) => {
                            if (period === 'yearly') setSelectedDate(`${e.target.value}-01-01`);
                            else if (period === 'monthly') setSelectedDate(`${e.target.value}-01`);
                            else setSelectedDate(e.target.value);
                        }}
                        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ backgroundColor: '#e8f5e9', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '1rem', color: '#2e7d32', marginBottom: '0.5rem' }}>Ventas Totales</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1b5e20' }}>${totalSales.toLocaleString('es-CL', { maximumFractionDigits: 0 })}</p>
                </div>
                <div style={{ backgroundColor: '#ffebee', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '1rem', color: '#c62828', marginBottom: '0.5rem' }}>Gastos Totales</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#b71c1c' }}>${totalExpenses.toLocaleString('es-CL', { maximumFractionDigits: 0 })}</p>
                    <div style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: '#d32f2f' }}>
                        <div>Caja Chica: ${totalCajaChica.toLocaleString('es-CL', { maximumFractionDigits: 0 })}</div>
                        <div>Insumos: ${totalInsumoCost.toLocaleString('es-CL', { maximumFractionDigits: 0 })}</div>
                        <div>Gastos Gen.: ${totalGastosGenerales.toLocaleString('es-CL', { maximumFractionDigits: 0 })}</div>
                    </div>
                </div>
                <div style={{ backgroundColor: '#e3f2fd', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '1rem', color: '#1565c0', marginBottom: '0.5rem' }}>Balance Neto</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: balance >= 0 ? '#0d47a1' : '#c62828' }}>
                        ${balance.toLocaleString('es-CL', { maximumFractionDigits: 0 })}
                    </p>
                </div>
            </div>

            {/* Manual Expenses Section */}
            <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                    <h3>Gastos Generales (Manuales)</h3>
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            setEditingId(null);
                            setFormData({ fecha: selectedDate, descripcion: '', monto: 0, categoria: 'Otros' });
                            setIsModalOpen(true);
                        }}
                    >
                        + Nuevo Gasto
                    </button>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                            <th style={{ padding: '10px' }}>Fecha</th>
                            <th style={{ padding: '10px' }}>Descripción</th>
                            <th style={{ padding: '10px' }}>Categoría</th>
                            <th style={{ padding: '10px' }}>Monto</th>
                            <th style={{ padding: '10px' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredGastosGenerales.map(g => (
                            <tr key={g.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '10px' }}>{g.fecha}</td>
                                <td style={{ padding: '10px' }}>{g.descripcion}</td>
                                <td style={{ padding: '10px' }}>{g.categoria}</td>
                                <td style={{ padding: '10px' }}>${g.monto.toLocaleString('es-CL', { maximumFractionDigits: 0 })}</td>
                                <td style={{ padding: '10px' }}>
                                    <button onClick={() => handleEdit(g)} style={{ marginRight: '5px' }}>✏️</button>
                                    <button onClick={() => handleDelete(g.id)}>🗑️</button>
                                </td>
                            </tr>
                        ))}
                        {filteredGastosGenerales.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                                    No hay gastos generales registrados en este periodo.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal for Expenses */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Editar Gasto" : "Registrar Gasto"}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Fecha</label>
                        <input
                            type="date"
                            required
                            value={formData.fecha}
                            onChange={e => setFormData({ ...formData, fecha: e.target.value })}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Descripción</label>
                        <input
                            type="text"
                            required
                            value={formData.descripcion}
                            onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Categoría</label>
                        <select
                            value={formData.categoria}
                            onChange={e => setFormData({ ...formData, categoria: e.target.value })}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        >
                            <option value="Arriendo">Arriendo</option>
                            <option value="Servicios">Servicios Básicos</option>
                            <option value="Sueldos">Sueldos</option>
                            <option value="Mantenimiento">Mantenimiento</option>
                            <option value="Otros">Otros</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Monto</label>
                        <input
                            type="number"
                            required
                            min="0"
                            value={formData.monto}
                            onChange={e => setFormData({ ...formData, monto: Number(e.target.value) })}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Guardar</button>
                        <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '4px', background: '#fff' }}>Cancelar</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
