'use client';

import { useState, useEffect } from 'react';
import type { PedidoCliente, DetallePedido } from '@/types/dashboard';

interface PedidoConDetalles extends PedidoCliente {
    detalles: DetallePedido[];
}

export default function HistorialPedidosPage() {
    const [pedidos, setPedidos] = useState<PedidoConDetalles[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPedido, setSelectedPedido] = useState<PedidoConDetalles | null>(null);

    useEffect(() => {
        loadPedidos();
    }, []);

    const loadPedidos = async () => {
        try {
            const clientData = JSON.parse(localStorage.getItem('clientData') || '{}');
            const res = await fetch(`/api/pedidos-clientes?casinoId=${clientData.id}`);
            const data = await res.json();

            // Sort by date descending
            const sorted = data.sort((a: PedidoCliente, b: PedidoCliente) =>
                new Date(b.fechaPedido).getTime() - new Date(a.fechaPedido).getTime()
            );

            setPedidos(sorted);
        } catch (error) {
            console.error('Error loading orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getEstadoBadge = (estado: string) => {
        const styles: Record<string, { bg: string; color: string }> = {
            pendiente: { bg: '#fff3e0', color: '#e65100' },
            confirmado: { bg: '#e3f2fd', color: '#1565c0' },
            en_produccion: { bg: '#e8f5e9', color: '#2e7d32' },
            entregado: { bg: '#e8f5e9', color: '#1b5e20' },
            cancelado: { bg: '#ffebee', color: '#c62828' },
            despachado: { bg: '#e0f7fa', color: '#006064' }
        };
        const style = styles[estado] || styles.pendiente;

        const labels: Record<string, string> = {
            pendiente: 'Pendiente',
            confirmado: 'Confirmado',
            en_produccion: 'En Producción',
            entregado: 'Entregado',
            cancelado: 'Cancelado',
            despachado: 'Despachado'
        };

        return (
            <span style={{
                backgroundColor: style.bg,
                color: style.color,
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: '600'
            }}>
                {labels[estado] || estado}
            </span>
        );
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr + 'T12:00:00');
        return date.toLocaleDateString('es-CL', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        });
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <p>Cargando pedidos...</p>
            </div>
        );
    }

    return (
        <div style={{ paddingBottom: '80px' }}>
            <div style={{
                backgroundColor: '#fff',
                padding: '20px',
                borderRadius: '12px'
            }}>
                <h2 style={{ marginBottom: '20px' }}>📋 Mis Pedidos</h2>

                {pedidos.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                        <p>No tienes pedidos aún.</p>
                        <a href="/pedidos/nuevo" style={{
                            color: '#ff9800',
                            textDecoration: 'none',
                            fontWeight: 'bold'
                        }}>
                            Hacer primer pedido →
                        </a>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                                <th style={{ padding: '12px' }}>N° Pedido</th>
                                <th style={{ padding: '12px' }}>Fecha Pedido</th>
                                <th style={{ padding: '12px' }}>Entrega</th>
                                <th style={{ padding: '12px' }}>Productos</th>
                                <th style={{ padding: '12px' }}>Total</th>
                                <th style={{ padding: '12px' }}>Estado</th>
                                <th style={{ padding: '12px' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pedidos.map(pedido => (
                                <tr
                                    key={pedido.id}
                                    style={{
                                        borderBottom: '1px solid #eee',
                                        backgroundColor: pedido.estado === 'cancelado' ? '#fafafa' : '#fff'
                                    }}
                                >
                                    <td style={{ padding: '12px', fontWeight: 'bold' }}>
                                        #{pedido.id.toString().padStart(4, '0')}
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        {formatDate(pedido.fechaPedido)}
                                        <br />
                                        <span style={{ fontSize: '0.8rem', color: '#888' }}>
                                            {pedido.horaPedido}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px', fontWeight: '600' }}>
                                        {formatDate(pedido.fechaEntrega)}
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        {pedido.detalles.length} producto(s)
                                    </td>
                                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#2e7d32' }}>
                                        ${(pedido.total || 0).toLocaleString()}
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        {getEstadoBadge(pedido.estado)}
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <button
                                            onClick={() => setSelectedPedido(pedido)}
                                            style={{
                                                padding: '6px 12px',
                                                backgroundColor: '#e3f2fd',
                                                color: '#1565c0',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                marginRight: '8px'
                                            }}
                                        >
                                            Ver Detalle
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Detail Modal */}
            {selectedPedido && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: '#fff',
                        borderRadius: '12px',
                        padding: '30px',
                        width: '90%',
                        maxWidth: '600px',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '20px'
                        }}>
                            <h2>Pedido #{selectedPedido.id.toString().padStart(4, '0')}</h2>
                            <button
                                onClick={() => setSelectedPedido(null)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '1.5rem',
                                    cursor: 'pointer',
                                    color: '#888'
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '15px',
                            marginBottom: '20px'
                        }}>
                            <div>
                                <p style={{ color: '#888', fontSize: '0.85rem' }}>Fecha Pedido</p>
                                <p style={{ fontWeight: '600' }}>
                                    {formatDate(selectedPedido.fechaPedido)} - {selectedPedido.horaPedido}
                                </p>
                            </div>
                            <div>
                                <p style={{ color: '#888', fontSize: '0.85rem' }}>Fecha Entrega</p>
                                <p style={{ fontWeight: '600' }}>{formatDate(selectedPedido.fechaEntrega)}</p>
                            </div>
                            <div>
                                <p style={{ color: '#888', fontSize: '0.85rem' }}>Estado</p>
                                {getEstadoBadge(selectedPedido.estado)}
                            </div>
                            <div>
                                <p style={{ color: '#888', fontSize: '0.85rem' }}>Total</p>
                                <p style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#2e7d32' }}>
                                    ${(selectedPedido.total || 0).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        {selectedPedido.observaciones && (
                            <div style={{
                                backgroundColor: '#fff3e0',
                                padding: '10px 15px',
                                borderRadius: '8px',
                                marginBottom: '20px'
                            }}>
                                <p style={{ color: '#888', fontSize: '0.85rem' }}>Observaciones</p>
                                <p>{selectedPedido.observaciones}</p>
                            </div>
                        )}

                        <h3 style={{ marginBottom: '10px' }}>Productos</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                                    <th style={{ padding: '10px' }}>Producto</th>
                                    <th style={{ padding: '10px', textAlign: 'right' }}>Cantidad</th>
                                    <th style={{ padding: '10px', textAlign: 'right' }}>Precio</th>
                                    <th style={{ padding: '10px', textAlign: 'right' }}>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedPedido.detalles.map(detalle => (
                                    <tr key={detalle.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '10px' }}>{detalle.productoNombre}</td>
                                        <td style={{ padding: '10px', textAlign: 'right' }}>
                                            {detalle.cantidad}
                                        </td>
                                        <td style={{ padding: '10px', textAlign: 'right' }}>
                                            ${detalle.precioUnitario.toLocaleString()}
                                        </td>
                                        <td style={{ padding: '10px', textAlign: 'right', fontWeight: '600' }}>
                                            ${(detalle.subtotal || 0).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
