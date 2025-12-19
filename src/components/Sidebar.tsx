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
                        { name: 'Balance', path: '/dashboard/balance', role: 'manager' },
                        { name: 'Banco', path: '/dashboard/banco', role: 'manager' },
                        { name: 'Caja Chica', path: '/dashboard/caja-chica' },
                        { name: 'Configuración', path: '/dashboard/configuracion', role: 'manager' },
                        { name: 'Dashboard', path: '/dashboard' },
                        { name: 'Informes', path: '/dashboard/informes', role: 'manager' },
                        { name: 'Insumos', path: '/dashboard/inventario' },
                        { name: 'Pagos', path: '/dashboard/pagos' },
                        { name: 'Pedidos', path: '/dashboard/pedidos' },
                        { name: 'Productos (Web)', path: '/dashboard/productos-web', role: 'manager' },
                        { name: 'Rendimiento', path: '/dashboard/rendimiento' },
                        { name: 'Usuarios', path: '/dashboard/usuarios', role: 'manager' },
                        { name: 'Ventas', path: '/dashboard/ventas' },
                    ]
                        .filter(item => {
                            // Manager has access to everything
                            if (role === 'manager') return true;

                            // Check role restriction first
                            if (item.role && item.role !== role) return false;

                            // Check permissions
                            // If permissions array is empty (legacy user or not set), default to allowing non-manager items
                            if (permissions.length === 0) return !item.role;

                            return permissions.includes(item.path);
                        })
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((item) => (
                            <li key={item.path}>
                                <Link href={item.path} style={{ color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {item.name}
                                </Link>
                            </li>
                        ))}
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
