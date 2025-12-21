'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

interface ClientData {
    id: number;
    username: string;
    casinoNombre: string;
    empresaId: number;
    empresaNombre: string;
    empresaRut: string;
}

export default function PedidosLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [clientData, setClientData] = useState<ClientData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Skip auth check for login and password change pages
        if (pathname === '/pedidos/login' || pathname === '/pedidos/cambiar-password') {
            setLoading(false);
            return;
        }

        // Check if client is logged in
        const token = localStorage.getItem('clientToken');
        const data = localStorage.getItem('clientData');

        if (!token || !data) {
            router.push('/pedidos/login');
            return;
        }

        try {
            const parsed = JSON.parse(data);

            // If must change password, redirect there
            if (parsed.mustChangePassword) {
                router.push('/pedidos/cambiar-password');
                return;
            }

            setClientData(parsed);
        } catch {
            router.push('/pedidos/login');
        }

        setLoading(false);
    }, [pathname, router]);

    const handleLogout = () => {
        localStorage.removeItem('clientToken');
        localStorage.removeItem('clientData');
        router.push('/pedidos/login');
    };

    // Show nothing while checking auth
    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f5f5f5'
            }}>
                <p>Cargando...</p>
            </div>
        );
    }

    // Login and password change pages don't need the layout wrapper
    if (pathname === '/pedidos/login' || pathname === '/pedidos/cambiar-password') {
        return children;
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
            {/* Header */}
            <header style={{
                backgroundColor: '#1a1a2e',
                color: '#fff',
                padding: '15px 30px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <h1 style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
                        🍞 Pan San Sebastián
                    </h1>
                    <span style={{
                        backgroundColor: '#ff9800',
                        padding: '4px 12px',
                        borderRadius: '15px',
                        fontSize: '0.85rem',
                        fontWeight: '600'
                    }}>
                        Portal de Pedidos
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                            {clientData?.casinoNombre}
                        </p>
                        <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                            {clientData?.empresaNombre}
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: 'transparent',
                            color: '#fff',
                            border: '1px solid #fff',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                        }}
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </header>

            {/* Navigation */}
            <nav style={{
                backgroundColor: '#fff',
                padding: '10px 30px',
                borderBottom: '1px solid #e0e0e0',
                display: 'flex',
                gap: '20px'
            }}>
                <Link
                    href="/pedidos/nuevo"
                    style={{
                        padding: '8px 16px',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        color: pathname === '/pedidos/nuevo' ? '#ff9800' : '#333',
                        fontWeight: pathname === '/pedidos/nuevo' ? 'bold' : 'normal',
                        backgroundColor: pathname === '/pedidos/nuevo' ? '#fff3e0' : 'transparent'
                    }}
                >
                    📝 Nuevo Pedido
                </Link>
                <Link
                    href="/pedidos/historial"
                    style={{
                        padding: '8px 16px',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        color: pathname === '/pedidos/historial' ? '#ff9800' : '#333',
                        fontWeight: pathname === '/pedidos/historial' ? 'bold' : 'normal',
                        backgroundColor: pathname === '/pedidos/historial' ? '#fff3e0' : 'transparent'
                    }}
                >
                    📋 Mis Pedidos
                </Link>
                <Link
                    href="/pedidos/programados"
                    style={{
                        padding: '8px 16px',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        color: pathname === '/pedidos/programados' ? '#ff9800' : '#333',
                        fontWeight: pathname === '/pedidos/programados' ? 'bold' : 'normal',
                        backgroundColor: pathname === '/pedidos/programados' ? '#fff3e0' : 'transparent'
                    }}
                >
                    🔄 Pedidos Programados
                </Link>
            </nav>

            {/* Main Content */}
            <main style={{ padding: '30px' }}>
                {children}
            </main>

            {/* Footer with order deadline info */}
            <footer style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: '#fff3e0',
                padding: '10px 30px',
                textAlign: 'center',
                borderTop: '1px solid #ffcc80',
                fontSize: '0.9rem',
                color: '#e65100'
            }}>
                ⏰ Horario tope de pedidos: <strong>18:00 hrs</strong> para entrega al día siguiente
            </footer>
        </div>
    );
}
