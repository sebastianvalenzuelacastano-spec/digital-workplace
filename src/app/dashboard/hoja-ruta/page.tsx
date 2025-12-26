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
                                padding: '15px',
                                marginBottom: '1rem',
                                pageBreakAfter: 'always'
                            }}
                        >
                            {/* Repartidor Header - COMPACT */}
                            <div style={{
                                borderBottom: '2px solid #000',
                                paddingBottom: '5px',
                                marginBottom: '10px'
                            }}>
                                <h2 style={{
                                    fontSize: '12pt',
                                    margin: '0',
                                    fontWeight: 'bold'
                                }}>
                                    {ruta.nombre} - {ruta.casinos.length} entregas
                                </h2>
                            </div>

                            {/* Casinos Container - Grid Layout */}
                            <div
                                className="casinos-container"
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(3, 1fr)',
                                    gap: '8px'
                                }}
                            >
                                {/* Casinos - COMPACT FORMAT */}
                                {ruta.casinos.map((casino, casinoIndex) => (
                                    <div
                                        key={casino.pedido.id}
                                        className="casino-block"
                                        style={{
                                            marginBottom: '5px',
                                            padding: '4px',
                                            border: '1px solid #000',
                                            pageBreakInside: 'avoid',
                                            fontSize: '6pt',
                                            boxSizing: 'border-box',
                                            backgroundColor: '#fff'
                                        }}
                                    >
                                        {/* Casino Header - Compact */}
                                        <div style={{
                                            fontWeight: 'bold',
                                            marginBottom: '2px',
                                            paddingBottom: '2px',
                                            borderBottom: '1px solid #ccc',
                                            fontSize: '7pt'
                                        }}>
                                            {(casino.pedido.casinoNombre || 'Sin Nombre').toUpperCase()} - {casino.pedido.horaEntrega || casino.pedido.horaPedido || 'S/H'}
                                        </div>


                                        {/* Products - Table Format */}
                                        <table style={{
                                            width: '100%',
                                            borderCollapse: 'collapse',
                                            fontSize: '6pt',
                                            tableLayout: 'fixed'
                                        }}>
                                            <tbody>
                                                {casino.pedido.detalles.map(detalle => (
                                                    <tr key={detalle.id}>
                                                        <td style={{
                                                            padding: '1px 2px 1px 0',
                                                            textAlign: 'left',
                                                            width: '50%'
                                                        }}>
                                                            {detalle.productoNombre || 'Producto'}
                                                        </td>
                                                        <td style={{
                                                            padding: '1px 2px',
                                                            textAlign: 'right',
                                                            fontWeight: 'bold',
                                                            width: '25%',
                                                            fontSize: '7pt',
                                                            whiteSpace: 'nowrap'
                                                        }}>
                                                            {detalle.cantidad}
                                                        </td>
                                                        <td style={{
                                                            padding: '1px 2px',
                                                            textAlign: 'center',
                                                            width: '25%',
                                                            fontSize: '7pt',
                                                            fontWeight: 'bold',
                                                            whiteSpace: 'nowrap'
                                                        }}>
                                                            {detalle.unidad || 'Un'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ))}
                            </div>
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
                        width: 100% !important;
                        table-layout: fixed !important;
                    }
                    
                    td, th {
                        background-color: white !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    
                    /* Ensure quantity and unit columns are visible */
                    td:nth-child(2), td:nth-child(3) {\n                        min-width: 60px !important;
                        white-space: nowrap !important;
                        display: table-cell !important;
                        visibility: visible !important;
                    }
                    
                    /* Expand casino blocks to full width on print */
                    @page {
                        margin: 1cm;
                    }
                    
                    /* Force 3-column grid layout on print */
                    .casinos-container {
                        display: grid !important;
                        grid-template-columns: repeat(3, 1fr) !important;
                        gap: 8px !important;
                    }
                    
                    /* Force casino block to fill grid cell */
                    .casino-block {
                        break-inside: avoid !important;
                        page-break-inside: avoid !important;
                        width: 100% !important;
                    }
                    
                    /* Ensure tbody cells are visible */
                    tbody td {
                        display: table-cell !important;
                        visibility: visible !important;
                        opacity: 1 !important;
                    }
                    
                    /* Force unit column */
                    tbody td:nth-child(3) {
                        width: 25% !important;
                        min-width: 70px !important;
                        max-width: none !important;
                    }
                    
                    /* Ensure flexbox works in print */
                    div[style*="display: flex"] {
                        display: flex !important;
                    }
                }
            `}</style>
        </div>
    );
}
