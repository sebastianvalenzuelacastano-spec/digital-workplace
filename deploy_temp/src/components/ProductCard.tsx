interface ProductCardProps {
    title: string;
    description?: string;
    category: string;
    image?: string;
}

export default function ProductCard({ title, description, category, image }: ProductCardProps) {
    // Using gradient backgrounds as placeholders until we get real images
    const gradients = {
        'Pan': 'linear-gradient(135deg, #D4A574 0%, #8B6F47 100%)',
        'Pastelería': 'linear-gradient(135deg, #FFE5B4 0%, #D4AF37 100%)',
        'Masa Madre': 'linear-gradient(135deg, #C19A6B 0%, #6F4E37 100%)',
    };

    const gradient = gradients[category as keyof typeof gradients] || gradients['Pan'];

    return (
        <div style={{
            backgroundColor: '#fff',
            borderRadius: 'var(--border-radius)',
            boxShadow: 'var(--box-shadow)',
            overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer',
            border: '1px solid rgba(0,0,0,0.05)'
        }}
            className="product-card"
        >
            {/* Image */}
            <div style={{
                height: '260px',
                background: image ? '#fff' : gradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '4rem',
                fontWeight: 'bold',
                textShadow: '0 4px 10px rgba(0,0,0,0.2)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {image ? (
                    <img
                        src={image}
                        alt={title}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            padding: '20px',
                            transition: 'transform 0.5s ease'
                        }}
                        className="product-image"
                    />
                ) : (
                    <span style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' }}>🥖</span>
                )}
            </div>

            <div style={{ padding: '2rem' }}>
                <div style={{
                    display: 'inline-block',
                    fontSize: '0.7rem',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    color: '#fff',
                    backgroundColor: 'var(--color-secondary)',
                    fontWeight: 'bold',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    marginBottom: '1rem'
                }}>
                    {category}
                </div>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', lineHeight: 1.3 }}>{title}</h3>
                <p style={{ color: 'var(--color-text-light)', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: 1.6 }}>
                    {description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: 'auto' }}>
                    <button className="btn btn-outline" style={{
                        padding: '8px 20px',
                        fontSize: '0.8rem',
                        color: 'var(--color-primary)',
                        borderColor: 'var(--color-primary)'
                    }}>
                        Ver Detalle
                    </button>
                </div>
            </div>
        </div>
    );
}
