'use client';

import { useState, useEffect } from 'react';
import Modal from './Modal';
import { useDashboard } from '@/context/DashboardContext';
import type { Venta } from '@/types/dashboard';
import { formatDate, isSameMonth, getTodayString } from '@/lib/dateUtils';
import DateFilter from './DateFilter';
import ExportButtons from './ExportButtons';
import MoneyInput from './MoneyInput';

export default function SalesTable() {
    const { ventas, addVenta, updateVenta, deleteVenta, maestroClientes } = useDashboard();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [filterDate, setFilterDate] = useState<string>('');

    useEffect(() => {
        setRole(localStorage.getItem('role'));
    }, []);

    const [formData, setFormData] = useState<Partial<Venta>>({
        fecha: '',
        cliente: '',
        kilos: 0,
        monto: 0
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            updateVenta(editingId, {
                fecha: formData.fecha || '',
                cliente: formData.cliente || '',
                kilos: formData.kilos || 0,
                monto: formData.monto || 0
            });
        } else {
            addVenta({
                fecha: formData.fecha || '',
                cliente: formData.cliente || '',
                kilos: formData.kilos || 0,
                monto: formData.monto || 0
            });
        }
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({ fecha: '', cliente: '', kilos: 0, monto: 0 });
    };

    const handleEdit = (item: Venta) => {
        setEditingId(item.id);
        setFormData({
            fecha: item.fecha,
            cliente: item.cliente,
            kilos: item.kilos,
            monto: item.monto
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Estás seguro de eliminar esta venta?')) {
            deleteVenta(id);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({ fecha: '', cliente: '', kilos: 0, monto: 0 });
    };


    const totalKilos = ventas.reduce((sum, v) => sum + v.kilos, 0);
    const totalMonto = ventas.reduce((sum, v) => sum + v.monto, 0);

    // Filter ventas by date
    const filteredVentas = filterDate
        ? ventas.filter(v => v.fecha === filterDate)
        : ventas;

    // Calcular estadísticas del mes actual
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const ventasMes = ventas.filter(v => isSameMonth(v.fecha, currentMonth, currentYear));

    const kilosMes = ventasMes.reduce((sum, v) => sum + v.kilos, 0);
    const montoMes = ventasMes.reduce((sum, v) => sum + v.monto, 0);
    const precioPromedioMes = kilosMes > 0 ? montoMes / kilosMes : 0;

    return (
        <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3>Gestión de Ventas</h3>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <ExportButtons
                        data={filteredVentas.map(item => ({
                            ...item,
                            fecha: formatDate(item.fecha)
                        }))}
                        filename={`ventas_${filterDate || 'todos'}`}
                        title="Reporte de Ventas"
                        columns={[
                            { key: 'fecha', header: 'Fecha' },
                            { key: 'cliente', header: 'Cliente' },
                            { key: 'kilos', header: 'Kilos' },
                            { key: 'monto', header: 'Monto' }
                        ]}
                    />
                    <button
                        className="btn btn-primary"
                        style={{ fontSize: '0.9rem', padding: '8px 16px' }}
                        onClick={() => {
                            setFormData({ fecha: filterDate || getTodayString(), cliente: '', kilos: 0, monto: 0 });
                            setIsModalOpen(true);
                        }}
                    >
                        + Nueva Venta
                    </button>
                </div>
            </div>

            <DateFilter
                selectedDate={filterDate}
                onDateChange={setFilterDate}
                totalRecords={ventas.length}
                filteredRecords={filteredVentas.length}
            />

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingId ? "Editar Venta" : "Registrar Nueva Venta"}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Fecha *</label>
                        <input
                            type="date"
                            required
                            value={formData.fecha}
                            onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Cliente *</label>
                        <select
                            required
                            value={formData.cliente}
                            onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        >
                            <option value="">Seleccionar cliente...</option>
                            {maestroClientes
                                .filter(c => c.activo)
                                .sort((a, b) => a.nombre.localeCompare(b.nombre))
                                .map(c => (
                                    <option key={c.id} value={c.nombre}>{c.nombre}</option>
                                ))
                            }
                        </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Kilos *</label>
                            <input
                                type="number"
                                required
                                step="0.01"
                                value={formData.kilos}
                                onChange={(e) => setFormData({ ...formData, kilos: Number(e.target.value) })}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Monto *</label>
                            <MoneyInput
                                required
                                value={formData.monto || 0}
                                onChange={(val) => setFormData({ ...formData, monto: val })}
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

            {/* Summary Cards - Estadísticas del Mes */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ backgroundColor: '#e3f2fd', padding: '1rem', borderRadius: '8px' }}>
                    <p style={{ fontSize: '0.85rem', color: '#666' }}>Kilos del Mes</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2196f3' }}>
                        {kilosMes.toFixed(2)} kg
                    </p>
                </div>
                <div style={{ backgroundColor: '#e8f5e9', padding: '1rem', borderRadius: '8px' }}>
                    <p style={{ fontSize: '0.85rem', color: '#666' }}>Total del Mes</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4caf50' }}>
                        ${montoMes.toLocaleString()}
                    </p>
                </div>
                <div style={{ backgroundColor: '#fff3e0', padding: '1rem', borderRadius: '8px' }}>
                    <p style={{ fontSize: '0.85rem', color: '#666' }}>Precio Promedio Mes</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff9800' }}>
                        ${precioPromedioMes.toFixed(0)}/kg
                    </p>
                </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                        <th style={{ padding: '10px' }}>ID</th>
                        <th style={{ padding: '10px' }}>Fecha</th>
                        <th style={{ padding: '10px' }}>Cliente</th>
                        <th style={{ padding: '10px' }}>Kilos</th>
                        <th style={{ padding: '10px' }}>Monto</th>
                        <th style={{ padding: '10px' }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {[...filteredVentas]
                        .sort((a, b) => b.fecha.localeCompare(a.fecha))
                        .map((venta) => (
                            <tr key={venta.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '10px', fontWeight: 'bold' }}>#{venta.id}</td>
                                <td style={{ padding: '10px' }}>{formatDate(venta.fecha)}</td>
                                <td style={{ padding: '10px' }}>{venta.cliente}</td>
                                <td style={{ padding: '10px', fontWeight: 'bold' }}>{venta.kilos} kg</td>
                                <td style={{ padding: '10px', fontWeight: 'bold', color: 'green' }}>${venta.monto.toLocaleString()}</td>
                                <td style={{ padding: '10px' }}>
                                    <button
                                        onClick={() => handleEdit(venta)}
                                        style={{ marginRight: '5px', padding: '4px 8px', cursor: 'pointer', border: '1px solid #2196f3', backgroundColor: '#e3f2fd', borderRadius: '4px' }}
                                        title="Editar"
                                    >
                                        ✏️
                                    </button>
                                    {role === 'manager' && (
                                        <button
                                            onClick={() => handleDelete(venta.id)}
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
        </div>
    );
}
