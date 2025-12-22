import { readDb } from "@/lib/db";

export default async function Highlights() {
    // Fetch featured products from database (server-side)
    try {
        const db = await readDb();
        const products = (db?.productos || [])
            .filter((p: any) => p.activo && p.destacado) // Only active and featured
            .sort((a: any, b: any) => a.orden - b.orden) // Sort by orden
            .slice(0, 3); // Show max 3

        if (products.length === 0) {
            return null; // Don't render if no products
        }

        return (
            <section className="container" style={{ padding: '6rem 24px' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <span style={{ color: 'var(--color-secondary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem' }}>Nuestra Selección</span>
                    <h2 style={{ fontSize: '3rem', marginTop: '0.5rem' }}>Favoritos del Mes</h2>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '2.5rem'
                }}>
                    {products.map((p: any, i: number) => (
                        <div key={p.id} className="product-card" style={{
                            backgroundColor: '#fff',
                            padding: '2.5rem',
                            borderRadius: 'var(--border-radius)',
                            boxShadow: 'var(--box-shadow)',
                            textAlign: 'center',
                            transition: 'all 0.3s ease',
                            border: '1px solid rgba(0,0,0,0.05)'
                        }}>
                            <div style={{
                                height: '220px',
                                backgroundColor: '#fff',
                                marginBottom: '1.5rem',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#ccc',
                                overflow: 'hidden'
                            }}>
                                <img
                                    src={p.imagen}
                                    alt={p.nombre}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain',
                                        padding: '10px'
                                    }}
                                />
                            </div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{p.nombre}</h3>
                            <p style={{ color: 'var(--color-text-light)', marginBottom: '1.5rem', lineHeight: 1.6 }}>{p.descripcion}</p>
                            <a href="/productos" className="btn btn-outline" style={{
                                display: 'inline-block',
                                padding: '8px 24px',
                                borderRadius: '50px',
                                fontSize: '0.9rem',
                                color: 'var(--color-primary)',
                                borderColor: 'var(--color-primary)'
                            }}>
                                Ver Más
                            </a>
                        </div>
                    ))}
                </div>
            </section>
        );
    } catch (error) {
        console.error('Error loading highlights:', error);
        return null; // Fail gracefully
    }
}
