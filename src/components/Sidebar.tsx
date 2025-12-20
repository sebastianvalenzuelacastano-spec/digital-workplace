'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Sidebar() {
    const router = useRouter();
    const [role, setRole] = useState<string | null>(null);
    const [permissions, setPermissions] = useState<string[]>([]);

    useEffect(() => {
        const storedRole = localStorage.getItem('role');
        const storedPermissions = JSON.parse(localStorage.getItem('permissions') || '[]');

        if (!storedRole) {
            router.push('/auth/login');
        }
        setRole(storedRole);
        setPermissions(storedPermissions);
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('permissions');
        router.push('/auth/login');
    };

    if (!role) return null;

    return (
        <aside style={{
            width: '250px',
            backgroundColor: 'var(--color-primary)',
            color: '#fff',
            height: '100vh',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <Image
                    src="/logo.jpg"
                    alt="Panificadora San Sebastián"
                    width={120}
                    height={120}
                    style={{ borderRadius: '8px', marginBottom: '1rem' }}
                />
                <h2 style={{ color: 'var(--color-secondary)', margin: 0 }}>San Sebastian</h2>
            </div>
            <nav style={{ flex: 1 }}>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {[
                        {
                            title: 'Principal',
                            items: [
                                { name: 'Dashboard', path: '/dashboard' },
                            ]
                        },
                        {
                            title: 'Finanzas',
                            items: [
                                { name: 'Conciliación Bancaria', path: '/dashboard/banco', role: 'manager' },
                                { name: 'Balance', path: '/dashboard/balance', role: 'manager' },
                                { name: 'Caja Chica', path: '/dashboard/caja-chica' },
                                { name: 'Pagos', path: '/dashboard/pagos' },
                            ]
                        },
                        {
                            title: 'Operaciones',
                            items: [
                                { name: 'Ventas', path: '/dashboard/ventas' },
                                { name: 'Pedidos', path: '/dashboard/pedidos' },
                                { name: 'Rendimiento', path: '/dashboard/rendimiento' },
                                { name: 'Insumos', path: '/dashboard/inventario' },
                            ]
                        },
                        {
                            title: 'Gestión',
                            items: [
                                { name: 'Equipos', path: '/dashboard/equipos', role: 'manager' },
                                { name: 'Vehículos', path: '/dashboard/vehiculos', role: 'manager' },
                                { name: 'Productos (Web)', path: '/dashboard/productos-web', role: 'manager' },
                            ]
                        },
                        {
                            title: 'Administración',
                            items: [
                                { name: 'Informes', path: '/dashboard/informes', role: 'manager' },
                                { name: 'Usuarios', path: '/dashboard/usuarios', role: 'manager' },
                                { name: 'Configuración', path: '/dashboard/configuracion', role: 'manager' },
                            ]
                        }
                    ].map((group, groupIndex) => {
                        const filteredItems = group.items.filter(item => {
                            // Manager has access to everything
                            if (role === 'manager') return true;

                            // Check role restriction
                            if (item.role && item.role !== role) return false;

                            // Check permissions
                            if (permissions.length === 0) return !item.role;
                            return permissions.includes(item.path);
                        });

                        if (filteredItems.length === 0) return null;

                        return (
                            <li key={groupIndex} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {group.title !== 'Principal' && (
                                    <div style={{
                                        fontSize: '0.75rem',
                                        textTransform: 'uppercase',
                                        color: 'rgba(255,255,255,0.5)',
                                        fontWeight: 'bold',
                                        marginTop: '0.5rem',
                                        paddingLeft: '0.5rem'
                                    }}>
                                        {group.title}
                                    </div>
                                )}
                                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    {filteredItems.map(item => (
                                        <li key={item.path}>
                                            <Link
                                                href={item.path}
                                                style={{
                                                    color: '#fff',
                                                    textDecoration: 'none',
                                                    display: 'block',
                                                    padding: '8px 12px',
                                                    borderRadius: '6px',
                                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                                    fontSize: '0.9rem',
                                                    transition: 'background-color 0.2s'
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}
                                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                                            >
                                                {item.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        );
                    })}
                </ul>
            </nav>
            <button onClick={handleLogout} style={{
                backgroundColor: 'transparent',
                border: '1px solid #fff',
                color: '#fff',
                padding: '8px',
                borderRadius: '4px',
                cursor: 'pointer'
            }}>
                Cerrar Sesión
            </button>
        </aside>
    );
}
