'use client';

import { useState, useEffect } from 'react';
import Modal from './Modal';

interface Producto {
    id: number;
    nombre: string;
    descripcion: string;
    categoria: string;
    imagen: string;
    destacado: boolean;
    activo: boolean;
    orden: number;
}

export default function ProductosCatalogoTable() {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState<Partial<Producto>>({
        nombre: '',
        descripcion: '',
        categoria: 'Pan',
        imagen: '',
        destacado: false,
        activo: true
    });

    useEffect(() => {
        fetchProductos();
    }, []);

    const fetchProductos = async () => {
        try {
            const res = await fetch('/api/productos-catalogo');
            const data = await res.json();
            // Sort: active first, inactive last
            const sorted = data.sort((a: Producto, b: Producto) => {
                if (a.activo === b.activo) return 0;
                return a.activo ? -1 : 1;
            });
            setProductos(sorted);
        } catch (error) {
            console.error('Error fetching productos:', error);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);

        try {
            const res = await fetch('/api/upload-image', {
                method: 'POST',
                body: formDataUpload
            });

            const data = await res.json();
            if (data.success) {
                setFormData({ ...formData, imagen: data.url });
            } else {
                alert(data.error || 'Error uploading image');
            }
        } catch (error) {
            alert('Error uploading image');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('handleSubmit called', formData);

        try {
            const url = '/api/productos-catalogo';
            const method = editingId ? 'PUT' : 'POST';
            const payload = editingId ? { ...formData, id: editingId } : formData;

            console.log('Sending request:', { method, url, payload });

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            console.log('Response status:', res.status);

            if (res.ok) {
                const data = await res.json();
                console.log('Product saved:', data);
                await fetchProductos();
                closeModal();
            } else {
                const error = await res.json();
                console.error('Server error:', error);
                alert(`Error: ${error.error || 'Failed to save product'}`);
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert('Error saving product: ' + error);
        }
    };

    const handleEdit = (producto: Producto) => {
        setEditingId(producto.id);
        setFormData(producto);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Eliminar este producto?')) return;

        try {
            const res = await fetch(`/api/productos-catalogo?id=${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                fetchProductos();
            }
        } catch (error) {
            alert('Error deleting product');
        }
    };

    const handleToggleStatus = async (producto: Producto) => {
        try {
            await fetch('/api/productos-catalogo', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...producto, activo: !producto.activo })
            });
            fetchProductos();
        } catch (error) {
            alert('Error updating status');
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({
            nombre: '',
            descripcion: '',
            categoria: 'Pan',
            imagen: '',
            destacado: false,
            activo: true
        });
    };

    return (
        <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <p style={{ color: '#666' }}>Gestiona los productos que aparecen en la web pública</p>
                <button
                    className="btn btn-primary"
                    style={{ fontSize: '0.9rem', padding: '8px 16px' }}
                    onClick={() => setIsModalOpen(true)}
                >
                    + Nuevo Producto
                </button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                        <th style={{ padding: '10px' }}>Imagen</th>
                        <th style={{ padding: '10px' }}>Nombre</th>
                        <th style={{ padding: '10px' }}>Categoría</th>
                        <th style={{ padding: '10px' }}>Destacado</th>
                        <th style={{ padding: '10px' }}>Estado</th>
                        <th style={{ padding: '10px' }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {productos.map((producto) => (
                        <tr key={producto.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '10px' }}>
                                <img src={producto.imagen} alt={producto.nombre} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                            </td>
                            <td style={{ padding: '10px', fontWeight: 'bold' }}>{producto.nombre}</td>
                            <td style={{ padding: '10px' }}>
                                <span style={{ padding: '4px 8px', borderRadius: '8px', backgroundColor: '#e3f2fd', fontSize: '0.85rem' }}>
                                    {producto.categoria}
                                </span>
                            </td>
                            <td style={{ padding: '10px' }}>
                                {producto.destacado ? '⭐ Sí' : 'No'}
                            </td>
                            <td style={{ padding: '10px' }}>
                                <span style={{
                                    padding: '4px 12px',
                                    borderRadius: '12px',
                                    fontSize: '0.85rem',
                                    backgroundColor: producto.activo ? '#e8f5e9' : '#ffebee',
                                    color: producto.activo ? '#2e7d32' : '#c62828'
                                }}>
                                    {producto.activo ? '✓ Activo' : '✗ Inactivo'}
                                </span>
                            </td>
                            <td style={{ padding: '10px' }}>
                                <button
                                    onClick={() => handleToggleStatus(producto)}
                                    style={{ marginRight: '5px', padding: '4px 8px', cursor: 'pointer', border: '1px solid #757575', backgroundColor: '#f5f5f5', borderRadius: '4px' }}
                                    title={producto.activo ? 'Desactivar' : 'Activar'}
                                >
                                    {producto.activo ? '👁️' : '🚫'}
                                </button>
                                <button
                                    onClick={() => handleEdit(producto)}
                                    style={{ marginRight: '5px', padding: '4px 8px', cursor: 'pointer', border: '1px solid #2196f3', backgroundColor: '#e3f2fd', borderRadius: '4px' }}
                                    title="Editar"
                                >
                                    ✏️
                                </button>
                                <button
                                    onClick={() => handleDelete(producto.id)}
                                    style={{ padding: '4px 8px', cursor: 'pointer', border: '1px solid #f44336', backgroundColor: '#ffebee', borderRadius: '4px' }}
                                    title="Eliminar"
                                >
                                    🗑️
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? "Editar Producto" : "Nuevo Producto"}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Nombre *</label>
                        <input
                            type="text"
                            required
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            placeholder="Ej: Marraqueta"
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Descripción</label>
                        <textarea
                            value={formData.descripcion}
                            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '80px' }}
                            placeholder="Breve descripción del producto (opcional)"
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Categoría *</label>
                        <select
                            required
                            value={formData.categoria}
                            onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        >
                            <option value="Pan">Pan</option>
                            <option value="Pastelería">Pastelería</option>
                            <option value="Masa">Masa</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Imagen del Producto (Opcional)</label>
                        <input
                            type="file"
                            accept="image/png,image/jpeg,image/jpg,image/webp"
                            onChange={handleImageUpload}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                        {uploading && <p style={{ color: '#666', fontSize: '0.85rem', marginTop: '5px' }}>Subiendo imagen...</p>}
                        {formData.imagen && (
                            <div style={{ marginTop: '10px' }}>
                                <img src={formData.imagen} alt="Preview" style={{ maxWidth: '200px', borderRadius: '4px' }} />
                            </div>
                        )}
                    </div>

                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={formData.destacado ?? false}
                                onChange={(e) => setFormData({ ...formData, destacado: e.target.checked })}
                            />
                            <span>⭐ Mostrar en portada (Destacado)</span>
                        </label>
                    </div>

                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={formData.activo ?? true}
                                onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                            />
                            <span>Activo (visible en la web)</span>
                        </label>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={uploading}>
                            Guardar
                        </button>
                        <button
                            type="button"
                            onClick={closeModal}
                            style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff', cursor: 'pointer' }}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
