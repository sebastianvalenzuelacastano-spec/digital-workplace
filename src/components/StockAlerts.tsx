'use client';

import { useDashboard } from '@/context/DashboardContext';

interface StockAlert {
    insumoName: string;
    unidad: string;
    currentStock: number;
    stockMinimo: number;
    severity: 'critical' | 'warning';
}

export default function StockAlerts() {
    const { maestroInsumos, insumoTransactions } = useDashboard();

    // Calculate current stock for each insumo
    const calculateStock = (insumoName: string): number => {
        return insumoTransactions
            .filter(t => t.insumo === insumoName)
            .reduce((acc, t) => acc + t.cantidadEntrada - t.cantidadSalida, 0);
    };

    // Generate alerts for insumos below minimum stock
    const alerts: StockAlert[] = maestroInsumos
        .filter(insumo => insumo.activo && insumo.stockMinimo && insumo.stockMinimo > 0)
        .map(insumo => {
            const currentStock = calculateStock(insumo.nombre);
            const stockMinimo = insumo.stockMinimo || 0;

            if (currentStock < stockMinimo) {
                return {
                    insumoName: insumo.nombre,
                    unidad: insumo.unidad,
                    currentStock,
                    stockMinimo,
                    severity: currentStock <= 0 ? 'critical' : 'warning' as const
                };
            }
            return null;
        })
        .filter((alert): alert is StockAlert => alert !== null)
        .sort((a, b) => {
            // Sort by severity first (critical first), then by how close to zero
            if (a.severity === 'critical' && b.severity !== 'critical') return -1;
            if (b.severity === 'critical' && a.severity !== 'critical') return 1;
            return a.currentStock - b.currentStock;
        });

    if (alerts.length === 0) {
        return null;
    }

    const formatUnidad = (unidad: string): string => {
        switch (unidad) {
            case 'sacos_25kg': return 'sacos';
            case 'kg': return 'kg';
            case 'unidades': return 'unidades';
            default: return unidad;
        }
    };

    return (
        <div style={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            padding: '1rem',
            marginBottom: '1.5rem'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                <h3 style={{ margin: 0, color: '#f57c00' }}>Alertas de Stock Bajo</h3>
                <span style={{
                    backgroundColor: '#ff9800',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                }}>
                    {alerts.length}
                </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {alerts.map((alert, index) => (
                    <div
                        key={index}
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.75rem',
                            borderRadius: '6px',
                            backgroundColor: alert.severity === 'critical' ? '#ffebee' : '#fff3e0',
                            borderLeft: `4px solid ${alert.severity === 'critical' ? '#f44336' : '#ff9800'}`
                        }}
                    >
                        <div>
                            <span style={{
                                fontWeight: 'bold',
                                color: alert.severity === 'critical' ? '#c62828' : '#e65100'
                            }}>
                                {alert.insumoName}
                            </span>
                            {alert.severity === 'critical' && (
                                <span style={{
                                    marginLeft: '0.5rem',
                                    backgroundColor: '#f44336',
                                    color: 'white',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontSize: '0.7rem',
                                    fontWeight: 'bold'
                                }}>
                                    CRÍTICO
                                </span>
                            )}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <span style={{
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                color: alert.severity === 'critical' ? '#f44336' : '#ff9800'
                            }}>
                                {alert.currentStock} {formatUnidad(alert.unidad)}
                            </span>
                            <span style={{ color: '#666', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
                                / mín. {alert.stockMinimo}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <p style={{
                marginTop: '1rem',
                marginBottom: 0,
                fontSize: '0.85rem',
                color: '#666',
                fontStyle: 'italic'
            }}>
                Configura el stock mínimo en Configuración → Insumos
            </p>
        </div>
    );
}
