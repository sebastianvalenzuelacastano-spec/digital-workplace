'use client';

import { useState, useEffect } from 'react';

interface ClientData {
    id: number;
    casinoNombre: string;
    empresaId: number;
}

interface Producto {
    id: number;
    nombre: string;
    precio: number;
}

interface ProductoSeleccionado {
    productoId: number;
    nombre: string;
    cantidad: number;
    precio: number;
    unidad: string;
}

interface PedidoPorFecha {
    fecha: string;
    hora: string;
    productos: ProductoSeleccionado[];
}

export default function PedidosMasivosPage() {
    const [clientData, setClientData] = useState<ClientData | null>(null);
    const [productos, setProductos] = useState<Producto[]>([]);
    const [step, setStep] = useState<1 | 2>(1); // Step 1: productos base, Step 2: personalizar por día

    // Step 1: Base configuration
    const [horaEntrega, setHoraEntrega] = useState('07:00');
    const [fechasSeleccionadas, setFechasSeleccionadas] = useState<string[]>([]);
    const [productosBase, setProductosBase] = useState<ProductoSeleccionado[]>([]);
    const [productQuantities, setProductQuantities] = useState<Record<number, number>>({});
    const [productUnits, setProductUnits] = useState<Record<number, string>>({});

    // Step 2: Per-day customization
    const [pedidosPorFecha, setPedidosPorFecha] = useState<PedidoPorFecha[]>([]);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        const data = localStorage.getItem('clientData');
        if (data) {
            const parsed = JSON.parse(data);
            setClientData(parsed);
            loadProductos(parsed.empresaId);
        }
    }, []);

    const loadProductos = async (empresaId?: number) => {
        try {
            // Load client-specific prices (same as normal order page)
            if (empresaId) {
                const preciosRes = await fetch(`/api/precios-clientes?empresaId=${empresaId}`);
                const precios = await preciosRes.json();
                if (Array.isArray(precios) && precios.length > 0) {
                    const prods = precios.map((p: any) => ({
                        id: p.productoId,
                        nombre: p.productoNombre,
                        precio: p.precioNeto || 0
                    }));
                    setProductos(prods);
                    return;
                }
            }
            // Fallback: use catalog products
            const response = await fetch('/api/productos-catalogo');
            const prods = await response.json();
            setProductos(Array.isArray(prods) ? prods.filter((p: any) => p.activo) : []);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // Generate next 14 days
    const getNextDays = () => {
        const days = [];
        for (let i = 0; i < 14; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i + 1); // Start from tomorrow
            days.push({
                date: date.toISOString().split('T')[0],
                label: date.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: '2-digit' })
            });
        }
        return days;
    };

    const toggleFecha = (fecha: string) => {
        if (fechasSeleccionadas.includes(fecha)) {
            setFechasSeleccionadas(fechasSeleccionadas.filter(f => f !== fecha));
        } else {
            setFechasSeleccionadas([...fechasSeleccionadas, fecha].sort());
        }
    };

    const addProductoBase = (producto: Producto) => {
        const cantidad = productQuantities[producto.id] || 0;
        const unidad = productUnits[producto.id] || 'Kg';

        const exists = productosBase.find(p => p.productoId === producto.id);
        if (exists) {
            setProductosBase(productosBase.map(p =>
                p.productoId === producto.id
                    ? { ...p, cantidad, unidad }
                    : p
            ));
        } else {
            setProductosBase([...productosBase, {
                productoId: producto.id,
                nombre: producto.nombre,
                cantidad,
                precio: producto.precio,
                unidad
            }]);
        }
    };

    const removeProductoBase = (productoId: number) => {
        setProductosBase(productosBase.filter(p => p.productoId !== productoId));
    };

    const continuarAVistaPrevia = () => {
        if (fechasSeleccionadas.length === 0) {
            alert('Selecciona al menos una fecha');
            return;
        }
        if (productosBase.length === 0) {
            alert('Agrega al menos un producto');
            return;
        }

        // Initialize pedidosPorFecha with base data
        const nuevos: PedidoPorFecha[] = fechasSeleccionadas.map(fecha => ({
            fecha,
            hora: horaEntrega,
            productos: JSON.parse(JSON.stringify(productosBase)) // Deep copy
        }));
        setPedidosPorFecha(nuevos);
        setStep(2);
    };

    const updateProductoEnFecha = (fechaIndex: number, productoId: number, field: 'cantidad' | 'unidad', value: number | string) => {
        const nuevos = [...pedidosPorFecha];
        const producto = nuevos[fechaIndex].productos.find(p => p.productoId === productoId);
        if (producto) {
            if (field === 'cantidad' && typeof value === 'number') {
                producto.cantidad = value;
            } else if (field === 'unidad' && typeof value === 'string') {
                producto.unidad = value;
            }
            setPedidosPorFecha(nuevos);
        }
    };

    const removeProductoEnFecha = (fechaIndex: number, productoId: number) => {
        const nuevos = [...pedidosPorFecha];
        nuevos[fechaIndex].productos = nuevos[fechaIndex].productos.filter(p => p.productoId !== productoId);
        setPedidosPorFecha(nuevos);
    };

    const addProductoEnFecha = (fechaIndex: number, producto: Producto) => {
        const nuevos = [...pedidosPorFecha];
        const exists = nuevos[fechaIndex].productos.find(p => p.productoId === producto.id);
        if (!exists) {
            nuevos[fechaIndex].productos.push({
                productoId: producto.id,
                nombre: producto.nombre,
                cantidad: 0,
                precio: producto.precio,
                unidad: 'Kg'
            });
            setPedidosPorFecha(nuevos);
        }
    };

    const crearTodosPedidos = async () => {
        setCreating(true);
        try {
            const response = await fetch('/api/pedidos-masivos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    casinoId: clientData?.id,
                    empresaId: clientData?.empresaId,
                    pedidos: pedidosPorFecha
                })
            });

            if (response.ok) {
                const result = await response.json();
                alert(`✅ ${result.count} pedidos creados exitosamente`);
                window.location.href = '/pedidos/historial';
            } else {
                const error = await response.json();
                alert('Error: ' + (error.error || 'No se pudieron crear los pedidos'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al crear los pedidos');
        } finally {
            setCreating(false);
        }
    };

    const nextDays = getNextDays();

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '20px' }}>📅 Pedidos Múltiples</h2>

            {step === 1 ? (
                /* STEP 1: Base Configuration */
                <div>
                    {/* Select Dates */}
                    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
                        <h3 style={{ marginBottom: '15px' }}>1. Selecciona las Fechas</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
                            {nextDays.map(day => {
                                const isSelected = fechasSeleccionadas.includes(day.date);
                                return (
                                    <div
                                        key={day.date}
                                        onClick={() => toggleFecha(day.date)}
                                        style={{
                                            padding: '15px 10px',
                                            textAlign: 'center',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            backgroundColor: isSelected ? '#ff9800' : '#f5f5f5',
                                            color: isSelected ? '#fff' : '#333',
                                            fontWeight: isSelected ? 'bold' : 'normal',
                                            border: isSelected ? '2px solid #f57c00' : '2px solid transparent',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{ fontSize: '0.85rem' }}>{day.label.split(' ')[0]}</div>
                                        <div style={{ fontSize: '1.1rem', marginTop: '5px' }}>{day.label.split(' ')[1]}</div>
                                    </div>
                                );
                            })}
                        </div>
                        <p style={{ marginTop: '15px', color: '#666', fontSize: '0.9rem' }}>
                            Seleccionadas: {fechasSeleccionadas.length} fechas
                        </p>
                    </div>

                    {/* Delivery Time */}
                    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
                        <h3 style={{ marginBottom: '15px' }}>2. Hora de Entrega</h3>
                        <input
                            type="time"
                            value={horaEntrega}
                            onChange={(e) => setHoraEntrega(e.target.value)}
                            style={{
                                padding: '10px',
                                borderRadius: '6px',
                                border: '1px solid #ddd',
                                fontSize: '1rem'
                            }}
                        />
                        <p style={{ marginTop: '10px', color: '#666', fontSize: '0.9rem' }}>
                            Misma hora para todas las fechas (puedes ajustar individualmente después)
                        </p>
                    </div>

                    {/* Products */}
                    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
                        <h3 style={{ marginBottom: '15px' }}>3. Productos Base</h3>

                        {/* Selected Products */}
                        {productosBase.length > 0 && (
                            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '8px' }}>
                                <h4 style={{ marginBottom: '10px' }}>Productos Seleccionados:</h4>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid #c8e6c9', textAlign: 'left' }}>
                                            <th style={{ padding: '8px', width: '50%' }}>Producto</th>
                                            <th style={{ padding: '8px', width: '20%', textAlign: 'right' }}>Cantidad</th>
                                            <th style={{ padding: '8px', width: '20%', textAlign: 'center' }}>Unidad</th>
                                            <th style={{ padding: '8px', width: '10%', textAlign: 'center' }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productosBase.map(p => (
                                            <tr key={p.productoId} style={{ borderBottom: '1px solid #c8e6c9' }}>
                                                <td style={{ padding: '8px', fontWeight: '500' }}>{p.nombre}</td>
                                                <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold', color: '#2e7d32' }}>{p.cantidad}</td>
                                                <td style={{ padding: '8px', textAlign: 'center' }}>{p.unidad}</td>
                                                <td style={{ padding: '8px', textAlign: 'center' }}>
                                                    <button
                                                        onClick={() => removeProductoBase(p.productoId)}
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            color: '#c62828',
                                                            cursor: 'pointer',
                                                            fontSize: '1.2rem'
                                                        }}
                                                    >
                                                        🗑️
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Add Products Table */}
                        <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', maxHeight: '400px', overflowY: 'auto' }}>
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
                                        const isInCart = productosBase.some(item => item.productoId === producto.id);
                                        const tempQuantity = productQuantities[producto.id] || 0;
                                        const tempUnit = productUnits[producto.id] || 'Kg';

                                        return (
                                            <tr
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
                                                        onClick={() => addProductoBase(producto)}
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

                    {/* Continue Button */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button
                            onClick={continuarAVistaPrevia}
                            disabled={fechasSeleccionadas.length === 0 || productosBase.length === 0}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: fechasSeleccionadas.length === 0 || productosBase.length === 0 ? '#ccc' : '#ff9800',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: fechasSeleccionadas.length === 0 || productosBase.length === 0 ? 'not-allowed' : 'pointer',
                                fontWeight: '600',
                                fontSize: '1rem'
                            }}
                        >
                            Continuar a Vista Previa →
                        </button>
                    </div>
                </div>
            ) : (
                /* STEP 2: Preview & Customize */
                <div>
                    <div style={{ backgroundColor: '#e3f2fd', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                        <p style={{ fontWeight: '600', color: '#1565c0' }}>
                            ℹ️ Revisa y personaliza cada pedido antes de crear. Puedes ajustar cantidades, agregar o quitar productos por día.
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
                        {pedidosPorFecha.map((pedido, index) => (
                            <div key={pedido.fecha} style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px' }}>
                                <h3 style={{ marginBottom: '15px', color: '#ff9800' }}>
                                    {new Date(pedido.fecha + 'T00:00:00').toLocaleDateString('es-ES', {
                                        weekday: 'long',
                                        day: 'numeric',
                                        month: 'long'
                                    })} - {pedido.hora}
                                </h3>

                                {pedido.productos.length === 0 ? (
                                    <p style={{ color: '#888', marginBottom: '15px' }}>No hay productos para este día</p>
                                ) : (
                                    <table style={{ width: '100%', marginBottom: '15px' }}>
                                        <tbody>
                                            {pedido.productos.map(prod => (
                                                <tr key={prod.productoId} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                                    <td style={{ padding: '10px' }}>{prod.nombre}</td>
                                                    <td style={{ padding: '10px', width: '120px' }}>
                                                        <input
                                                            type="number"
                                                            min={prod.unidad === 'Un' ? 1 : 0.1}
                                                            step={prod.unidad === 'Un' ? 1 : 0.1}
                                                            value={prod.cantidad}
                                                            onChange={(e) => updateProductoEnFecha(index, prod.productoId, 'cantidad', parseFloat(e.target.value))}
                                                            style={{
                                                                width: '100%',
                                                                padding: '6px',
                                                                borderRadius: '4px',
                                                                border: '1px solid #ddd'
                                                            }}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '10px', width: '100px' }}>
                                                        <select
                                                            value={prod.unidad}
                                                            onChange={(e) => updateProductoEnFecha(index, prod.productoId, 'unidad', e.target.value)}
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
                                                    <td style={{ padding: '10px', width: '50px', textAlign: 'center' }}>
                                                        <button
                                                            onClick={() => removeProductoEnFecha(index, prod.productoId)}
                                                            style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                color: '#c62828',
                                                                cursor: 'pointer',
                                                                fontSize: '1.2rem'
                                                            }}
                                                        >
                                                            🗑️
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}

                                {/* Add product for this day */}
                                <details style={{ marginTop: '10px' }}>
                                    <summary style={{ cursor: 'pointer', color: '#1976d2', fontWeight: '500' }}>
                                        + Agregar producto solo para este día
                                    </summary>
                                    <div style={{ marginTop: '10px', maxHeight: '200px', overflow: 'auto' }}>
                                        {productos.filter(p => !pedido.productos.some(pp => pp.productoId === p.id)).map(prod => (
                                            <div
                                                key={prod.id}
                                                onClick={() => addProductoEnFecha(index, prod)}
                                                style={{
                                                    padding: '8px',
                                                    cursor: 'pointer',
                                                    borderBottom: '1px solid #f0f0f0',
                                                    display: 'flex',
                                                    justifyContent: 'space-between'
                                                }}
                                            >
                                                <span>{prod.nombre}</span>
                                                <span style={{ color: '#2e7d32' }}>+</span>
                                            </div>
                                        ))}
                                    </div>
                                </details>
                            </div>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                        <button
                            onClick={() => setStep(1)}
                            style={{
                                padding: '12px 24px',
                                border: '1px solid #ddd',
                                borderRadius: '6px',
                                backgroundColor: '#fff',
                                cursor: 'pointer'
                            }}
                        >
                            ← Volver
                        </button>
                        <button
                            onClick={crearTodosPedidos}
                            disabled={creating}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: creating ? '#ccc' : '#4caf50',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: creating ? 'wait' : 'pointer',
                                fontWeight: '600',
                                fontSize: '1rem'
                            }}
                        >
                            {creating ? 'Creando...' : `Crear ${pedidosPorFecha.length} Pedidos`}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
