'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav style={{
            backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
            backdropFilter: scrolled ? 'blur(10px)' : 'none',
            color: scrolled ? 'var(--color-primary)' : '#fff',
            padding: scrolled ? '1rem 0' : '1.5rem 0',
            boxShadow: scrolled ? 'var(--box-shadow)' : 'none',
            position: 'fixed',
            width: '100%',
            top: 0,
            zIndex: 1000,
            transition: 'all 0.3s ease'
        }}>
            <div className="container" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
                    <img
                        src="/logo.jpg"
                        alt="San Sebastian"
                        style={{
                            height: '50px',
                            width: 'auto',
                            borderRadius: '50%', // Optional: if it's a square logo, this makes it round
                            border: '2px solid #fff'
                        }}
                    />
                </Link>
                <ul style={{
                    display: 'flex',
                    gap: '2.5rem',
                    listStyle: 'none',
                    alignItems: 'center'
                }}>
                    <li><Link href="/" style={{ fontWeight: 500, fontSize: '0.95rem' }}>Inicio</Link></li>
                    <li><Link href="/nosotros" style={{ fontWeight: 500, fontSize: '0.95rem' }}>Nosotros</Link></li>
                    <li><Link href="/productos" style={{ fontWeight: 500, fontSize: '0.95rem' }}>Productos</Link></li>
                    <li><Link href="/contacto" style={{ fontWeight: 500, fontSize: '0.95rem' }}>Contacto</Link></li>
                    <li>
                        <Link href="/auth/login" className="btn btn-secondary" style={{
                            padding: '10px 24px',
                            fontSize: '0.85rem',
                            boxShadow: 'none'
                        }}>
                            Digital Workplace
                        </Link>
                    </li>
                    <li>
                        <Link href="/pedidos/login" className="btn btn-secondary" style={{
                            padding: '10px 24px',
                            fontSize: '0.85rem',
                            boxShadow: 'none'
                        }}>
                            Portal Pedidos
                        </Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
}
