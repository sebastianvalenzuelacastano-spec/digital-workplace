'use client';

import { useState, useEffect } from 'react';
import Modal from './Modal';

interface Casino {
    id: number;
    nombre: string;
    empresaId: number;
}

interface Producto {
    id: number;
    nombre: string;
    precio: number;
}

interface NuevoPedidoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    fechaEntrega: string;
}

export default function NuevoPedidoModal({ isOpen, onClose, onSuccess, fechaEntrega }: NuevoPedidoModalProps) {
    const [casinos, setCasinos] = useState<Casino[]>([]);
    const [productos, setProductos] = useState<Producto[]>([]);
    const [selectedCasino, setSelectedCasino] = useState('');
    const [cart, setCart] = useState<Array<{ productoId: number; nombre: string; cantidad: number; precio: number }>>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadData();
        }
    }, [isOpen]);

    const loadData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = '/auth/login';
                return;
            }

            // Load casinos
            const dbRes = await fetch('/api/db', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (dbRes.status === 401) {
                console.error('Authentication error: Token expired or invalid');
                localStorage.removeItem('token');
                window.location.href = '/auth/login';
                return;
            }
            const db = await dbRes.json();
            setCasinos(db.casinosSucursales?.filter((c: any) => c.activo) || []);

            // Load productos
            const prodRes = await fetch('/api/productos-catalogo');
            const prods = await prodRes.json();
            setProductos(Array.isArray(prods) ? prods.filter((p: any) => p.activo) : []);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    const addToCart = (producto: Producto) => {
        const existing = cart.find(item => item.productoId === producto.id);
        if (existing) {
            setCart(cart.map(item =>
                item.productoId === producto.id
                    ? { ...item, cantidad: item.cantidad + 1 }
                    : item
            ));
        } else {
            setCart([...cart, {
                productoId: producto.id,
                nombre: producto.nombre,
                cantidad: 1,
                precio: producto.precio
            }]);
        }
    };

    const updateQuantity = (productoId: number, cantidad: number) => {
        if (cantidad <= 0) {
            setCart(cart.filter(item => item.productoId !== productoId));
        } else {
            setCart(cart.map(item =>
                item.productoId === productoId ? { ...item, cantidad } : item
            ));
        }
    };

    const calculateTotal = () => {
        return cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    };

    const handleSubmit = async () => {
        if (!selectedCasino || cart.length === 0) {
            alert('Selecciona un casino y agrega productos');
            return;
        }

        setLoading(true);
        try {
            const casino = casinos.find(c => c.id === Number(selectedCasino));

            const response = await fetch('/api/pedidos-clientes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    casinoId: Number(selectedCasino),
                    fechaEntrega: fechaEntrega,
                    productos: cart.map(item => ({
                        productoId: item.productoId,
                        cantidad: item.cantidad
                    })),
                    origenPedido: 'manual'
                })
            });

            if (response.ok) {
                alert('Pedido creado exitosamente');
                setSelectedCasino('');
                setCart([]);
                onSuccess();
                onClose();
            } else {
                const error = await response.json();
                alert('Error: ' + (error.error || 'No se pudo crear el pedido'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al crear el pedido');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Nuevo Pedido Manual">
            <div style={{ maxWidth: '700px', maxHeight: '80vh', overflowY: 'auto' }}>
                {/* Removed h2 since Modal already shows title */}

                {/* Casino Selection */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        Seleccionar Casino *
                    </label>
                    <select
                        value={selectedCasino}
                        onChange={(e) => setSelectedCasino(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '6px',
                            border: '1px solid #ddd'
                        }}
                    >
                        <option value="">Seleccionar...</option>
                        {casinos.map(casino => (
                            <option key={casino.id} value={casino.id}>
                                {casino.nombre}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Cart */}
                {cart.length > 0 && (
                    <div style={{
                        marginBottom: '1.5rem',
                        padding: '1rem',
                        backgroundColor: '#e8f5e9',
                        borderRadius: '8px'
                    }}>
                        <h4 style={{ marginBottom: '0.75rem' }}>Carrito</h4>
                        {cart.map(item => (
                            <div key={item.productoId} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '0.5rem 0',
                                borderBottom: '1px solid #c8e6c9'
                            }}>
                                <span>{item.nombre}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <input
                                        type="number"
                                        min="1"
                                        value={item.cantidad}
                                        onChange={(e) => updateQuantity(item.productoId, Number(e.target.value))}
                                        style={{ width: '60px', padding: '4px', textAlign: 'center' }}
                                    />
                                    <span style={{ fontWeight: 'bold', minWidth: '80px', textAlign: 'right' }}>
                                        ${(item.precio * item.cantidad).toLocaleString()}
                                    </span>
                                    <button
                                        onClick={() => updateQuantity(item.productoId, 0)}
                                        style={{
                                            color: '#f44336',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                        <div style={{
                            marginTop: '1rem',
                            paddingTop: '1rem',
                            borderTop: '2px solid #2e7d32',
                            textAlign: 'right',
                            fontSize: '1.2rem',
                            fontWeight: 'bold'
                        }}>
                            Total: ${(calculateTotal() || 0).toLocaleString()}
                        </div>
                    </div>
                )}

                {/* Products */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ marginBottom: '0.75rem' }}>Productos Disponibles</h4>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                        gap: '0.75rem',
                        maxHeight: '300px',
                        overflowY: 'auto',
                        padding: '0.5rem',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px'
                    }}>
                        {productos.map(producto => (
                            <div
                                key={producto.id}
                                onClick={() => addToCart(producto)}
                                style={{
                                    padding: '0.75rem',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    backgroundColor: cart.some(item => item.productoId === producto.id) ? '#e8f5e9' : '#fff'
                                }}
                            >
                                <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                                    {producto.nombre}
                                </div>
                                <div style={{ color: '#2e7d32', fontWeight: 'bold' }}>
                                    ${(producto.precio || 0).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '10px 20px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            background: '#fff',
                            cursor: 'pointer'
                        }}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !selectedCasino || cart.length === 0}
                        className="btn btn-primary"
                        style={{ padding: '10px 20px' }}
                    >
                        {loading ? 'Creando...' : 'Crear Pedido'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
