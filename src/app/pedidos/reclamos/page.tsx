'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Reclamo {
    id: number;
    fechaIncidente: string;
    horaIncidente: string;
    tipo: string;
    area: string;
    descripcion: string;
    imagenes: string[];
    estado: string;
    fechaCreacion: string;
    respuesta: string | null;
    fechaRespuesta: string | null;
}

interface ClientData {
    id: number;
    casinoNombre: string;
}

export default function ReclamosPage() {
    const [clientData, setClientData] = useState<ClientData | null>(null);
    const [reclamos, setReclamos] = useState<Reclamo[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReclamo, setSelectedReclamo] = useState<Reclamo | null>(null);

    useEffect(() => {
        const data = localStorage.getItem('clientData');
        if (data) {
            const client = JSON.parse(data);
            setClientData(client);
            loadReclamos(client.id);
        }
    }, []);

    const loadReclamos = async (casinoId: number) => {
        try {
            const response = await fetch(`/api/reclamos?casinoId=${casinoId}`);
            const data = await response.json();
            setReclamos(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error loading reclamos:', error);
        } finally {
            setLoading(false);
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

    if (loading) {
        return <div style={{ padding: '20px' }}>Cargando...</div>;
    }

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>📋 Mis Reclamos y Sugerencias</h2>
                <Link
                    href="/pedidos/reclamos/nuevo"
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#ff9800',
                        color: '#fff',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        fontWeight: '600'
                    }}
                >
                    + Nuevo Reclamo o Sugerencia
                </Link>
            </div>

            {reclamos.length === 0 ? (
                <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '12px', textAlign: 'center' }}>
                    <p style={{ color: '#888', marginBottom: '20px' }}>No tienes reclamos registrados</p>
                    <Link
                        href="/pedidos/reclamos/nuevo"
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#ff9800',
                            color: '#fff',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            fontWeight: '600'
                        }}
                    >
                        Crear Primer Reclamo o Sugerencia
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {reclamos.map(reclamo => {
                        const estadoStyle = getEstadoColor(reclamo.estado);
                        return (
                            <div
                                key={reclamo.id}
                                style={{
                                    backgroundColor: '#fff',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                    cursor: 'pointer'
                                }}
                                onClick={() => setSelectedReclamo(reclamo)}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                                    <div>
                                        <div style={{ marginBottom: '8px' }}>
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                fontSize: '0.85rem',
                                                fontWeight: '600',
                                                marginRight: '10px',
                                                backgroundColor: reclamo.tipo === 'Reclamo' ? '#ffebee' : '#e3f2fd',
                                                color: reclamo.tipo === 'Reclamo' ? '#c62828' : '#1976d2'
                                            }}>
                                                {reclamo.tipo}
                                            </span>
                                        </div>
                                        <h3 style={{ marginBottom: '5px', fontSize: '1.1rem' }}>
                                            {reclamo.area}
                                        </h3>
                                        <p style={{ fontSize: '0.9rem', color: '#666' }}>
                                            Incidente: {reclamo.fechaIncidente} a las {reclamo.horaIncidente}
                                        </p>
                                    </div>
                                    <span style={{
                                        padding: '6px 12px',
                                        borderRadius: '6px',
                                        fontWeight: '600',
                                        fontSize: '0.85rem',
                                        backgroundColor: estadoStyle.bg,
                                        color: estadoStyle.color
                                    }}>
                                        {reclamo.estado}
                                    </span>
                                </div>

                                <p style={{ color: '#333', marginBottom: '10px', lineHeight: '1.5' }}>
                                    {reclamo.descripcion.length > 150
                                        ? reclamo.descripcion.substring(0, 150) + '...'
                                        : reclamo.descripcion}
                                </p>

                                {reclamo.imagenes && reclamo.imagenes.length > 0 && (
                                    <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
                                        {reclamo.imagenes.slice(0, 3).map((img, idx) => (
                                            <img
                                                key={idx}
                                                src={img}
                                                alt={`Imagen ${idx + 1}`}
                                                style={{
                                                    width: '60px',
                                                    height: '60px',
                                                    objectFit: 'cover',
                                                    borderRadius: '4px',
                                                    border: '1px solid #ddd'
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}

                                <div style={{ fontSize: '0.85rem', color: '#888' }}>
                                    Creado el {reclamo.fechaCreacion}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Detail Modal */}
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
                            maxWidth: '600px',
                            width: '100%',
                            maxHeight: '80vh',
                            overflow: 'auto'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
                            <h3>Detalles del Reclamo</h3>
                            <button
                                onClick={() => setSelectedReclamo(null)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '1.5rem',
                                    cursor: 'pointer',
                                    color: '#666'
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <strong>Área:</strong> {selectedReclamo.area}
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <strong>Fecha y Hora del Incidente:</strong><br />
                            {selectedReclamo.fechaIncidente} a las {selectedReclamo.horaIncidente}
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <strong>Estado:</strong>{' '}
                            <span style={{
                                ...getEstadoColor(selectedReclamo.estado),
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontWeight: '600'
                            }}>
                                {selectedReclamo.estado}
                            </span>
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <strong>Descripción:</strong><br />
                            <p style={{ marginTop: '8px', lineHeight: '1.6' }}>{selectedReclamo.descripcion}</p>
                        </div>

                        {selectedReclamo.imagenes && selectedReclamo.imagenes.length > 0 && (
                            <div style={{ marginBottom: '15px' }}>
                                <strong>Imágenes:</strong><br />
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
                                                border: '2px solid #ddd',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => window.open(img, '_blank')}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedReclamo.respuesta && (
                            <div style={{
                                marginTop: '20px',
                                padding: '15px',
                                backgroundColor: '#e8f5e9',
                                borderRadius: '8px',
                                borderLeft: '4px solid #4caf50'
                            }}>
                                <strong style={{ color: '#2e7d32' }}>Respuesta:</strong><br />
                                <p style={{ marginTop: '8px', lineHeight: '1.6' }}>{selectedReclamo.respuesta}</p>
                                <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '8px' }}>
                                    Respondido el {selectedReclamo.fechaRespuesta}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
