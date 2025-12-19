'use client';

import { useState, useEffect } from 'react';
import Modal from './Modal';
import { useDashboard } from '@/context/DashboardContext';
import type { Order } from '@/types/dashboard';
import { formatDate, getTodayString } from '@/lib/dateUtils';
import DateFilter from './DateFilter';

export default function OrdersTable() {
    const { orders, addOrder, updateOrder, deleteOrder } = useDashboard();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [filterDate, setFilterDate] = useState<string>('');

    useEffect(() => {
        setRole(localStorage.getItem('role'));
    }, []);

    const [formData, setFormData] = useState<Partial<Order>>({
        fecha: '',
        cliente: '',
        productos: '',
        total: 0,
        estado: 'pendiente',
        entrega: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            updateOrder(editingId, {
                fecha: formData.fecha || '',
                cliente: formData.cliente || '',
                productos: formData.productos || '',
                total: formData.total || 0,
                estado: formData.estado || 'pendiente',
                entrega: formData.entrega || ''
            });
        } else {
            addOrder({
                fecha: formData.fecha || '',
                cliente: formData.cliente || '',
                productos: formData.productos || '',
                total: formData.total || 0,
                estado: formData.estado || 'pendiente',
                entrega: formData.entrega || ''
            });
        }
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({
            fecha: '',
            cliente: '',
            productos: '',
            total: 0,
            estado: 'pendiente',
            entrega: ''
        });
    };

    const handleEdit = (item: Order) => {
        setEditingId(item.id);
        setFormData({
            fecha: item.fecha,
            cliente: item.cliente,
            productos: item.productos,
            total: item.total,
            estado: item.estado,
            entrega: item.entrega
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Estás seguro de eliminar este pedido?')) {
            deleteOrder(id);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({
            fecha: '',
            cliente: '',
            productos: '',
            total: 0,
            estado: 'pendiente',
            entrega: ''
        });
    };

    const getStatusColor = (estado: Order['estado']) => {
        switch (estado) {
            case 'pendiente': return '#ff9800';
            case 'en_proceso': return '#2196f3';
            case 'completado': return '#4caf50';
            case 'cancelado': return '#f44336';
            default: return '#757575';
        }
    };

    const getStatusText = (estado: Order['estado']) => {
        switch (estado) {
            case 'pendiente': return 'Pendiente';
            case 'en_proceso': return 'En Proceso';
            case 'completado': return 'Completado';
            case 'cancelado': return 'Cancelado';
            default: return estado;
        }
    };

    const pendingCount = orders.filter(o => o.estado === 'pendiente').length;
    const inProcessCount = orders.filter(o => o.estado === 'en_proceso').length;

    // Filter by date
    const filteredOrders = filterDate
        ? orders.filter(o => o.fecha === filterDate)
        : orders;

    return (
        <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3>Gestión de Pedidos</h3>
                <button
                    className="btn btn-primary"
                    style={{ fontSize: '0.9rem', padding: '8px 16px' }}
                    onClick={() => {
                        setFormData({ fecha: filterDate || getTodayString(), cliente: '', productos: '', total: 0, estado: 'pendiente', entrega: '' });
                        setIsModalOpen(true);
                    }}
                >
                    + Nuevo Pedido
                </button>
            </div>

            <DateFilter
                selectedDate={filterDate}
                onDateChange={setFilterDate}
                totalRecords={orders.length}
                filteredRecords={filteredOrders.length}
            />

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingId ? "Editar Pedido" : "Nuevo Pedido"}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Fecha Entrega *</label>
                            <input
                                type="date"
                                required
                                value={formData.entrega}
                                onChange={(e) => setFormData({ ...formData, entrega: e.target.value })}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Cliente *</label>
                        <input
                            type="text"
                            required
                            value={formData.cliente}
                            onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Productos *</label>
                        <textarea
                            required
                            value={formData.productos}
                            onChange={(e) => setFormData({ ...formData, productos: e.target.value })}
                            rows={3}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' }}
                            placeholder="Ej: 50 panes amasados, 20 hallullas"
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Total *</label>
                            <input
                                type="number"
                                required
                                value={formData.total}
                                onChange={(e) => setFormData({ ...formData, total: Number(e.target.value) })}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Estado</label>
                            <select
                                value={formData.estado}
                                onChange={(e) => setFormData({ ...formData, estado: e.target.value as Order['estado'] })}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            >
                                <option value="pendiente">Pendiente</option>
                                <option value="en_proceso">En Proceso</option>
                                <option value="completado">Completado</option>
                                <option value="cancelado">Cancelado</option>
                            </select>
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

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ backgroundColor: '#fff3e0', padding: '1rem', borderRadius: '8px', border: '1px solid #ff9800' }}>
                    <p style={{ fontSize: '0.85rem', color: '#666' }}>Pendientes</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff9800' }}>{pendingCount}</p>
                </div>
                <div style={{ backgroundColor: '#e3f2fd', padding: '1rem', borderRadius: '8px', border: '1px solid #2196f3' }}>
                    <p style={{ fontSize: '0.85rem', color: '#666' }}>En Proceso</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2196f3' }}>{inProcessCount}</p>
                </div>
                <div style={{ backgroundColor: '#e8f5e9', padding: '1rem', borderRadius: '8px', border: '1px solid #4caf50' }}>
                    <p style={{ fontSize: '0.85rem', color: '#666' }}>Total Pedidos</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4caf50' }}>{orders.length}</p>
                </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                        <th style={{ padding: '10px' }}>ID</th>
                        <th style={{ padding: '10px' }}>Fecha</th>
                        <th style={{ padding: '10px' }}>Cliente</th>
                        <th style={{ padding: '10px' }}>Productos</th>
                        <th style={{ padding: '10px' }}>Total</th>
                        <th style={{ padding: '10px' }}>Entrega</th>
                        <th style={{ padding: '10px' }}>Estado</th>
                        <th style={{ padding: '10px' }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {[...filteredOrders]
                        .sort((a, b) => b.fecha.localeCompare(a.fecha))
                        .map((order) => (
                            <tr key={order.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '10px', fontWeight: 'bold' }}>#{order.id}</td>
                                <td style={{ padding: '10px' }}>{formatDate(order.fecha)}</td>
                                <td style={{ padding: '10px' }}>{order.cliente}</td>
                                <td style={{ padding: '10px', fontSize: '0.85rem', color: '#666' }}>{order.productos}</td>
                                <td style={{ padding: '10px', fontWeight: 'bold' }}>${order.total.toLocaleString()}</td>
                                <td style={{ padding: '10px' }}>{formatDate(order.entrega)}</td>
                                <td style={{ padding: '10px' }}>
                                    <span style={{
                                        padding: '4px 12px',
                                        borderRadius: '12px',
                                        fontSize: '0.85rem',
                                        fontWeight: 'bold',
                                        color: '#fff',
                                        backgroundColor: getStatusColor(order.estado)
                                    }}>
                                        {getStatusText(order.estado)}
                                    </span>
                                </td>
                                <td style={{ padding: '10px' }}>
                                    <button
                                        onClick={() => handleEdit(order)}
                                        style={{ marginRight: '5px', padding: '4px 8px', cursor: 'pointer', border: '1px solid #2196f3', backgroundColor: '#e3f2fd', borderRadius: '4px' }}
                                        title="Editar"
                                    >
                                        ✏️
                                    </button>
                                    {role === 'manager' && (
                                        <button
                                            onClick={() => handleDelete(order.id)}
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
