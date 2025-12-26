'use client';

import { useState } from 'react';
import Modal from './Modal';
import { useDashboard } from '@/context/DashboardContext';
import type { MaestroArea, Insumo, Proveedor, Cliente, Trabajador } from '@/types/dashboard';
import { formatRUT } from '@/lib/rutUtils';

export default function ConfiguracionTable() {
    const {
        maestroAreas, addMaestroArea, updateMaestroArea, deleteMaestroArea,
        maestroInsumos, addMaestroInsumo, updateMaestroInsumo, deleteMaestroInsumo,
        maestroProveedores, addMaestroProveedor, updateMaestroProveedor, deleteMaestroProveedor,
        maestroClientes, addMaestroCliente, updateMaestroCliente, deleteMaestroCliente,
        maestroTrabajadores, addMaestroTrabajador, updateMaestroTrabajador, deleteMaestroTrabajador
    } = useDashboard();

    const [activeTab, setActiveTab] = useState<'areas' | 'insumos' | 'proveedores' | 'clientes' | 'trabajadores' | 'respaldos'>('areas');

    // Areas Modal State
    const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
    const [editingAreaId, setEditingAreaId] = useState<number | null>(null);
    const [areaFormData, setAreaFormData] = useState<Partial<MaestroArea>>({
        nombre: '',
        activo: true
    });

    // Insumos Modal State
    const [isInsumoModalOpen, setIsInsumoModalOpen] = useState(false);
    const [editingInsumoId, setEditingInsumoId] = useState<number | null>(null);
    const [insumoFormData, setInsumoFormData] = useState<Partial<Insumo>>({
        nombre: '',
        unidad: 'kg',
        activo: true,
        costoUnitario: 0,
        tieneImpuestoAdicional: false,
        stockMinimo: 0
    });

    // Proveedores Modal State
    const [isProveedorModalOpen, setIsProveedorModalOpen] = useState(false);
    const [editingProveedorId, setEditingProveedorId] = useState<number | null>(null);
    const [proveedorFormData, setProveedorFormData] = useState<Partial<Proveedor>>({
        rut: '',
        nombre: '',
        contacto: '',
        telefono: '',
        email: '',
        direccion: '',
        activo: true
    });

    // Clientes Modal State
    const [isClienteModalOpen, setIsClienteModalOpen] = useState(false);
    const [editingClienteId, setEditingClienteId] = useState<number | null>(null);
    const [clienteFormData, setClienteFormData] = useState<Partial<Cliente>>({
        rut: '',
        nombre: '',
        tipo: 'empresa',
        contacto: '',
        telefono: '',
        email: '',
        direccion: '',
        activo: true
    });

    // Trabajadores Modal State
    const [isTrabajadorModalOpen, setIsTrabajadorModalOpen] = useState(false);
    const [editingTrabajadorId, setEditingTrabajadorId] = useState<number | null>(null);
    const [trabajadorFormData, setTrabajadorFormData] = useState<Partial<Trabajador>>({
        rut: '',
        nombre: '',
        cargo: '',
        telefono: '',
        email: '',
        fechaIngreso: '',
        activo: true
    });

    // Areas Handlers
    const handleAreaSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingAreaId) {
            updateMaestroArea(editingAreaId, areaFormData);
        } else {
            addMaestroArea({
                nombre: areaFormData.nombre || '',
                activo: areaFormData.activo ?? true
            });
        }
        setIsAreaModalOpen(false);
        setEditingAreaId(null);
        setAreaFormData({ nombre: '', activo: true });
    };

    const handleEditArea = (area: MaestroArea) => {
        setEditingAreaId(area.id);
        setAreaFormData({ nombre: area.nombre, activo: area.activo });
        setIsAreaModalOpen(true);
    };

    const handleDeleteArea = (id: number) => {
        if (confirm('¿Estás seguro de eliminar esta área?')) {
            deleteMaestroArea(id);
        }
    };

    const handleToggleAreaStatus = (id: number, activo: boolean) => {
        updateMaestroArea(id, { activo: !activo });
    };

    // Insumos Handlers
    const handleInsumoSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingInsumoId) {
            updateMaestroInsumo(editingInsumoId, insumoFormData);
        } else {
            addMaestroInsumo({
                nombre: insumoFormData.nombre || '',
                unidad: insumoFormData.unidad || 'kg',
                activo: insumoFormData.activo ?? true,
                costoUnitario: Number(insumoFormData.costoUnitario) || 0,
                tieneImpuestoAdicional: insumoFormData.tieneImpuestoAdicional ?? false,
                stockMinimo: Number(insumoFormData.stockMinimo) || 0
            });
        }
        setIsInsumoModalOpen(false);
        setIsInsumoModalOpen(false);
        setEditingInsumoId(null);
        setInsumoFormData({ nombre: '', unidad: 'kg', activo: true, costoUnitario: 0, tieneImpuestoAdicional: false, stockMinimo: 0 });
    };

    const handleEditInsumo = (insumo: Insumo) => {
        setEditingInsumoId(insumo.id);
        setInsumoFormData({
            nombre: insumo.nombre,
            unidad: insumo.unidad,
            activo: insumo.activo,
            costoUnitario: insumo.costoUnitario,
            tieneImpuestoAdicional: insumo.tieneImpuestoAdicional,
            stockMinimo: insumo.stockMinimo
        });
        setIsInsumoModalOpen(true);
    };

    const handleDeleteInsumo = (id: number) => {
        if (confirm('¿Estás seguro de eliminar este insumo?')) {
            deleteMaestroInsumo(id);
        }
    };

    const handleToggleInsumoStatus = (id: number, activo: boolean) => {
        updateMaestroInsumo(id, { activo: !activo });
    };

    const getUnidadLabel = (unidad: string) => {
        const labels: Record<string, string> = {
            'sacos_25kg': 'Sacos (25kg)',
            'kg': 'Kilogramos',
            'unidades': 'Unidades',
            'sacos': 'Sacos'
        };
        return labels[unidad] || unidad;
    };

    // Proveedores Handlers
    const handleProveedorSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingProveedorId) {
            updateMaestroProveedor(editingProveedorId, proveedorFormData);
        } else {
            addMaestroProveedor({
                rut: proveedorFormData.rut || '',
                nombre: proveedorFormData.nombre || '',
                contacto: proveedorFormData.contacto || '',
                telefono: proveedorFormData.telefono || '',
                email: proveedorFormData.email || '',
                direccion: proveedorFormData.direccion || '',
                activo: proveedorFormData.activo ?? true
            });
        }
        setIsProveedorModalOpen(false);
        setEditingProveedorId(null);
        setProveedorFormData({ rut: '', nombre: '', contacto: '', telefono: '', email: '', direccion: '', activo: true });
    };

    const handleEditProveedor = (proveedor: Proveedor) => {
        setEditingProveedorId(proveedor.id);
        setProveedorFormData(proveedor);
        setIsProveedorModalOpen(true);
    };

    const handleDeleteProveedor = (id: number) => {
        if (confirm('¿Estás seguro de eliminar este proveedor?')) {
            deleteMaestroProveedor(id);
        }
    };

    const handleToggleProveedorStatus = (id: number, activo: boolean) => {
        updateMaestroProveedor(id, { activo: !activo });
    };

    // Clientes Handlers
    const handleClienteSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingClienteId) {
            updateMaestroCliente(editingClienteId, clienteFormData);
        } else {
            addMaestroCliente({
                rut: clienteFormData.rut || '',
                nombre: clienteFormData.nombre || '',
                tipo: clienteFormData.tipo as 'empresa' | 'persona' || 'empresa',
                contacto: clienteFormData.contacto || '',
                telefono: clienteFormData.telefono || '',
                email: clienteFormData.email || '',
                direccion: clienteFormData.direccion || '',
                activo: clienteFormData.activo ?? true
            });
        }
        setIsClienteModalOpen(false);
        setEditingClienteId(null);
        setClienteFormData({ rut: '', nombre: '', tipo: 'empresa', contacto: '', telefono: '', email: '', direccion: '', activo: true });
    };

    const handleEditCliente = (cliente: Cliente) => {
        setEditingClienteId(cliente.id);
        setClienteFormData(cliente);
        setIsClienteModalOpen(true);
    };

    const handleDeleteCliente = (id: number) => {
        if (confirm('¿Estás seguro de eliminar este cliente?')) {
            deleteMaestroCliente(id);
        }
    };

    const handleToggleClienteStatus = (id: number, activo: boolean) => {
        updateMaestroCliente(id, { activo: !activo });
    };

    // Trabajadores Handlers
    const handleTrabajadorSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingTrabajadorId) {
            updateMaestroTrabajador(editingTrabajadorId, trabajadorFormData);
        } else {
            addMaestroTrabajador({
                rut: trabajadorFormData.rut || '',
                nombre: trabajadorFormData.nombre || '',
                cargo: trabajadorFormData.cargo || '',
                telefono: trabajadorFormData.telefono || '',
                email: trabajadorFormData.email || '',
                fechaIngreso: trabajadorFormData.fechaIngreso || '',
                activo: trabajadorFormData.activo ?? true
            });
        }
        setIsTrabajadorModalOpen(false);
        setEditingTrabajadorId(null);
        setTrabajadorFormData({ rut: '', nombre: '', cargo: '', telefono: '', email: '', fechaIngreso: '', activo: true });
    };

    const handleEditTrabajador = (trabajador: Trabajador) => {
        setEditingTrabajadorId(trabajador.id);
        setTrabajadorFormData(trabajador);
        setIsTrabajadorModalOpen(true);
    };

    const handleDeleteTrabajador = (id: number) => {
        if (confirm('¿Estás seguro de eliminar este trabajador?')) {
            deleteMaestroTrabajador(id);
        }
    };

    const handleToggleTrabajadorStatus = (id: number, activo: boolean) => {
        updateMaestroTrabajador(id, { activo: !activo });
    };

    return (
        <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Configuración de Maestros</h3>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid #eee' }}>
                <button
                    onClick={() => setActiveTab('areas')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        borderBottom: activeTab === 'areas' ? '3px solid var(--color-primary)' : 'none',
                        fontWeight: activeTab === 'areas' ? 'bold' : 'normal',
                        color: activeTab === 'areas' ? 'var(--color-primary)' : '#666'
                    }}
                >
                    📁 Áreas
                </button>
                <button
                    onClick={() => setActiveTab('insumos')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        borderBottom: activeTab === 'insumos' ? '3px solid var(--color-primary)' : 'none',
                        fontWeight: activeTab === 'insumos' ? 'bold' : 'normal',
                        color: activeTab === 'insumos' ? 'var(--color-primary)' : '#666'
                    }}
                >
                    📦 Insumos
                </button>
                <button
                    onClick={() => setActiveTab('proveedores')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        borderBottom: activeTab === 'proveedores' ? '3px solid var(--color-primary)' : 'none',
                        fontWeight: activeTab === 'proveedores' ? 'bold' : 'normal',
                        color: activeTab === 'proveedores' ? 'var(--color-primary)' : '#666'
                    }}
                >
                    🏢 Proveedores
                </button>
                <button
                    onClick={() => setActiveTab('clientes')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        borderBottom: activeTab === 'clientes' ? '3px solid var(--color-primary)' : 'none',
                        fontWeight: activeTab === 'clientes' ? 'bold' : 'normal',
                        color: activeTab === 'clientes' ? 'var(--color-primary)' : '#666'
                    }}
                >
                    👥 Clientes
                </button>
                <button
                    onClick={() => setActiveTab('trabajadores')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        borderBottom: activeTab === 'trabajadores' ? '3px solid var(--color-primary)' : 'none',
                        fontWeight: activeTab === 'trabajadores' ? 'bold' : 'normal',
                        color: activeTab === 'trabajadores' ? 'var(--color-primary)' : '#666'
                    }}
                >
                    👷 Trabajadores
                </button>
                <button
                    onClick={() => setActiveTab('respaldos')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        borderBottom: activeTab === 'respaldos' ? '3px solid var(--color-primary)' : 'none',
                        fontWeight: activeTab === 'respaldos' ? 'bold' : 'normal',
                        color: activeTab === 'respaldos' ? 'var(--color-primary)' : '#666'
                    }}
                >
                    💾 Respaldos
                </button>
            </div>

            {/* Areas Tab */}
            {activeTab === 'areas' && (
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <p style={{ color: '#666' }}>Gestiona las áreas disponibles para Caja Chica</p>
                        <button
                            className="btn btn-primary"
                            style={{ fontSize: '0.9rem', padding: '8px 16px' }}
                            onClick={() => setIsAreaModalOpen(true)}
                        >
                            + Nueva Área
                        </button>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                                <th style={{ padding: '10px' }}>Nombre</th>
                                <th style={{ padding: '10px' }}>Estado</th>
                                <th style={{ padding: '10px' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {maestroAreas.map((area) => (
                                <tr key={area.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '10px', fontWeight: 'bold' }}>{area.nombre}</td>
                                    <td style={{ padding: '10px' }}>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '12px',
                                            fontSize: '0.85rem',
                                            backgroundColor: area.activo ? '#e8f5e9' : '#ffebee',
                                            color: area.activo ? '#2e7d32' : '#c62828'
                                        }}>
                                            {area.activo ? '✓ Activo' : '✗ Inactivo'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '10px' }}>
                                        <button
                                            onClick={() => handleToggleAreaStatus(area.id, area.activo)}
                                            style={{ marginRight: '5px', padding: '4px 8px', cursor: 'pointer', border: '1px solid #757575', backgroundColor: '#f5f5f5', borderRadius: '4px' }}
                                            title={area.activo ? 'Desactivar' : 'Activar'}
                                        >
                                            {area.activo ? '👁️' : '🚫'}
                                        </button>
                                        <button
                                            onClick={() => handleEditArea(area)}
                                            style={{ marginRight: '5px', padding: '4px 8px', cursor: 'pointer', border: '1px solid #2196f3', backgroundColor: '#e3f2fd', borderRadius: '4px' }}
                                            title="Editar"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => handleDeleteArea(area.id)}
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

                    <Modal isOpen={isAreaModalOpen} onClose={() => setIsAreaModalOpen(false)} title={editingAreaId ? "Editar Área" : "Nueva Área"}>
                        <form onSubmit={handleAreaSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Nombre *</label>
                                <input
                                    type="text"
                                    required
                                    value={areaFormData.nombre}
                                    onChange={(e) => setAreaFormData({ ...areaFormData, nombre: e.target.value })}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                    placeholder="Ej: Producción, Ventas..."
                                />
                            </div>

                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={areaFormData.activo ?? true}
                                        onChange={(e) => setAreaFormData({ ...areaFormData, activo: e.target.checked })}
                                    />
                                    <span>Activo</span>
                                </label>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                    Guardar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsAreaModalOpen(false)}
                                    style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff', cursor: 'pointer' }}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </Modal>
                </>
            )}

            {/* Insumos Tab */}
            {activeTab === 'insumos' && (
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <p style={{ color: '#666' }}>Gestiona los insumos disponibles para Inventario</p>
                        <button
                            className="btn btn-primary"
                            style={{ fontSize: '0.9rem', padding: '8px 16px' }}
                            onClick={() => setIsInsumoModalOpen(true)}
                        >
                            + Nuevo Insumo
                        </button>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                                <th style={{ padding: '10px' }}>Nombre</th>
                                <th style={{ padding: '10px' }}>Unidad</th>
                                <th style={{ padding: '10px' }}>Costo Neto</th>
                                <th style={{ padding: '10px' }}>Impuestos</th>
                                <th style={{ padding: '10px' }}>Estado</th>
                                <th style={{ padding: '10px' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {maestroInsumos.map((insumo) => (
                                <tr key={insumo.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '10px', fontWeight: 'bold' }}>{insumo.nombre}</td>
                                    <td style={{ padding: '10px' }}>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '8px',
                                            backgroundColor: '#e3f2fd',
                                            fontSize: '0.85rem'
                                        }}>
                                            {getUnidadLabel(insumo.unidad)}
                                        </span>
                                    </td>
                                    <td style={{ padding: '10px' }}>
                                        ${(insumo.costoUnitario || 0).toLocaleString()}
                                    </td>
                                    <td style={{ padding: '10px' }}>
                                        <div style={{ fontSize: '0.85rem' }}>
                                            <span style={{ color: '#666' }}>IVA (19%)</span>
                                            {insumo.tieneImpuestoAdicional && (
                                                <span style={{ marginLeft: '5px', color: '#d32f2f', fontWeight: 'bold' }}>+ ILA (12%)</span>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: '10px' }}>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '12px',
                                            fontSize: '0.85rem',
                                            backgroundColor: insumo.activo ? '#e8f5e9' : '#ffebee',
                                            color: insumo.activo ? '#2e7d32' : '#c62828'
                                        }}>
                                            {insumo.activo ? '✓ Activo' : '✗ Inactivo'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '10px' }}>
                                        <button
                                            onClick={() => handleToggleInsumoStatus(insumo.id, insumo.activo)}
                                            style={{ marginRight: '5px', padding: '4px 8px', cursor: 'pointer', border: '1px solid #757575', backgroundColor: '#f5f5f5', borderRadius: '4px' }}
                                            title={insumo.activo ? 'Desactivar' : 'Activar'}
                                        >
                                            {insumo.activo ? '👁️' : '🚫'}
                                        </button>
                                        <button
                                            onClick={() => handleEditInsumo(insumo)}
                                            style={{ marginRight: '5px', padding: '4px 8px', cursor: 'pointer', border: '1px solid #2196f3', backgroundColor: '#e3f2fd', borderRadius: '4px' }}
                                            title="Editar"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => handleDeleteInsumo(insumo.id)}
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

                    <Modal isOpen={isInsumoModalOpen} onClose={() => setIsInsumoModalOpen(false)} title={editingInsumoId ? "Editar Insumo" : "Nuevo Insumo"}>
                        <form onSubmit={handleInsumoSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Nombre *</label>
                                <input
                                    type="text"
                                    required
                                    value={insumoFormData.nombre}
                                    onChange={(e) => setInsumoFormData({ ...insumoFormData, nombre: e.target.value })}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                    placeholder="Ej: Harina, Levadura..."
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Unidad de Medida *</label>
                                <select
                                    required
                                    value={insumoFormData.unidad}
                                    onChange={(e) => setInsumoFormData({ ...insumoFormData, unidad: e.target.value })}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                >
                                    <option value="sacos_25kg">Sacos (25kg)</option>
                                    <option value="kg">Kilogramos</option>
                                    <option value="sacos">Sacos</option>
                                    <option value="unidades">Unidades</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                    Costo Promedio Ponderado
                                    <span style={{ fontWeight: 'normal', fontSize: '0.8rem', color: '#666', display: 'block' }}>
                                        (Se calcula automáticamente con cada compra en Inventario)
                                    </span>
                                </label>
                                <div style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    borderRadius: '4px',
                                    border: '1px solid #ddd',
                                    backgroundColor: '#f5f5f5',
                                    color: '#333',
                                    fontSize: '1rem'
                                }}>
                                    {insumoFormData.costoUnitario ? `$${Number(insumoFormData.costoUnitario).toLocaleString()}` : 'Sin compras registradas'}
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Stock Mínimo (alerta)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={insumoFormData.stockMinimo}
                                    onChange={(e) => setInsumoFormData({ ...insumoFormData, stockMinimo: Number(e.target.value) })}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                    placeholder="Ej: 5 (se alertará cuando queden menos)"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '0.5rem' }}>
                                    <input
                                        type="checkbox"
                                        checked={insumoFormData.tieneImpuestoAdicional ?? false}
                                        onChange={(e) => setInsumoFormData({ ...insumoFormData, tieneImpuestoAdicional: e.target.checked })}
                                    />
                                    <span>Aplica Impuesto Adicional (12%) - Ej: Harinas</span>
                                </label>
                            </div>

                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={insumoFormData.activo ?? true}
                                        onChange={(e) => setInsumoFormData({ ...insumoFormData, activo: e.target.checked })}
                                    />
                                    <span>Activo</span>
                                </label>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                    Guardar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsInsumoModalOpen(false)}
                                    style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff', cursor: 'pointer' }}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </Modal>
                </>
            )}

            {/* Proveedores Tab */}
            {activeTab === 'proveedores' && (
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <p style={{ color: '#666' }}>Gestiona los proveedores</p>
                        <button
                            className="btn btn-primary"
                            style={{ fontSize: '0.9rem', padding: '8px 16px' }}
                            onClick={() => setIsProveedorModalOpen(true)}
                        >
                            + Nuevo Proveedor
                        </button>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                                <th style={{ padding: '10px' }}>RUT</th>
                                <th style={{ padding: '10px' }}>Nombre</th>
                                <th style={{ padding: '10px' }}>Contacto</th>
                                <th style={{ padding: '10px' }}>Teléfono</th>
                                <th style={{ padding: '10px' }}>Estado</th>
                                <th style={{ padding: '10px' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {maestroProveedores.map((proveedor) => (
                                <tr key={proveedor.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '10px', fontWeight: 'bold' }}>{proveedor.rut}</td>
                                    <td style={{ padding: '10px' }}>{proveedor.nombre}</td>
                                    <td style={{ padding: '10px' }}>{proveedor.contacto}</td>
                                    <td style={{ padding: '10px' }}>{proveedor.telefono}</td>
                                    <td style={{ padding: '10px' }}>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '12px',
                                            fontSize: '0.85rem',
                                            backgroundColor: proveedor.activo ? '#e8f5e9' : '#ffebee',
                                            color: proveedor.activo ? '#2e7d32' : '#c62828'
                                        }}>
                                            {proveedor.activo ? '✓ Activo' : '✗ Inactivo'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '10px' }}>
                                        <button
                                            onClick={() => handleToggleProveedorStatus(proveedor.id, proveedor.activo)}
                                            style={{ marginRight: '5px', padding: '4px 8px', cursor: 'pointer', border: '1px solid #757575', backgroundColor: '#f5f5f5', borderRadius: '4px' }}
                                            title={proveedor.activo ? 'Desactivar' : 'Activar'}
                                        >
                                            {proveedor.activo ? '👁️' : '🚫'}
                                        </button>
                                        <button
                                            onClick={() => handleEditProveedor(proveedor)}
                                            style={{ marginRight: '5px', padding: '4px 8px', cursor: 'pointer', border: '1px solid #2196f3', backgroundColor: '#e3f2fd', borderRadius: '4px' }}
                                            title="Editar"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => handleDeleteProveedor(proveedor.id)}
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

                    <Modal isOpen={isProveedorModalOpen} onClose={() => setIsProveedorModalOpen(false)} title={editingProveedorId ? "Editar Proveedor" : "Nuevo Proveedor"}>
                        <form onSubmit={handleProveedorSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>RUT *</label>
                                <input
                                    type="text"
                                    required
                                    value={proveedorFormData.rut}
                                    onChange={(e) => setProveedorFormData({ ...proveedorFormData, rut: formatRUT(e.target.value) })}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                    placeholder="Ej: 12.345.678-9"
                                    maxLength={12}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Nombre *</label>
                                <input
                                    type="text"
                                    required
                                    value={proveedorFormData.nombre}
                                    onChange={(e) => setProveedorFormData({ ...proveedorFormData, nombre: e.target.value })}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                    placeholder="Nombre del proveedor"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Contacto</label>
                                <input
                                    type="text"
                                    value={proveedorFormData.contacto}
                                    onChange={(e) => setProveedorFormData({ ...proveedorFormData, contacto: e.target.value })}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                    placeholder="Nombre del contacto"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Teléfono</label>
                                <input
                                    type="text"
                                    value={proveedorFormData.telefono}
                                    onChange={(e) => setProveedorFormData({ ...proveedorFormData, telefono: e.target.value })}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                    placeholder="+56 9 1234 5678"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Email</label>
                                <input
                                    type="email"
                                    value={proveedorFormData.email}
                                    onChange={(e) => setProveedorFormData({ ...proveedorFormData, email: e.target.value })}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                    placeholder="email@ejemplo.com"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Dirección</label>
                                <input
                                    type="text"
                                    value={proveedorFormData.direccion}
                                    onChange={(e) => setProveedorFormData({ ...proveedorFormData, direccion: e.target.value })}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                    placeholder="Dirección completa"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={proveedorFormData.activo ?? true}
                                        onChange={(e) => setProveedorFormData({ ...proveedorFormData, activo: e.target.checked })}
                                    />
                                    <span>Activo</span>
                                </label>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                    Guardar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsProveedorModalOpen(false)}
                                    style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff', cursor: 'pointer' }}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </Modal>
                </>
            )}

            {/* Clientes Tab */}
            {activeTab === 'clientes' && (
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <p style={{ color: '#666' }}>Gestiona los clientes</p>
                        <button
                            className="btn btn-primary"
                            style={{ fontSize: '0.9rem', padding: '8px 16px' }}
                            onClick={() => setIsClienteModalOpen(true)}
                        >
                            + Nuevo Cliente
                        </button>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                                <th style={{ padding: '10px' }}>RUT</th>
                                <th style={{ padding: '10px' }}>Nombre</th>
                                <th style={{ padding: '10px' }}>Tipo</th>
                                <th style={{ padding: '10px' }}>Contacto</th>
                                <th style={{ padding: '10px' }}>Teléfono</th>
                                <th style={{ padding: '10px' }}>Estado</th>
                                <th style={{ padding: '10px' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {maestroClientes.map((cliente) => (
                                <tr key={cliente.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '10px', fontWeight: 'bold' }}>{cliente.rut}</td>
                                    <td style={{ padding: '10px' }}>{cliente.nombre}</td>
                                    <td style={{ padding: '10px' }}>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '8px',
                                            backgroundColor: cliente.tipo === 'empresa' ? '#e3f2fd' : '#fff3e0',
                                            fontSize: '0.85rem'
                                        }}>
                                            {cliente.tipo === 'empresa' ? '🏢 Empresa' : '👤 Persona'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '10px' }}>{cliente.contacto}</td>
                                    <td style={{ padding: '10px' }}>{cliente.telefono}</td>
                                    <td style={{ padding: '10px' }}>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '12px',
                                            fontSize: '0.85rem',
                                            backgroundColor: cliente.activo ? '#e8f5e9' : '#ffebee',
                                            color: cliente.activo ? '#2e7d32' : '#c62828'
                                        }}>
                                            {cliente.activo ? '✓ Activo' : '✗ Inactivo'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '10px' }}>
                                        <button
                                            onClick={() => handleToggleClienteStatus(cliente.id, cliente.activo)}
                                            style={{ marginRight: '5px', padding: '4px 8px', cursor: 'pointer', border: '1px solid #757575', backgroundColor: '#f5f5f5', borderRadius: '4px' }}
                                            title={cliente.activo ? 'Desactivar' : 'Activar'}
                                        >
                                            {cliente.activo ? '👁️' : '🚫'}
                                        </button>
                                        <button
                                            onClick={() => handleEditCliente(cliente)}
                                            style={{ marginRight: '5px', padding: '4px 8px', cursor: 'pointer', border: '1px solid #2196f3', backgroundColor: '#e3f2fd', borderRadius: '4px' }}
                                            title="Editar"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCliente(cliente.id)}
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

                    <Modal isOpen={isClienteModalOpen} onClose={() => setIsClienteModalOpen(false)} title={editingClienteId ? "Editar Cliente" : "Nuevo Cliente"}>
                        <form onSubmit={handleClienteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>RUT *</label>
                                <input
                                    type="text"
                                    required
                                    value={clienteFormData.rut}
                                    onChange={(e) => setClienteFormData({ ...clienteFormData, rut: formatRUT(e.target.value) })}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                    placeholder="Ej: 12.345.678-9"
                                    maxLength={12}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Nombre *</label>
                                <input
                                    type="text"
                                    required
                                    value={clienteFormData.nombre}
                                    onChange={(e) => setClienteFormData({ ...clienteFormData, nombre: e.target.value })}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                    placeholder="Nombre del cliente"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Tipo *</label>
                                <select
                                    required
                                    value={clienteFormData.tipo}
                                    onChange={(e) => setClienteFormData({ ...clienteFormData, tipo: e.target.value as 'empresa' | 'persona' })}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                >
                                    <option value="empresa">Empresa</option>
                                    <option value="persona">Persona</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Contacto</label>
                                <input
                                    type="text"
                                    value={clienteFormData.contacto}
                                    onChange={(e) => setClienteFormData({ ...clienteFormData, contacto: e.target.value })}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                    placeholder="Nombre del contacto"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Teléfono</label>
                                <input
                                    type="text"
                                    value={clienteFormData.telefono}
                                    onChange={(e) => setClienteFormData({ ...clienteFormData, telefono: e.target.value })}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                    placeholder="+56 9 1234 5678"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Email</label>
                                <input
                                    type="email"
                                    value={clienteFormData.email}
                                    onChange={(e) => setClienteFormData({ ...clienteFormData, email: e.target.value })}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                    placeholder="email@ejemplo.com"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Dirección</label>
                                <input
                                    type="text"
                                    value={clienteFormData.direccion}
                                    onChange={(e) => setClienteFormData({ ...clienteFormData, direccion: e.target.value })}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                    placeholder="Dirección completa"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={clienteFormData.activo ?? true}
                                        onChange={(e) => setClienteFormData({ ...clienteFormData, activo: e.target.checked })}
                                    />
                                    <span>Activo</span>
                                </label>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                    Guardar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsClienteModalOpen(false)}
                                    style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff', cursor: 'pointer' }}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </Modal>
                </>
            )}

            {/* Trabajadores Tab */}
            {activeTab === 'trabajadores' && (
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <p style={{ color: '#666' }}>Gestiona los trabajadores</p>
                        <button
                            className="btn btn-primary"
                            style={{ fontSize: '0.9rem', padding: '8px 16px' }}
                            onClick={() => setIsTrabajadorModalOpen(true)}
                        >
                            + Nuevo Trabajador
                        </button>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                                <th style={{ padding: '10px' }}>RUT</th>
                                <th style={{ padding: '10px' }}>Nombre</th>
                                <th style={{ padding: '10px' }}>Cargo</th>
                                <th style={{ padding: '10px' }}>Teléfono</th>
                                <th style={{ padding: '10px' }}>Fecha Ingreso</th>
                                <th style={{ padding: '10px' }}>Estado</th>
                                <th style={{ padding: '10px' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {maestroTrabajadores.map((trabajador) => (
                                <tr key={trabajador.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '10px', fontWeight: 'bold' }}>{trabajador.rut}</td>
                                    <td style={{ padding: '10px' }}>{trabajador.nombre}</td>
                                    <td style={{ padding: '10px' }}>{trabajador.cargo}</td>
                                    <td style={{ padding: '10px' }}>{trabajador.telefono}</td>
                                    <td style={{ padding: '10px' }}>{trabajador.fechaIngreso}</td>
                                    <td style={{ padding: '10px' }}>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '12px',
                                            fontSize: '0.85rem',
                                            backgroundColor: trabajador.activo ? '#e8f5e9' : '#ffebee',
                                            color: trabajador.activo ? '#2e7d32' : '#c62828'
                                        }}>
                                            {trabajador.activo ? '✓ Activo' : '✗ Inactivo'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '10px' }}>
                                        <button
                                            onClick={() => handleToggleTrabajadorStatus(trabajador.id, trabajador.activo)}
                                            style={{ marginRight: '5px', padding: '4px 8px', cursor: 'pointer', border: '1px solid #757575', backgroundColor: '#f5f5f5', borderRadius: '4px' }}
                                            title={trabajador.activo ? 'Desactivar' : 'Activar'}
                                        >
                                            {trabajador.activo ? '👁️' : '🚫'}
                                        </button>
                                        <button
                                            onClick={() => handleEditTrabajador(trabajador)}
                                            style={{ marginRight: '5px', padding: '4px 8px', cursor: 'pointer', border: '1px solid #2196f3', backgroundColor: '#e3f2fd', borderRadius: '4px' }}
                                            title="Editar"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => handleDeleteTrabajador(trabajador.id)}
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

                    <Modal isOpen={isTrabajadorModalOpen} onClose={() => setIsTrabajadorModalOpen(false)} title={editingTrabajadorId ? "Editar Trabajador" : "Nuevo Trabajador"}>
                        <form onSubmit={handleTrabajadorSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>RUT *</label>
                                <input
                                    type="text"
                                    required
                                    value={trabajadorFormData.rut}
                                    onChange={(e) => setTrabajadorFormData({ ...trabajadorFormData, rut: formatRUT(e.target.value) })}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                    placeholder="Ej: 12.345.678-9"
                                    maxLength={12}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Nombre *</label>
                                <input
                                    type="text"
                                    required
                                    value={trabajadorFormData.nombre}
                                    onChange={(e) => setTrabajadorFormData({ ...trabajadorFormData, nombre: e.target.value })}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                    placeholder="Nombre completo"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Cargo *</label>
                                <select
                                    required
                                    value={trabajadorFormData.cargo}
                                    onChange={(e) => setTrabajadorFormData({ ...trabajadorFormData, cargo: e.target.value })}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                >
                                    <option value="">Seleccionar cargo...</option>
                                    <option value="Panadero">Panadero</option>
                                    <option value="Aseador">Aseador</option>
                                    <option value="Administrativo">Administrativo</option>
                                    <option value="Repartidor">Repartidor</option>
                                    <option value="Otro">Otro</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Teléfono</label>
                                <input
                                    type="text"
                                    value={trabajadorFormData.telefono}
                                    onChange={(e) => setTrabajadorFormData({ ...trabajadorFormData, telefono: e.target.value })}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                    placeholder="+56 9 1234 5678"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Email</label>
                                <input
                                    type="email"
                                    value={trabajadorFormData.email}
                                    onChange={(e) => setTrabajadorFormData({ ...trabajadorFormData, email: e.target.value })}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                    placeholder="email@ejemplo.com"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Fecha de Ingreso *</label>
                                <input
                                    type="date"
                                    required
                                    value={trabajadorFormData.fechaIngreso}
                                    onChange={(e) => setTrabajadorFormData({ ...trabajadorFormData, fechaIngreso: e.target.value })}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={trabajadorFormData.activo ?? true}
                                        onChange={(e) => setTrabajadorFormData({ ...trabajadorFormData, activo: e.target.checked })}
                                    />
                                    <span>Activo</span>
                                </label>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                    Guardar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsTrabajadorModalOpen(false)}
                                    style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff', cursor: 'pointer' }}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </Modal>
                </>
            )}

            {/* Respaldos Tab */}
            {activeTab === 'respaldos' && (
                <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div>
                            <h4 style={{ marginBottom: '0.5rem' }}>Respaldar Base de Datos</h4>
                            <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                                Descarga una copia completa de tu base de datos (usuarios, ventas, inventario, etc.)
                                para guardarla en un lugar seguro como Google Drive, Dropbox o tu computadora.
                            </p>
                            <button
                                onClick={async () => {
                                    try {
                                        const res = await fetch('/api/backup');
                                        const data = await res.json();
                                        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        const dateStr = new Date().toISOString().split('T')[0];
                                        a.href = url;
                                        a.download = `backup_panificadora_${dateStr}.json`;
                                        document.body.appendChild(a);
                                        a.click();
                                        document.body.removeChild(a);
                                        URL.revokeObjectURL(url);
                                        alert('✅ Respaldo descargado correctamente');
                                    } catch (error) {
                                        alert('Error al descargar respaldo: ' + error);
                                    }
                                }}
                                className="btn btn-primary"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    cursor: 'pointer'
                                }}
                            >
                                💾 Descargar Respaldo
                            </button>
                        </div>

                        <div style={{
                            padding: '1.5rem',
                            backgroundColor: '#f5f5f5',
                            borderRadius: '8px',
                            borderLeft: '4px solid var(--color-primary)'
                        }}>
                            <h5 style={{ marginTop: 0, marginBottom: '1rem' }}>📋 Recomendaciones:</h5>
                            <ul style={{ marginLeft: '1.5rem', lineHeight: 1.8 }}>
                                <li>Haz respaldos semanalmente o antes de cambios importantes</li>
                                <li>Guarda el archivo en un lugar seguro (Drive, Dropbox, USB externo)</li>
                                <li>El archivo contiene TODOS tus datos en formato JSON</li>
                                <li>Puedes restaurar los datos contactando a soporte si es necesario</li>
                            </ul>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
