'use client';

import { useState, useEffect } from 'react';
import type { PedidoCliente, DetallePedido } from '@/types/dashboard';

interface PedidoConDetalles extends PedidoCliente {
    detalles: DetallePedido[];
}

interface RepartidorRuta {
    nombre: string;
    casinos: Array<{
        pedido: PedidoConDetalles;
    }>;
}

export default function HojaRutaPage() {
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
    const [pedidos, setPedidos] = useState<PedidoConDetalles[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, [fecha]);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/resumen-produccion?fecha=${fecha}`);
            const data = await res.json();
            setPedidos(data.pedidosPorCasino || []);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Group orders by repartidor
    const agruparPorRepartidor = (): RepartidorRuta[] => {
        const grupos: Record<string, RepartidorRuta> = {};

        pedidos.forEach(pedido => {
            const repartidor = pedido.repartidor || 'Sin Asignar';

            if (!grupos[repartidor]) {
                grupos[repartidor] = {
                    nombre: repartidor,
                    casinos: []
                };
            }

            grupos[repartidor].casinos.push({ pedido });
        });

        return Object.values(grupos);
    };

    const rutas = agruparPorRepartidor();

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr + 'T12:00:00');
        return date.toLocaleDateString('es-CL', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div>
            {/* Header - No print */}
            <div className="no-print" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <h1>📋 Hojas de Ruta - Reparto</h1>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input
                        type="date"
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                        style={{
                            padding: '10px 15px',
                            border: '2px solid #ff9800',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: 'bold'
                        }}
                    />
                    <button
                        onClick={() => window.print()}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#1565c0',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        🖨️ Imprimir Todas
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>Cargando...</div>
            ) : rutas.length === 0 ? (
                <div style={{
                    backgroundColor: '#fff',
                    padding: '50px',
                    borderRadius: '12px',
                    textAlign: 'center',
                    color: '#888'
                }}>
                    No hay pedidos para esta fecha
                </div>
            ) : (
                <>
                    {/* Print: Show date header */}
                    <div className="print-only" style={{
                        textAlign: 'center',
                        marginBottom: '30px',
                        display: 'none'
                    }}>
                        <h1 style={{ marginBottom: '10px' }}>Hojas de Ruta - Reparto</h1>
                        <h2 style={{ color: '#666', fontWeight: 'normal' }}>{formatDate(fecha)}</h2>
                    </div>

                    {rutas.map((ruta, index) => (
                        <div
                            key={ruta.nombre}
                            style={{
                                backgroundColor: '#fff',
                                borderRadius: '12px',
                                padding: '2rem',
                                marginBottom: '2rem',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                pageBreakAfter: 'always'
                            }}
                        >
                            {/* Repartidor Header */}
                            <div style={{
                                borderBottom: '3px solid #2196f3',
                                paddingBottom: '1rem',
                                marginBottom: '1.5rem'
                            }}>
                                <h2 style={{
                                    fontSize: '1.8rem',
                                    color: '#2196f3',
                                    marginBottom: '0.5rem'
                                }}>
                                    🚗 {ruta.nombre}
                                </h2>
                                <p style={{ color: '#666', fontSize: '1rem' }}>
                                    Total de entregas: {ruta.casinos.length}
                                </p>
                            </div>

                            {/* Casinos */}
                            {ruta.casinos.map((casino, casinoIndex) => (
                                <div
                                    key={casino.pedido.id}
                                    style={{
                                        marginBottom: '2rem',
                                        padding: '1.5rem',
                                        backgroundColor: '#f9f9f9',
                                        borderRadius: '8px',
                                        border: '1px solid #e0e0e0'
                                    }}
                                >
                                    {/* Casino Header */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        marginBottom: '1rem',
                                        paddingBottom: '0.75rem',
                                        borderBottom: '2px solid #ddd'
                                    }}>
                                        <div>
                                            <h3 style={{
                                                fontSize: '1.3rem',
                                                marginBottom: '0.25rem',
                                                color: '#333'
                                            }}>
                                                {casinoIndex + 1}. {casino.pedido.casinoNombre}
                                            </h3>
                                            <p style={{ color: '#666', fontSize: '0.9rem' }}>
                                                {casino.pedido.empresaNombre}
                                            </p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontSize: '0.85rem', color: '#666' }}>
                                                Pedido #{casino.pedido.id}
                                            </p>
                                            <p style={{ fontSize: '0.85rem', color: '#666' }}>
                                                Hora: {casino.pedido.horaEntrega || casino.pedido.horaPedido}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Products */}
                                    <table style={{
                                        width: '100%',
                                        borderCollapse: 'collapse',
                                        marginBottom: '0.75rem'
                                    }}>
                                        <thead>
                                            <tr style={{ backgroundColor: '#e8e8e8' }}>
                                                <th style={{
                                                    padding: '10px',
                                                    textAlign: 'left',
                                                    fontSize: '0.9rem'
                                                }}>
                                                    Producto
                                                </th>
                                                <th style={{
                                                    padding: '10px',
                                                    textAlign: 'center',
                                                    fontSize: '0.9rem',
                                                    width: '100px'
                                                }}>
                                                    Cantidad
                                                </th>
                                                <th style={{
                                                    padding: '10px',
                                                    textAlign: 'right',
                                                    fontSize: '0.9rem',
                                                    width: '120px'
                                                }}>
                                                    Subtotal
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {casino.pedido.detalles.map(detalle => (
                                                <tr key={detalle.id} style={{ borderBottom: '1px solid #ddd' }}>
                                                    <td style={{ padding: '10px', fontSize: '0.95rem' }}>
                                                        {detalle.productoNombre}
                                                    </td>
                                                    <td style={{
                                                        padding: '10px',
                                                        textAlign: 'center',
                                                        fontWeight: 'bold',
                                                        fontSize: '1rem'
                                                    }}>
                                                        {detalle.cantidad} {detalle.unidad || 'und'}
                                                    </td>
                                                    <td style={{
                                                        padding: '10px',
                                                        textAlign: 'right',
                                                        fontSize: '0.95rem'
                                                    }}>
                                                        ${detalle.subtotal.toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr style={{ backgroundColor: '#e8f5e9' }}>
                                                <td colSpan={2} style={{
                                                    padding: '10px',
                                                    fontWeight: 'bold',
                                                    textAlign: 'right',
                                                    fontSize: '1rem'
                                                }}>
                                                    Total Casino:
                                                </td>
                                                <td style={{
                                                    padding: '10px',
                                                    textAlign: 'right',
                                                    fontWeight: 'bold',
                                                    fontSize: '1.1rem',
                                                    color: '#2e7d32'
                                                }}>
                                                    ${casino.pedido.total.toLocaleString()}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>

                                    {/* Observaciones */}
                                    {casino.pedido.observaciones && (
                                        <div style={{
                                            marginTop: '0.75rem',
                                            padding: '0.75rem',
                                            backgroundColor: '#fff3cd',
                                            borderRadius: '6px',
                                            borderLeft: '4px solid #ffc107'
                                        }}>
                                            <strong>📝 Observaciones:</strong> {casino.pedido.observaciones}
                                        </div>
                                    )}

                                    {/* Firma */}
                                    <div style={{
                                        marginTop: '1.5rem',
                                        paddingTop: '1rem',
                                        borderTop: '1px dashed #ccc'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-end'
                                        }}>
                                            <div>
                                                <p style={{ marginBottom: '2rem', fontSize: '0.9rem' }}>
                                                    Firma: _______________________
                                                </p>
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '0.85rem', color: '#666' }}>
                                                    Hora entrega: _______
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </>
            )}

            {/* Print CSS */}
            <style jsx global>{`
                @media print {
                    .no-print {
                        display: none !important;
                    }
                    
                    .print-only {
                        display: block !important;
                    }
                    
                    body {
                        margin: 0;
                        padding: 0;
                    }
                    
                    aside, nav, header, footer {
                        display: none !important;
                    }
                    
                    @page {
                        margin: 1.5cm;
                        size: letter;
                    }
                    
                    h1 {
                        font-size: 20pt;
                    }
                    
                    h2 {
                        font-size: 16pt;
                    }
                    
                    h3 {
                        font-size: 13pt;
                    }
                    
                    table {
                        page-break-inside: avoid;
                    }
                }
            `}</style>
        </div>
    );
}
