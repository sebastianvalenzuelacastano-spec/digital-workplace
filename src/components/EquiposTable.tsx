'use client';

import { useState, useEffect } from 'react';
import Modal from './Modal';
import MaintenanceModal from './MaintenanceModal';
import { useDashboard } from '@/context/DashboardContext';
import type { Equipo } from '@/types/dashboard';
import { formatDate } from '@/lib/dateUtils';

export default function EquiposTable() {
    const {
        equipos, addEquipo, updateEquipo, deleteEquipo,
        mantenimientos, addMantenimiento, deleteMantenimiento
    } = useDashboard();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [filtroEstado, setFiltroEstado] = useState<string>('');
    const [formData, setFormData] = useState<Partial<Equipo>>({
        codigo: '',
        nombre: '',
        tipo: 'Horno',
        marca: '',
        modelo: '',
        numeroSerie: '',
        fechaCompra: '', // Kept in state but hidden in form
        proveedor: '',
        estado: 'Operativo',
        ubicacion: 'Producción',
        garantiaHasta: '',
        valorCompra: 0, // Kept in state but hidden in form
        observaciones: '',
        activo: true
    });

    const [showMaintenance, setShowMaintenance] = useState(false);
    const [selectedEquipoForMaintenance, setSelectedEquipoForMaintenance] = useState<Equipo | null>(null);

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

        if (editingId) {
            updateEquipo(editingId, formData as Equipo);
        } else {
            addEquipo(formData as Equipo);
        }

        handleCloseModal();
    };

    const handleEdit = (equipo: Equipo) => {
        setEditingId(equipo.id);
        setFormData(equipo);
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Estás seguro de eliminar este equipo?')) {
            deleteEquipo(id);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({
            codigo: '',
            nombre: '',
            tipo: 'Horno',
            marca: '',
            modelo: '',
            numeroSerie: '',
            fechaCompra: '',
            proveedor: '',
            estado: 'Operativo',
            ubicacion: 'Producción',
            garantiaHasta: '',
            valorCompra: 0,
            observaciones: '',
            activo: true
        });
    };

    const handleOpenMaintenance = (equipo: Equipo) => {
        setSelectedEquipoForMaintenance(equipo);
        setShowMaintenance(true);
    };

    const filteredEquipos = filtroEstado
        ? equipos.filter(e => e.estado === filtroEstado && e.activo)
        : equipos.filter(e => e.activo);

    const getEstadoBadge = (estado: string) => {
        const colors = {
            'Operativo': '#4caf50',
            'En Mantenimiento': '#ff9800',
            'Fuera de Servicio': '#f44336'
        };
        return {
            backgroundColor: colors[estado as keyof typeof colors] + '20',
            color: colors[estado as keyof typeof colors],
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '0.85rem',
            fontWeight: 'bold'
        };
    };

    return (
        <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h3>⚙️ Gestión de Equipos</h3>
                    <p style={{ color: '#666', fontSize: '0.9rem', margin: '0.5rem 0' }}>
                        Total: {equipos.filter(e => e.activo).length} equipos |
                        Operativos: {equipos.filter(e => e.estado === 'Operativo' && e.activo).length}
                    </p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setIsModalOpen(true)}
                >
                    + Nuevo Equipo
                </button>
            </div>

            {/* Filtros */}
            <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                    onClick={() => setFiltroEstado('')}
                    style={{
                        padding: '6px 12px',
                        border: filtroEstado === '' ? '2px solid var(--color-primary)' : '1px solid #ddd',
                        backgroundColor: filtroEstado === '' ? '#e3f2fd' : '#fff',
                        borderRadius: '6px',
                        cursor: 'pointer'
                    }}
                >
                    Todos
                </button>
                <button
                    onClick={() => setFiltroEstado('Operativo')}
                    style={{
                        padding: '6px 12px',
                        border: filtroEstado === 'Operativo' ? '2px solid #4caf50' : '1px solid #ddd',
                        backgroundColor: filtroEstado === 'Operativo' ? '#e8f5e9' : '#fff',
                        borderRadius: '6px',
                        cursor: 'pointer'
                    }}
                >
                    Operativo
                </button>
                <button
                    onClick={() => setFiltroEstado('En Mantenimiento')}
                    style={{
                        padding: '6px 12px',
                        border: filtroEstado === 'En Mantenimiento' ? '2px solid #ff9800' : '1px solid #ddd',
                        backgroundColor: filtroEstado === 'En Mantenimiento' ? '#fff3e0' : '#fff',
                        borderRadius: '6px',
                        cursor: 'pointer'
                    }}
                >
                    En Mantenimiento
                </button>
            </div>

            {/* Tabla */}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                        <th style={{ padding: '10px' }}>Código</th>
                        <th style={{ padding: '10px' }}>Nombre</th>
                        <th style={{ padding: '10px' }}>Tipo</th>
                        <th style={{ padding: '10px' }}>Ubicación</th>
                        <th style={{ padding: '10px' }}>Estado</th>
                        <th style={{ padding: '10px' }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredEquipos.map((equipo) => (
                        <tr key={equipo.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '10px', fontWeight: 'bold' }}>{equipo.codigo}</td>
                            <td style={{ padding: '10px' }}>{equipo.nombre}</td>
                            <td style={{ padding: '10px' }}>{equipo.tipo}</td>
                            <td style={{ padding: '10px' }}>{equipo.ubicacion}</td>
                            <td style={{ padding: '10px' }}>
                                <span style={getEstadoBadge(equipo.estado)}>
                                    {equipo.estado}
                                </span>
                            </td>
                            <td style={{ padding: '10px' }}>
                                <button
                                    onClick={() => handleOpenMaintenance(equipo)}
                                    style={{ marginRight: '5px', padding: '4px 8px', cursor: 'pointer', border: '1px solid #ff9800', backgroundColor: '#fff3e0', borderRadius: '4px' }}
                                    title="Historial de Mantenimientos"
                                >
                                    🛠️
                                </button>
                                <button
                                    onClick={() => handleEdit(equipo)}
                                    style={{ marginRight: '5px', padding: '4px 8px', cursor: 'pointer', border: '1px solid #2196f3', backgroundColor: '#e3f2fd', borderRadius: '4px' }}
                                    title="Editar"
                                >
                                    ✏️
                                </button>
                                <button
                                    onClick={() => handleDelete(equipo.id)}
                                    style={{ padding: '4px 8px', cursor: 'pointer', border: '1px solid #f44336', backgroundColor: '#ffebee', borderRadius: '4px' }}
                                    title="Eliminar"
                                >
                                    🗑️
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Modal */}
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingId ? "Editar Equipo" : "Nuevo Equipo"}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Código *</label>
                            <input
                                type="text"
                                required
                                value={formData.codigo}
                                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                placeholder="EQ-001"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Tipo *</label>
                            <select
                                required
                                value={formData.tipo}
                                onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            >
                                <option value="Horno">Horno</option>
                                <option value="Amasadora">Amasadora</option>
                                <option value="Batidora">Batidora</option>
                                <option value="Refrigerador">Refrigerador</option>
                                <option value="Otro">Otro</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Nombre *</label>
                        <input
                            type="text"
                            required
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            placeholder="Horno Industrial Marca X"
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Marca *</label>
                            <input
                                type="text"
                                required
                                value={formData.marca}
                                onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Modelo *</label>
                            <input
                                type="text"
                                required
                                value={formData.modelo}
                                onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Proveedor</label>
                            <input
                                type="text"
                                value={formData.proveedor}
                                onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Estado *</label>
                            <select
                                required
                                value={formData.estado}
                                onChange={(e) => setFormData({ ...formData, estado: e.target.value as any })}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            >
                                <option value="Operativo">Operativo</option>
                                <option value="En Mantenimiento">En Mantenimiento</option>
                                <option value="Fuera de Servicio">Fuera de Servicio</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Ubicación *</label>
                            <select
                                required
                                value={formData.ubicacion}
                                onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value as any })}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            >
                                <option value="Producción">Producción</option>
                                <option value="Bodega">Bodega</option>
                                <option value="Ventas">Ventas</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Observaciones</label>
                        <textarea
                            rows={2}
                            value={formData.observaciones}
                            onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
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

            {/* Modal de Mantenimiento */}
            {selectedEquipoForMaintenance && (
                <MaintenanceModal
                    isOpen={showMaintenance}
                    onClose={() => {
                        setShowMaintenance(false);
                        setSelectedEquipoForMaintenance(null);
                    }}
                    title="Historial de Mantenimientos"
                    entityInfo={`${selectedEquipoForMaintenance.nombre} (${selectedEquipoForMaintenance.codigo})`}
                    type="equipo"
                    records={mantenimientos.filter(m => m.equipoId === selectedEquipoForMaintenance.id)}
                    onAdd={(record) => addMantenimiento({ ...record, equipoId: selectedEquipoForMaintenance.id })}
                    onDelete={deleteMantenimiento}
                />
            )}
        </div>
    );
}
