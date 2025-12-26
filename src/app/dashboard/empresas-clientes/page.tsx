'use client';

import { useState, useEffect } from 'react';
import type { EmpresaCliente, CasinoSucursal } from '@/types/dashboard';

import { formatRUT, validateRUT } from '@/lib/rutUtils';

export default function EmpresasClientesPage() {
    const [empresas, setEmpresas] = useState<EmpresaCliente[]>([]);
    const [casinos, setCasinos] = useState<CasinoSucursal[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showCasinoModal, setShowCasinoModal] = useState(false);
    const [selectedEmpresa, setSelectedEmpresa] = useState<EmpresaCliente | null>(null);
    const [rutError, setRutError] = useState('');
    const [formData, setFormData] = useState({
        id: 0,
        rut: '',
        nombre: '',
        contacto: '',
        telefono: '',
        email: ''
    });
    const [casinoFormData, setCasinoFormData] = useState({
        id: 0,
        empresaId: 0,
        nombre: '',
        username: '',
        password: '',
        direccion: '',
        telefono: '',
        email: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [empresasRes, casinosRes] = await Promise.all([
                fetch('/api/empresas-clientes'),
                fetch('/api/casinos')
            ]);

            const empresasData = await empresasRes.json();
            const casinosData = await casinosRes.json();

            // Validate responses are arrays
            if (Array.isArray(empresasData)) {
                // Sort: active first, inactive last
                const sorted = empresasData.sort((a, b) => {
                    if (a.activo === b.activo) return 0;
                    return a.activo ? -1 : 1;
                });
                setEmpresas(sorted);
            } else {
                console.error('empresasData is not an array:', empresasData);
                setEmpresas([]);
            }

            if (Array.isArray(casinosData)) {
                // Sort: active first, inactive last
                const sorted = casinosData.sort((a, b) => {
                    if (a.activo === b.activo) return 0;
                    return a.activo ? -1 : 1;
                });
                setCasinos(sorted);
            } else {
                console.error('casinosData is not an array:', casinosData);
                setCasinos([]);
            }
        } catch (error) {
            console.error('Error loading data:', error);
            setEmpresas([]);
            setCasinos([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitEmpresa = async (e: React.FormEvent) => {
        e.preventDefault();
        const method = formData.id ? 'PUT' : 'POST';

        try {
            const res = await fetch('/api/empresas-clientes', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                loadData();
                setShowModal(false);
                resetForm();
            } else {
                const error = await res.json();
                alert(error.error || 'Error al guardar');
            }
        } catch {
            alert('Error de conexión');
        }
    };

    const handleSubmitCasino = async (e: React.FormEvent) => {
        e.preventDefault();
        const method = casinoFormData.id ? 'PUT' : 'POST';

        try {
            const res = await fetch('/api/casinos', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(casinoFormData)
            });

            if (res.ok) {
                loadData();
                setShowCasinoModal(false);
                resetCasinoForm();
            } else {
                const error = await res.json();
                alert(error.error || 'Error al guardar');
            }
        } catch {
            alert('Error de conexión');
        }
    };

    const resetForm = () => {
        setFormData({ id: 0, rut: '', nombre: '', contacto: '', telefono: '', email: '' });
    };

    const resetCasinoForm = () => {
        setCasinoFormData({
            id: 0, empresaId: 0, nombre: '', username: '', password: '',
            direccion: '', telefono: '', email: ''
        });
    };

    const handleEditEmpresa = (empresa: EmpresaCliente) => {
        setFormData({
            id: empresa.id,
            rut: empresa.rut,
            nombre: empresa.nombre,
            contacto: empresa.contacto,
            telefono: empresa.telefono,
            email: empresa.email
        });
        setShowModal(true);
    };

    const handleToggleActivo = async (empresa: EmpresaCliente) => {
        try {
            const response = await fetch('/api/empresas-clientes', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: empresa.id,
                    activo: !empresa.activo
                })
            });

            if (response.ok) {
                loadData();
            } else {
                alert('Error al actualizar el estado');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al actualizar el estado');
        }
    };

    const handleDeleteEmpresa = async (empresa: EmpresaCliente) => {
        if (!confirm(`¿Estás seguro de eliminar la empresa "${empresa.nombre}"?\n\nEsto también eliminará todos sus casinos asociados.`)) {
            return;
        }

        try {
            const response = await fetch(`/api/empresas-clientes?id=${empresa.id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert('Empresa eliminada exitosamente');
                loadData();
            } else {
                alert('Error al eliminar la empresa');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al eliminar la empresa');
        }
    };

    const handleAddCasino = (empresa: EmpresaCliente) => {
        setCasinoFormData({
            ...casinoFormData,
            empresaId: empresa.id,
            id: 0,
            nombre: '',
            username: '',
            password: generatePassword()
        });
        setSelectedEmpresa(empresa);
        setShowCasinoModal(true);
    };

    const generatePassword = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let password = '';
        for (let i = 0; i < 8; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    };

    const getCasinosByEmpresa = (empresaId: number) => {
        return casinos.filter(c => c.empresaId === empresaId && c.activo);
    };

    if (loading) {
        return <div style={{ padding: '20px' }}>Cargando...</div>;
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>🏢 Empresas Clientes</h2>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#4caf50',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    + Nueva Empresa
                </button>
            </div>

            {empresas.length === 0 ? (
                <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '12px', textAlign: 'center' }}>
                    <p style={{ color: '#888' }}>No hay empresas registradas.</p>
                    <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '10px' }}>
                        Crea una empresa para comenzar a agregar casinos/sucursales.
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {empresas.map(empresa => (
                        <div key={empresa.id} style={{
                            backgroundColor: '#fff',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                        }}>
                            {/* Empresa Header */}
                            <div style={{
                                padding: '20px',
                                borderBottom: '1px solid #eee',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <h3 style={{ marginBottom: '5px' }}>
                                        {empresa.nombre}
                                        {!empresa.activo && (
                                            <span style={{
                                                marginLeft: '10px',
                                                padding: '3px 8px',
                                                backgroundColor: '#ffebee',
                                                color: '#c62828',
                                                fontSize: '0.75rem',
                                                borderRadius: '4px',
                                                fontWeight: 'normal'
                                            }}>
                                                INACTIVO
                                            </span>
                                        )}
                                    </h3>
                                    <p style={{ color: '#888', fontSize: '0.9rem' }}>
                                        RUT: {empresa.rut} | {empresa.email}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        onClick={() => handleToggleActivo(empresa)}
                                        style={{
                                            padding: '8px 15px',
                                            backgroundColor: empresa.activo ? '#fff3e0' : '#e8f5e9',
                                            color: empresa.activo ? '#e65100' : '#2e7d32',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontWeight: '500'
                                        }}
                                        title={empresa.activo ? 'Desactivar empresa' : 'Activar empresa'}
                                    >
                                        {empresa.activo ? '🔴 Desactivar' : '✅ Activar'}
                                    </button>
                                    <button
                                        onClick={() => handleEditEmpresa(empresa)}
                                        style={{
                                            padding: '8px 15px',
                                            backgroundColor: '#e3f2fd',
                                            color: '#1565c0',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        ✏️ Editar
                                    </button>
                                    <button
                                        onClick={() => handleAddCasino(empresa)}
                                        style={{
                                            padding: '8px 15px',
                                            backgroundColor: '#e8f5e9',
                                            color: '#2e7d32',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        + Agregar Casino
                                    </button>
                                    <button
                                        onClick={() => handleDeleteEmpresa(empresa)}
                                        style={{
                                            padding: '8px 15px',
                                            backgroundColor: '#ffebee',
                                            color: '#c62828',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer'
                                        }}
                                        title="Eliminar empresa"
                                    >
                                        🗑️ Eliminar
                                    </button>
                                    <a
                                        href={`/dashboard/precios-clientes?empresaId=${empresa.id}`}
                                        style={{
                                            padding: '8px 15px',
                                            backgroundColor: '#fff3e0',
                                            color: '#e65100',
                                            borderRadius: '6px',
                                            textDecoration: 'none'
                                        }}
                                    >
                                        💰 Precios
                                    </a>
                                </div>
                            </div>

                            {/* Casinos List */}
                            <div style={{ padding: '15px 20px' }}>
                                <p style={{ fontWeight: 'bold', marginBottom: '10px', color: '#666' }}>
                                    Casinos/Sucursales ({getCasinosByEmpresa(empresa.id).length})
                                </p>
                                {getCasinosByEmpresa(empresa.id).length === 0 ? (
                                    <p style={{ color: '#888', fontSize: '0.9rem' }}>
                                        No hay casinos registrados para esta empresa.
                                    </p>
                                ) : (
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid #eee', textAlign: 'left' }}>
                                                <th style={{ padding: '8px' }}>Nombre</th>
                                                <th style={{ padding: '8px' }}>Usuario</th>
                                                <th style={{ padding: '8px' }}>Email</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {getCasinosByEmpresa(empresa.id).map(casino => (
                                                <tr key={casino.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                                    <td style={{ padding: '8px' }}>{casino.nombre}</td>
                                                    <td style={{ padding: '8px' }}>
                                                        <code style={{
                                                            backgroundColor: '#f5f5f5',
                                                            padding: '2px 6px',
                                                            borderRadius: '4px'
                                                        }}>
                                                            {casino.username}
                                                        </code>
                                                    </td>
                                                    <td style={{ padding: '8px' }}>{casino.email || '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empresa Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: '#fff', borderRadius: '12px', padding: '30px',
                        width: '90%', maxWidth: '500px'
                    }}>
                        <h3 style={{ marginBottom: '20px' }}>
                            {formData.id ? 'Editar Empresa' : 'Nueva Empresa'}
                        </h3>
                        <form onSubmit={(e) => {
                            if (!validateRUT(formData.rut)) {
                                e.preventDefault();
                                setRutError('El RUT ingresado no es válido');
                                return;
                            }
                            handleSubmitEmpresa(e);
                        }}>
                            <div style={{ display: 'grid', gap: '15px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>RUT *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.rut}
                                        onChange={(e) => {
                                            const formatted = formatRUT(e.target.value);
                                            setFormData({ ...formData, rut: formatted });
                                            if (formatted.length > 8 && !validateRUT(formatted)) {
                                                setRutError('RUT inválido');
                                            } else {
                                                setRutError('');
                                            }
                                        }}
                                        placeholder="76.024.739-1"
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            border: `1px solid ${rutError ? '#f44336' : '#ddd'}`,
                                            borderRadius: '6px',
                                            backgroundColor: rutError ? '#ffebee' : '#fff'
                                        }}
                                    />
                                    {rutError && <span style={{ color: '#f44336', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{rutError}</span>}
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Nombre *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.nombre}
                                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                        placeholder="Aramark Chile S.A."
                                        style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Contacto</label>
                                    <input
                                        type="text"
                                        value={formData.contacto}
                                        onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
                                        placeholder="Juan Pérez"
                                        style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Teléfono</label>
                                        <input
                                            type="tel"
                                            value={formData.telefono}
                                            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                            placeholder="+56 9 1234 5678"
                                            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Email</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="contacto@empresa.cl"
                                            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '25px', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); setRutError(''); }}
                                    style={{ padding: '10px 20px', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer' }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={!!rutError}
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: rutError ? '#a5d6a7' : '#4caf50',
                                        color: '#fff',
                                        border: 'none', borderRadius: '6px', cursor: rutError ? 'not-allowed' : 'pointer', fontWeight: 'bold'
                                    }}
                                >
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Casino Modal */}
            {showCasinoModal && selectedEmpresa && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: '#fff', borderRadius: '12px', padding: '30px',
                        width: '90%', maxWidth: '500px'
                    }}>
                        <h3 style={{ marginBottom: '10px' }}>Nuevo Casino/Sucursal</h3>
                        <p style={{ color: '#888', marginBottom: '20px' }}>
                            Para: <strong>{selectedEmpresa.nombre}</strong>
                        </p>
                        <form onSubmit={handleSubmitCasino}>
                            <div style={{ display: 'grid', gap: '15px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Nombre del Casino *</label>
                                    <input
                                        type="text"
                                        required
                                        value={casinoFormData.nombre}
                                        onChange={(e) => setCasinoFormData({ ...casinoFormData, nombre: e.target.value })}
                                        placeholder="Casino Easy Quilpue"
                                        style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Usuario *</label>
                                        <input
                                            type="text"
                                            required
                                            value={casinoFormData.username}
                                            onChange={(e) => setCasinoFormData({ ...casinoFormData, username: e.target.value.toLowerCase().replace(/\s/g, '.') })}
                                            placeholder="easy.quilpue"
                                            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Contraseña Provisional *</label>
                                        <input
                                            type="text"
                                            required
                                            value={casinoFormData.password}
                                            onChange={(e) => setCasinoFormData({ ...casinoFormData, password: e.target.value })}
                                            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontFamily: 'monospace' }}
                                        />
                                    </div>
                                </div>
                                <div style={{ backgroundColor: '#fff3e0', padding: '10px', borderRadius: '6px', fontSize: '0.85rem' }}>
                                    ⚠️ El usuario deberá cambiar esta contraseña en su primer ingreso.
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Email</label>
                                    <input
                                        type="email"
                                        value={casinoFormData.email}
                                        onChange={(e) => setCasinoFormData({ ...casinoFormData, email: e.target.value })}
                                        placeholder="casino@empresa.cl"
                                        style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '25px', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowCasinoModal(false)}
                                    style={{ padding: '10px 20px', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer' }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        padding: '10px 20px', backgroundColor: '#4caf50', color: '#fff',
                                        border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'
                                    }}
                                >
                                    Crear Casino
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
