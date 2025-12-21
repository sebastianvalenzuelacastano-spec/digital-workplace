'use client';

import { useState } from 'react';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        telefono: '',
        mensaje: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Formulario enviado! (funcionalidad de envío pendiente)');
    };

    return (
        <main>
            {/* Hero Section */}
            <section style={{
                backgroundColor: 'var(--color-primary)',
                backgroundImage: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.8)), url("/hero-placeholder.jpg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                color: '#fff',
                padding: '10rem 0 6rem',
                textAlign: 'center',
                position: 'relative'
            }}>
                <div className="container animate-fade-in">
                    <span style={{
                        display: 'block',
                        fontSize: '1rem',
                        letterSpacing: '3px',
                        textTransform: 'uppercase',
                        marginBottom: '1rem',
                        opacity: 0.9
                    }}>
                        Estamos aquí
                    </span>
                    <h1 style={{
                        fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                        color: '#fff',
                        marginBottom: '1rem',
                        textShadow: '0 4px 10px rgba(0,0,0,0.3)'
                    }}>
                        <span style={{ color: 'var(--color-secondary)', fontStyle: 'italic' }}>Contáctanos</span>
                    </h1>
                    <p style={{
                        fontSize: '1.2rem',
                        maxWidth: '600px',
                        margin: '0 auto',
                        lineHeight: 1.8,
                        opacity: 0.9
                    }}>
                        ¿Tienes alguna consulta? Estamos aquí para ayudarte.
                    </p>
                </div>
            </section>

            {/* Contact Content */}
            <section className="container" style={{ padding: '6rem 24px' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                    gap: '4rem'
                }}>
                    {/* Contact Form */}
                    <div className="animate-fade-in" style={{
                        backgroundColor: '#fff',
                        padding: '3rem',
                        borderRadius: 'var(--border-radius)',
                        boxShadow: 'var(--box-shadow)',
                        border: '1px solid rgba(0,0,0,0.05)'
                    }}>
                        <h2 style={{ marginBottom: '2rem', fontSize: '2rem' }}>Envíanos un mensaje</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Nombre *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd',
                                        fontSize: '1rem',
                                        transition: 'border-color 0.3s ease',
                                        outline: 'none'
                                    }}
                                    placeholder="Tu nombre completo"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Email *</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd',
                                        fontSize: '1rem',
                                        transition: 'border-color 0.3s ease',
                                        outline: 'none'
                                    }}
                                    placeholder="tu@email.com"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Teléfono</label>
                                <input
                                    type="tel"
                                    value={formData.telefono}
                                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd',
                                        fontSize: '1rem',
                                        transition: 'border-color 0.3s ease',
                                        outline: 'none'
                                    }}
                                    placeholder="+56 9 ..."
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Mensaje *</label>
                                <textarea
                                    required
                                    value={formData.mensaje}
                                    onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                                    rows={5}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd',
                                        fontSize: '1rem',
                                        transition: 'border-color 0.3s ease',
                                        outline: 'none',
                                        resize: 'vertical'
                                    }}
                                    placeholder="¿En qué podemos ayudarte?"
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
                                Enviar Mensaje
                            </button>
                        </form>
                    </div>

                    {/* Contact Info */}
                    <div className="animate-fade-in delay-200">
                        <div style={{
                            backgroundColor: 'var(--color-primary)',
                            color: '#fff',
                            padding: '3rem',
                            borderRadius: 'var(--border-radius)',
                            boxShadow: 'var(--box-shadow)',
                            marginBottom: '2rem',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <h3 style={{ marginBottom: '2rem', fontSize: '1.8rem', color: 'var(--color-secondary)' }}>Información de Contacto</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                    <div>
                                        <strong style={{ display: 'block', marginBottom: '0.5rem', fontSize: '1.1rem' }}>📍 Área de Entrega</strong>
                                        <p style={{ margin: 0, opacity: 0.9, lineHeight: 1.6 }}>Viña del Mar, Valparaíso, Quilpué, Villa Alemana, Concón</p>
                                    </div>
                                    <div>
                                        <strong style={{ display: 'block', marginBottom: '0.5rem', fontSize: '1.1rem' }}>📞 Teléfono</strong>
                                        <p style={{ margin: 0, opacity: 0.9, lineHeight: 1.6 }}>+56 9 33745025 / +56 9 79598438</p>
                                    </div>
                                    <div>
                                        <strong style={{ display: 'block', marginBottom: '0.5rem', fontSize: '1.1rem' }}>✉️ Email</strong>
                                        <p style={{ margin: 0, opacity: 0.9, lineHeight: 1.6 }}>contacto@pansansebastian.cl</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{
                            backgroundColor: '#fff',
                            padding: '3rem',
                            borderRadius: 'var(--border-radius)',
                            boxShadow: 'var(--box-shadow)',
                            border: '1px solid rgba(0,0,0,0.05)'
                        }}>
                            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Horario de Atención</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: 'bold' }}>Lunes a Viernes</span>
                                    <span>7:00 - 20:00</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: 'bold' }}>Sábado</span>
                                    <span>8:00 - 14:00</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontWeight: 'bold' }}>Domingo</span>
                                    <span>8:00 - 14:00</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
