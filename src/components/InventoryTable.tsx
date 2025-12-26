'use client';

import { useState, useEffect } from 'react';
import Modal from './Modal';
import { useDashboard } from '@/context/DashboardContext';
import type { InsumoTransaction } from '@/types/dashboard';
import { formatDate, getTodayString } from '@/lib/dateUtils';
import DateFilter from './DateFilter';
export default function InventoryTable() {
    const { insumoTransactions, addInsumoTransaction, updateInsumoTransaction, deleteInsumoTransaction, registerInsumoPurchase, updateInsumoPurchase, maestroInsumos, updateMaestroInsumo, maestroProveedores } = useDashboard();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [filterDate, setFilterDate] = useState<string>('');

    useEffect(() => {
        setRole(localStorage.getItem('role'));
    }, []);

    const [formData, setFormData] = useState<Partial<InsumoTransaction>>({
        fecha: '',
        insumo: '',
        cantidadEntrada: 0,
        cantidadSalida: 0,
        proveedor: '',
        fechaCompra: '',
        fechaPago: '',
        fechaVencimiento: '',
        factura: '',
        estadoPago: 'pendiente',
        precioUnitario: 0
    });
    const [filterStatus, setFilterStatus] = useState<'todos' | 'pendiente' | 'urgente' | 'pagada'>('todos');

    // Helper to calculate stock per item
    const calculateStock = (itemName: string) => {
        return insumoTransactions
            .filter(t => t.insumo === itemName)
            .reduce((acc, t) => acc + t.cantidadEntrada - t.cantidadSalida, 0);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const transactionData = {
            fecha: formData.fecha || '',
            insumo: formData.insumo || '',
            cantidadEntrada: Number(formData.cantidadEntrada) || 0,
            cantidadSalida: Number(formData.cantidadSalida) || 0,
            proveedor: formData.proveedor || '',
            fechaCompra: formData.fechaCompra || '',
            fechaPago: formData.fechaPago || '',
            factura: formData.factura || '',
            estadoPago: formData.estadoPago as 'pendiente' | 'urgente' | 'pagada' || 'pendiente',
            precioUnitario: Number(formData.precioUnitario) || 0
        };

        if (editingId) {
            // Use atomic update if it's a purchase (Entrada) with price
            if (transactionData.cantidadEntrada > 0 && transactionData.precioUnitario > 0) {
                updateInsumoPurchase(editingId, transactionData, transactionData.precioUnitario);
            } else {
                updateInsumoTransaction(editingId, transactionData);
            }
        } else {
            // Use atomic update if it's a purchase (Entrada) with price
            if (transactionData.cantidadEntrada > 0 && transactionData.precioUnitario > 0) {
                registerInsumoPurchase(transactionData, transactionData.precioUnitario);
            } else {
                addInsumoTransaction(transactionData);
            }
        }
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({
            fecha: '',
            insumo: '',
            cantidadEntrada: 0,
            cantidadSalida: 0,
            proveedor: '',
            fechaCompra: '',
            fechaPago: '',
            fechaVencimiento: '',
            factura: '',
            estadoPago: 'pendiente',
            precioUnitario: 0
        });
    };

    const handleEdit = (item: InsumoTransaction) => {
        setEditingId(item.id);
        setFormData({
            fecha: item.fecha,
            insumo: item.insumo,
            cantidadEntrada: item.cantidadEntrada,
            cantidadSalida: item.cantidadSalida,
            proveedor: item.proveedor,
            fechaCompra: item.fechaCompra,
            fechaPago: item.fechaPago,
            fechaVencimiento: item.fechaVencimiento || '',
            factura: item.factura,
            estadoPago: item.estadoPago,
            precioUnitario: item.precioUnitario || 0
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Estás seguro de eliminar este movimiento?')) {
            deleteInsumoTransaction(id);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({
            fecha: '',
            insumo: '',
            cantidadEntrada: 0,
            cantidadSalida: 0,
            proveedor: '',
            fechaCompra: '',
            fechaPago: '',
            fechaVencimiento: '',
            factura: '',
            estadoPago: 'pendiente',
            precioUnitario: 0
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pagada': return '#4caf50'; // Green
            case 'urgente': return '#f44336'; // Red
            case 'pendiente': return '#ff9800'; // Orange
            default: return '#757575';
        }
    };

    const getUnidadLabel = (unidad: string) => {
        const labels: Record<string, string> = {
            'sacos_25kg': 'Sacos (25kg)',
            'kg': 'kg',
            'unidades': 'unidades',
            'sacos': 'Sacos'
        };
        return labels[unidad] || unidad;
    };

    // Get unit for selected insumo
    const getInsumoUnidad = (insumoNombre: string) => {
        const insumo = maestroInsumos.find(i => i.nombre === insumoNombre);
        return insumo ? getUnidadLabel(insumo.unidad) : '';
    };

    // Get all active insumos from master list (show even if no transactions)
    const allActiveInsumos = maestroInsumos.filter(i => i.activo).map(i => i.nombre);

    // Calculate stock for all items
    // Filter by date
    const filteredTransactions = filterDate
        ? insumoTransactions.filter(t => t.fecha === filterDate)
        : insumoTransactions;

    return (
        <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3>Gestión de Inventario</h3>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        className="btn btn-primary"
                        style={{ fontSize: '0.9rem', padding: '8px 16px' }}
                        onClick={() => {
                            setFormData({ fecha: filterDate || getTodayString(), insumo: '', cantidadEntrada: 0, cantidadSalida: 0, proveedor: '', fechaCompra: '', fechaPago: '', factura: '', estadoPago: 'pendiente', precioUnitario: 0 });
                            setIsModalOpen(true);
                        }}
                    >
                        + Nuevo Movimiento
                    </button>
                </div>
            </div>

            <DateFilter
                selectedDate={filterDate}
                onDateChange={setFilterDate}
                totalRecords={insumoTransactions.length}
                filteredRecords={filteredTransactions.length}
            />

            <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    >
                        <option value="todos">Todos los estados</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="urgente">Urgente</option>
                        <option value="pagada">Pagada</option>
                    </select>
                    <button
                        className="btn btn-primary"
                        style={{ fontSize: '0.9rem', padding: '8px 16px' }}
                        onClick={() => setIsModalOpen(true)}
                    >
                        + Nuevo Movimiento
                    </button>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingId ? "Editar Movimiento de Insumo" : "Registrar Movimiento de Insumo"}>
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
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Insumo *</label>
                            <select
                                required
                                value={formData.insumo}
                                onChange={(e) => setFormData({ ...formData, insumo: e.target.value })}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            >
                                <option value="">Seleccionar insumo</option>
                                {maestroInsumos
                                    .filter(insumo => insumo.activo)
                                    .sort((a, b) => a.nombre.localeCompare(b.nombre))
                                    .map(insumo => (
                                        <option key={insumo.id} value={insumo.nombre}>
                                            {insumo.nombre}
                                        </option>
                                    ))
                                }
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                                type="radio"
                                name="type"
                                checked={formData.cantidadEntrada! > 0}
                                onChange={() => setFormData({ ...formData, cantidadEntrada: 1, cantidadSalida: 0 })}
                            />
                            <span style={{ color: 'green', fontWeight: 'bold' }}>Entrada (Compra)</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                                type="radio"
                                name="type"
                                checked={formData.cantidadSalida! > 0}
                                onChange={() => setFormData({ ...formData, cantidadSalida: 1, cantidadEntrada: 0 })}
                            />
                            <span style={{ color: 'red', fontWeight: 'bold' }}>Salida (Uso)</span>
                        </label>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
                            Cantidad {formData.insumo && `(${getInsumoUnidad(formData.insumo)})`} *
                        </label>
                        <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={formData.cantidadEntrada! > 0 ? formData.cantidadEntrada : formData.cantidadSalida}
                            onChange={(e) => {
                                const val = Number(e.target.value);
                                if (formData.cantidadEntrada! > 0) {
                                    setFormData({ ...formData, cantidadEntrada: val });
                                } else {
                                    setFormData({ ...formData, cantidadSalida: val });
                                }
                            }}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>

                    {formData.cantidadEntrada! > 0 && (
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                Precio Unitario Neto (Sin IVA)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="1"
                                value={formData.precioUnitario}
                                onChange={(e) => setFormData({ ...formData, precioUnitario: Number(e.target.value) })}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                            {formData.insumo && formData.precioUnitario! > 0 && (
                                <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#e3f2fd', borderRadius: '4px', fontSize: '0.85rem' }}>
                                    {(() => {
                                        const insumo = maestroInsumos.find(i => i.nombre === formData.insumo);
                                        const neto = formData.precioUnitario || 0;
                                        const iva = Math.round(neto * 0.19);
                                        const ila = insumo?.tieneImpuestoAdicional ? Math.round(neto * 0.12) : 0;
                                        const totalUnitario = neto + iva + ila;
                                        const totalFinal = totalUnitario * (formData.cantidadEntrada || 0);

                                        return (
                                            <>
                                                <div><strong>Desglose por Unidad:</strong></div>
                                                <div>Neto: ${neto.toLocaleString()}</div>
                                                <div>IVA (19%): ${iva.toLocaleString()}</div>
                                                {insumo?.tieneImpuestoAdicional && (
                                                    <div style={{ color: '#d32f2f' }}>ILA (12%): ${ila.toLocaleString()}</div>
                                                )}
                                                <div style={{ marginTop: '4px', borderTop: '1px solid #ccc', paddingTop: '4px' }}>
                                                    <strong>Total Unitario: ${totalUnitario.toLocaleString()}</strong>
                                                </div>
                                                <div style={{ marginTop: '8px', fontWeight: 'bold', fontSize: '1rem', color: '#1565c0' }}>
                                                    Total a Pagar: ${totalFinal.toLocaleString()}
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                            )}
                        </div>
                    )}

                    {formData.cantidadEntrada! > 0 && (
                        <>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Proveedor *</label>
                                <select
                                    required
                                    value={formData.proveedor}
                                    onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                >
                                    <option value="">Seleccionar proveedor...</option>
                                    {maestroProveedores
                                        .filter(p => p.activo)
                                        .sort((a, b) => a.nombre.localeCompare(b.nombre))
                                        .map(p => (
                                            <option key={p.id} value={p.nombre}>{p.nombre}</option>
                                        ))}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Fecha Compra *</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.fechaCompra}
                                        onChange={(e) => setFormData({ ...formData, fechaCompra: e.target.value })}
                                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Fecha Vencimiento *</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.fechaVencimiento}
                                        onChange={(e) => setFormData({ ...formData, fechaVencimiento: e.target.value })}
                                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>N° Factura *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.factura}
                                        onChange={(e) => setFormData({ ...formData, factura: e.target.value })}
                                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Estado Pago</label>
                                    <select
                                        value={formData.estadoPago}
                                        onChange={(e) => setFormData({ ...formData, estadoPago: e.target.value as any })}
                                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                    >
                                        <option value="pendiente">Pendiente</option>
                                        <option value="urgente">Urgente</option>
                                        <option value="pagada">Pagada</option>
                                    </select>
                                </div>
                            </div>
                        </>
                    )}

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

            {/* Stock Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {allActiveInsumos.map((item: string) => (
                    <div key={item} style={{ backgroundColor: '#f5f5f5', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid var(--color-primary)' }}>
                        <p style={{ fontSize: '0.85rem', color: '#666' }}>{item}</p>
                        <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#333' }}>
                            {calculateStock(item)} {getInsumoUnidad(item)}
                        </p>
                    </div>
                ))}
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                        <th style={{ padding: '10px' }}>Fecha</th>
                        <th style={{ padding: '10px' }}>Insumo</th>
                        <th style={{ padding: '10px' }}>Entrada</th>
                        <th style={{ padding: '10px' }}>Salida</th>
                        <th style={{ padding: '10px' }}>Proveedor</th>
                        <th style={{ padding: '10px' }}>F. Compra</th>
                        <th style={{ padding: '10px' }}>F. Pago</th>
                        <th style={{ padding: '10px' }}>Factura</th>
                        <th style={{ padding: '10px' }}>Estado</th>
                        <th style={{ padding: '10px' }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredTransactions
                        .filter(t => filterStatus === 'todos' || t.estadoPago === filterStatus)
                        .sort((a, b) => b.fecha.localeCompare(a.fecha))
                        .map((t) => (
                            <tr key={t.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '10px' }}>{formatDate(t.fecha)}</td>
                                <td style={{ padding: '10px', fontWeight: 'bold' }}>{t.insumo}</td>
                                <td style={{ padding: '10px', color: 'green' }}>{t.cantidadEntrada > 0 ? t.cantidadEntrada : '-'}</td>
                                <td style={{ padding: '10px', color: 'red' }}>{t.cantidadSalida > 0 ? t.cantidadSalida : '-'}</td>
                                <td style={{ padding: '10px' }}>{t.proveedor || '-'}</td>
                                <td style={{ padding: '10px' }}>{formatDate(t.fechaCompra)}</td>
                                <td style={{ padding: '10px' }}>{formatDate(t.fechaPago)}</td>
                                <td style={{ padding: '10px' }}>{t.factura}</td>
                                <td style={{ padding: '10px' }}>
                                    {t.cantidadEntrada > 0 ? (
                                        <span style={{
                                            backgroundColor: getStatusColor(t.estadoPago),
                                            color: '#fff',
                                            padding: '4px 8px',
                                            borderRadius: '12px',
                                            fontSize: '0.8rem'
                                        }}>
                                            {t.estadoPago.toUpperCase()}
                                        </span>
                                    ) : '-'}
                                </td>
                                <td style={{ padding: '10px' }}>
                                    <button
                                        onClick={() => handleEdit(t)}
                                        style={{ marginRight: '5px', padding: '4px 8px', cursor: 'pointer', border: '1px solid #2196f3', backgroundColor: '#e3f2fd', borderRadius: '4px' }}
                                        title="Editar"
                                    >
                                        ✏️
                                    </button>
                                    {role === 'manager' && (
                                        <button
                                            onClick={() => handleDelete(t.id)}
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
