'use client';

export default function PedidosProgramadosPage() {
    return (
        <div style={{ paddingBottom: '80px' }}>
            <div style={{
                backgroundColor: '#fff',
                padding: '30px',
                borderRadius: '12px',
                textAlign: 'center'
            }}>
                <h2 style={{ marginBottom: '15px' }}>🔄 Pedidos Programados</h2>
                <p style={{ color: '#888', marginBottom: '20px' }}>
                    Esta función está en desarrollo.
                </p>

                <div style={{
                    backgroundColor: '#e3f2fd',
                    padding: '20px',
                    borderRadius: '8px',
                    textAlign: 'left',
                    marginTop: '30px'
                }}>
                    <h3 style={{ marginBottom: '10px', color: '#1976d2' }}>💡 Mientras tanto, usa:</h3>
                    <p style={{ marginBottom: '10px' }}>
                        <strong>📅 Pedidos Múltiples</strong> - Ideal para crear varios pedidos de una sola vez seleccionando múltiples fechas.
                    </p>
                    <a
                        href="/pedidos/pedidos-masivos"
                        style={{
                            display: 'inline-block',
                            marginTop: '10px',
                            padding: '10px 20px',
                            backgroundColor: '#ff9800',
                            color: '#fff',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            fontWeight: '600'
                        }}
                    >
                        Ir a Pedidos Múltiples →
                    </a>
                </div>

                <div style={{
                    marginTop: '30px',
                    padding: '15px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    color: '#666',
                    textAlign: 'left'
                }}>
                    <strong>¿Qué son los Pedidos Programados?</strong>
                    <p style={{ marginTop: '10px' }}>
                        Podrás configurar pedidos que se generen automáticamente cada semana.
                        Por ejemplo: "Todos los lunes y viernes a las 7:00 am, pedir 5kg de Pan Marraqueta y 3 unidades de Hallulla".
                    </p>
                    <p style={{ marginTop: '10px' }}>
                        Esta función estará disponible próximamente.
                    </p>
                </div>
            </div>
        </div>
    );
}
