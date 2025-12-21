'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Producto {
    id: number;
    nombre: string;
    precioNeto: number;
    unidad?: string;
    categoria?: string;
    imagen?: string;
}

interface CartItem {
    productoId: number;
    productoNombre: string;
    cantidad: number;
    unidad: string; // 'kg' or 'unidad'
    precioKilo: number; // Reference price per kg
    horaEntrega: string; // Delivery time slot
}

// Available delivery time slots
const HORARIOS_ENTREGA = [
    '05:00', '05:15', '05:30', '05:45',
    '06:00', '06:15', '06:30', '06:45',
    '07:00', '07:15', '07:30', '07:45',
    '08:00', '08:15', '08:30', '08:45',
    '09:00', '09:15', '09:30', '09:45',
    '10:00', '10:15', '10:30', '10:45',
    '11:00', '11:15', '11:30', '11:45',
    '12:00', '12:15', '12:30', '12:45',
    '13:00', '13:15', '13:30', '13:45',
    '14:00', '14:15', '14:30', '14:45',
    '15:00'
];

export default function NuevoPedidoPage() {
    const router = useRouter();
    const [productos, setProductos] = useState<Producto[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [fechaEntrega, setFechaEntrega] = useState('');
    const [horaEntrega, setHoraEntrega] = useState('07:00');
    const [observaciones, setObservaciones] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [favorites, setFavorites] = useState<number[]>([]);

    useEffect(() => {
        loadProductos();
        loadFavorites();
        setMinDeliveryDate();
    }, []);

    const loadFavorites = async () => {
        const clientData = JSON.parse(localStorage.getItem('clientData') || '{}');
        if (clientData.id) {
            try {
                const res = await fetch(`/api/favoritos?clientId=${clientData.id}`);
                const data = await res.json();
                if (Array.isArray(data)) setFavorites(data);
            } catch (e) {
                console.error('Error loading favorites', e);
            }
        }
    };

    const toggleFavorite = async (productoId: number) => {
        const clientData = JSON.parse(localStorage.getItem('clientData') || '{}');

        const isFav = favorites.includes(productoId);
        if (isFav) {
            setFavorites(prev => prev.filter(id => id !== productoId));
            showToast('Eliminado de Favoritos', 'info');
        } else {
            setFavorites(prev => [...prev, productoId]);
            showToast('Agregado a Favoritos', 'success');
        }

        try {
            await fetch('/api/favoritos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clientId: clientData.id, productoId })
            });
        } catch (e) {
            console.error('Error toggling favorite');
        }
    };

    const setMinDeliveryDate = () => {
        const now = new Date();
        const hour = now.getHours();

        // If after 18:00, minimum is day after tomorrow
        const daysToAdd = hour >= 18 ? 2 : 1;
        const minDate = new Date(now);
        minDate.setDate(minDate.getDate() + daysToAdd);

        setFechaEntrega(minDate.toISOString().split('T')[0]);
    };

    const loadProductos = async () => {
        try {
            const clientData = JSON.parse(localStorage.getItem('clientData') || '{}');

            // Get catalog products (already sorted alphabetically by API)
            const catalogoRes = await fetch('/api/productos-catalogo');
            const catalogo = await catalogoRes.json();

            // Get custom prices for this company
            const preciosRes = await fetch(`/api/precios-clientes?empresaId=${clientData.empresaId}`);
            const precios = await preciosRes.json();

            // If there are custom prices, use them with catalog info
            if (precios.length > 0) {
                const productosConPrecio = precios.map((p: any) => {
                    const catalogItem = catalogo.find((c: any) => c.id === p.productoId);
                    return {
                        id: p.productoId,
                        nombre: p.nombreProducto,
                        precioNeto: p.precioNeto,
                        categoria: catalogItem?.categoria || '',
                        imagen: catalogItem?.imagen || ''
                    };
                });
                // Sort alphabetically
                productosConPrecio.sort((a: any, b: any) => a.nombre.localeCompare(b.nombre, 'es'));
                setProductos(productosConPrecio);
            } else {
                // Use default catalog products (already sorted)
                setProductos(catalogo.map((p: any) => ({
                    id: p.id,
                    nombre: p.nombre,
                    precioNeto: p.precioBase || 0,
                    categoria: p.categoria,
                    imagen: p.imagen || ''
                })));
            }
        } catch {
            setError('Error al cargar productos');
        } finally {
            setLoading(false);
        }
    };

    // Categories derived from products
    const categories = ['⭐ Favoritos', 'Todos', ...Array.from(new Set(productos.map(p => p.categoria || 'Otros'))).sort()];

    // Filter products
    const filteredProductos = productos.filter(p => {
        const matchesSearch = searchTerm === '' || p.nombre.toLowerCase().includes(searchTerm.toLowerCase());

        let matchesCategory = true;
        if (selectedCategory === '⭐ Favoritos') {
            matchesCategory = favorites.includes(p.id);
        } else if (selectedCategory !== 'Todos') {
            matchesCategory = (p.categoria || 'Otros') === selectedCategory;
        }

        return matchesSearch && matchesCategory;
    });

    const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const addToCart = (producto: Producto, cantidad: number, unidad: string) => {
        if (cantidad <= 0) return;

        setCart(prev => {
            // Check if same product with same unit AND same hour exists
            const existingIndex = prev.findIndex(
                item => item.productoId === producto.id &&
                    item.unidad === unidad &&
                    item.horaEntrega === horaEntrega
            );

            if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex].cantidad += cantidad;
                return updated;
            }

            return [...prev, {
                productoId: producto.id,
                productoNombre: producto.nombre,
                cantidad,
                unidad,
                precioKilo: producto.precioNeto,
                horaEntrega
            }];
        });

        showToast(`✅ ${producto.nombre} agregado (${cantidad} ${unidad}) para las ${horaEntrega}`);
    };

    const updateCartItem = (productoId: number, cantidad: number) => {
        if (cantidad <= 0) {
            removeFromCart(productoId);
            return;
        }

        setCart(prev => prev.map(item =>
            item.productoId === productoId
                ? { ...item, cantidad }
                : item
        ));
    };

    const removeFromCart = (productoId: number) => {
        setCart(prev => prev.filter(item => item.productoId !== productoId));
    };

    const handleSubmit = async () => {
        if (cart.length === 0) {
            setError('Agrega al menos un producto al pedido');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const clientData = JSON.parse(localStorage.getItem('clientData') || '{}');

            const res = await fetch('/api/pedidos-clientes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    casinoId: clientData.id,
                    fechaEntrega,
                    observaciones,
                    items: cart
                })
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
                setCart([]);
                setTimeout(() => {
                    router.push('/pedidos/historial');
                }, 2000);
            } else {
                setError(data.error || 'Error al enviar pedido');
            }
        } catch {
            setError('Error de conexión');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <p>Cargando productos...</p>
            </div>
        );
    }

    if (success) {
        return (
            <div style={{
                textAlign: 'center',
                padding: '50px',
                backgroundColor: '#e8f5e9',
                borderRadius: '12px'
            }}>
                <h2 style={{ color: '#2e7d32', marginBottom: '10px' }}>✅ ¡Pedido Enviado!</h2>
                <p>Tu pedido ha sido recibido. Te llegará una confirmación por email.</p>
                <p style={{ color: '#666', marginTop: '20px' }}>Redirigiendo a tus pedidos...</p>
            </div>
        );
    }



    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '30px', paddingBottom: '80px', position: 'relative' }}>
            {/* Toast Notification */}
            {toast && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: toast.type === 'error' ? '#f44336' : '#4caf50',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '50px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    zIndex: 1000,
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    animation: 'fadeIn 0.3s'
                }}>
                    {toast.msg}
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '30px',
                        borderRadius: '12px',
                        maxWidth: '500px',
                        width: '90%',
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }}>
                        <h2 style={{ marginBottom: '20px', color: '#2e7d32', fontSize: '1.5rem' }}>✅ Confirmar Pedido</h2>
                        <p style={{ marginBottom: '20px', fontSize: '0.95rem' }}>Por favor revisa el resumen de tu pedido antes de enviar.</p>

                        <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                            <p style={{ fontSize: '0.9rem' }}><strong>Fecha de Entrega:</strong> {new Date(fechaEntrega).toLocaleDateString()}</p>
                            <div style={{ marginTop: '10px' }}>
                                {[...new Set(cart.map(i => i.horaEntrega))].sort().map(hora => (
                                    <div key={hora} style={{ marginTop: '10px' }}>
                                        <p style={{ fontWeight: 'bold', borderBottom: '1px solid #ddd', fontSize: '0.9rem' }}>🕐 {hora} hrs</p>
                                        {cart.filter(i => i.horaEntrega === hora).map((item, idx) => (
                                            <p key={idx} style={{ fontSize: '0.85rem', marginLeft: '10px' }}>
                                                • {item.productoNombre}: {item.cantidad} {item.unidad}
                                            </p>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {observaciones && (
                            <p style={{ marginBottom: '20px', fontStyle: 'italic', fontSize: '0.9rem' }}>
                                📝 Observaciones: "{observaciones}"
                            </p>
                        )}

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    backgroundColor: 'white',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem'
                                }}
                            >
                                Volver / Editar
                            </button>
                            <button
                                onClick={() => {
                                    setShowConfirmModal(false);
                                    handleSubmit();
                                }}
                                disabled={submitting}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    backgroundColor: '#2e7d32',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    fontSize: '0.9rem'
                                }}
                            >
                                {submitting ? 'Enviando...' : 'CONFIRMAR Y ENVIAR'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Modal */}
            {selectedImage && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.85)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2500,
                    cursor: 'pointer'
                }} onClick={() => setSelectedImage(null)}>
                    <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}>
                        <img
                            src={selectedImage}
                            style={{
                                maxHeight: '85vh',
                                maxWidth: '100%',
                                borderRadius: '8px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                            }}
                        />
                        <p style={{
                            color: 'white',
                            textAlign: 'center',
                            marginTop: '10px',
                            fontSize: '0.9rem'
                        }}>Presiona para cerrar</p>
                    </div>
                </div>
            )}

            {/* Products Catalog */}
            <div>
                <div style={{
                    backgroundColor: '#fff',
                    padding: '20px',
                    borderRadius: '12px',
                    marginBottom: '20px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                    <h2 style={{ marginBottom: '15px' }}>📦 Selecciona Productos</h2>

                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '15px' }}>
                        <div>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '0.85rem' }}>
                                📅 Fecha de Entrega
                            </label>
                            <input
                                type="date"
                                value={fechaEntrega}
                                min={fechaEntrega}
                                onChange={(e) => setFechaEntrega(e.target.value)}
                                style={{
                                    padding: '8px 12px',
                                    border: '2px solid #ff9800',
                                    borderRadius: '6px',
                                    fontSize: '0.9rem',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '0.85rem' }}>
                                🕐 Hora de Entrega
                            </label>
                            <select
                                value={horaEntrega}
                                onChange={(e) => setHoraEntrega(e.target.value)}
                                style={{
                                    padding: '8px 12px',
                                    border: '2px solid #ff9800',
                                    borderRadius: '6px',
                                    fontSize: '0.9rem',
                                    fontFamily: 'inherit',
                                    backgroundColor: '#fff'
                                }}
                            >
                                {HORARIOS_ENTREGA.map(hora => (
                                    <option key={hora} value={hora}>{hora} hrs</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <input
                                type="text"
                                placeholder="🔍 Buscar producto..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    borderRadius: '30px',
                                    border: '1px solid #ddd',
                                    fontSize: '0.9rem',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', paddingBottom: '5px' }}>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    style={{
                                        padding: '6px 14px',
                                        borderRadius: '20px',
                                        border: '1px solid',
                                        borderColor: selectedCategory === cat ? '#ff9800' : '#ddd',
                                        backgroundColor: selectedCategory === cat ? '#fff3e0' : 'white',
                                        color: selectedCategory === cat ? '#e65100' : '#666',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        transition: 'all 0.2s',
                                        fontSize: '0.85rem',
                                        fontFamily: 'inherit'
                                    }}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    overflow: 'hidden'
                }}>
                    {/* Header */}
                    <div style={{
                        display: 'flex',
                        padding: '12px 15px',
                        backgroundColor: '#fafafa',
                        borderBottom: '1px solid #eee',
                        fontWeight: 'bold',
                        fontSize: '0.85rem',
                        color: '#666',
                        alignItems: 'center'
                    }}>
                        <div style={{ flex: 3 }}>Producto</div>
                        <div style={{ flex: 1 }}>Neto/Kg</div>
                        <div style={{ flex: 3 }}>Pedido</div>
                        <div style={{ width: '60px', textAlign: 'center' }}>Ver</div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {filteredProductos.map(producto => (
                            <ProductRow
                                key={producto.id}
                                producto={producto}
                                onAdd={addToCart}
                                inCart={cart.find(i => i.productoId === producto.id)}
                                isFavorite={favorites.includes(producto.id)}
                                onToggleFavorite={() => toggleFavorite(producto.id)}
                                onViewImage={(img) => setSelectedImage(img)}
                            />
                        ))}
                    </div>
                </div>

                {productos.length === 0 && (
                    <div style={{
                        textAlign: 'center',
                        padding: '40px',
                        backgroundColor: '#fff',
                        borderRadius: '12px'
                    }}>
                        <p style={{ color: '#666' }}>
                            No hay productos con precios asignados para tu empresa.
                        </p>
                        <p style={{ color: '#888', fontSize: '0.9rem', marginTop: '10px' }}>
                            Contacta a Pan San Sebastián para configurar tus precios.
                        </p>
                    </div>
                )}
            </div>

            {/* Cart */}
            <div style={{
                backgroundColor: '#fff',
                padding: '20px',
                borderRadius: '12px',
                position: 'sticky',
                top: '20px',
                height: 'fit-content',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
            }}>
                <h2 style={{ marginBottom: '15px', fontSize: '1.2rem' }}>🛒 Tu Pedido</h2>

                {cart.length === 0 ? (
                    <p style={{ color: '#888', textAlign: 'center', padding: '20px', fontSize: '0.9rem' }}>
                        Tu carrito está vacío
                    </p>
                ) : (
                    <>
                        <div style={{ marginBottom: '20px', maxHeight: '400px', overflowY: 'auto' }}>
                            {cart.map(item => (
                                <div
                                    key={`${item.productoId}-${item.unidad}-${item.horaEntrega}`}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '8px 0',
                                        borderBottom: '1px solid #eee'
                                    }}
                                >
                                    <div>
                                        <p style={{ fontWeight: '600', marginBottom: '4px', fontSize: '0.85rem' }}>
                                            {item.productoNombre}
                                        </p>
                                        <p style={{ fontSize: '0.75rem', color: '#888' }}>
                                            🕐 {item.horaEntrega} | ${item.precioKilo.toLocaleString()}/kg
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <input
                                            type="number"
                                            value={item.cantidad}
                                            onChange={(e) => updateCartItem(item.productoId, parseFloat(e.target.value) || 0)}
                                            min="0"
                                            step={item.unidad === 'kg' ? '0.5' : '1'}
                                            style={{
                                                width: '50px',
                                                padding: '4px',
                                                textAlign: 'center',
                                                border: '1px solid #ddd',
                                                borderRadius: '6px',
                                                fontWeight: 'bold',
                                                fontSize: '0.8rem',
                                                fontFamily: 'inherit'
                                            }}
                                        />
                                        <span style={{
                                            padding: '2px 6px',
                                            backgroundColor: item.unidad === 'kg' ? '#e3f2fd' : '#fff3e0',
                                            borderRadius: '4px',
                                            fontSize: '0.7rem',
                                            fontWeight: '600'
                                        }}>
                                            {item.unidad}
                                        </span>
                                        <button
                                            onClick={() => removeFromCart(item.productoId)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: '#f44336',
                                                cursor: 'pointer',
                                                fontSize: '0.9rem',
                                                fontFamily: 'inherit'
                                            }}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{
                            backgroundColor: '#f1f8e9',
                            padding: '10px',
                            borderRadius: '8px',
                            marginBottom: '15px'
                        }}>
                            <p style={{ fontWeight: 'bold', marginBottom: '8px', color: '#33691e', fontSize: '0.9rem' }}>
                                📋 Resumen del Pedido
                            </p>
                            {/* Group by hour */}
                            {[...new Set(cart.map(i => i.horaEntrega))].sort().map(hora => (
                                <div key={hora} style={{
                                    marginBottom: '8px',
                                    paddingBottom: '6px',
                                    borderBottom: '1px dashed #c5e1a5'
                                }}>
                                    <p style={{
                                        fontWeight: '600',
                                        color: '#558b2f',
                                        marginBottom: '2px',
                                        fontSize: '0.85rem'
                                    }}>
                                        🕐 {hora} hrs
                                    </p>
                                    {cart.filter(i => i.horaEntrega === hora).map((item, idx) => (
                                        <p key={idx} style={{ fontSize: '0.8rem', color: '#555', marginLeft: '15px' }}>
                                            • {item.productoNombre}: <strong>{item.cantidad} {item.unidad}</strong>
                                        </p>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </>
                )}

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', fontSize: '0.85rem' }}>
                        Observaciones (opcional)
                    </label>
                    <textarea
                        value={observaciones}
                        onChange={(e) => setObservaciones(e.target.value)}
                        placeholder="Ej: Entregar antes de las 10am"
                        rows={3}
                        style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            resize: 'none',
                            fontSize: '0.85rem',
                            fontFamily: 'inherit'
                        }}
                    />
                </div>

                {error && (
                    <div style={{
                        backgroundColor: '#ffebee',
                        color: '#c62828',
                        padding: '10px',
                        borderRadius: '6px',
                        marginBottom: '15px',
                        fontSize: '0.85rem'
                    }}>
                        {error}
                    </div>
                )}

                <button
                    onClick={() => setShowConfirmModal(true)}
                    disabled={cart.length === 0 || submitting}
                    style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: '#2e7d32',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        cursor: cart.length === 0 || submitting ? 'not-allowed' : 'pointer',
                        opacity: cart.length === 0 || submitting ? 0.7 : 1,
                        boxShadow: '0 2px 4px rgba(46, 125, 50, 0.2)',
                        fontFamily: 'inherit'
                    }}
                >
                    {submitting ? 'Enviando...' : 'Revisar y Confirmar'}
                </button>
            </div>
        </div>
    );
}

// Product Row Component (ListView)
function ProductRow({
    producto,
    onAdd,
    inCart,
    isFavorite,
    onToggleFavorite,
    onViewImage
}: {
    producto: Producto;
    onAdd: (p: Producto, qty: number, unidad: string) => void;
    inCart?: CartItem;
    isFavorite?: boolean;
    onToggleFavorite?: () => void;
    onViewImage: (img: string) => void;
}) {
    const [qty, setQty] = useState(0);
    const [unidad, setUnidad] = useState<string>('kg');

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 15px',
            borderBottom: '1px solid #f0f0f0',
            backgroundColor: inCart ? '#fff8e1' : 'white',
            transition: 'background-color 0.2s',
            gap: '15px'
        }}>
            {/* 1. Name + Favorite */}
            <div style={{ flex: 3, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                    onClick={onToggleFavorite}
                    style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '1.2rem',
                        cursor: 'pointer',
                        color: isFavorite ? '#ffc107' : '#e0e0e0',
                        padding: 0
                    }}
                    title={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
                >
                    {isFavorite ? '⭐' : '☆'}
                </button>
                <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#333' }}>
                        {producto.nombre}
                    </div>
                    {inCart && (
                        <div style={{ fontSize: '0.75rem', color: '#ef6c00', fontWeight: 'bold' }}>
                            ✓ {inCart.cantidad} {inCart.unidad} en el pedido
                        </div>
                    )}
                </div>
            </div>

            {/* 2. Price */}
            <div style={{ flex: 1, fontSize: '0.9rem', color: '#2e7d32', fontWeight: '600' }}>
                ${producto.precioNeto.toLocaleString()}
            </div>

            {/* 3. Quantity + Unit + Add */}
            <div style={{ flex: 3, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                    type="number"
                    value={qty}
                    onChange={(e) => setQty(parseFloat(e.target.value) || 0)}
                    min="0"
                    step={unidad === 'kg' ? '0.5' : '1'}
                    placeholder="0"
                    style={{
                        width: '60px',
                        padding: '6px',
                        textAlign: 'center',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        fontFamily: 'inherit'
                    }}
                />
                <select
                    value={unidad}
                    onChange={(e) => setUnidad(e.target.value)}
                    style={{
                        padding: '6px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        backgroundColor: unidad === 'kg' ? '#e3f2fd' : '#fff3e0',
                        fontWeight: '600',
                        fontSize: '0.85rem',
                        fontFamily: 'inherit',
                        width: '80px'
                    }}
                >
                    <option value="kg">Kg</option>
                    <option value="unidad">Unid</option>
                </select>
                <button
                    onClick={() => {
                        if (qty > 0) {
                            onAdd(producto, qty, unidad);
                            setQty(0);
                        }
                    }}
                    disabled={qty <= 0}
                    style={{
                        padding: '6px 15px',
                        backgroundColor: qty > 0 ? '#ff9800' : '#e0e0e0',
                        color: qty > 0 ? '#fff' : '#9e9e9e',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: qty > 0 ? 'pointer' : 'not-allowed',
                        fontWeight: '600',
                        fontSize: '0.85rem',
                        fontFamily: 'inherit',
                        flex: 1
                    }}
                >
                    Agregar
                </button>
            </div>

            {/* 4. View Image */}
            <div style={{ width: '60px', textAlign: 'center' }}>
                {producto.imagen ? (
                    <button
                        onClick={() => onViewImage(producto.imagen!)}
                        style={{
                            background: 'none',
                            border: '1px solid #ddd',
                            padding: '4px',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            fontSize: '1.1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px',
                            margin: '0 auto',
                            color: '#555'
                        }}
                        title="Ver foto del producto"
                    >
                        👁️
                    </button>
                ) : (
                    <span style={{ color: '#eee', fontSize: '1.1rem' }}>-</span>
                )}
            </div>
        </div>
    );
}

