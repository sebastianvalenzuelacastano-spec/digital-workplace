'use client';

import { useState } from 'react';
import Modal from './Modal';
import { formatDate } from '@/lib/dateUtils';
import type { Mantenimiento, MantenimientoVehiculo } from '@/types/dashboard';

interface MaintenanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    entityInfo: string; // e.g., "Horno 1" or "Furgón ABCD-12"
    type: 'equipo' | 'vehiculo';
    records: (Mantenimiento | MantenimientoVehiculo)[];
    onAdd: (record: any) => void;
    onDelete: (id: number) => void;
}

export default function MaintenanceModal({
    isOpen,
    onClose,
    title,
    entityInfo,
    type,
    records,
    onAdd,
    onDelete
}: MaintenanceModalProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [newRecord, setNewRecord] = useState<any>({
        fecha: new Date().toISOString().split('T')[0],
        tipo: 'Preventivo',
        descripcion: '',
        costo: 0,
        observaciones: '',
        repuestos: '', // spare parts used
        // Specific fields
        tecnico: '', // Equipo
        empresaExterna: '', // Equipo
        kilometraje: 0, // Vehiculo
        taller: '' // Vehiculo
    });

    const resetForm = () => {
        setNewRecord({
            fecha: new Date().toISOString().split('T')[0],
            tipo: 'Preventivo',
            descripcion: '',
            costo: 0,
            observaciones: '',
            repuestos: '', // spare parts used
            tecnico: '',
            empresaExterna: '',
            kilometraje: 0,
            taller: ''
        });
        setIsAdding(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd(newRecord);
        resetForm();
    };

    // Sort records by date descending
    const sortedRecords = [...records].sort((a, b) =>
        new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div style={{ display: 'flex', flexDirection: 'column', height: '80vh', maxWidth: '900px' }}>
                <div style={{ marginBottom: '1rem', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                    <strong>Item:</strong> {entityInfo}
                </div>

                {!isAdding ? (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0 }}>Historial</h3>
                            <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
                                + Registrar Mantenimiento
                            </button>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            {sortedRecords.length === 0 ? (
                                <p style={{ color: '#666', fontStyle: 'italic', textAlign: 'center', padding: '2rem' }}>
                                    No hay registros de mantenimiento.
                                </p>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ position: 'sticky', top: 0, backgroundColor: '#fff' }}>
                                        <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                                            <th style={{ padding: '8px' }}>Fecha</th>
                                            <th style={{ padding: '8px' }}>Tipo</th>
                                            <th style={{ padding: '8px' }}>Descripción</th>
                                            {type === 'vehiculo' && <th style={{ padding: '8px' }}>Km</th>}
                                            <th style={{ padding: '8px' }}>Realizado por</th>
                                            <th style={{ padding: '8px' }}>Repuestos</th>
                                            <th style={{ padding: '8px' }}>Costo</th>
                                            <th style={{ padding: '8px' }}>Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedRecords.map((rec) => (
                                            <tr key={rec.id} style={{ borderBottom: '1px solid #eee' }}>
                                                <td style={{ padding: '8px' }}>{formatDate(rec.fecha)}</td>
                                                <td style={{ padding: '8px' }}>
                                                    <span style={{
                                                        backgroundColor: '#e3f2fd',
                                                        color: '#1565c0',
                                                        padding: '2px 8px',
                                                        borderRadius: '12px',
                                                        fontSize: '0.8rem'
                                                    }}>
                                                        {rec.tipo}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '8px' }}>{rec.descripcion}</td>
                                                {type === 'vehiculo' && (
                                                    <td style={{ padding: '8px' }}>
                                                        {(rec as MantenimientoVehiculo).kilometraje?.toLocaleString()} km
                                                    </td>
                                                )}
                                                <td style={{ padding: '8px' }}>
                                                    {type === 'equipo'
                                                        ? ((rec as Mantenimiento).tecnico || (rec as Mantenimiento).empresaExterna || '-')
                                                        : ((rec as MantenimientoVehiculo).taller || '-')
                                                    }
                                                </td>
                                                <td style={{ padding: '8px' }}>
                                                    {type === 'equipo'
                                                        ? ((rec as Mantenimiento).repuestos || '-')
                                                        : ((rec as MantenimientoVehiculo).repuestos || '-')
                                                    }
                                                </td>
                                                <td style={{ padding: '8px' }}>${rec.costo.toLocaleString()}</td>
                                                <td style={{ padding: '8px' }}>
                                                    <button
                                                        onClick={() => onDelete(rec.id)}
                                                        style={{ color: '#f44336', background: 'none', border: 'none', cursor: 'pointer' }}
                                                        title="Eliminar registro"
                                                    >
                                                        🗑️
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </>
                ) : (
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Nuevo Registro</h3>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Fecha *</label>
                                    <input
                                        type="date"
                                        required
                                        value={newRecord.fecha}
                                        onChange={(e) => setNewRecord({ ...newRecord, fecha: e.target.value })}
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Tipo *</label>
                                    <select
                                        required
                                        value={newRecord.tipo}
                                        onChange={(e) => setNewRecord({ ...newRecord, tipo: e.target.value })}
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                    >
                                        <option value="Preventivo">Preventivo</option>
                                        <option value="Correctivo">Correctivo</option>
                                        {type === 'equipo' ? (
                                            <option value="Calibración">Calibración</option>
                                        ) : (
                                            <>
                                                <option value="Cambio Aceite">Cambio Aceite</option>
                                                <option value="Neumáticos">Neumáticos</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Descripción *</label>
                                <input
                                    type="text"
                                    required
                                    value={newRecord.descripcion}
                                    onChange={(e) => setNewRecord({ ...newRecord, descripcion: e.target.value })}
                                    placeholder="Ej: Cambio de filtro, Reparación de motor..."
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Repuestos *</label>
                                <input
                                    type="text"
                                    value={newRecord.repuestos}
                                    onChange={(e) => setNewRecord({ ...newRecord, repuestos: e.target.value })}
                                    placeholder="Ej: Filtro, Correa..."
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                />
                            </div>

                            {type === 'vehiculo' && (
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Kilometraje Actual *</label>
                                    <input
                                        type="number"
                                        required
                                        value={newRecord.kilometraje}
                                        onChange={(e) => setNewRecord({ ...newRecord, kilometraje: Number(e.target.value) })}
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                    />
                                </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                {type === 'equipo' ? (
                                    <>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Técnico / Responsable</label>
                                            <input
                                                type="text"
                                                value={newRecord.tecnico}
                                                onChange={(e) => setNewRecord({ ...newRecord, tecnico: e.target.value })}
                                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Empresa Externa</label>
                                            <input
                                                type="text"
                                                value={newRecord.empresaExterna}
                                                onChange={(e) => setNewRecord({ ...newRecord, empresaExterna: e.target.value })}
                                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Taller / Lugar *</label>
                                        <input
                                            type="text"
                                            required
                                            value={newRecord.taller}
                                            onChange={(e) => setNewRecord({ ...newRecord, taller: e.target.value })}
                                            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                        />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Costo ($)</label>
                                <input
                                    type="number"
                                    value={newRecord.costo}
                                    onChange={(e) => setNewRecord({ ...newRecord, costo: Number(e.target.value) })}
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Observaciones</label>
                                <textarea
                                    value={newRecord.observaciones}
                                    onChange={(e) => setNewRecord({ ...newRecord, observaciones: e.target.value })}
                                    rows={3}
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                    Guardar Registro
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsAdding(false)}
                                    style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff', cursor: 'pointer' }}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </Modal>
    );
}
