'use client';

import { useState, useEffect } from 'react';
import Modal from './Modal';
import { useDashboard } from '@/context/DashboardContext';
import type { CajaChica } from '@/types/dashboard';
import { formatDate, isSameMonth, getTodayString } from '@/lib/dateUtils';
import DateFilter from './DateFilter';
import ExportButtons from './ExportButtons';

export default function CajaChicaTable() {
    const { cajaChica, addCajaChica, updateCajaChica, deleteCajaChica, maestroAreas, maestroProveedores, maestroTrabajadores, addBankTransaction } = useDashboard();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [filterDate, setFilterDate] = useState<string>(''); // '' = mostrar todos

    useEffect(() => {
        setRole(localStorage.getItem('role'));
    }, []);

    const [beneficiaryType, setBeneficiaryType] = useState<'proveedor' | 'trabajador' | 'otro'>('otro');
    const [formData, setFormData] = useState<Partial<CajaChica>>({
        fecha: '',
        area: '',
        monto: 0,
        descripcion: '',
        proveedor: '',
        trabajador: '',
        metodoPago: 'efectivo'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const metodoPago = formData.metodoPago || 'efectivo';

        if (editingId) {
            updateCajaChica(editingId, {
                fecha: formData.fecha || '',
                area: formData.area || '',
                monto: Number(formData.monto) || 0,
                descripcion: formData.descripcion || '',
                proveedor: beneficiaryType === 'proveedor' ? formData.proveedor : undefined,
                trabajador: beneficiaryType === 'trabajador' ? formData.trabajador : undefined,
                metodoPago: metodoPago
            });
        } else {
            // Create caja chica entry
            addCajaChica({
                fecha: formData.fecha || '',
                area: formData.area || '',
                monto: Number(formData.monto) || 0,
                descripcion: formData.descripcion || '',
                proveedor: beneficiaryType === 'proveedor' ? formData.proveedor : undefined,
                trabajador: beneficiaryType === 'trabajador' ? formData.trabajador : undefined,
                metodoPago: metodoPago
            });

            // If paid with card or check, also create bank transaction
            if (metodoPago === 'tarjeta' || metodoPago === 'cheque') {
                const descripcionBanco = `[Caja Chica] ${formData.descripcion} - ${formData.area}`;
                await addBankTransaction({
                    fecha: formData.fecha || '',
                    entrada: 0,
                    salida: Number(formData.monto) || 0,
                    documento: metodoPago === 'cheque' ? 'Cheque' : 'Tarjeta',
                    descripcion: descripcionBanco,
                    observacion: '',
                    areaPago: 'Caja Chica'
                });
            }
        }
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({ fecha: '', area: '', monto: 0, descripcion: '', proveedor: '', trabajador: '', metodoPago: 'efectivo' });
        setBeneficiaryType('otro');
    };

    const handleEdit = (item: CajaChica) => {
        setEditingId(item.id);
        if (item.proveedor) setBeneficiaryType('proveedor');
        else if (item.trabajador) setBeneficiaryType('trabajador');
        else setBeneficiaryType('otro');

        setFormData({
            fecha: item.fecha,
            area: item.area,
            monto: item.monto,
            descripcion: item.descripcion,
            proveedor: item.proveedor || '',
            trabajador: item.trabajador || '',
            metodoPago: item.metodoPago || 'efectivo'
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Estás seguro de eliminar este registro de caja chica?')) {
            deleteCajaChica(id);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({ fecha: '', area: '', monto: 0, descripcion: '', proveedor: '', trabajador: '', metodoPago: 'efectivo' });
        setBeneficiaryType('otro');
    };

    // Filter cajaChica by date
    const filteredCajaChica = filterDate
        ? cajaChica.filter(item => item.fecha === filterDate)
        : cajaChica;

    // Calculate total and stats
    const totalMonto = filteredCajaChica.reduce((sum, item) => sum + item.monto, 0);

    // Calculate daily spending (today)
    const today = new Date();
    // Format today as YYYY-MM-DD using local time components to match input format
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const gastoHoy = cajaChica
        .filter(item => item.fecha === todayStr)
        .reduce((sum, item) => sum + item.monto, 0);

    // Calculate monthly spending (current month)
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const gastoMensual = cajaChica
        .filter(item => isSameMonth(item.fecha, currentMonth, currentYear))
        .reduce((sum, item) => sum + item.monto, 0);

    // Group by area (only filtered records)
    const gastosPorArea = filteredCajaChica.reduce((acc, item) => {
        if (!acc[item.area]) {
            acc[item.area] = 0;
        }
        acc[item.area] += item.monto;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3>Caja Chica</h3>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <ExportButtons
                        data={filteredCajaChica.map(item => ({
                            ...item,
                            fecha: formatDate(item.fecha),
                            monto: item.monto
                        }))}
                        filename={`caja_chica_${filterDate || 'todos'}`}
                        title="Reporte Caja Chica"
                        columns={[
                            { key: 'fecha', header: 'Fecha' },
                            { key: 'area', header: 'Área' },
                            { key: 'descripcion', header: 'Descripción' },
                            { key: 'monto', header: 'Monto' }
                        ]}
                    />
                    <button
                        className="btn btn-primary"
                        style={{ fontSize: '0.9rem', padding: '8px 16px' }}
                        onClick={() => {
                            setFormData({ fecha: filterDate || getTodayString(), area: '', monto: 0, descripcion: '', proveedor: '', trabajador: '' });
                            setBeneficiaryType('otro');
                            setIsModalOpen(true);
                        }}
                    >
                        + Nuevo Gasto
                    </button>
                </div>

                <DateFilter
                    selectedDate={filterDate}
                    onDateChange={setFilterDate}
                    totalRecords={cajaChica.length}
                    filteredRecords={filteredCajaChica.length}
                />

                <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingId ? "Editar Gasto" : "Registrar Nuevo Gasto"}>
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
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Área *</label>
                            <select
                                required
                                value={formData.area}
                                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            >
                                <option value="">Seleccionar área</option>
                                {maestroAreas
                                    .filter(area => area.activo)
                                    .sort((a, b) => a.nombre.localeCompare(b.nombre))
                                    .map(area => (
                                        <option key={area.id} value={area.nombre}>
                                            {area.nombre}
                                        </option>
                                    ))
                                }
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Beneficiario</label>
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="beneficiaryType"
                                        checked={beneficiaryType === 'proveedor'}
                                        onChange={() => setBeneficiaryType('proveedor')}
                                    />
                                    <span>Proveedor</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="beneficiaryType"
                                        checked={beneficiaryType === 'trabajador'}
                                        onChange={() => setBeneficiaryType('trabajador')}
                                    />
                                    <span>Trabajador</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="beneficiaryType"
                                        checked={beneficiaryType === 'otro'}
                                        onChange={() => setBeneficiaryType('otro')}
                                    />
                                    <span>Otro</span>
                                </label>
                            </div>

                            {beneficiaryType === 'proveedor' && (
                                <select
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
                            )}

                            {beneficiaryType === 'trabajador' && (
                                <select
                                    value={formData.trabajador}
                                    onChange={(e) => setFormData({ ...formData, trabajador: e.target.value })}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                >
                                    <option value="">Seleccionar trabajador...</option>
                                    {maestroTrabajadores
                                        .filter(t => t.activo)
                                        .sort((a, b) => a.nombre.localeCompare(b.nombre))
                                        .map(t => (
                                            <option key={t.id} value={t.nombre}>{t.nombre}</option>
                                        ))}
                                </select>
                            )}
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Método de Pago *</label>
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="metodoPago"
                                        checked={formData.metodoPago === 'efectivo'}
                                        onChange={() => setFormData({ ...formData, metodoPago: 'efectivo' })}
                                    />
                                    <span>💵 Efectivo</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="metodoPago"
                                        checked={formData.metodoPago === 'tarjeta'}
                                        onChange={() => setFormData({ ...formData, metodoPago: 'tarjeta' })}
                                    />
                                    <span>💳 Tarjeta</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="metodoPago"
                                        checked={formData.metodoPago === 'cheque'}
                                        onChange={() => setFormData({ ...formData, metodoPago: 'cheque' })}
                                    />
                                    <span>📝 Cheque</span>
                                </label>
                            </div>
                            {(formData.metodoPago === 'tarjeta' || formData.metodoPago === 'cheque') && !editingId && (
                                <div style={{
                                    backgroundColor: '#e3f2fd',
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    fontSize: '0.85rem',
                                    color: '#1565c0'
                                }}>
                                    ℹ️ Este gasto también se registrará en Conciliación Bancaria
                                </div>
                            )}
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Monto *</label>
                            <input
                                type="number"
                                required
                                value={formData.monto}
                                onChange={(e) => setFormData({ ...formData, monto: Number(e.target.value) })}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                Descripción {beneficiaryType !== 'trabajador' && '*'}
                            </label>
                            <textarea
                                required={beneficiaryType !== 'trabajador'}
                                value={formData.descripcion}
                                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                rows={3}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' }}
                                placeholder={beneficiaryType === 'trabajador' ? 'Descripción opcional...' : 'Describe el gasto realizado...'}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                Guardar
                            </button>
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff', cursor: 'pointer' }}
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </Modal>

                {/* Stats Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ backgroundColor: '#ffebee', padding: '1rem', borderRadius: '8px' }}>
                        <p style={{ fontSize: '0.85rem', color: '#666' }}>Total del Filtro</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f44336' }}>
                            ${totalMonto.toLocaleString()}
                        </p>
                    </div>
                    <div style={{ backgroundColor: '#fff3e0', padding: '1rem', borderRadius: '8px' }}>
                        <p style={{ fontSize: '0.85rem', color: '#666' }}>Gasto Hoy</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff9800' }}>
                            ${gastoHoy.toLocaleString()}
                        </p>
                    </div>
                    <div style={{ backgroundColor: '#e3f2fd', padding: '1rem', borderRadius: '8px' }}>
                        <p style={{ fontSize: '0.85rem', color: '#666' }}>Gasto del Mes</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2196f3' }}>
                            ${gastoMensual.toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Area Stats */}
                {Object.keys(gastosPorArea).length > 0 && (
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: '#666' }}>Gastos por Área</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                            {Object.entries(gastosPorArea).map(([area, monto]) => (
                                <div key={area} style={{ backgroundColor: '#f5f5f5', padding: '0.75rem 1rem', borderRadius: '6px', display: 'flex', gap: '0.75rem', alignItems: 'center', minWidth: 'fit-content' }}>
                                    <span style={{ fontSize: '0.85rem', color: '#666', whiteSpace: 'nowrap' }}>{area}:</span>
                                    <span style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#333', whiteSpace: 'nowrap' }}>
                                        ${monto.toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                            <th style={{ padding: '10px' }}>Fecha</th>
                            <th style={{ padding: '10px' }}>Área</th>
                            <th style={{ padding: '10px' }}>Monto</th>
                            <th style={{ padding: '10px' }}>Pago</th>
                            <th style={{ padding: '10px' }}>Descripción</th>
                            <th style={{ padding: '10px' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCajaChica
                            .sort((a, b) => b.fecha.localeCompare(a.fecha))
                            .map((item) => (
                                <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '10px' }}>{formatDate(item.fecha)}</td>
                                    <td style={{ padding: '10px' }}>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '12px',
                                            backgroundColor: '#e3f2fd',
                                            fontSize: '0.85rem',
                                            fontWeight: 'bold'
                                        }}>
                                            {item.area}
                                        </span>
                                    </td>
                                    <td style={{ padding: '10px', fontWeight: 'bold', color: '#f44336' }}>${item.monto.toLocaleString()}</td>
                                    <td style={{ padding: '10px' }}>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '12px',
                                            fontSize: '0.85rem',
                                            backgroundColor: item.metodoPago === 'tarjeta' ? '#e3f2fd' : item.metodoPago === 'cheque' ? '#fff3e0' : '#f5f5f5',
                                            color: item.metodoPago === 'tarjeta' ? '#1565c0' : item.metodoPago === 'cheque' ? '#e65100' : '#666'
                                        }}>
                                            {item.metodoPago === 'tarjeta' ? '💳' : item.metodoPago === 'cheque' ? '📝' : '💵'} {item.metodoPago || 'efectivo'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '10px', color: '#666' }}>{item.descripcion}</td>
                                    <td style={{ padding: '10px' }}>
                                        <button
                                            onClick={() => handleEdit(item)}
                                            style={{ marginRight: '5px', padding: '4px 8px', cursor: 'pointer', border: '1px solid #2196f3', backgroundColor: '#e3f2fd', borderRadius: '4px' }}
                                            title="Editar"
                                        >
                                            ✏️
                                        </button>
                                        {role === 'manager' && (
                                            <button
                                                onClick={() => handleDelete(item.id)}
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
        </div>
    );
}
