export default function AboutPage() {
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
                        Nuestra Historia
                    </span>
                    <h1 style={{
                        fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                        color: '#fff',
                        marginBottom: '1rem',
                        textShadow: '0 4px 10px rgba(0,0,0,0.3)'
                    }}>
                        Sobre <span style={{ color: 'var(--color-secondary)', fontStyle: 'italic' }}>Nosotros</span>
                    </h1>
                </div>
            </section>

            {/* Quienes Somos */}
            <section className="container" style={{ padding: '6rem 24px 0', textAlign: 'center' }}>
                <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'var(--color-primary)' }}>Quiénes Somos</h2>
                    <p style={{ fontSize: '1.2rem', lineHeight: 1.8, color: 'var(--color-text-light)' }}>
                        En Panificadora San Sebastian, somos una familia apasionada por el arte de hacer pan artesanal.
                        Nuestra misión es crear productos de la más alta calidad, elaborados con dedicación y amor en cada paso.
                        Nos comprometemos a ofrecerte una experiencia de sabor única y reconfortante, preservando las tradiciones
                        panaderas mientras utilizamos ingredientes frescos y técnicas artesanales que garantizan un pan delicioso en cada bocado.
                    </p>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="container" style={{ padding: '6rem 24px' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '4rem'
                }}>
                    <div className="animate-fade-in delay-100" style={{
                        padding: '3rem',
                        backgroundColor: '#fff',
                        borderRadius: 'var(--border-radius)',
                        boxShadow: 'var(--box-shadow)',
                        borderTop: '4px solid var(--color-secondary)'
                    }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Nuestra Misión</h2>
                        <p style={{ lineHeight: 1.8, color: 'var(--color-text-light)', fontSize: '1.1rem' }}>
                            Nuestra misión es crear pan artesanal de la más alta calidad, elaborado con dedicación y pasión familiar,
                            para ofrecer a nuestros clientes una experiencia de sabor única y reconfortante. Nos comprometemos a
                            preservar la tradición panadera, utilizando ingredientes frescos y técnicas artesanales, para satisfacer
                            las necesidades y superar las expectativas de quienes disfrutan de nuestro pan.
                        </p>
                    </div>

                    <div className="animate-fade-in delay-200" style={{
                        padding: '3rem',
                        backgroundColor: '#fff',
                        borderRadius: 'var(--border-radius)',
                        boxShadow: 'var(--box-shadow)',
                        borderTop: '4px solid var(--color-primary)'
                    }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Nuestra Visión</h2>
                        <p style={{ lineHeight: 1.8, color: 'var(--color-text-light)', fontSize: '1.1rem' }}>
                            Aspiramos a ser líderes en innovación dentro del sector panadero, preservando al mismo tiempo los valores
                            familiares que nos han impulsado desde nuestros inicios. Queremos ser referentes en la industria,
                            inspirando a otros con nuestro amor por el pan artesanal y dejando una huella perdurable en cada hogar
                            que llegamos a servir.
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}
