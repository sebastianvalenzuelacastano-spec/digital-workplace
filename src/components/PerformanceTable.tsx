'use client';

import { useState, useEffect } from 'react';
import Modal from './Modal';
import { useDashboard } from '@/context/DashboardContext';
import type { Rendimiento } from '@/types/dashboard';
import { formatDate, isSameMonth, getTodayString } from '@/lib/dateUtils';
import DateFilter from './DateFilter';

export default function PerformanceTable() {
    const { rendimientos, addRendimiento, updateRendimiento, deleteRendimiento, insumoTransactions, ventas } = useDashboard();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [filterDate, setFilterDate] = useState<string>('');

    useEffect(() => {
        setRole(localStorage.getItem('role'));
    }, []);

    const [formData, setFormData] = useState<Partial<Rendimiento>>({
        fecha: '',
        kilosProducidos: 0,
        sacos: 0,
        rinde: 0,
        barrido: 0,
        merma: 0
    });

    // Auto-calculate sacos when date changes
    const calculateSacos = (date: string) => {
        if (!date) return 0;
        return insumoTransactions
            .filter(t => t.fecha === date && t.insumo === 'Harina' && t.cantidadSalida > 0)
            .reduce((sum, t) => sum + t.cantidadSalida, 0);
    };

    // Auto-calculate kilos from sales
    const calculateKilosFromVentas = (date: string) => {
        if (!date) return 0;
        return ventas
            .filter(v => v.fecha === date)
            .reduce((sum, v) => sum + v.kilos, 0);
    };

    // Update sacos and kilos when date changes
    const handleDateChange = (date: string) => {
        const sacos = calculateSacos(date);
        const kilosProducidos = calculateKilosFromVentas(date);
        const rinde = kilosProducidos && sacos > 0 ? Number(((kilosProducidos / sacos) * 2).toFixed(2)) : 0;
        setFormData({ ...formData, fecha: date, sacos, kilosProducidos, rinde });
    };

    // Effect to ensure data is up-to-date if context changes while modal is open
    useEffect(() => {
        if (isModalOpen && formData.fecha) {
            const sacos = calculateSacos(formData.fecha);
            const kilosProducidos = calculateKilosFromVentas(formData.fecha);

            if (sacos !== formData.sacos || kilosProducidos !== formData.kilosProducidos) {
                const rinde = kilosProducidos && sacos > 0 ? Number(((kilosProducidos / sacos) * 2).toFixed(2)) : 0;
                setFormData(prev => ({ ...prev, sacos, kilosProducidos, rinde }));
            }
        }
    }, [ventas, insumoTransactions, isModalOpen, formData.fecha]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            updateRendimiento(editingId, {
                fecha: formData.fecha || '',
                kilosProducidos: Number(formData.kilosProducidos) || 0,
                sacos: Number(formData.sacos) || 0,
                rinde: Number(formData.rinde) || 0,
                barrido: Number(formData.barrido) || 0,
                merma: Number(formData.merma) || 0
            });
        } else {
            addRendimiento({
                fecha: formData.fecha || '',
                kilosProducidos: Number(formData.kilosProducidos) || 0,
                sacos: Number(formData.sacos) || 0,
                rinde: Number(formData.rinde) || 0,
                barrido: Number(formData.barrido) || 0,
                merma: Number(formData.merma) || 0
            });
        }
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({ fecha: '', kilosProducidos: 0, sacos: 0, rinde: 0, barrido: 0, merma: 0 });
    };

    const handleEdit = (item: Rendimiento) => {
        setEditingId(item.id);
        // Recalcular sacos basado en la fecha del registro
        const recalculatedSacos = calculateSacos(item.fecha);
        // Recalcular kilos desde ventas
        const recalculatedKilos = calculateKilosFromVentas(item.fecha);
        const recalculatedRinde = recalculatedKilos && recalculatedSacos > 0
            ? Number(((recalculatedKilos / recalculatedSacos) * 2).toFixed(2))
            : 0;

        setFormData({
            fecha: item.fecha,
            kilosProducidos: recalculatedKilos,  // Usar valor recalculado
            sacos: recalculatedSacos,  // Usar valor recalculado
            rinde: recalculatedRinde,   // Usar valor recalculado
            barrido: item.barrido,
            merma: item.merma
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Estás seguro de eliminar este registro?')) {
            deleteRendimiento(id);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({ fecha: '', kilosProducidos: 0, sacos: 0, rinde: 0, barrido: 0, merma: 0 });
    };

    // Period Filtering Logic
    const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
    const today = new Date();
    const [selectedDate, setSelectedDate] = useState(getTodayString());

    // Helper to get week number
    const getWeekNumber = (d: Date) => {
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
        return { year: d.getUTCFullYear(), week: weekNo };
    };

    // Helper to filter data by period
    const filterByPeriod = (dateString: string) => {
        if (!dateString) return false;

        if (period === 'daily') {
            return dateString === selectedDate;
        } else if (period === 'weekly') {
            const date = new Date(dateString);
            const selected = new Date(selectedDate); // Expecting YYYY-Www format or similar reference
            // Simplified weekly logic: check if in same week as selected date
            // However, input type='week' gives "2025-W01".
            // Let's parse the selectedDate string which comes from the input.
            if (selectedDate.includes('-W')) {
                const [yearStr, weekStr] = selectedDate.split('-W');
                const { year, week } = getWeekNumber(date);
                return year === parseInt(yearStr) && week === parseInt(weekStr);
            }
            return false;
        } else if (period === 'monthly') {
            const [year, month] = dateString.split('-');
            const [selectedYear, selectedMonth] = selectedDate.split('-');
            return year === selectedYear && month === selectedMonth;
        } else {
            // yearly
            const [year] = dateString.split('-');
            const [selectedYear] = selectedDate.split('-');
            return year === selectedYear;
        }
    };

    // Filter rendimientos based on selected period
    const filteredRendimientos = rendimientos.filter(r => filterByPeriod(r.fecha));

    // Función para recalcular valores de un rendimiento dinámicamente
    const getRecalculatedValues = (r: Rendimiento) => {
        const sacos = calculateSacos(r.fecha);
        const kilosProducidos = calculateKilosFromVentas(r.fecha);
        const rinde = kilosProducidos && sacos > 0 ? Number(((kilosProducidos / sacos) * 2).toFixed(2)) : 0;
        return { ...r, sacos, kilosProducidos, rinde };
    };

    // Recalcular todos los valores para mostrar siempre datos actualizados
    const recalculatedRendimientos = filteredRendimientos.map(getRecalculatedValues);

    // Calculate statistics for the filtered set
    const totalKilos = recalculatedRendimientos.reduce((sum, r) => sum + r.kilosProducidos, 0);
    const totalSacos = recalculatedRendimientos.reduce((sum, r) => sum + r.sacos, 0);

    // Global Yield = (Total Kilos / Total Sacos) * 2
    // This gives a weighted average instead of an average of averages
    const globalRendimiento = totalSacos > 0 ? (totalKilos / totalSacos) * 2 : 0;

    // Totals for Barrido and Merma
    const totalBarrido = recalculatedRendimientos.reduce((sum, r) => sum + r.barrido, 0);
    const totalMerma = recalculatedRendimientos.reduce((sum, r) => sum + r.merma, 0);


    return (
        <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <h3>Rendimiento de Producción</h3>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <select
                        value={period}
                        onChange={(e) => {
                            const newPeriod = e.target.value as any;
                            setPeriod(newPeriod);
                            // Reset date based on period
                            if (newPeriod === 'daily') setSelectedDate(getTodayString());
                            else if (newPeriod === 'monthly') setSelectedDate(getTodayString().slice(0, 7));
                            else if (newPeriod === 'yearly') setSelectedDate(getTodayString().split('-')[0]);
                            else if (newPeriod === 'weekly') {
                                const { year, week } = getWeekNumber(new Date());
                                setSelectedDate(`${year}-W${String(week).padStart(2, '0')}`);
                            }
                        }}
                        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                    >
                        <option value="daily">Diario</option>
                        <option value="weekly">Semanal</option>
                        <option value="monthly">Mensual</option>
                        <option value="yearly">Anual</option>
                    </select>

                    <input
                        type={period === 'yearly' ? 'number' : period === 'monthly' ? 'month' : period === 'weekly' ? 'week' : 'date'}
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                    />

                    <button
                        className="btn btn-primary"
                        style={{ fontSize: '0.9rem', padding: '8px 16px' }}
                        onClick={() => {
                            setFormData({ fecha: period === 'daily' ? selectedDate : getTodayString(), kilosProducidos: 0, sacos: 0, rinde: 0, barrido: 0, merma: 0 });
                            setIsModalOpen(true);
                        }}
                    >
                        + Nuevo Registro
                    </button>
                </div>
            </div>

            {/* Removed DateFilter component as we now have specific period controls */}

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingId ? "Editar Rendimiento" : "Registrar Rendimiento"}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Fecha *</label>
                        <input
                            type="date"
                            required
                            value={formData.fecha}
                            onChange={(e) => handleDateChange(e.target.value)}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Kilos Producidos (Auto) *</label>
                        <input
                            type="number"
                            readOnly
                            value={formData.kilosProducidos}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #eee', backgroundColor: '#f5f5f5', color: '#666' }}
                            title="Calculado automáticamente desde Ventas"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Sacos Usados (Auto) *</label>
                        <input
                            type="number"
                            readOnly
                            value={formData.sacos}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #eee', backgroundColor: '#f5f5f5', color: '#666' }}
                            title="Calculado automáticamente desde Inventario (Salidas de Harina)"
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Rinde (kg/saco) *</label>
                            <input
                                type="number"
                                readOnly
                                value={formData.rinde}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #eee', backgroundColor: '#f5f5f5', color: '#666' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Barrido *</label>
                            <input
                                type="number"
                                required
                                step="0.01"
                                value={formData.barrido}
                                onChange={(e) => setFormData({ ...formData, barrido: Number(e.target.value) })}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Merma *</label>
                            <input
                                type="number"
                                required
                                step="0.01"
                                value={formData.merma}
                                onChange={(e) => setFormData({ ...formData, merma: Number(e.target.value) })}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                            Guardar
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff', cursor: 'pointer' }}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Summary Cards - Period Statistics */}
            <h4 style={{ marginBottom: '1rem', color: '#666' }}>Estadísticas del Periodo ({period === 'daily' ? 'Diario' : period === 'weekly' ? 'Semanal' : period === 'monthly' ? 'Mensual' : 'Anual'})</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ backgroundColor: '#e3f2fd', padding: '1rem', borderRadius: '8px' }}>
                    <p style={{ fontSize: '0.85rem', color: '#666' }}>Rendimiento Promedio</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2196f3' }}>
                        {globalRendimiento.toFixed(2)}
                    </p>
                </div>
                <div style={{ backgroundColor: '#fff3e0', padding: '1rem', borderRadius: '8px' }}>
                    <p style={{ fontSize: '0.85rem', color: '#666' }}>Total Barrido</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff9800' }}>
                        {totalBarrido.toFixed(2)}
                    </p>
                </div>
                <div style={{ backgroundColor: '#ffebee', padding: '1rem', borderRadius: '8px' }}>
                    <p style={{ fontSize: '0.85rem', color: '#666' }}>Total Merma</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f44336' }}>
                        {totalMerma.toFixed(2)}
                    </p>
                </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                        <th style={{ padding: '10px' }}>Fecha</th>
                        <th style={{ padding: '10px' }}>Kilos Prod.</th>
                        <th style={{ padding: '10px' }}>Sacos</th>
                        <th style={{ padding: '10px' }}>Rinde (kg/saco)</th>
                        <th style={{ padding: '10px' }}>Barrido</th>
                        <th style={{ padding: '10px' }}>Merma</th>
                        <th style={{ padding: '10px' }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {[...recalculatedRendimientos]
                        .sort((a, b) => b.fecha.localeCompare(a.fecha))
                        .map((r) => (
                            <tr key={r.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '10px' }}>{formatDate(r.fecha)}</td>
                                <td style={{ padding: '10px', fontWeight: 'bold' }}>{r.kilosProducidos} kg</td>
                                <td style={{ padding: '10px' }}>{r.sacos}</td>
                                <td style={{ padding: '10px', color: 'green', fontWeight: 'bold' }}>{r.rinde}</td>
                                <td style={{ padding: '10px', color: '#ff9800' }}>{r.barrido}</td>
                                <td style={{ padding: '10px', color: 'red' }}>{r.merma}</td>
                                <td style={{ padding: '10px' }}>
                                    <button
                                        onClick={() => handleEdit(r)}
                                        style={{ marginRight: '5px', padding: '4px 8px', cursor: 'pointer', border: '1px solid #2196f3', backgroundColor: '#e3f2fd', borderRadius: '4px' }}
                                        title="Editar"
                                    >
                                        ✏️
                                    </button>
                                    {role === 'manager' && (
                                        <button
                                            onClick={() => handleDelete(r.id)}
                                            style={{ padding: '4px 8px', cursor: 'pointer', border: '1px solid #f44336', backgroundColor: '#ffebee', borderRadius: '4px' }}
                                            title="Eliminar"
                                        >
                                            🗑️
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>
        </div >
    );
}
