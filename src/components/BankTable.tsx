'use client';

import { useState, useEffect } from 'react';
import Modal from './Modal';
import { useDashboard } from '@/context/DashboardContext';
import type { BankTransaction } from '@/types/dashboard';
import { formatDate, getTodayString } from '@/lib/dateUtils';
import DateFilter from './DateFilter';
import ExportButtons from './ExportButtons';
import MoneyInput from './MoneyInput';
import ImportCartolaModal from './ImportCartolaModal';

export default function BankTable() {
    const { bankTransactions, addBankTransaction, updateBankTransaction, deleteBankTransaction, insumoTransactions, maestroProveedores, maestroClientes, maestroInsumos } = useDashboard();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingCell, setEditingCell] = useState<{ id: number; field: string } | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [filterDate, setFilterDate] = useState<string>('');

    // Opciones para área de pago
    const areasPago = ['', 'O.Gerencia', 'OPER. CENTRALES', 'Agustinas', 'O.Florencia', 'D.Gerencia', 'Guiness'];

    // Función para edición inline
    const handleInlineEdit = async (id: number, field: string, value: string) => {
        const transaction = bankTransactions.find(t => t.id === id);
        if (transaction) {
            await updateBankTransaction(id, { ...transaction, [field]: value });
        }
        setEditingCell(null);
    };
    const [formData, setFormData] = useState<Partial<BankTransaction>>({
        fecha: '',
        entrada: 0,
        salida: 0,
        descripcion: '',
        documento: '',
        observacion: '',
        areaPago: '',
        proveedor: '',
        cliente: ''
    });

    // Check role on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setRole(localStorage.getItem('role'));
        }
    }, []);

    if (role !== 'manager') {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                <h2>Acceso Restringido</h2>
                <p>No tienes permisos para ver este módulo.</p>
            </div>
        );
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const entradaVal = Number(formData.entrada) || 0;
        const salidaVal = Number(formData.salida) || 0;

        if (editingId) {
            updateBankTransaction(editingId, {
                fecha: formData.fecha || '',
                entrada: entradaVal,
                salida: salidaVal,
                descripcion: formData.descripcion || '',
                documento: formData.documento || '',
                observacion: formData.observacion || '',
                areaPago: formData.areaPago,
                proveedor: formData.proveedor,
                cliente: formData.cliente
            });
        } else {
            addBankTransaction({
                fecha: formData.fecha || '',
                entrada: entradaVal,
                salida: salidaVal,
                descripcion: formData.descripcion || '',
                documento: formData.documento || '',
                observacion: formData.observacion || '',
                areaPago: formData.areaPago,
                proveedor: formData.proveedor,
                cliente: formData.cliente
            });
        }

        setIsModalOpen(false);
        setEditingId(null);
        setFormData({
            fecha: '',
            entrada: 0,
            salida: 0,
            descripcion: '',
            documento: '',
            observacion: '',
            areaPago: '',
            proveedor: '',
            cliente: ''
        });
    };

    const handleEdit = (item: BankTransaction) => {
        setEditingId(item.id);
        setFormData({
            fecha: item.fecha,
            entrada: item.entrada,
            salida: item.salida,
            descripcion: item.descripcion,
            documento: item.documento,
            observacion: item.observacion,
            areaPago: item.areaPago || '',
            proveedor: item.proveedor || '',
            cliente: item.cliente || ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Estás seguro de eliminar esta transacción?')) {
            deleteBankTransaction(id);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({
            fecha: '',
            entrada: 0,
            salida: 0,
            descripcion: '',
            documento: '',
            observacion: '',
            areaPago: '',
            proveedor: '',
            cliente: ''
        });
    };

    // Check if there's a matching unpaid invoice
    const getMatchingInvoice = () => {
        if (!formData.documento || formData.documento === '-' || formData.salida === 0) return null;
        return insumoTransactions.find(
            inv => inv.factura === formData.documento && inv.estadoPago !== 'pagada'
        );
    };

    const matchingInvoice = getMatchingInvoice();

    // Filter by date
    const filteredTransactions = filterDate
        ? bankTransactions.filter(t => t.fecha === filterDate)
        : bankTransactions;

    const totalIngresos = bankTransactions.reduce((sum, t) => sum + t.entrada, 0);
    const totalEgresos = bankTransactions.reduce((sum, t) => sum + t.salida, 0);
    const saldoActual = bankTransactions.length > 0 ? bankTransactions[bankTransactions.length - 1].saldo : 0;

    return (
        <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3>Movimientos Bancarios</h3>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <ExportButtons
                        data={filteredTransactions.map(item => ({
                            ...item,
                            fecha: formatDate(item.fecha)
                        }))}
                        filename={`banco_${filterDate || 'todos'}`}
                        title="Movimientos Bancarios"
                        columns={[
                            { key: 'fecha', header: 'Fecha' },
                            { key: 'descripcion', header: 'Descripción' },
                            { key: 'entrada', header: 'Entrada' },
                            { key: 'salida', header: 'Salida' },
                            { key: 'saldo', header: 'Saldo' }
                        ]}
                    />
                    <button
                        className="btn btn-primary"
                        style={{ fontSize: '0.9rem', padding: '8px 16px', marginRight: '0.5rem' }}
                        onClick={() => setIsImportModalOpen(true)}
                    >
                        📥 Importar Cartola
                    </button>
                    <button
                        className="btn btn-primary"
                        style={{ fontSize: '0.9rem', padding: '8px 16px' }}
                        onClick={() => {
                            setFormData({ fecha: filterDate || getTodayString(), entrada: 0, salida: 0, descripcion: '', documento: '', observacion: '', saldo: saldoActual });
                            setIsModalOpen(true);
                        }}
                    >
                        + Nueva Transacción
                    </button>
                </div>

                <DateFilter
                    selectedDate={filterDate}
                    onDateChange={setFilterDate}
                    totalRecords={bankTransactions.length}
                    filteredRecords={filteredTransactions.length}
                />

                <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingId ? "Editar Transacción" : "Nueva Transacción"}>
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

                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="type"
                                    checked={formData.entrada! > 0}
                                    onChange={() => setFormData({ ...formData, entrada: 1, salida: 0 })}
                                />
                                <span style={{ color: 'green', fontWeight: 'bold' }}>Entrada</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="type"
                                    checked={formData.salida! > 0}
                                    onChange={() => setFormData({ ...formData, salida: 1, entrada: 0 })}
                                />
                                <span style={{ color: 'red', fontWeight: 'bold' }}>Salida</span>
                            </label>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Monto *</label>
                            <MoneyInput
                                required
                                value={formData.entrada! > 0 ? formData.entrada! : (formData.salida || 0)}
                                onChange={(val) => {
                                    if (formData.entrada! > 0) setFormData({ ...formData, entrada: val, salida: 0 });
                                    else setFormData({ ...formData, salida: val, entrada: 0 });
                                }}
                            />
                        </div>

                        {/* Area de Pago selector (for Salidas) */}
                        {formData.salida! > 0 && (
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Área de Pago *</label>
                                <select
                                    required
                                    value={formData.areaPago || ''}
                                    onChange={(e) => {
                                        const area = e.target.value;
                                        setFormData({
                                            ...formData,
                                            areaPago: area,
                                            proveedor: area === 'Proveedores' ? formData.proveedor : ''
                                        });
                                    }}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                >
                                    <option value="">Seleccionar área...</option>
                                    <option value="Proveedores">🏢 Proveedores (Insumos)</option>
                                    <option value="Sueldos">👷 Sueldos</option>
                                    <option value="Servicios">💡 Servicios Básicos</option>
                                    <option value="Arriendos">🏠 Arriendos</option>
                                    <option value="Impuestos">📋 Impuestos</option>
                                    <option value="Otros">📦 Otros</option>
                                </select>
                            </div>
                        )}

                        {/* Proveedor selector (only when Area is Proveedores) */}
                        {formData.salida! > 0 && formData.areaPago === 'Proveedores' && (
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Proveedor *</label>
                                <select
                                    required
                                    value={formData.proveedor || ''}
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

                                {/* Pending invoices for selected proveedor */}
                                {formData.proveedor && (
                                    <div style={{ marginTop: '0.75rem' }}>
                                        <p style={{ fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#666' }}>
                                            📋 Facturas Pendientes (más antiguas primero):
                                        </p>
                                        <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px' }}>
                                            {insumoTransactions
                                                .filter(inv => inv.proveedor === formData.proveedor && inv.estadoPago !== 'pagada' && inv.cantidadEntrada > 0)
                                                .sort((a, b) => a.fechaCompra.localeCompare(b.fechaCompra))
                                                .map(inv => (
                                                    <div
                                                        key={inv.id}
                                                        onClick={() => setFormData({ ...formData, documento: inv.factura })}
                                                        style={{
                                                            padding: '8px 10px',
                                                            borderBottom: '1px solid #eee',
                                                            cursor: 'pointer',
                                                            backgroundColor: formData.documento === inv.factura ? '#e3f2fd' : 'transparent',
                                                            fontSize: '0.85rem'
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <span><strong>Factura:</strong> {inv.factura || 'S/N'}</span>
                                                            <span style={{
                                                                color: inv.estadoPago === 'urgente' ? '#f44336' : '#ff9800',
                                                                fontWeight: 'bold'
                                                            }}>
                                                                {inv.estadoPago === 'urgente' ? '⚠️ URGENTE' : '⏳ Pendiente'}
                                                            </span>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', fontSize: '0.8rem' }}>
                                                            <span>{inv.insumo} - {inv.cantidadEntrada} unid. - {inv.fechaCompra}</span>
                                                            {(() => {
                                                                const insumo = maestroInsumos.find(i => i.nombre === inv.insumo);
                                                                const neto = (inv.precioUnitario || 0) * (inv.cantidadEntrada || 0);
                                                                const iva = Math.round(neto * 0.19);
                                                                const ila = insumo?.tieneImpuestoAdicional ? Math.round(neto * 0.12) : 0;
                                                                const totalConImpuestos = neto + iva + ila;
                                                                return (
                                                                    <span style={{ fontWeight: 'bold', color: '#1976d2' }}>
                                                                        ${totalConImpuestos.toLocaleString('es-CL')}
                                                                        {insumo?.tieneImpuestoAdicional && <span style={{ fontSize: '0.7rem', color: '#d32f2f' }}> (inc. ILA)</span>}
                                                                    </span>
                                                                );
                                                            })()}
                                                        </div>
                                                    </div>
                                                ))}
                                            {insumoTransactions.filter(inv => inv.proveedor === formData.proveedor && inv.estadoPago !== 'pagada' && inv.cantidadEntrada > 0).length === 0 && (
                                                <div style={{ padding: '12px', textAlign: 'center', color: '#4caf50' }}>
                                                    ✅ No hay facturas pendientes
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Cliente selector (for Entradas) */}
                        {formData.entrada! > 0 && (
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Cliente</label>
                                <select
                                    value={formData.cliente || ''}
                                    onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                >
                                    <option value="">Seleccionar cliente...</option>
                                    {maestroClientes
                                        .filter(c => c.activo)
                                        .sort((a, b) => a.nombre.localeCompare(b.nombre))
                                        .map(c => (
                                            <option key={c.id} value={c.nombre}>{c.nombre}</option>
                                        ))}
                                </select>
                            </div>
                        )}

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Descripción *</label>
                            <input
                                type="text"
                                required
                                value={formData.descripcion}
                                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>N° Documento</label>
                            <input
                                type="text"
                                value={formData.documento}
                                onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                            {matchingInvoice && (
                                <div style={{
                                    marginTop: '0.5rem',
                                    padding: '8px',
                                    backgroundColor: '#e8f5e9',
                                    borderLeft: '3px solid #4caf50',
                                    borderRadius: '4px',
                                    fontSize: '0.85rem'
                                }}>
                                    ✓ Se marcará como pagada la factura <strong>{matchingInvoice.factura}</strong> del insumo <strong>{matchingInvoice.insumo}</strong>
                                </div>
                            )}
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Observación</label>
                            <textarea
                                rows={2}
                                value={formData.observacion}
                                onChange={(e) => setFormData({ ...formData, observacion: e.target.value })}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
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
                        <p style={{ fontSize: '0.85rem', color: '#666' }}>Total Entradas</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'green' }}>
                            ${totalIngresos.toLocaleString()}
                        </p>
                    </div>
                    <div style={{ backgroundColor: '#ffebee', padding: '1rem', borderRadius: '8px' }}>
                        <p style={{ fontSize: '0.85rem', color: '#666' }}>Total Salidas</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'red' }}>
                            ${totalEgresos.toLocaleString()}
                        </p>
                    </div>
                    <div style={{ backgroundColor: '#e3f2fd', padding: '1rem', borderRadius: '8px' }}>
                        <p style={{ fontSize: '0.85rem', color: '#666' }}>Saldo Actual</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                            ${saldoActual.toLocaleString()}
                        </p>
                    </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                            <th style={{ padding: '10px' }}>Fecha</th>
                            <th style={{ padding: '10px' }}>Entrada</th>
                            <th style={{ padding: '10px' }}>Salida</th>
                            <th style={{ padding: '10px' }}>Descripción</th>
                            <th style={{ padding: '10px' }}>Doc.</th>
                            <th style={{ padding: '10px' }}>Obs.</th>
                            <th style={{ padding: '10px' }}>Saldo</th>
                            <th style={{ padding: '10px' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...filteredTransactions]
                            .sort((a, b) => b.fecha.localeCompare(a.fecha))
                            .map((transaction) => (
                                <tr key={transaction.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '10px' }}>{formatDate(transaction.fecha)}</td>
                                    <td style={{ padding: '10px', color: 'green', fontWeight: transaction.entrada > 0 ? 'bold' : 'normal' }}>
                                        {transaction.entrada > 0 ? `$${transaction.entrada.toLocaleString()}` : '-'}
                                    </td>
                                    <td style={{ padding: '10px', color: 'red', fontWeight: transaction.salida > 0 ? 'bold' : 'normal' }}>
                                        {transaction.salida > 0 ? `$${transaction.salida.toLocaleString()}` : '-'}
                                    </td>
                                    <td
                                        style={{ padding: '10px', cursor: 'pointer' }}
                                        onDoubleClick={() => setEditingCell({ id: transaction.id, field: 'descripcion' })}
                                        title="Doble clic para editar"
                                    >
                                        {editingCell?.id === transaction.id && editingCell?.field === 'descripcion' ? (
                                            <input
                                                type="text"
                                                defaultValue={transaction.descripcion}
                                                autoFocus
                                                style={{ width: '100%', padding: '4px', fontSize: '0.9rem' }}
                                                onBlur={(e) => handleInlineEdit(transaction.id, 'descripcion', e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleInlineEdit(transaction.id, 'descripcion', e.currentTarget.value);
                                                    if (e.key === 'Escape') setEditingCell(null);
                                                }}
                                            />
                                        ) : transaction.descripcion}
                                    </td>
                                    <td
                                        style={{ padding: '10px', cursor: 'pointer' }}
                                        onDoubleClick={() => setEditingCell({ id: transaction.id, field: 'documento' })}
                                        title="Doble clic para editar"
                                    >
                                        {editingCell?.id === transaction.id && editingCell?.field === 'documento' ? (
                                            <input
                                                type="text"
                                                defaultValue={transaction.documento}
                                                autoFocus
                                                style={{ width: '80px', padding: '4px', fontSize: '0.9rem' }}
                                                onBlur={(e) => handleInlineEdit(transaction.id, 'documento', e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleInlineEdit(transaction.id, 'documento', e.currentTarget.value);
                                                    if (e.key === 'Escape') setEditingCell(null);
                                                }}
                                            />
                                        ) : transaction.documento}
                                    </td>
                                    <td
                                        style={{ padding: '10px', cursor: 'pointer' }}
                                        onDoubleClick={() => setEditingCell({ id: transaction.id, field: 'observacion' })}
                                        title="Doble clic para editar"
                                    >
                                        {editingCell?.id === transaction.id && editingCell?.field === 'observacion' ? (
                                            <select
                                                defaultValue={transaction.observacion || ''}
                                                autoFocus
                                                style={{ padding: '4px', fontSize: '0.9rem' }}
                                                onChange={(e) => handleInlineEdit(transaction.id, 'observacion', e.target.value)}
                                                onBlur={(e) => handleInlineEdit(transaction.id, 'observacion', e.target.value)}
                                            >
                                                {areasPago.map(area => (
                                                    <option key={area} value={area}>{area || '(vacío)'}</option>
                                                ))}
                                            </select>
                                        ) : (transaction.observacion || '-')}
                                    </td>
                                    <td style={{ padding: '10px', fontWeight: 'bold', color: transaction.saldo >= 0 ? 'green' : 'red' }}>
                                        ${transaction.saldo.toLocaleString()}
                                    </td>
                                    <td style={{ padding: '10px' }}>
                                        <button
                                            onClick={() => handleEdit(transaction)}
                                            style={{ marginRight: '5px', padding: '4px 8px', cursor: 'pointer', border: '1px solid #2196f3', backgroundColor: '#e3f2fd', borderRadius: '4px' }}
                                            title="Editar"
                                        >
                                            ✏️
                                        </button>
                                        {role === 'manager' && (
                                            <button
                                                onClick={() => handleDelete(transaction.id)}
                                                style={{ padding: '4px 8px', cursor: 'pointer', border: '1px solid #f44336', backgroundColor: '#ffebee', borderRadius: '4px' }}
                                                title="Eliminar"
                                            >
                                                🗑️
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}</tbody>
                </table >
            </div >
            <ImportCartolaModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImport={async (movimientos) => {
                    try {
                        let importados = 0;
                        for (const mov of movimientos) {
                            await addBankTransaction({
                                fecha: mov.fecha,
                                entrada: mov.entrada,
                                salida: mov.salida,
                                descripcion: mov.descripcion,
                                documento: mov.documento,
                                observacion: mov.observacion || '',
                                areaPago: mov.areaPago || ''
                            });
                            importados++;
                        }
                        alert(`✅ Se importaron ${importados} movimientos correctamente`);
                    } catch (error) {
                        console.error('Error importing movimientos:', error);
                        alert('Error al importar algunos movimientos');
                    }
                }}
            />
        </div >

    );
}
