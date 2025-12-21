export default function Hero() {
    return (
        <section style={{
            height: '90vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundImage: 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url("/hero-bg.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            color: '#fff',
            textAlign: 'center',
            position: 'relative'
        }}>
            <div className="container animate-fade-in">
                <span style={{
                    display: 'block',
                    fontSize: '1.2rem',
                    letterSpacing: '3px',
                    textTransform: 'uppercase',
                    marginBottom: '1rem',
                    opacity: 0.9
                }}>
                    Desde 1985
                </span>
                <h1 style={{
                    fontSize: 'clamp(3rem, 8vw, 5.5rem)',
                    color: '#fff',
                    marginBottom: '1.5rem',
                    lineHeight: 1.1,
                    textShadow: '0 4px 10px rgba(0,0,0,0.3)'
                }}>
                    El Sabor de la <br />
                    <span style={{ color: 'var(--color-secondary)', fontStyle: 'italic' }}>Tradición</span>
                </h1>
                <p style={{
                    fontSize: '1.25rem',
                    marginBottom: '3rem',
                    maxWidth: '600px',
                    margin: '0 auto 3rem',
                    lineHeight: 1.8,
                    opacity: 0.9
                }}>
                    Pan fresco, pasteles artesanales y la mejor calidad para tu mesa todos los días.
                </p>
                <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <a href="/productos" className="btn btn-secondary delay-100">Ver Productos</a>
                    <a href="/pedidos/login" className="btn btn-primary delay-200">Portal de Pedidos</a>
                    <a href="/contacto" className="btn btn-outline delay-300">Contáctanos</a>
                </div>
            </div>
        </section>
    );
}
