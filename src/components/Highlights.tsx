import { readDb } from "@/lib/db";

export default async function Highlights() {
    // Fetch products from database (server-side)
    try {
        const db = await readDb();
        const allProducts = db?.productosCatalogo || [];

        // Get products with unique images (no repeated images)
        const seenImages = new Set<string>();
        const productsWithUniqueImages: any[] = [];

        for (const p of allProducts) {
            if (p.activo && p.mostrarEnWeb && p.imagenUrl) {
                // Only add if image hasn't been seen
                if (!seenImages.has(p.imagenUrl)) {
                    seenImages.add(p.imagenUrl);
                    productsWithUniqueImages.push(p);
                }
            }
        }

        // Take first 6 products with unique images
        const products = productsWithUniqueImages.slice(0, 6);

        if (products.length === 0) {
            return null; // Don't render if no products
        }

        return (
            <section className="container" style={{ padding: '6rem 24px' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <span style={{ color: 'var(--color-secondary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem' }}>Nuestra Selección</span>
                    <h2 style={{ fontSize: '3rem', marginTop: '0.5rem' }}>Nuestros Productos</h2>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '2rem'
                }}>
                    {products.map((p: any) => (
                        <div key={p.id} className="product-card" style={{
                            backgroundColor: '#fff',
                            padding: '1.5rem',
                            borderRadius: 'var(--border-radius)',
                            boxShadow: 'var(--box-shadow)',
                            textAlign: 'center',
                            transition: 'all 0.3s ease',
                            border: '1px solid rgba(0,0,0,0.05)'
                        }}>
                            <div style={{
                                height: '180px',
                                backgroundColor: '#f5f5f5',
                                marginBottom: '1rem',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden'
                            }}>
                                <img
                                    src={p.imagenUrl}
                                    alt={p.nombre}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                />
                            </div>
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>{p.nombre}</h3>
                            {p.descripcion && (
                                <p style={{ color: 'var(--color-text-light)', marginBottom: '1rem', lineHeight: 1.5, fontSize: '0.9rem' }}>{p.descripcion}</p>
                            )}
                            <p style={{
                                color: 'var(--color-secondary)',
                                fontWeight: 'bold',
                                fontSize: '1.1rem'
                            }}>
                                ${p.precioVentaKg?.toLocaleString('es-CL') || 'Consultar'} / kg
                            </p>
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
