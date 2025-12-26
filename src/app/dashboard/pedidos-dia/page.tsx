'use client';

import { useState, useEffect } from 'react';
import type { PedidoCliente, DetallePedido, Trabajador } from '@/types/dashboard';
import NuevoPedidoModal from '@/components/NuevoPedidoModal';

interface Producto {
    id: number;
    nombre: string;
    precioKilo: number;
    unidades?: string[];
}

interface PedidoConDetalles extends PedidoCliente {
    detalles: DetallePedido[];
}

interface ResumenProduccion {
    productoId: number;
    productoNombre: string;
    unidad: string;
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
    const [editingPedido, setEditingPedido] = useState<PedidoConDetalles | null>(null); // For editing
    const [repartidores, setRepartidores] = useState<Trabajador[]>([]);
    const [productos, setProductos] = useState<Producto[]>([]); // Products for adding to order

    useEffect(() => {
        loadData();
    }, [fecha]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [resumenRes, dbRes, productosRes] = await Promise.all([
                fetch(`/api/resumen-produccion?fecha=${fecha}`),
                fetch('/api/db', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }),
                fetch('/api/productos-catalogo') // Load products from catalog endpoint
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

            // Load products from productos-catalogo endpoint
            if (productosRes.ok) {
                const prods = await productosRes.json();
                setProductos(Array.isArray(prods) ? prods.filter((p: any) => p.activo) : []);
            } else {
                console.error('Error loading productos:', productosRes.status);
                setProductos([]);
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

    const handleDeletePedido = async (pedido: PedidoConDetalles) => {
        // Only allow deleting orders in certain states
        if (!['pendiente', 'confirmado'].includes(pedido.estado)) {
            alert('Solo se pueden eliminar pedidos en estado Pendiente o Confirmado');
            return;
        }

        const confirmed = window.confirm(
            `¿Estás seguro de que deseas eliminar el pedido #${pedido.id.toString().padStart(4, '0')} de ${pedido.casinoNombre}?`
        );

        if (!confirmed) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/pedidos-clientes?id=${pedido.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                alert('Pedido eliminado exitosamente');
                loadData(); // Refresh data
            } else {
                const error = await response.json();
                alert('Error al eliminar: ' + (error.error || 'Error desconocido'));
            }
        } catch (error) {
            console.error('Error deleting pedido:', error);
            alert('Error al eliminar el pedido');
        }
    };

    const handleSaveEdit = async (updatedPedido: PedidoConDetalles) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/pedidos-clientes', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    id: updatedPedido.id,
                    horaEntrega: updatedPedido.horaEntrega,
                    repartidor: updatedPedido.repartidor,
                    observaciones: updatedPedido.observaciones,
                    estado: updatedPedido.estado,
                    detalles: updatedPedido.detalles // Include product details for update
                })
            });

            if (response.ok) {
                alert('Pedido actualizado exitosamente');
                setEditingPedido(null);
                loadData(); // Refresh data
            } else {
                const error = await response.json();
                alert('Error al actualizar: ' + (error.error || 'Error desconocido'));
            }
        } catch (error) {
            console.error('Error updating pedido:', error);
            alert('Error al actualizar el pedido');
        }
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
                <h2>📋 Pedidos del Día (v2.4)</h2>

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
                                    <th className="no-print" style={{ padding: '15px' }}>Empresa</th>
                                    <th style={{ padding: '15px' }}>Hora</th>
                                    <th style={{ padding: '15px' }}>Productos</th>
                                    <th className="no-print" style={{ padding: '15px' }}>Total</th>
                                    <th className="no-print" style={{ padding: '15px' }}>Repartidor</th>
                                    <th className="no-print" style={{ padding: '15px' }}>Estado</th>
                                    <th className="no-print" style={{ padding: '15px' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPorRepartidor.map(pedido => (
                                    <tr key={pedido.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '15px', fontWeight: 'bold' }}>
                                            #{pedido.id.toString().padStart(4, '0')}
                                        </td>
                                        <td style={{ padding: '15px' }}>{pedido.casinoNombre}</td>
                                        <td className="no-print" style={{ padding: '15px', color: '#888' }}>{pedido.empresaNombre}</td>
                                        <td style={{ padding: '15px' }}>{pedido.horaPedido}</td>
                                        <td style={{ padding: '15px' }}>{pedido.detalles.length}</td>
                                        <td className="no-print" style={{ padding: '15px', fontWeight: 'bold', color: '#2e7d32' }}>
                                            ${(pedido.total || 0).toLocaleString()}
                                        </td>
                                        <td className="no-print" style={{ padding: '15px' }}>
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
                                        <td className="no-print" style={{ padding: '15px' }}>
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
                                        <td className="no-print" style={{ padding: '15px' }}>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => setEditingPedido(pedido)}
                                                    style={{
                                                        padding: '6px 12px',
                                                        backgroundColor: '#e8f5e9',
                                                        color: '#2e7d32',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        fontSize: '0.9rem'
                                                    }}
                                                    title="Editar pedido"
                                                >
                                                    ✏️ Editar
                                                </button>
                                                <button
                                                    onClick={() => handleDeletePedido(pedido)}
                                                    style={{
                                                        padding: '6px 12px',
                                                        backgroundColor: '#ffebee',
                                                        color: '#c62828',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        fontSize: '0.9rem'
                                                    }}
                                                    title="Eliminar pedido"
                                                    disabled={!['pendiente', 'confirmado'].includes(pedido.estado)}
                                                >
                                                    🗑️ Eliminar
                                                </button>
                                                <button
                                                    onClick={() => setSelectedPedido(pedido)}
                                                    style={{
                                                        padding: '6px 12px',
                                                        backgroundColor: '#e3f2fd',
                                                        color: '#1565c0',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        fontSize: '0.9rem'
                                                    }}
                                                >
                                                    👁️ Ver
                                                </button>
                                            </div>
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
                                                {(item.cantidadTotal || 0).toLocaleString()} <span style={{ fontSize: '0.85rem', color: '#666' }}>{item.unidad}</span>
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

            {/* Print-only: Repartidor Delivery Route - BLOCK FORMAT */}
            {printMode === 'repartidor' && selectedRepartidor && (
                <div className="print-only-repartidor" style={{
                    display: 'none',
                    backgroundColor: '#fff',
                    padding: '10px',
                    fontSize: '9pt',
                    fontFamily: 'Arial, sans-serif'
                }}>
                    {/* Header */}
                    <div style={{
                        textAlign: 'center',
                        borderBottom: '2px solid #000',
                        paddingBottom: '5px',
                        marginBottom: '10px'
                    }}>
                        <h2 style={{ margin: '0', fontSize: '12pt', fontWeight: 'bold', textTransform: 'uppercase' }}>
                            {selectedRepartidor} - {formatDate(fecha)}
                        </h2>
                    </div>

                    {/* Casinos in multi-column layout */}
                    <div style={{
                        columnCount: 2,
                        columnGap: '15px',
                        fontSize: '8pt'
                    }}>
                        {filteredPorRepartidor.map((pedido) => (
                            <div key={pedido.id} style={{
                                border: '1px solid #000',
                                padding: '8px',
                                marginBottom: '10px',
                                breakInside: 'avoid',
                                pageBreakInside: 'avoid'
                            }}>
                                {/* Casino Header */}
                                <div style={{
                                    fontWeight: 'bold',
                                    marginBottom: '5px',
                                    fontSize: '9pt',
                                    borderBottom: '1px solid #ccc',
                                    paddingBottom: '3px'
                                }}>
                                    {pedido.casinoNombre.toUpperCase()} {pedido.horaEntrega || ''}
                                </div>

                                {/* Products List */}
                                {pedido.detalles.map((detalle) => (
                                    <div key={detalle.id} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        padding: '2px 0',
                                        fontSize: '8pt'
                                    }}>
                                        <span style={{ flex: 1 }}>{detalle.productoNombre}</span>
                                        <span style={{ width: '40px', textAlign: 'right', fontWeight: 'bold' }}>
                                            {detalle.cantidad}
                                        </span>
                                        <span style={{ width: '45px', textAlign: 'right' }}>
                                            {detalle.unidad || 'UNID'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
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
                                    <th style={{ padding: '10px', textAlign: 'center' }}>Unidad</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedPedido.detalles.map(detalle => (
                                    <tr key={detalle.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '10px' }}>{detalle.productoNombre}</td>
                                        <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                            {detalle.cantidad}
                                        </td>
                                        <td style={{ padding: '10px', textAlign: 'center', color: '#666' }}>
                                            {detalle.unidad || 'Un'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>

                        </table>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editingPedido && (
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
                        maxWidth: '500px',
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
                                <h2>Editar Pedido #{editingPedido.id.toString().padStart(4, '0')}</h2>
                                <p style={{ color: '#888' }}>
                                    {editingPedido.casinoNombre} - {editingPedido.empresaNombre}
                                </p>
                            </div>
                            <button
                                onClick={() => setEditingPedido(null)}
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

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {/* Hora de Entrega */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                    🕐 Hora de Entrega
                                </label>
                                <input
                                    type="time"
                                    value={editingPedido.horaEntrega || ''}
                                    onChange={(e) => setEditingPedido({
                                        ...editingPedido,
                                        horaEntrega: e.target.value
                                    })}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>

                            {/* Repartidor */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                    🚗 Repartidor
                                </label>
                                <select
                                    value={editingPedido.repartidor || ''}
                                    onChange={(e) => setEditingPedido({
                                        ...editingPedido,
                                        repartidor: e.target.value
                                    })}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd',
                                        fontSize: '1rem'
                                    }}
                                >
                                    <option value="">Sin asignar</option>
                                    {repartidores.map(r => (
                                        <option key={r.id} value={r.nombre}>{r.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Estado */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                    📋 Estado
                                </label>
                                <select
                                    value={editingPedido.estado}
                                    onChange={(e) => setEditingPedido({
                                        ...editingPedido,
                                        estado: e.target.value as any
                                    })}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd',
                                        fontSize: '1rem'
                                    }}
                                >
                                    <option value="pendiente">Pendiente</option>
                                    <option value="confirmado">Confirmado</option>
                                    <option value="en_produccion">En Producción</option>
                                    <option value="despachado">Despachado</option>
                                    <option value="entregado">Entregado</option>
                                    <option value="cancelado">Cancelado</option>
                                </select>
                            </div>

                            {/* Productos */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                                    📦 Productos del Pedido
                                </label>
                                <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ backgroundColor: '#f5f5f5' }}>
                                                <th style={{ padding: '8px', textAlign: 'left', fontSize: '0.9rem' }}>Producto</th>
                                                <th style={{ padding: '8px', textAlign: 'center', fontSize: '0.9rem', width: '80px' }}>Cantidad</th>
                                                <th style={{ padding: '8px', textAlign: 'center', fontSize: '0.9rem', width: '80px' }}>Unidad</th>
                                                <th style={{ padding: '8px', textAlign: 'center', fontSize: '0.9rem', width: '50px' }}></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {editingPedido.detalles.map((detalle, idx) => (
                                                <tr key={detalle.id} style={{ borderBottom: '1px solid #eee' }}>
                                                    <td style={{ padding: '8px', fontSize: '0.9rem' }}>{detalle.productoNombre}</td>
                                                    <td style={{ padding: '4px' }}>
                                                        <input
                                                            type="number"
                                                            min="0.1"
                                                            step="0.1"
                                                            value={detalle.cantidad}
                                                            onChange={(e) => {
                                                                const newDetalles = [...editingPedido.detalles];
                                                                newDetalles[idx] = { ...newDetalles[idx], cantidad: parseFloat(e.target.value) || 0 };
                                                                setEditingPedido({ ...editingPedido, detalles: newDetalles });
                                                            }}
                                                            style={{
                                                                width: '100%',
                                                                padding: '6px',
                                                                borderRadius: '4px',
                                                                border: '1px solid #ddd',
                                                                textAlign: 'center'
                                                            }}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '4px' }}>
                                                        <select
                                                            value={detalle.unidad || 'Kg'}
                                                            onChange={(e) => {
                                                                const newDetalles = [...editingPedido.detalles];
                                                                newDetalles[idx] = { ...newDetalles[idx], unidad: e.target.value };
                                                                setEditingPedido({ ...editingPedido, detalles: newDetalles });
                                                            }}
                                                            style={{
                                                                width: '100%',
                                                                padding: '6px',
                                                                borderRadius: '4px',
                                                                border: '1px solid #ddd'
                                                            }}
                                                        >
                                                            <option value="Kg">Kg</option>
                                                            <option value="Un">Un</option>
                                                        </select>
                                                    </td>
                                                    <td style={{ padding: '4px', textAlign: 'center' }}>
                                                        <button
                                                            onClick={() => {
                                                                const newDetalles = editingPedido.detalles.filter((_, i) => i !== idx);
                                                                setEditingPedido({ ...editingPedido, detalles: newDetalles });
                                                            }}
                                                            style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                fontSize: '1.2rem',
                                                                cursor: 'pointer',
                                                                color: '#c62828'
                                                            }}
                                                            title="Eliminar producto"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Add Product */}
                                <div style={{ marginTop: '10px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <select
                                        id="addProductSelect"
                                        style={{
                                            flex: 1,
                                            padding: '8px',
                                            borderRadius: '6px',
                                            border: '1px solid #ddd',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        <option value="">Seleccionar producto...</option>
                                        {productos.map(p => (
                                            <option key={p.id} value={p.id}>{p.nombre}</option>
                                        ))
                                        }
                                    </select>
                                    <button
                                        onClick={() => {
                                            const select = document.getElementById('addProductSelect') as HTMLSelectElement;
                                            const productoId = parseInt(select.value);
                                            if (!productoId) return;
                                            const producto = productos.find(p => p.id === productoId);
                                            if (!producto) return;

                                            const newDetalle: DetallePedido = {
                                                id: Date.now(), // Temporary ID
                                                pedidoId: editingPedido.id,
                                                productoId: producto.id,
                                                productoNombre: producto.nombre,
                                                cantidad: 1,
                                                unidad: 'Kg',
                                                precioUnitario: producto.precioKilo || 0,
                                                subtotal: producto.precioKilo || 0
                                            };
                                            setEditingPedido({
                                                ...editingPedido,
                                                detalles: [...editingPedido.detalles, newDetalle]
                                            });
                                            select.value = '';
                                        }}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#1976d2',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        ➕ Agregar
                                    </button>
                                </div>
                            </div>

                            {/* Observaciones */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                    📝 Observaciones
                                </label>
                                <textarea
                                    value={editingPedido.observaciones || ''}
                                    onChange={(e) => setEditingPedido({
                                        ...editingPedido,
                                        observaciones: e.target.value
                                    })}
                                    rows={3}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd',
                                        fontSize: '1rem',
                                        resize: 'vertical'
                                    }}
                                    placeholder="Notas adicionales..."
                                />
                            </div>
                        </div>

                        {/* Buttons */}
                        <div style={{ display: 'flex', gap: '10px', marginTop: '25px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setEditingPedido(null)}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#f5f5f5',
                                    color: '#666',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '1rem'
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleSaveEdit(editingPedido)}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#2e7d32',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    fontWeight: 'bold'
                                }}
                            >
                                💾 Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Print CSS */}
            <style jsx global>{`
                @media print {
                    .no-print {
                        display: none !important;
                    }
                    
                    /* Show print-only content */
                    .print-only-repartidor {
                        display: block !important;
                    }
                    
                    /* Hide main content when printing repartidor route */
                    ${printMode === 'repartidor' ? `
                        body > div > div:not(.print-only-repartidor) {
                            display: none !important;
                        }
                    ` : ''}
                    
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
