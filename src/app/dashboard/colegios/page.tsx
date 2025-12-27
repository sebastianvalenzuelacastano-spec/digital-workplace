'use client';

import { useState, useEffect } from 'react';
import type { RegistroColegio } from '@/types/dashboard';
import Modal from '@/components/Modal';

const REPARTIDORES = ['Aranda', 'Bazaes', 'Diaz Godoy'];

export default function ColegiosPage() {
    const [registros, setRegistros] = useState<RegistroColegio[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    // Filtros
    const [filtroRepartidor, setFiltroRepartidor] = useState('todos');
    const [filtroFechaInicio, setFiltroFechaInicio] = useState('');
    const [filtroFechaFin, setFiltroFechaFin] = useState('');

    // Form data
    const [formData, setFormData] = useState({
        fecha: new Date().toISOString().split('T')[0],
        repartidor: REPARTIDORES[0],
        pesoFormula: '',
        pesoReal: '',
        observaciones: ''
    });

    useEffect(() => {
        loadRegistros();
    }, [filtroRepartidor, filtroFechaInicio, filtroFechaFin]);

    const loadRegistros = async () => {
        try {
            const params = new URLSearchParams();
            if (filtroRepartidor !== 'todos') params.append('repartidor', filtroRepartidor);
            if (filtroFechaInicio) params.append('fechaInicio', filtroFechaInicio);
            if (filtroFechaFin) params.append('fechaFin', filtroFechaFin);

            const res = await fetch(`/api/colegios?${params.toString()}`);
            const data = await res.json();
            setRegistros(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error loading registros:', error);
            setRegistros([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.pesoFormula || !formData.pesoReal) {
            alert('Por favor complete todos los campos requeridos');
            return;
        }

        try {
            const username = localStorage.getItem('username') || 'Sistema';
            const url = '/api/colegios';
            const method = editingId ? 'PUT' : 'POST';
            const payload = editingId
                ? { ...formData, id: editingId }
                : { ...formData, creador: username };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                loadRegistros();
                closeModal();
            } else {
                alert('Error al guardar registro');
            }
        } catch (error) {
            console.error('Error saving registro:', error);
        }
    };

    const handleEdit = (registro: RegistroColegio) => {
        setEditingId(registro.id);
        setFormData({
            fecha: registro.fecha,
            repartidor: registro.repartidor,
            pesoFormula: registro.pesoFormula.toString(),
            pesoReal: registro.pesoReal.toString(),
            observaciones: registro.observaciones || ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Eliminar este registro?')) return;

        try {
            const res = await fetch(`/api/colegios?id=${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                loadRegistros();
            }
        } catch (error) {
            console.error('Error deleting registro:', error);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({
            fecha: new Date().toISOString().split('T')[0],
            repartidor: REPARTIDORES[0],
            pesoFormula: '',
            pesoReal: '',
            observaciones: ''
        });
    };

    // Cálculos de resumen
    const getTotalMerma = () => {
        return registros.reduce((sum, r) => sum + r.diferencia, 0).toFixed(2);
    };

    const getPromedioMerma = () => {
        if (registros.length === 0) return '0.00';
        const promedio = registros.reduce((sum, r) => sum + r.porcentajeMerma, 0) / registros.length;
        return promedio.toFixed(2);
    };

    const getMermaPorRepartidor = () => {
        const porRepartidor: Record<string, number> = {};
        registros.forEach(r => {
            if (!porRepartidor[r.repartidor]) porRepartidor[r.repartidor] = 0;
            porRepartidor[r.repartidor] += r.diferencia;
        });
        return porRepartidor;
    };

    const getMermaColor = (porcentaje: number) => {
        const abs = Math.abs(porcentaje);
        if (abs <= 3) return { bg: '#e8f5e9', color: '#2e7d32' }; // Verde - Dentro tolerancia
        if (abs <= 5) return { bg: '#fff3e0', color: '#e65100' }; // Naranja - Advertencia
        return { bg: '#ffebee', color: '#c62828' }; // Rojo - Crítico
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Cargando...</div>;
    }

    const mermaPorRepartidor = getMermaPorRepartidor();

    return (
        <div>
            <h2 style={{ marginBottom: '20px' }}>🎒 Control de Mermas - Colegios</h2>

            {/* Resumen Global */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '20px' }}>
                <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '5px' }}>Total Registros</p>
                    <p style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{registros.length}</p>
                </div>
                <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '5px' }}>Diferencia Total (Kg)</p>
                    <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: parseFloat(getTotalMerma()) < 0 ? '#c62828' : '#2e7d32' }}>
                        {getTotalMerma()}
                    </p>
                </div>
                <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '5px' }}>Promedio Merma (%)</p>
                    <p style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{getPromedioMerma()}%</p>
                </div>
                <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <button
                        className="btn btn-primary"
                        onClick={() => setIsModalOpen(true)}
                        style={{ width: '100%', padding: '12px' }}
                    >
                        + Nuevo Registro
                    </button>
                </div>
            </div>

            {/* Resumen por Repartidor */}
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
                <h3 style={{ marginBottom: '15px' }}>Diferencia por Repartidor</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                    {REPARTIDORES.map(repartidor => (
                        <div key={repartidor} style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                            <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '5px' }}>{repartidor}</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: (mermaPorRepartidor[repartidor] || 0) < 0 ? '#c62828' : '#2e7d32' }}>
                                {(mermaPorRepartidor[repartidor] || 0).toFixed(2)} Kg
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Filtros */}
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
                <h3 style={{ marginBottom: '15px' }}>Filtros</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginBottom: '15px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Repartidor</label>
                        <select
                            value={filtroRepartidor}
                            onChange={(e) => setFiltroRepartidor(e.target.value)}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        >
                            <option value="todos">Todos</option>
                            {REPARTIDORES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Mes</label>
                        <input
                            type="month"
                            value={filtroFechaInicio ? filtroFechaInicio.substring(0, 7) : ''}
                            onChange={(e) => {
                                if (e.target.value) {
                                    const [year, month] = e.target.value.split('-');
                                    const firstDay = `${year}-${month}-01`;
                                    const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
                                    const lastDayFormatted = `${year}-${month}-${lastDay.toString().padStart(2, '0')}`;
                                    setFiltroFechaInicio(firstDay);
                                    setFiltroFechaFin(lastDayFormatted);
                                } else {
                                    setFiltroFechaInicio('');
                                    setFiltroFechaFin('');
                                }
                            }}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: '#666' }}>O filtrar por rango:</span>
                    <div style={{ display: 'flex', gap: '10px', flex: 1 }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#666' }}>Desde</label>
                            <input
                                type="date"
                                value={filtroFechaInicio}
                                onChange={(e) => setFiltroFechaInicio(e.target.value)}
                                style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '0.9rem' }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#666' }}>Hasta</label>
                            <input
                                type="date"
                                value={filtroFechaFin}
                                onChange={(e) => setFiltroFechaFin(e.target.value)}
                                style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '0.9rem' }}
                            />
                        </div>
                        {(filtroFechaInicio || filtroFechaFin) && (
                            <button
                                onClick={() => {
                                    setFiltroFechaInicio('');
                                    setFiltroFechaFin('');
                                }}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '4px',
                                    border: '1px solid #f44336',
                                    backgroundColor: '#ffebee',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    alignSelf: 'flex-end'
                                }}
                            >
                                Limpiar fechas
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabla de Registros */}
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h3 style={{ marginBottom: '15px' }}>Registros</h3>

                {registros.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                        <p>No hay registros con los filtros aplicados</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                                    <th style={{ padding: '10px' }}>Fecha</th>
                                    <th style={{ padding: '10px' }}>Repartidor</th>
                                    <th style={{ padding: '10px', textAlign: 'right' }}>Fórmula (Kg)</th>
                                    <th style={{ padding: '10px', textAlign: 'right' }}>Real (Kg)</th>
                                    <th style={{ padding: '10px', textAlign: 'right' }}>Diferencia</th>
                                    <th style={{ padding: '10px', textAlign: 'right' }}>Merma (%)</th>
                                    <th style={{ padding: '10px' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {registros.map(registro => {
                                    const mermaStyle = getMermaColor(registro.porcentajeMerma);
                                    return (
                                        <tr key={registro.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '10px' }}>{registro.fecha}</td>
                                            <td style={{ padding: '10px' }}>{registro.repartidor}</td>
                                            <td style={{ padding: '10px', textAlign: 'right' }}>{registro.pesoFormula}</td>
                                            <td style={{ padding: '10px', textAlign: 'right' }}>{registro.pesoReal}</td>
                                            <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: registro.diferencia < 0 ? '#c62828' : '#2e7d32' }}>
                                                {registro.diferencia > 0 ? '+' : ''}{registro.diferencia}
                                            </td>
                                            <td style={{ padding: '10px', textAlign: 'right' }}>
                                                <span style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '12px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600',
                                                    backgroundColor: mermaStyle.bg,
                                                    color: mermaStyle.color
                                                }}>
                                                    {registro.porcentajeMerma > 0 ? '+' : ''}{registro.porcentajeMerma}%
                                                </span>
                                            </td>
                                            <td style={{ padding: '10px' }}>
                                                <button
                                                    onClick={() => handleEdit(registro)}
                                                    style={{ marginRight: '5px', padding: '4px 8px', cursor: 'pointer', border: '1px solid #2196f3', backgroundColor: '#e3f2fd', borderRadius: '4px' }}
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(registro.id)}
                                                    style={{ padding: '4px 8px', cursor: 'pointer', border: '1px solid #f44336', backgroundColor: '#ffebee', borderRadius: '4px' }}
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal de Registro */}
            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? "Editar Registro" : "Nuevo Registro de Merma"}>
                <form onSubmit={handleSubmit} style={{
                    display: 'flex',

                    flexDirection: 'column', gap: '1rem'
                }}>
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
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Repartidor *</label>
                            <select
                                required
                                value={formData.repartidor}
                                onChange={(e) => setFormData({ ...formData, repartidor: e.target.value })}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            >
                                {REPARTIDORES.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Peso según Fórmula (Kg) *</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={formData.pesoFormula}
                                onChange={(e) => setFormData({ ...formData, pesoFormula: e.target.value })}
                                placeholder="1000"
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Peso Real Pesado (Kg) *</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={formData.pesoReal}
                                onChange={(e) => setFormData({ ...formData, pesoReal: e.target.value })}
                                placeholder="1050"
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>
                    </div>

                    {/* Cálculo en tiempo real */}
                    {formData.pesoFormula && formData.pesoReal && (
                        <div style={{ padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
                            <p style={{ fontSize: '0.9rem', marginBottom: '5px' }}>
                                <strong>Diferencia:</strong> {(parseFloat(formData.pesoReal) - parseFloat(formData.pesoFormula)).toFixed(2)} Kg
                            </p>
                            <p style={{ fontSize: '0.9rem' }}>
                                <strong>Merma:</strong> {(((parseFloat(formData.pesoReal) - parseFloat(formData.pesoFormula)) / parseFloat(formData.pesoFormula)) * 100).toFixed(2)}%
                            </p>
                        </div>
                    )}

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Observaciones</label>
                        <textarea
                            value={formData.observaciones}
                            onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                            placeholder="Notas adicionales..."
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '80px' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                            Guardar
                        </button>
                        <button
                            type="button"
                            onClick={closeModal}
                            style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff', cursor: 'pointer' }}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
