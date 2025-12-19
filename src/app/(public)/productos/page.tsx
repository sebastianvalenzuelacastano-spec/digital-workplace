import ProductCard from "@/components/ProductCard";

export default function ProductsPage() {
    const products = [
        { title: "Marraqueta", description: "Crujiente y dorada, el clásico pan chileno.", category: "Pan", image: "https://pansansebastian.cl/wp-content/uploads/2024/03/marraqueta-4.png" },
        { title: "Hallulla", description: "Suave y esponjosa, perfecta para cualquier hora.", category: "Pan", image: "https://pansansebastian.cl/wp-content/uploads/2024/03/hallulla-4.png" },
        { title: "Hallulla Integral", description: "La versión saludable de nuestro clásico.", category: "Pan", image: "https://pansansebastian.cl/wp-content/uploads/2024/03/hallulla-integral-2.png" },
        { title: "Bollo", description: "Pan suave ideal para acompañar tus comidas.", category: "Pan", image: "https://pansansebastian.cl/wp-content/uploads/2024/03/Bollito-3.png" },
        { title: "Bollo Integral", description: "Rico en fibra y sabor natural.", category: "Pan", image: "https://pansansebastian.cl/wp-content/uploads/2024/03/Bollito-integral-3.png" },
        { title: "Coliza", description: "Pan cuadrado de miga suave y corteza delicada.", category: "Pan", image: "https://pansansebastian.cl/wp-content/uploads/2024/03/coliza-3.png" },
        { title: "Pan de Molde", description: "Perfecto para sándwiches y tostadas.", category: "Pan", image: "https://pansansebastian.cl/wp-content/uploads/2024/03/Molde-2.png" },
        { title: "Frica", description: "El pan ideal para tus hamburguesas y sándwiches.", category: "Pan", image: "https://pansansebastian.cl/wp-content/uploads/2024/03/frica-4.png" },
        { title: "Frica Sésamo", description: "Con semillas de sésamo para un toque especial.", category: "Pan", image: "https://pansansebastian.cl/wp-content/uploads/2024/03/frica-sesamo-2.png" },
        { title: "Hot Dog", description: "Pan alargado y suave para completos.", category: "Pan", image: "https://pansansebastian.cl/wp-content/uploads/2024/03/hotdog-2.png" },
        { title: "Pizza", description: "Masa lista para tus preparaciones favoritas.", category: "Masa", image: "https://pansansebastian.cl/wp-content/uploads/2024/03/pizza-2.png" },
        { title: "Rosita", description: "Dulce y suave, una delicia tradicional.", category: "Pastelería", image: "https://pansansebastian.cl/wp-content/uploads/2024/03/rosita-2.png" }
    ];

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
                    {products.map((product, index) => (
                        <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                            <ProductCard
                                title={product.title}
                                description={product.description}
                                category={product.category}
                                image={product.image}
                            />
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}
