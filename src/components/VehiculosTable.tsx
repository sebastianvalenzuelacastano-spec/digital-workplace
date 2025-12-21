'use client';

import { useState, useEffect } from 'react';
import Modal from './Modal';
import MaintenanceModal from './MaintenanceModal';
import { useDashboard } from '@/context/DashboardContext';
import type { Vehiculo } from '@/types/dashboard';
import { formatDate } from '@/lib/dateUtils';

export default function VehiculosTable() {
    const {
        vehiculos, addVehiculo, updateVehiculo, deleteVehiculo,
        mantenimientosVehiculos, addMantenimientoVehiculo, deleteMantenimientoVehiculo
    } = useDashboard();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [filtroEstado, setFiltroEstado] = useState<string>('');
    const [formData, setFormData] = useState<Partial<Vehiculo>>({
        patente: '',
        marca: '',
        modelo: '',
        anio: new Date().getFullYear(),
        tipo: 'Furgón',
        kilometraje: 0,
        proximaRevisionTecnica: '',
        vencimientoSeguro: '',
        vencimientoPermisoCirculacion: '',
        estado: 'Operativo',
        conductorAsignado: '',
        observaciones: '',
        activo: true
    });

    const [showMaintenance, setShowMaintenance] = useState(false);
    const [selectedVehiculoForMaintenance, setSelectedVehiculoForMaintenance] = useState<Vehiculo | null>(null);

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
            updateVehiculo(editingId, formData as Vehiculo);
        } else {
            addVehiculo(formData as Vehiculo);
        }

        handleCloseModal();
    };

    const handleEdit = (vehiculo: Vehiculo) => {
        setEditingId(vehiculo.id);
        setFormData(vehiculo);
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Estás seguro de eliminar este vehículo?')) {
            deleteVehiculo(id);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({
            patente: '',
            marca: '',
            modelo: '',
            anio: new Date().getFullYear(),
            tipo: 'Furgón',
            kilometraje: 0,
            proximaRevisionTecnica: '',
            vencimientoSeguro: '',
            vencimientoPermisoCirculacion: '',
            estado: 'Operativo',
            conductorAsignado: '',
            observaciones: '',
            activo: true
        });
    };

    const handleOpenMaintenance = (vehiculo: Vehiculo) => {
        setSelectedVehiculoForMaintenance(vehiculo);
        setShowMaintenance(true);
    };

    const filteredVehiculos = filtroEstado
        ? vehiculos.filter(v => v.estado === filtroEstado && v.activo)
        : vehiculos.filter(v => v.activo);

    const getEstadoBadge = (estado: string) => {
        const colors = {
            'Operativo': '#4caf50',
            'En Taller': '#ff9800',
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

    // Calculate days until expiration helper
    const getDaysUntil = (dateString: string) => {
        if (!dateString) return 999;
        const today = new Date();
        const target = new Date(dateString);
        const diffTime = target.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const getExpiryClass = (days: number) => {
        if (days < 0) return { color: '#f44336', fontWeight: 'bold' }; // Expired
        if (days < 30) return { color: '#ff9800', fontWeight: 'bold' }; // Warning (Orange)
        return { color: '#4caf50' }; // OK (Green)
    };

    return (
        <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h3>🚚 Control de Vehículos</h3>
                    <p style={{ color: '#666', fontSize: '0.9rem', margin: '0.5rem 0' }}>
                        Total: {vehiculos.filter(v => v.activo).length} vehículos |
                        Operativos: {vehiculos.filter(v => v.estado === 'Operativo' && v.activo).length}
                    </p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setIsModalOpen(true)}
                >
                    + Nuevo Vehículo
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
                    onClick={() => setFiltroEstado('En Taller')}
                    style={{
                        padding: '6px 12px',
                        border: filtroEstado === 'En Taller' ? '2px solid #ff9800' : '1px solid #ddd',
                        backgroundColor: filtroEstado === 'En Taller' ? '#fff3e0' : '#fff',
                        borderRadius: '6px',
                        cursor: 'pointer'
                    }}
                >
                    En Taller
                </button>
            </div>

            {/* Tabla */}
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                            <th style={{ padding: '10px' }}>Vehículo</th>
                            <th style={{ padding: '10px' }}>Patente</th>
                            <th style={{ padding: '10px' }}>Conductor</th>
                            <th style={{ padding: '10px' }}>Vencimientos (RT / Seg / PC)</th>
                            <th style={{ padding: '10px' }}>Estado</th>
                            <th style={{ padding: '10px' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredVehiculos.map((vehiculo) => {
                            const daysRT = getDaysUntil(vehiculo.proximaRevisionTecnica);
                            const daysSeg = getDaysUntil(vehiculo.vencimientoSeguro);
                            const daysPC = getDaysUntil(vehiculo.vencimientoPermisoCirculacion);

                            return (
                                <tr key={vehiculo.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '10px' }}>
                                        <div style={{ fontWeight: 'bold' }}>{vehiculo.marca} {vehiculo.modelo}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#666' }}>{vehiculo.anio} • {vehiculo.tipo} • {vehiculo.kilometraje.toLocaleString()} km</div>
                                    </td>
                                    <td style={{ padding: '10px', fontWeight: 'bold', fontFamily: 'monospace' }}>{vehiculo.patente}</td>
                                    <td style={{ padding: '10px' }}>{vehiculo.conductorAsignado || '-'}</td>
                                    <td style={{ padding: '10px', fontSize: '0.85rem' }}>
                                        <div style={getExpiryClass(daysRT)}>RT: {formatDate(vehiculo.proximaRevisionTecnica)} ({daysRT}d)</div>
                                        <div style={getExpiryClass(daysSeg)}>SEG: {formatDate(vehiculo.vencimientoSeguro)} ({daysSeg}d)</div>
                                        <div style={getExpiryClass(daysPC)}>PC: {formatDate(vehiculo.vencimientoPermisoCirculacion)} ({daysPC}d)</div>
                                    </td>
                                    <td style={{ padding: '10px' }}>
                                        <span style={getEstadoBadge(vehiculo.estado)}>
                                            {vehiculo.estado}
                                        </span>
                                    </td>
                                    <td style={{ padding: '10px' }}>
                                        <button
                                            onClick={() => handleOpenMaintenance(vehiculo)}
                                            style={{ marginRight: '5px', padding: '4px 8px', cursor: 'pointer', border: '1px solid #ff9800', backgroundColor: '#fff3e0', borderRadius: '4px' }}
                                            title="Historial de Mantenimientos"
                                        >
                                            🛠️
                                        </button>
                                        <button
                                            onClick={() => handleEdit(vehiculo)}
                                            style={{ marginRight: '5px', padding: '4px 8px', cursor: 'pointer', border: '1px solid #2196f3', backgroundColor: '#e3f2fd', borderRadius: '4px' }}
                                            title="Editar"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => handleDelete(vehiculo.id)}
                                            style={{ padding: '4px 8px', cursor: 'pointer', border: '1px solid #f44336', backgroundColor: '#ffebee', borderRadius: '4px' }}
                                            title="Eliminar"
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

            {/* Modal */}
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingId ? "Editar Vehículo" : "Nuevo Vehículo"}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Patente *</label>
                            <input
                                type="text"
                                required
                                value={formData.patente}
                                onChange={(e) => setFormData({ ...formData, patente: e.target.value.toUpperCase() })}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                placeholder="ABCD-12"
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
                                <option value="Furgón">Furgón</option>
                                <option value="Camioneta">Camioneta</option>
                                <option value="Camión">Camión</option>
                                <option value="Automóvil">Automóvil</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
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
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Año *</label>
                            <input
                                type="number"
                                required
                                value={formData.anio}
                                onChange={(e) => setFormData({ ...formData, anio: Number(e.target.value) })}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Kilometraje *</label>
                            <input
                                type="number"
                                required
                                value={formData.kilometraje}
                                onChange={(e) => setFormData({ ...formData, kilometraje: Number(e.target.value) })}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Conductor Asignado</label>
                            <input
                                type="text"
                                value={formData.conductorAsignado}
                                onChange={(e) => setFormData({ ...formData, conductorAsignado: e.target.value })}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>
                    </div>

                    <div style={{ backgroundColor: '#f5f5f5', padding: '1rem', borderRadius: '6px' }}>
                        <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem' }}>📅 Vencimientos</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.8rem' }}>Rev. Técnica</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.proximaRevisionTecnica}
                                    onChange={(e) => setFormData({ ...formData, proximaRevisionTecnica: e.target.value })}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.8rem' }}>Seguro</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.vencimientoSeguro}
                                    onChange={(e) => setFormData({ ...formData, vencimientoSeguro: e.target.value })}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.8rem' }}>Perm. Circulación</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.vencimientoPermisoCirculacion}
                                    onChange={(e) => setFormData({ ...formData, vencimientoPermisoCirculacion: e.target.value })}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Estado *</label>
                        <select
                            required
                            value={formData.estado}
                            onChange={(e) => setFormData({ ...formData, estado: e.target.value as any })}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        >
                            <option value="Operativo">Operativo</option>
                            <option value="En Taller">En Taller</option>
                            <option value="Fuera de Servicio">Fuera de Servicio</option>
                        </select>
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
            {selectedVehiculoForMaintenance && (
                <MaintenanceModal
                    isOpen={showMaintenance}
                    onClose={() => {
                        setShowMaintenance(false);
                        setSelectedVehiculoForMaintenance(null);
                    }}
                    title="Historial de Mantenimientos"
                    entityInfo={`${selectedVehiculoForMaintenance.marca} ${selectedVehiculoForMaintenance.modelo} (${selectedVehiculoForMaintenance.patente})`}
                    type="vehiculo"
                    records={mantenimientosVehiculos.filter(m => m.vehiculoId === selectedVehiculoForMaintenance.id)}
                    onAdd={(record) => addMantenimientoVehiculo({ ...record, vehiculoId: selectedVehiculoForMaintenance.id })}
                    onDelete={deleteMantenimientoVehiculo}
                />
            )}
        </div>
    );
}
