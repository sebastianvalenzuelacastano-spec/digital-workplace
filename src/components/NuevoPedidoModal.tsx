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
    unidad?: string;
}

interface CartItem {
    productoId: number;
    nombre: string;
    cantidad: number;
    precio: number;
    unidad: string;
}

interface NuevoPedidoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    fechaEntrega: string;
}

const COMMON_UNITS = ['Un', 'Kg'];

export default function NuevoPedidoModal({ isOpen, onClose, onSuccess, fechaEntrega }: NuevoPedidoModalProps) {
    const [casinos, setCasinos] = useState<Casino[]>([]);
    const [productos, setProductos] = useState<Producto[]>([]);
    const [selectedCasino, setSelectedCasino] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [productQuantities, setProductQuantities] = useState<Record<number, number>>({});
    const [productUnits, setProductUnits] = useState<Record<number, string>>({});

    const [selectedDate, setSelectedDate] = useState(fechaEntrega);
    const [horaEntrega, setHoraEntrega] = useState('07:00'); // Default delivery hour

    useEffect(() => {
        if (isOpen) {
            loadData();
            setSelectedDate(fechaEntrega);
            setHoraEntrega('07:00'); // Reset to default when modal opens
        }
    }, [isOpen, fechaEntrega]);

    const loadData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = '/auth/login';
                return;
            }

            // Load casinos using dedicated endpoint
            const casinosRes = await fetch('/api/casinos', { cache: 'no-store' });
            const casinosData = await casinosRes.json();

            const activos = Array.isArray(casinosData) ? casinosData.filter((c: any) => c.activo) : [];
            setCasinos(activos);

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
                precio: Number(producto.precio) || 0,
                unidad: producto.unidad || 'Un'
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

    const updateUnit = (productoId: number, newUnit: string) => {
        setCart(cart.map(item =>
            item.productoId === productoId ? { ...item, unidad: newUnit } : item
        ));
    };

    const calculateTotal = () => {
        return cart.reduce((sum, item) => sum + ((Number(item.precio) || 0) * item.cantidad), 0);
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
                    fechaEntrega: selectedDate,
                    horaEntrega: horaEntrega, // Include delivery hour
                    items: cart.map(item => ({
                        productoId: item.productoId,
                        cantidad: item.cantidad,
                        productoNombre: item.nombre,
                        precioUnitario: Number(item.precio) || 0,
                        unidad: item.unidad
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
            <div style={{ maxWidth: '750px', minHeight: '400px', overflow: 'visible' }}>

                {/* Date and Time Selection */}
                <div style={{ marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <div style={{ position: 'relative', overflow: 'visible' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                            Fecha de Entrega
                        </label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            onFocus={(e) => e.target.showPicker?.()}
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '6px',
                                border: '1px solid #ddd',
                                cursor: 'pointer'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                            Hora de Entrega
                        </label>
                        <input
                            type="time"
                            value={horaEntrega}
                            onChange={(e) => setHoraEntrega(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '6px',
                                border: '1px solid #ddd'
                            }}
                        />
                    </div>

                    {/* Casino Selection */}
                    <div>
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
                </div>

                {/* Cart */}
                {cart.length > 0 && (
                    <div style={{
                        marginBottom: '1.5rem',
                        padding: '1rem',
                        backgroundColor: '#e8f5e9',
                        borderRadius: '8px'
                    }}>
                        <h4 style={{ marginBottom: '0.75rem' }}>Carrito de Compras</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {cart.map(item => (
                                <div key={item.productoId} style={{
                                    display: 'grid',
                                    gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
                                    gap: '10px',
                                    alignItems: 'center',
                                    padding: '0.5rem 0',
                                    borderBottom: '1px solid #c8e6c9'
                                }}>
                                    <span style={{ fontWeight: '500' }}>{item.nombre}</span>

                                    {/* Quantity Input */}
                                    <input
                                        type="number"
                                        min="1"
                                        value={item.cantidad}
                                        onChange={(e) => updateQuantity(item.productoId, Number(e.target.value))}
                                        placeholder="Cant."
                                        style={{ width: '100%', padding: '6px', textAlign: 'center', borderRadius: '4px', border: '1px solid #aaa' }}
                                    />

                                    {/* Unit Selector */}
                                    <select
                                        value={item.unidad}
                                        onChange={(e) => updateUnit(item.productoId, e.target.value)}
                                        style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #aaa' }}
                                    >
                                        {COMMON_UNITS.map(u => (
                                            <option key={u} value={u}>{u}</option>
                                        ))}
                                    </select>

                                    <span style={{ fontWeight: 'bold', textAlign: 'right' }}>
                                        ${(item.precio * item.cantidad).toLocaleString()}
                                    </span>

                                    <button
                                        onClick={() => updateQuantity(item.productoId, 0)}
                                        style={{
                                            color: '#f44336',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontSize: '1.2rem'
                                        }}
                                        title="Eliminar"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            ))}
                        </div>
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
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        maxHeight: '400px',
                        overflowY: 'auto'
                    }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f5f5f5', zIndex: 1 }}>
                                <tr>
                                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Producto</th>
                                    <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #ddd', width: '100px' }}>Precio</th>
                                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #ddd', width: '100px' }}>Unidad</th>
                                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #ddd', width: '100px' }}>Cantidad</th>
                                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #ddd', width: '80px' }}>Agregar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productos.map(producto => {
                                    const isInCart = cart.some(item => item.productoId === producto.id);
                                    const tempQuantity = productQuantities[producto.id] || 1;
                                    const tempUnit = productUnits[producto.id] || 'Kg';

                                    return (<tr
                                        key={producto.id}
                                        style={{
                                            backgroundColor: isInCart ? '#e8f5e9' : '#fff',
                                            borderBottom: '1px solid #f0f0f0'
                                        }}
                                    >
                                        <td style={{ padding: '10px', fontWeight: '500' }}>{producto.nombre}</td>
                                        <td style={{ padding: '10px', textAlign: 'right', color: '#2e7d32', fontWeight: 'bold' }}>
                                            ${(producto.precio || 0).toLocaleString()}
                                        </td>
                                        <td style={{ padding: '10px', textAlign: 'center' }}>
                                            <select
                                                value={tempUnit}
                                                onChange={(e) => {
                                                    setProductUnits(prev => ({ ...prev, [producto.id]: e.target.value }));
                                                }}
                                                style={{
                                                    padding: '6px',
                                                    borderRadius: '4px',
                                                    border: '1px solid #ddd',
                                                    width: '100%'
                                                }}
                                            >
                                                <option value="Kg">Kg</option>
                                                <option value="Un">Un</option>
                                            </select>
                                        </td>
                                        <td style={{ padding: '10px', textAlign: 'center' }}>
                                            <input
                                                type="number"
                                                min={tempUnit === 'Un' ? 1 : 0.1}
                                                step={tempUnit === 'Un' ? 1 : 0.1}
                                                value={tempQuantity}
                                                onChange={(e) => {
                                                    const value = parseFloat(e.target.value) || 0;
                                                    // Round to integer if unit is Un
                                                    const finalValue = tempUnit === 'Un' ? Math.round(value) : value;
                                                    setProductQuantities(prev => ({ ...prev, [producto.id]: finalValue }));
                                                }}
                                                style={{
                                                    padding: '6px',
                                                    borderRadius: '4px',
                                                    border: '1px solid #ddd',
                                                    width: '100%',
                                                    textAlign: 'center'
                                                }}
                                            />
                                        </td>
                                        <td style={{ padding: '10px', textAlign: 'center' }}>
                                            <button
                                                onClick={() => {
                                                    const existing = cart.find(item => item.productoId === producto.id);
                                                    if (existing) {
                                                        // Update existing item
                                                        setCart(cart.map(item =>
                                                            item.productoId === producto.id
                                                                ? { ...item, cantidad: tempQuantity, unidad: tempUnit }
                                                                : item
                                                        ));
                                                    } else {
                                                        // Add new item
                                                        setCart([...cart, {
                                                            productoId: producto.id,
                                                            nombre: producto.nombre,
                                                            cantidad: tempQuantity,
                                                            precio: Number(producto.precio) || 0,
                                                            unidad: tempUnit
                                                        }]);
                                                    }
                                                }}
                                                style={{
                                                    padding: '6px 12px',
                                                    backgroundColor: isInCart ? '#ff9800' : '#4caf50',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '14px',
                                                    fontWeight: '500'
                                                }}
                                            >
                                                {isInCart ? '✓' : '➕'}
                                            </button>
                                        </td>
                                    </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
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
                        style={{
                            padding: '10px 25px',
                            backgroundColor: '#2e7d32',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            cursor: loading ? 'wait' : 'pointer',
                            opacity: (loading || !selectedCasino || cart.length === 0) ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Creando...' : 'Crear Pedido'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
