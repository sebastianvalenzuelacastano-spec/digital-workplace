import ProductCard from "@/components/ProductCard";
import { readDb } from "@/lib/db";

// Force dynamic rendering (don't pre-render at build time)
export const dynamic = 'force-dynamic';


export default function ProductsPage() {
    // Fetch products from database (server-side)
    const db = readDb();
    const products = db.productos
        .filter((p: any) => p.activo) // Only show active products
        .sort((a: any, b: any) => a.orden - b.orden); // Sort by orden

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
                        Catálogo
                    </span>
                    <h1 style={{
                        fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                        color: '#fff',
                        marginBottom: '1rem',
                        textShadow: '0 4px 10px rgba(0,0,0,0.3)'
                    }}>
                        Nuestros <span style={{ color: 'var(--color-secondary)', fontStyle: 'italic' }}>Productos</span>
                    </h1>
                    <p style={{
                        fontSize: '1.2rem',
                        maxWidth: '600px',
                        margin: '0 auto',
                        lineHeight: 1.8,
                        opacity: 0.9
                    }}>
                        Descubre nuestra selección de panes artesanales y pastelería tradicional, elaborados con ingredientes de primera calidad.
                    </p>
                </div>
            </section>

            {/* Products Grid */}
            <section className="container" style={{ padding: '6rem 24px' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '2.5rem'
                }}>
                    {products.map((product: any, index: number) => (
                        <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                            <ProductCard
                                title={product.nombre}
                                description={product.descripcion}
                                category={product.categoria}
                                image={product.imagen}
                            />
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}
