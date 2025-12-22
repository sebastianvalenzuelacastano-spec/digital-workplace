'use client';

import { useState, useEffect } from 'react';
import type { PedidoCliente, DetallePedido, Trabajador } from '@/types/dashboard';
import NuevoPedidoModal from '@/components/NuevoPedidoModal';

interface PedidoConDetalles extends PedidoCliente {
    detalles: DetallePedido[];
}

interface ResumenProduccion {
    productoId: number;
    productoNombre: string;
    cantidadTotal: number;
    subtotalTotal: number;
}

export default function PedidosDiaPage() {
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
    const [pedidos, setPedidos] = useState<PedidoConDetalles[]>([]);
    const [resumen, setResumen] = useState<ResumenProduccion[]>([]);
    const [totales, setTotales] = useState({ totalPedidos: 0, totalProductos: 0, totalUnidades: 0, totalMonto: 0 });
    const [loading, setLoading] = useState(false);
    const [selectedPedido, setSelectedPedido] = useState<PedidoConDetalles | null>(null);
    const [viewMode, setViewMode] = useState<'pedidos' | 'produccion'>('pedidos');
    const [selectedRepartidor, setSelectedRepartidor] = useState<string>(''); // For filtering by driver
    const [printMode, setPrintMode] = useState<'none' | 'produccion' | 'repartidor'>('none'); // What to print
    const [isNuevoPedidoOpen, setIsNuevoPedidoOpen] = useState(false);
    const [repartidores, setRepartidores] = useState<Trabajador[]>([]);

    useEffect(() => {
        loadData();
    }, [fecha]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [resumenRes, dbRes] = await Promise.all([
                fetch(`/api/resumen-produccion?fecha=${fecha}`),
                fetch('/api/db', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                })
            ]);

            // Check for authentication errors
            if (dbRes.status === 401) {
                console.error('Authentication error: Token expired or invalid');
                localStorage.removeItem('token');
                localStorage.removeItem('role');
                alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
                window.location.href = '/auth/login';
                return;
            }

            if (resumenRes.ok) {
                const data = await resumenRes.json();
                setPedidos(Array.isArray(data.pedidosPorCasino) ? data.pedidosPorCasino : []);
                setResumen(Array.isArray(data.resumenProduccion) ? data.resumenProduccion : []);

                // Ensure totales has valid numbers
                const totalesData = data.totales || {};
                setTotales({
                    totalPedidos: totalesData.totalPedidos || 0,
                    totalProductos: totalesData.totalProductos || 0,
                    totalUnidades: totalesData.totalUnidades || 0,
                    totalMonto: totalesData.totalMonto || 0
                });
            } else {
                console.error('Error loading resumen:', await resumenRes.text());
                setPedidos([]);
                setResumen([]);
                setTotales({ totalPedidos: 0, totalProductos: 0, totalUnidades: 0, totalMonto: 0 });
            }

            // Load repartidores
            if (dbRes.ok) {
                const db = await dbRes.json();
                const trabajadores = db.maestroTrabajadores || [];
                if (Array.isArray(trabajadores)) {
                    setRepartidores(trabajadores.filter((t: Trabajador) =>
                        t.activo && t.cargo && t.cargo.toLowerCase().includes('repartidor')
                    ));
                }
            } else if (dbRes.status !== 401) {
                console.error('Error loading db:', dbRes.status);
                setRepartidores([]);
            }
        } catch (error) {
            console.error('Error loading data:', error);
            setPedidos([]);
            setResumen([]);
            setTotales({ totalPedidos: 0, totalProductos: 0, totalUnidades: 0, totalMonto: 0 });
            setRepartidores([]);
        } finally {
            setLoading(false);
        }
    };

    const updateEstado = async (pedidoId: number, nuevoEstado: string) => {
        try {
            const res = await fetch('/api/pedidos-clientes', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: pedidoId, estado: nuevoEstado })
            });

            if (res.ok) {
                loadData();
            }
        } catch (error) {
            console.error('Error updating order:', error);
        }
    };

    const updateRepartidor = async (pedidoId: number, repartidor: string) => {
        try {
            const res = await fetch('/api/pedidos-clientes', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: pedidoId, repartidor })
            });

            if (res.ok) {
                loadData();
            }
        } catch (error) {
            console.error('Error updating driver:', error);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr + 'T12:00:00');
        return date.toLocaleDateString('es-CL', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
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

    const handlePrint = () => {
        // Set print mode based on current view
        if (viewMode === 'produccion') {
            setPrintMode('produccion');
        } else if (selectedRepartidor) {
            setPrintMode('repartidor');
        }

        setTimeout(() => {
            window.print();
            // Reset print mode after printing
            setTimeout(() => setPrintMode('none'), 500);
        }, 100);
    };

    // Get unique repartidores from pedidos (for the filter dropdown)
    const repartidoresAsignados = Array.from(new Set(pedidos.map(p => p.repartidor).filter(Boolean))) as string[];

    // Filter pedidos by repartidor if selected
    const filteredPorRepartidor = selectedRepartidor
        ? pedidos.filter(p => p.repartidor === selectedRepartidor)
        : pedidos;

    return (
        <div>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                flexWrap: 'wrap',
                gap: '15px'
            }}>
                <h2>📋 Pedidos del Día (v2.3)</h2>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
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
                        className="no-print"
                    />
                    <select
                        value={selectedRepartidor}
                        onChange={(e) => setSelectedRepartidor(e.target.value)}
                        style={{
                            padding: '10px 15px',
                            border: '2px solid #2196f3',
                            borderRadius: '8px',
                            fontSize: '0.9rem'
                        }}
                        className="no-print"
                    >
                        <option value="">Todos los repartidores</option>
                        {repartidoresAsignados.map(rep => (
                            <option key={rep} value={rep}>{rep}</option>
                        ))}
                    </select>
                    <button
                        onClick={handlePrint}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#1565c0',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}
                        className="no-print"
                    >
                        🖨️ Imprimir
                    </button>
                    <button
                        onClick={() => setIsNuevoPedidoOpen(true)}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#4caf50',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                        className="no-print"
                    >
                        ➕ Nuevo Pedido
                    </button>
                </div>
            </div>

            {/* Date display */}
            <div style={{
                backgroundColor: '#fff',
                padding: '15px 20px',
                borderRadius: '12px',
                marginBottom: '20px',
                textAlign: 'center'
            }}>
                <h3 style={{ color: '#1a1a2e', textTransform: 'capitalize' }}>
                    📅 {formatDate(fecha)}
                </h3>
            </div>

            {/* Summary cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '15px',
                marginBottom: '20px'
            }}>
                <div style={{
                    backgroundColor: '#fff',
                    padding: '20px',
                    borderRadius: '12px',
                    textAlign: 'center'
                }}>
                    <p style={{ color: '#888', fontSize: '0.9rem' }}>Pedidos</p>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1565c0' }}>
                        {totales.totalPedidos}
                    </p>
                </div>
                <div style={{
                    backgroundColor: '#fff',
                    padding: '20px',
                    borderRadius: '12px',
                    textAlign: 'center'
                }}>
                    <p style={{ color: '#888', fontSize: '0.9rem' }}>Productos Distintos</p>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ff9800' }}>
                        {totales.totalProductos}
                    </p>
                </div>
                <div style={{
                    backgroundColor: '#fff',
                    padding: '20px',
                    borderRadius: '12px',
                    textAlign: 'center'
                }}>
                    <p style={{ color: '#888', fontSize: '0.9rem' }}>Unidades Totales</p>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4caf50' }}>
                        {(totales.totalUnidades || 0).toLocaleString()}
                    </p>
                </div>
                <div style={{
                    backgroundColor: '#fff',
                    padding: '20px',
                    borderRadius: '12px',
                    textAlign: 'center'
                }}>
                    <p style={{ color: '#888', fontSize: '0.9rem' }}>Monto Total</p>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2e7d32' }}>
                        ${(totales.totalMonto || 0).toLocaleString()}
                    </p>
                </div>
            </div>

            {/* View toggle */}
            <div style={{
                display: 'flex',
                gap: '10px',
                marginBottom: '20px'
            }}>
                <button
                    onClick={() => setViewMode('pedidos')}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: viewMode === 'pedidos' ? '#1a1a2e' : '#fff',
                        color: viewMode === 'pedidos' ? '#fff' : '#333',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    📦 Pedidos por Casino
                </button>
                <button
                    onClick={() => setViewMode('produccion')}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: viewMode === 'produccion' ? '#1a1a2e' : '#fff',
                        color: viewMode === 'produccion' ? '#fff' : '#333',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    🏭 Resumen Producción
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>Cargando...</div>
            ) : viewMode === 'pedidos' ? (
                /* Orders by Casino */
                <div style={{ backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden' }}>
                    {filteredPorRepartidor.length === 0 ? (
                        <div style={{ padding: '50px', textAlign: 'center', color: '#888' }}>
                            No hay pedidos para esta fecha{selectedRepartidor ? ` para el repartidor ${selectedRepartidor}` : ''}.
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left', backgroundColor: '#f9f9f9' }}>
                                    <th style={{ padding: '15px' }}>N° Pedido</th>
                                    <th style={{ padding: '15px' }}>Casino</th>
                                    <th style={{ padding: '15px' }}>Empresa</th>
                                    <th style={{ padding: '15px' }}>Hora</th>
                                    <th style={{ padding: '15px' }}>Productos</th>
                                    <th style={{ padding: '15px' }}>Total</th>
                                    <th style={{ padding: '15px' }}>Repartidor</th>
                                    <th style={{ padding: '15px' }}>Estado</th>
                                    <th style={{ padding: '15px' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPorRepartidor.map(pedido => (
                                    <tr key={pedido.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '15px', fontWeight: 'bold' }}>
                                            #{pedido.id.toString().padStart(4, '0')}
                                        </td>
                                        <td style={{ padding: '15px' }}>{pedido.casinoNombre}</td>
                                        <td style={{ padding: '15px', color: '#888' }}>{pedido.empresaNombre}</td>
                                        <td style={{ padding: '15px' }}>{pedido.horaPedido}</td>
                                        <td style={{ padding: '15px' }}>{pedido.detalles.length}</td>
                                        <td style={{ padding: '15px', fontWeight: 'bold', color: '#2e7d32' }}>
                                            ${(pedido.total || 0).toLocaleString()}
                                        </td>
                                        <td style={{ padding: '15px' }}>
                                            <select
                                                value={pedido.repartidor || ''}
                                                onChange={(e) => updateRepartidor(pedido.id, e.target.value)}
                                                style={{
                                                    padding: '6px 10px',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '6px',
                                                    fontSize: '0.9rem',
                                                    width: '100%'
                                                }}
                                            >
                                                <option value="">Sin asignar</option>
                                                {repartidores.map(rep => (
                                                    <option key={rep.id} value={rep.nombre}>
                                                        {rep.nombre}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td style={{ padding: '15px' }}>
                                            <select
                                                value={pedido.estado}
                                                onChange={(e) => updateEstado(pedido.id, e.target.value)}
                                                style={{
                                                    padding: '6px 10px',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '6px',
                                                    fontSize: '0.9rem'
                                                }}
                                            >
                                                <option value="pendiente">Pendiente</option>
                                                <option value="confirmado">Confirmado</option>
                                                <option value="en_produccion">En Producción</option>
                                                <option value="entregado">Entregado</option>
                                                <option value="despachado">Despachado</option>
                                                <option value="cancelado">Cancelado</option>
                                            </select>
                                        </td>
                                        <td style={{ padding: '15px' }}>
                                            <button
                                                onClick={() => setSelectedPedido(pedido)}
                                                style={{
                                                    padding: '6px 12px',
                                                    backgroundColor: '#e3f2fd',
                                                    color: '#1565c0',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer'
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
            ) : (
                /* Production Summary */
                <div style={{ backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden' }}>
                    {resumen.length === 0 ? (
                        <div style={{ padding: '50px', textAlign: 'center', color: '#888' }}>
                            No hay productos para producir esta fecha.
                        </div>
                    ) : (
                        <>
                            <div style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
                                <h3>🏭 Resumen de Producción para el {formatDate(fecha)}</h3>
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left', backgroundColor: '#f9f9f9' }}>
                                        <th style={{ padding: '15px' }}>Producto</th>
                                        <th style={{ padding: '15px', textAlign: 'right' }}>Cantidad Total</th>
                                        <th style={{ padding: '15px', textAlign: 'right' }}>Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {resumen.map((item, index) => (
                                        <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '15px', fontWeight: '600' }}>
                                                {item.productoNombre}
                                            </td>
                                            <td style={{ padding: '15px', textAlign: 'right', fontSize: '1.2rem', fontWeight: 'bold', color: '#1565c0' }}>
                                                {(item.cantidadTotal || 0).toLocaleString()}
                                            </td>
                                            <td style={{ padding: '15px', textAlign: 'right', color: '#2e7d32' }}>
                                                ${(item.subtotalTotal || 0).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr style={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
                                        <td style={{ padding: '15px' }}>TOTAL</td>
                                        <td style={{ padding: '15px', textAlign: 'right', fontSize: '1.3rem', color: '#1565c0' }}>
                                            {(totales.totalUnidades || 0).toLocaleString()} unidades
                                        </td>
                                        <td style={{ padding: '15px', textAlign: 'right', fontSize: '1.3rem', color: '#2e7d32' }}>
                                            ${(totales.totalMonto || 0).toLocaleString()}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </>
                    )}
                </div>
            )}

            {/* Detail Modal */}
            {selectedPedido && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
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
                            <div>
                                <h2>Pedido #{selectedPedido.id.toString().padStart(4, '0')}</h2>
                                <p style={{ color: '#888' }}>
                                    {selectedPedido.casinoNombre} - {selectedPedido.empresaNombre}
                                </p>
                            </div>
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

                        <div style={{ marginBottom: '20px' }}>
                            {getEstadoBadge(selectedPedido.estado)}
                        </div>

                        {selectedPedido.observaciones && (
                            <div style={{
                                backgroundColor: '#fff3e0',
                                padding: '10px 15px',
                                borderRadius: '8px',
                                marginBottom: '20px'
                            }}>
                                <strong>Observaciones:</strong> {selectedPedido.observaciones}
                            </div>
                        )}

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
                                        <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>
                                            {detalle.cantidad}
                                        </td>
                                        <td style={{ padding: '10px', textAlign: 'right' }}>
                                            ${(detalle.precioUnitario || 0).toLocaleString()}
                                        </td>
                                        <td style={{ padding: '10px', textAlign: 'right', fontWeight: '600' }}>
                                            ${(detalle.subtotal || 0).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr style={{ borderTop: '2px solid #333' }}>
                                    <td colSpan={3} style={{ padding: '15px', fontWeight: 'bold', textAlign: 'right' }}>
                                        TOTAL:
                                    </td>
                                    <td style={{ padding: '15px', fontWeight: 'bold', color: '#2e7d32', fontSize: '1.2rem', textAlign: 'right' }}>
                                        ${(selectedPedido.total || 0).toLocaleString()}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}

            {/* Print CSS */}
            <style jsx global>{`
                @media print {
                    .no-print {
                        display: none !important;
                    }
                    
                    /* Hide sidebar and general UI */
                    aside, .sidebar, nav, header, footer {
                        display: none !important;
                    }
                    
                    /* Reset margins for print */
                    body {
                        margin: 0;
                        padding: 20px;
                    }
                    
                    /* Optimize table for print */
                    table {
                        page-break-inside: avoid;
                        font-size: 10pt;
                    }
                    
                    th, td {
                        padding: 8px 10px !important;
                    }
                    
                    /* Hide action columns when printing */
                    ${printMode !== 'none' ? `
                        th:last-child, td:last-child {
                            display: none;
                        }
                    ` : ''}
                    
                    /* Add header for print */
                    @page {
                        margin: 1cm;
                    }
                    
                    /* Print title */
                    h2 {
                        text-align: center;
                        margin-bottom: 20px;
                    }
                }
            `}</style>

            {/* Nuevo Pedido Modal */}
            <NuevoPedidoModal
                isOpen={isNuevoPedidoOpen}
                onClose={() => setIsNuevoPedidoOpen(false)}
                onSuccess={loadData}
                fechaEntrega={fecha}
            />
        </div>
    );
}
