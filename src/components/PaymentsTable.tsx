'use client';

import { useState, useEffect } from 'react';
import Modal from './Modal';
import { useDashboard } from '@/context/DashboardContext';
import type { Payment } from '@/types/dashboard';
import { formatDate, getTodayString } from '@/lib/dateUtils';
import DateFilter from './DateFilter';
import MoneyInput from './MoneyInput';

export default function PaymentsTable() {
    const { payments, addPayment, updatePayment, deletePayment } = useDashboard();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [filterDate, setFilterDate] = useState<string>('');

    useEffect(() => {
        setRole(localStorage.getItem('role'));
    }, []);

    const [formData, setFormData] = useState<Partial<Payment>>({
        factura: '',
        cliente: '',
        fechaPago: '',
        montoPagado: 0
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            updatePayment(editingId, {
                factura: formData.factura || '',
                cliente: formData.cliente || '',
                fechaPago: formData.fechaPago || '',
                montoPagado: Number(formData.montoPagado) || 0
            });
        } else {
            addPayment({
                factura: formData.factura || '',
                cliente: formData.cliente || '',
                fechaPago: formData.fechaPago || '',
                montoPagado: Number(formData.montoPagado) || 0
            });
        }
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({
            factura: '',
            cliente: '',
            fechaPago: '',
            montoPagado: 0
        });
    };

    const handleEdit = (item: Payment) => {
        setEditingId(item.id);
        setFormData({
            factura: item.factura,
            cliente: item.cliente,
            fechaPago: item.fechaPago,
            montoPagado: item.montoPagado
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Estás seguro de eliminar este pago?')) {
            deletePayment(id);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({
            factura: '',
            cliente: '',
            fechaPago: '',
            montoPagado: 0
        });
    };

    const totalCobrado = payments.reduce((sum, p) => sum + p.montoPagado, 0);

    // Filter by date
    const filteredPayments = filterDate
        ? payments.filter(p => p.fechaPago === filterDate)
        : payments;

    return (
        <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3>Gestión de Pagos</h3>
                <button
                    className="btn btn-primary"
                    style={{ fontSize: '0.9rem', padding: '8px 16px' }}
                    onClick={() => {
                        setFormData({ factura: '', cliente: '', fechaPago: filterDate || getTodayString(), montoPagado: 0 });
                        setIsModalOpen(true);
                    }}
                >
                    + Nuevo Pago
                </button>
            </div>

            <DateFilter
                selectedDate={filterDate}
                onDateChange={setFilterDate}
                totalRecords={payments.length}
                filteredRecords={filteredPayments.length}
            />

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingId ? "Editar Pago" : "Registrar Nuevo Pago"}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>N° Factura/Documento *</label>
                        <input
                            type="text"
                            required
                            value={formData.factura}
                            onChange={(e) => setFormData({ ...formData, factura: e.target.value })}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            placeholder="Referencia a la venta"
                        />
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

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Fecha de Pago *</label>
                            <input
                                type="date"
                                required
                                value={formData.fechaPago}
                                onChange={(e) => setFormData({ ...formData, fechaPago: e.target.value })}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Monto Pagado *</label>
                            <MoneyInput
                                required
                                value={formData.montoPagado || 0}
                                onChange={(val) => setFormData({ ...formData, montoPagado: val })}
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

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ backgroundColor: '#e8f5e9', padding: '1rem', borderRadius: '8px' }}>
                    <p style={{ fontSize: '0.85rem', color: '#666' }}>Total Cobrado</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4caf50' }}>
                        ${totalCobrado.toLocaleString()}
                    </p>
                </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                        <th style={{ padding: '10px' }}>Fecha Pago</th>
                        <th style={{ padding: '10px' }}>Factura/Doc</th>
                        <th style={{ padding: '10px' }}>Cliente</th>
                        <th style={{ padding: '10px' }}>Monto Pagado</th>
                        <th style={{ padding: '10px' }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {[...filteredPayments]
                        .sort((a, b) => b.fechaPago.localeCompare(a.fechaPago))
                        .map((payment) => (
                            <tr key={payment.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '10px' }}>{formatDate(payment.fechaPago)}</td>
                                <td style={{ padding: '10px', fontWeight: 'bold' }}>{payment.factura}</td>
                                <td style={{ padding: '10px' }}>{payment.cliente}</td>
                                <td style={{ padding: '10px', color: 'green', fontWeight: 'bold' }}>${payment.montoPagado.toLocaleString()}</td>
                                <td style={{ padding: '10px' }}>
                                    <button
                                        onClick={() => handleEdit(payment)}
                                        style={{ marginRight: '5px', padding: '4px 8px', cursor: 'pointer', border: '1px solid #2196f3', backgroundColor: '#e3f2fd', borderRadius: '4px' }}
                                        title="Editar"
                                    >
                                        ✏️
                                    </button>
                                    {role === 'manager' && (
                                        <button
                                            onClick={() => handleDelete(payment.id)}
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
