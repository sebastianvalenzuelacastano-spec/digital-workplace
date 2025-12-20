import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './Sidebar.module.css';

export default function Sidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const [role, setRole] = useState<string | null>(null);
    const [permissions, setPermissions] = useState<string[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const storedRole = localStorage.getItem('role');
        const storedPermissions = JSON.parse(localStorage.getItem('permissions') || '[]');

        if (!storedRole) {
            router.push('/auth/login');
        }
        setRole(storedRole);
        setPermissions(storedPermissions);
    }, [router]);

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('permissions');
        router.push('/auth/login');
    };

    if (!role) return null;

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                className={styles.toggleButton}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle Menu"
            >
                ☰
            </button>

            {/* Mobile Overlay */}
            <div
                className={`${styles.overlay} ${isOpen ? styles.open : ''}`}
                onClick={() => setIsOpen(false)}
            />

            <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
                <div className={styles.logoContainer}>
                    <Image
                        src="/logo.jpg"
                        alt="Panificadora San Sebastián"
                        width={100}
                        height={100}
                        className={styles.logoImage}
                    />
                    <h2 className={styles.brandName}>San Sebastian</h2>
                </div>

                <nav className={styles.nav}>
                    <ul className={styles.menuList}>
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
                                <li key={groupIndex} className={styles.menuGroup}>
                                    {group.title !== 'Principal' && (
                                        <div className={styles.groupTitle}>
                                            {group.title}
                                        </div>
                                    )}
                                    <ul className={styles.groupItems}>
                                        {filteredItems.map(item => (
                                            <li key={item.path}>
                                                <Link
                                                    href={item.path}
                                                    className={`${styles.menuLink} ${pathname === item.path ? styles.menuLinkActive : ''}`}
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

                <button onClick={handleLogout} className={styles.logoutButton}>
                    Cerrar Sesión
                </button>
            </aside>
        </>
    );
}
