'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import type { EmpresaCliente, PrecioCliente } from '@/types/dashboard';

interface ProductoCatalogo {
    id: number;
    nombre: string;
    categoria?: string;
    precioBase?: number;
    imagen?: string;
}

function PreciosContent() {
    const searchParams = useSearchParams();
    const empresaIdParam = searchParams.get('empresaId');

    const [empresas, setEmpresas] = useState<EmpresaCliente[]>([]);
    const [productos, setProductos] = useState<ProductoCatalogo[]>([]);
    const [precios, setPrecios] = useState<PrecioCliente[]>([]);
    const [selectedEmpresaId, setSelectedEmpresaId] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editedPrices, setEditedPrices] = useState<Record<number, number>>({});
    const [editedUnits, setEditedUnits] = useState<Record<number, string>>({});

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (empresaIdParam && empresas.length > 0) {
            setSelectedEmpresaId(parseInt(empresaIdParam));
        }
    }, [empresaIdParam, empresas]);

    useEffect(() => {
        if (selectedEmpresaId) {
            loadPrecios(selectedEmpresaId);
        }
    }, [selectedEmpresaId]);

    const loadInitialData = async () => {
        try {
            const [empresasRes, productosRes] = await Promise.all([
                fetch('/api/empresas-clientes'),
                fetch('/api/productos-catalogo')
            ]);
            const empresasData = await empresasRes.json();
            const productosData = await productosRes.json();

            // Validate responses
            if (Array.isArray(empresasData)) {
                setEmpresas(empresasData.filter((e: EmpresaCliente) => e.activo));
            } else {
                console.error('empresasData is not an array:', empresasData);
                setEmpresas([]);
            }

            if (Array.isArray(productosData)) {
                setProductos(productosData);
            } else {
                console.error('productosData is not an array:', productosData);
                setProductos([]);
            }
        } catch (error) {
            console.error('Error loading data:', error);
            setEmpresas([]);
            setProductos([]);
        } finally {
            setLoading(false);
        }
    };

    const loadPrecios = async (empresaId: number) => {
        try {
            const res = await fetch(`/api/precios-clientes?empresaId=${empresaId}`);
            const data = await res.json();
            setPrecios(data);

            // Initialize edited prices and units with current values
            const initialPrices: Record<number, number> = {};
            const initialUnits: Record<number, string> = {};
            data.forEach((p: PrecioCliente) => {
                initialPrices[p.productoId] = p.precioNeto;
                initialUnits[p.productoId] = p.unidad || 'kg';
            });
            setEditedPrices(initialPrices);
            setEditedUnits(initialUnits);
        } catch (error) {
            console.error('Error loading prices:', error);
        }
    };

    const handlePriceChange = (productoId: number, value: string) => {
        const numValue = parseInt(value) || 0;
        setEditedPrices(prev => ({ ...prev, [productoId]: numValue }));
    };

    const handleUnitChange = (productoId: number, value: string) => {
        setEditedUnits(prev => ({ ...prev, [productoId]: value }));
    };

    const getPrice = (productoId: number): number => {
        if (editedPrices[productoId] !== undefined) {
            return editedPrices[productoId];
        }
        const existingPrice = precios.find(p => p.productoId === productoId);
        return existingPrice?.precioNeto || 0;
    };

    const getUnit = (productoId: number): string => {
        if (editedUnits[productoId] !== undefined) {
            return editedUnits[productoId];
        }
        const existingPrice = precios.find(p => p.productoId === productoId);
        return existingPrice?.unidad || 'kg';
    };

    const handleSave = async () => {
        if (!selectedEmpresaId) return;

        setSaving(true);

        try {
            // Prepare prices data
            const pricesToSave = productos
                .map(producto => ({
                    empresaId: selectedEmpresaId,
                    productoId: producto.id,
                    nombreProducto: producto.nombre,
                    precioNeto: editedPrices[producto.id] || 0,
                    unidad: editedUnits[producto.id] || 'kg'
                }))
                .filter(p => p.precioNeto > 0); // Only save non-zero prices

            const res = await fetch('/api/precios-clientes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pricesToSave)
            });

            if (res.ok) {
                alert('Precios guardados correctamente');
                loadPrecios(selectedEmpresaId);
            } else {
                alert('Error al guardar precios');
            }
        } catch {
            alert('Error de conexión');
        } finally {
            setSaving(false);
        }
    };

    const selectedEmpresa = empresas.find(e => e.id === selectedEmpresaId);

    if (loading) {
        return <div style={{ padding: '20px' }}>Cargando...</div>;
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>💰 Precios por Cliente</h2>
            </div>

            {/* Empresa Selector */}
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                    Selecciona una Empresa
                </label>
                <select
                    value={selectedEmpresaId}
                    onChange={(e) => setSelectedEmpresaId(parseInt(e.target.value))}
                    style={{
                        width: '100%',
                        maxWidth: '400px',
                        padding: '12px',
                        border: '2px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '1rem'
                    }}
                >
                    <option value={0}>-- Seleccionar empresa --</option>
                    {empresas.map(empresa => (
                        <option key={empresa.id} value={empresa.id}>
                            {empresa.nombre} ({empresa.rut})
                        </option>
                    ))}
                </select>
            </div>

            {selectedEmpresaId > 0 && selectedEmpresa && (
                <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '20px',
                        paddingBottom: '15px',
                        borderBottom: '1px solid #eee'
                    }}>
                        <div>
                            <h3 style={{ marginBottom: '5px' }}>Precios para: {selectedEmpresa.nombre}</h3>
                            <p style={{ color: '#888', fontSize: '0.9rem' }}>
                                Define los precios netos que verá este cliente al hacer pedidos.
                            </p>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            style={{
                                padding: '12px 25px',
                                backgroundColor: '#4caf50',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: saving ? 'not-allowed' : 'pointer',
                                fontWeight: 'bold',
                                opacity: saving ? 0.7 : 1
                            }}
                        >
                            {saving ? 'Guardando...' : '💾 Guardar Precios'}
                        </button>
                    </div>

                    {productos.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                            <p>No hay productos en el catálogo.</p>
                            <p style={{ fontSize: '0.9rem', marginTop: '10px' }}>
                                Primero debes crear productos en la sección Productos (Web).
                            </p>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                                    <th style={{ padding: '12px', width: '50px' }}></th>
                                    <th style={{ padding: '12px' }}>Producto</th>
                                    <th style={{ padding: '12px' }}>Categoría</th>
                                    <th style={{ padding: '12px', width: '180px' }}>Precio Neto/Kg ($)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productos.map(producto => (
                                    <tr key={producto.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                        <td style={{ padding: '8px' }}>
                                            {producto.imagen ? (
                                                <img
                                                    src={producto.imagen}
                                                    alt={producto.nombre}
                                                    style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        objectFit: 'cover',
                                                        borderRadius: '6px'
                                                    }}
                                                />
                                            ) : (
                                                <img
                                                    src="/logo.jpg"
                                                    alt="Producto"
                                                    style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        objectFit: 'cover',
                                                        borderRadius: '6px'
                                                    }}
                                                />
                                            )}
                                        </td>
                                        <td style={{ padding: '12px', fontWeight: '600' }}>
                                            {producto.nombre}
                                        </td>
                                        <td style={{ padding: '12px', color: '#888' }}>
                                            {producto.categoria || '-'}
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <input
                                                type="number"
                                                value={getPrice(producto.id) || ''}
                                                onChange={(e) => handlePriceChange(producto.id, e.target.value)}
                                                placeholder="0"
                                                min="0"
                                                style={{
                                                    width: '100%',
                                                    padding: '8px 12px',
                                                    border: getPrice(producto.id) > 0 ? '2px solid #4caf50' : '1px solid #ddd',
                                                    borderRadius: '6px',
                                                    textAlign: 'right',
                                                    fontWeight: getPrice(producto.id) > 0 ? 'bold' : 'normal'
                                                }}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    <div style={{
                        marginTop: '20px',
                        padding: '15px',
                        backgroundColor: '#e8f5e9',
                        borderRadius: '8px',
                        fontSize: '0.9rem'
                    }}>
                        <strong>💡 Nota:</strong> Los productos con precio $0 no aparecerán en el catálogo del cliente.
                    </div>
                </div>
            )}
        </div>
    );
}

export default function PreciosClientesPage() {
    return (
        <Suspense fallback={<div style={{ padding: '20px' }}>Cargando...</div>}>
            <PreciosContent />
        </Suspense>
    );
}
