'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types/dashboard';
import Modal from '@/components/Modal';

const AVAILABLE_MODULES = [
    { name: 'Balance', path: '/dashboard/balance' },
    { name: 'Banco', path: '/dashboard/banco' },
    { name: 'Caja Chica', path: '/dashboard/caja-chica' },
    { name: 'Configuración', path: '/dashboard/configuracion' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Informes', path: '/dashboard/informes' },
    { name: 'Insumos', path: '/dashboard/inventario' },
    { name: 'Pagos', path: '/dashboard/pagos' },
    { name: 'Pedidos', path: '/dashboard/pedidos' },
    { name: 'Rendimiento', path: '/dashboard/rendimiento' },
    { name: 'Ventas', path: '/dashboard/ventas' },
];

export default function UsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        username: '',
        nombre: '',
        password: '',
        role: 'employee' as 'manager' | 'employee',
        permissions: [] as string[]
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/auth/login');
            return;
        }

        try {
            const response = await fetch('/api/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            } else {
                if (response.status === 401) router.push('/auth/login');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        try {
            const url = editingId ? '/api/users' : '/api/users';
            const method = editingId ? 'PUT' : 'POST';
            const body = editingId ? { ...formData, id: editingId } : formData;

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                fetchUsers();
                handleCloseModal();
            } else {
                alert('Error al guardar usuario');
            }
        } catch (error) {
            console.error('Error saving user:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Estás seguro de eliminar este usuario?')) return;

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`/api/users?id=${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                fetchUsers();
            } else {
                const data = await response.json();
                alert(data.error || 'Error al eliminar');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const handleEdit = (user: User) => {
        setEditingId(user.id);
        setFormData({
            username: user.username,
            nombre: user.nombre,
            password: '', // Don't show password
            role: user.role,
            permissions: user.permissions || []
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({
            username: '',
            nombre: '',
            password: '',
            role: 'employee',
            permissions: []
        });
    };

    const togglePermission = (path: string) => {
        setFormData(prev => {
            const permissions = prev.permissions.includes(path)
                ? prev.permissions.filter(p => p !== path)
                : [...prev.permissions, path];
            return { ...prev, permissions };
        });
    };

    const handleRoleChange = (role: 'manager' | 'employee') => {
        setFormData(prev => ({
            ...prev,
            role,
            // If manager, auto-select all permissions? Or just let backend/frontend logic handle it.
            // For clarity, let's keep permissions independent or auto-fill.
            // Actually, managers ignore permissions array in sidebar logic, so it doesn't matter much,
            // but for consistency let's leave it as is.
        }));
    };

    return (
        <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3>Gestión de Usuarios</h3>
                <button
                    className="btn btn-primary"
                    onClick={() => setIsModalOpen(true)}
                >
                    + Nuevo Usuario
                </button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                        <th style={{ padding: '10px' }}>Usuario</th>
                        <th style={{ padding: '10px' }}>Nombre</th>
                        <th style={{ padding: '10px' }}>Rol</th>
                        <th style={{ padding: '10px' }}>Permisos</th>
                        <th style={{ padding: '10px' }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '10px' }}>{user.username}</td>
                            <td style={{ padding: '10px' }}>{user.nombre}</td>
                            <td style={{ padding: '10px' }}>
                                <span style={{
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    backgroundColor: user.role === 'manager' ? '#e3f2fd' : '#f5f5f5',
                                    color: user.role === 'manager' ? '#1976d2' : '#666',
                                    fontWeight: 'bold',
                                    fontSize: '0.85rem'
                                }}>
                                    {user.role === 'manager' ? 'Administrador' : 'Empleado'}
                                </span>
                            </td>
                            <td style={{ padding: '10px', fontSize: '0.85rem', color: '#666' }}>
                                {user.role === 'manager' ? 'Acceso Total' : (
                                    user.permissions && user.permissions.length > 0
                                        ? `${user.permissions.length} módulos`
                                        : 'Sin acceso'
                                )}
                            </td>
                            <td style={{ padding: '10px' }}>
                                <button
                                    onClick={() => handleEdit(user)}
                                    style={{ marginRight: '5px', padding: '4px 8px', cursor: 'pointer', border: '1px solid #2196f3', backgroundColor: '#e3f2fd', borderRadius: '4px' }}
                                >
                                    ✏️
                                </button>
                                <button
                                    onClick={() => handleDelete(user.id)}
                                    style={{ padding: '4px 8px', cursor: 'pointer', border: '1px solid #f44336', backgroundColor: '#ffebee', borderRadius: '4px' }}
                                >
                                    🗑️
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingId ? "Editar Usuario" : "Nuevo Usuario"}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Nombre Completo</label>
                        <input
                            type="text"
                            required
                            value={formData.nombre}
                            onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Usuario</label>
                        <input
                            type="text"
                            required
                            value={formData.username}
                            onChange={e => setFormData({ ...formData, username: e.target.value })}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                            {editingId ? 'Nueva Contraseña (dejar en blanco para mantener)' : 'Contraseña'}
                        </label>
                        <input
                            type="password"
                            required={!editingId}
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Rol</label>
                        <select
                            value={formData.role}
                            onChange={e => handleRoleChange(e.target.value as 'manager' | 'employee')}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        >
                            <option value="employee">Empleado</option>
                            <option value="manager">Administrador</option>
                        </select>
                    </div>

                    {formData.role === 'employee' && (
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Permisos de Acceso</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', border: '1px solid #eee', padding: '10px', borderRadius: '4px' }}>
                                {AVAILABLE_MODULES.map(module => (
                                    <label key={module.path} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.permissions.includes(module.path)}
                                            onChange={() => togglePermission(module.path)}
                                        />
                                        {module.name}
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                            Guardar
                        </button>
                        <button
                            type="button"
                            onClick={handleCloseModal}
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
