export default function Footer() {
    return (
        <footer style={{
            backgroundColor: 'var(--color-primary)',
            color: '#fff',
            padding: '5rem 0 2rem',
            marginTop: 'auto',
            borderTop: '5px solid var(--color-secondary)'
        }}>
            <div className="container" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '4rem',
                marginBottom: '4rem'
            }}>
                <div>
                    <h3 style={{ color: 'var(--color-secondary)', fontSize: '1.8rem', marginBottom: '1.5rem' }}>San Sebastian</h3>
                    <p style={{ opacity: 0.8, lineHeight: 1.8 }}>
                        Tradición y calidad en cada horneada. Llevando el mejor sabor a tu mesa desde hace más de 30 años.
                    </p>
                </div>
                <div>
                    <h4 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Contacto</h4>
                    <ul style={{ listStyle: 'none', opacity: 0.8, lineHeight: 2 }}>
                        <li>📞 +56 9 33745025 / +56 9 79598438</li>
                        <li>✉️ contacto@pansansebastian.cl</li>
                        <li>📍 Área de entrega: Viña del Mar, Valparaíso, Quilpué, Villa Alemana, Concón</li>
                    </ul>
                </div>
                <div>
                    <h4 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Horario</h4>
                    <ul style={{ listStyle: 'none', opacity: 0.8, lineHeight: 2 }}>
                        <li>Lunes a Viernes: 7:00 - 20:00</li>
                        <li>Sábado y Domingo: 8:00 - 14:00</li>
                    </ul>
                </div>
            </div>
            <div style={{
                textAlign: 'center',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                paddingTop: '2rem',
                fontSize: '0.9rem',
                opacity: 0.6
            }}>
                &copy; {new Date().getFullYear()} Panificadora San Sebastian. Todos los derechos reservados.
            </div>
        </footer>
    );
}
