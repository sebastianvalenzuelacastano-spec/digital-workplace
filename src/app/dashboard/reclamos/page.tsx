'use client';

import { useState, useEffect } from 'react';

interface Reclamo {
    id: number;
    casinoId: number;
    empresaId: number;
    fechaIncidente: string;
    horaIncidente: string;
    tipo: string;
    area: string;
    email: string;
    descripcion: string;
    imagenes: string[];
    estado: string;
    fechaCreacion: string;
    respuesta: string | null;
    fechaRespuesta: string | null;
}

export default function GestionReclamosPage() {
    const [reclamos, setReclamos] = useState<Reclamo[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('');
    const [selectedReclamo, setSelectedReclamo] = useState<Reclamo | null>(null);
    const [respuesta, setRespuesta] = useState('');
    const [nuevoEstado, setNuevoEstado] = useState('');

    useEffect(() => {
        loadReclamos();
    }, []);

    const loadReclamos = async () => {
        try {
            const response = await fetch('/api/reclamos');
            const data = await response.json();
            setReclamos(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateReclamo = async () => {
        if (!selectedReclamo) return;

        try {
            const response = await fetch('/api/reclamos', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: selectedReclamo.id,
                    estado: nuevoEstado || selectedReclamo.estado,
                    respuesta: respuesta || undefined
                })
            });

            if (response.ok) {
                alert('Reclamo actualizado exitosamente');
                setSelectedReclamo(null);
                setRespuesta('');
                setNuevoEstado('');
                loadReclamos();
            } else {
                alert('Error al actualizar');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al actualizar');
        }
    };

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case 'Pendiente': return { bg: '#fff3e0', color: '#e65100' };
            case 'En Revisión': return { bg: '#e3f2fd', color: '#1565c0' };
            case 'Resuelto': return { bg: '#e8f5e9', color: '#2e7d32' };
            default: return { bg: '#f5f5f5', color: '#666' };
        }
    };

    const filteredReclamos = filter
        ? reclamos.filter(r => r.estado === filter)
        : reclamos;

    const stats = {
        total: reclamos.length,
        pendiente: reclamos.filter(r => r.estado === 'Pendiente').length,
        revision: reclamos.filter(r => r.estado === 'En Revisión').length,
        resuelto: reclamos.filter(r => r.estado === 'Resuelto').length
    };

    if (loading) {
        return <div style={{ padding: '20px' }}>Cargando...</div>;
    }

    return (
        <div>
            <h2 style={{ marginBottom: '20px' }}>📝 Gestión de Reclamos y Sugerencias</h2>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '20px' }}>
                <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#333' }}>{stats.total}</div>
                    <div style={{ color: '#666' }}>Total</div>
                </div>
                <div style={{ backgroundColor: '#fff3e0', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#e65100' }}>{stats.pendiente}</div>
                    <div style={{ color: '#e65100' }}>Pendientes</div>
                </div>
                <div style={{ backgroundColor: '#e3f2fd', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1565c0' }}>{stats.revision}</div>
                    <div style={{ color: '#1565c0' }}>En Revisión</div>
                </div>
                <div style={{ backgroundColor: '#e8f5e9', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2e7d32' }}>{stats.resuelto}</div>
                    <div style={{ color: '#2e7d32' }}>Resueltos</div>
                </div>
            </div>

            {/* Filters */}
            <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>
                <label style={{ marginRight: '10px', fontWeight: '600' }}>Filtrar por estado:</label>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #ddd'
                    }}
                >
                    <option value="">Todos</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="En Revisión">En Revisión</option>
                    <option value="Resuelto">Resuelto</option>
                </select>
            </div>

            {/* Reclamos List */}
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#f5f5f5' }}>
                        <tr>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Fecha Incidente</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Tipo</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Área</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Descripción</th>
                            <th style={{ padding: '15px', textAlign: 'center' }}>Estado</th>
                            <th style={{ padding: '15px', textAlign: 'center' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredReclamos.map((reclamo) => {
                            const estadoStyle = getEstadoColor(reclamo.estado);
                            return (
                                <tr key={reclamo.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                    <td style={{ padding: '15px' }}>
                                        {reclamo.fechaIncidente}<br />
                                        <span style={{ fontSize: '0.85rem', color: '#666' }}>{reclamo.horaIncidente}</span>
                                    </td>
                                    <td style={{ padding: '15px' }}>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '0.85rem',
                                            fontWeight: '600',
                                            backgroundColor: reclamo.tipo === 'Reclamo' ? '#ffebee' : '#e3f2fd',
                                            color: reclamo.tipo === 'Reclamo' ? '#c62828' : '#1976d2'
                                        }}>
                                            {reclamo.tipo}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px' }}>{reclamo.area}</td>
                                    <td style={{ padding: '15px', maxWidth: '300px' }}>
                                        {reclamo.descripcion.length > 80
                                            ? reclamo.descripcion.substring(0, 80) + '...'
                                            : reclamo.descripcion}
                                    </td>
                                    <td style={{ padding: '15px', textAlign: 'center' }}>
                                        <span style={{
                                            padding: '6px 12px',
                                            borderRadius: '6px',
                                            fontWeight: '600',
                                            fontSize: '0.85rem',
                                            ...estadoStyle
                                        }}>
                                            {reclamo.estado}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px', textAlign: 'center' }}>
                                        <button
                                            onClick={() => {
                                                setSelectedReclamo(reclamo);
                                                setNuevoEstado(reclamo.estado);
                                                setRespuesta(reclamo.respuesta || '');
                                            }}
                                            style={{
                                                padding: '6px 12px',
                                                backgroundColor: '#1976d2',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Ver/Editar
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {filteredReclamos.length === 0 && (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                        No hay reclamos {filter ? `con estado "${filter}"` : ''}
                    </div>
                )}
            </div>

            {/* Detail/Edit Modal */}
            {selectedReclamo && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '20px'
                    }}
                    onClick={() => setSelectedReclamo(null)}
                >
                    <div
                        style={{
                            backgroundColor: '#fff',
                            borderRadius: '12px',
                            padding: '30px',
                            maxWidth: '700px',
                            width: '100%',
                            maxHeight: '90vh',
                            overflow: 'auto'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h3>Detalle del Reclamo #{selectedReclamo.id}</h3>
                            <button
                                onClick={() => setSelectedReclamo(null)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '1.5rem',
                                    cursor: 'pointer'
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                            <p><strong>Tipo:</strong> {selectedReclamo.tipo}</p>
                            <p><strong>Fecha/Hora Incidente:</strong> {selectedReclamo.fechaIncidente} {selectedReclamo.horaIncidente}</p>
                            <p><strong>Área:</strong> {selectedReclamo.area}</p>
                            <p><strong>Email de Contacto:</strong> {selectedReclamo.email}</p>
                            <p><strong>Casino ID:</strong> {selectedReclamo.casinoId}</p>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <strong>Descripción:</strong>
                            <p style={{ marginTop: '8px', padding: '10px', backgroundColor: '#fafafa', borderRadius: '6px' }}>
                                {selectedReclamo.descripcion}
                            </p>
                        </div>

                        {selectedReclamo.imagenes && selectedReclamo.imagenes.length > 0 && (
                            <div style={{ marginBottom: '20px' }}>
                                <strong>Imágenes:</strong>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                                    {selectedReclamo.imagenes.map((img, idx) => (
                                        <img
                                            key={idx}
                                            src={img}
                                            alt={`Imagen ${idx + 1}`}
                                            style={{
                                                width: '150px',
                                                height: '150px',
                                                objectFit: 'cover',
                                                borderRadius: '8px',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => window.open(img, '_blank')}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                Estado:
                            </label>
                            <select
                                value={nuevoEstado}
                                onChange={(e) => setNuevoEstado(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '6px',
                                    border: '1px solid #ddd'
                                }}
                            >
                                <option value="Pendiente">Pendiente</option>
                                <option value="En Revisión">En Revisión</option>
                                <option value="Resuelto">Resuelto</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                Respuesta:
                            </label>
                            <textarea
                                value={respuesta}
                                onChange={(e) => setRespuesta(e.target.value)}
                                placeholder="Escribir respuesta al cliente..."
                                rows={4}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '6px',
                                    border: '1px solid #ddd',
                                    fontFamily: 'inherit',
                                    resize: 'vertical'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setSelectedReclamo(null)}
                                style={{
                                    padding: '10px 20px',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    backgroundColor: '#fff',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleUpdateReclamo}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#4caf50',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
