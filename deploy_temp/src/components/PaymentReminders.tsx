'use client';

import { useDashboard } from '@/context/DashboardContext';
import { formatDate } from '@/lib/dateUtils';

interface PaymentDue {
    id: number;
    factura: string;
    insumo: string;
    proveedor: string;
    fechaPago: string;
    daysUntilDue: number;
    estadoPago: 'pendiente' | 'urgente' | 'pagada';
}

export default function PaymentReminders() {
    const { insumoTransactions } = useDashboard();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate days until due for each pending/urgent payment
    const pendingPayments: PaymentDue[] = insumoTransactions
        .filter(t => t.estadoPago !== 'pagada' && t.fechaPago)
        .map(t => {
            const dueDate = new Date(t.fechaPago);
            dueDate.setHours(0, 0, 0, 0);
            const diffTime = dueDate.getTime() - today.getTime();
            const daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            return {
                id: t.id,
                factura: t.factura,
                insumo: t.insumo,
                proveedor: t.proveedor,
                fechaPago: t.fechaPago,
                daysUntilDue,
                estadoPago: t.estadoPago
            };
        })
        .filter(p => p.daysUntilDue <= 7) // Show payments due within 7 days
        .sort((a, b) => a.daysUntilDue - b.daysUntilDue);

    if (pendingPayments.length === 0) {
        return null;
    }

    const getStatusStyle = (payment: PaymentDue) => {
        if (payment.daysUntilDue < 0) {
            return { bg: '#ffebee', border: '#f44336', text: '#c62828' }; // Overdue
        } else if (payment.daysUntilDue === 0) {
            return { bg: '#fff3e0', border: '#ff9800', text: '#e65100' }; // Due today
        } else if (payment.daysUntilDue <= 3 || payment.estadoPago === 'urgente') {
            return { bg: '#fff8e1', border: '#ffc107', text: '#ff8f00' }; // Due soon or urgent
        }
        return { bg: '#e3f2fd', border: '#2196f3', text: '#1565c0' }; // Normal
    };

    const getStatusLabel = (payment: PaymentDue): string => {
        if (payment.daysUntilDue < 0) {
            return `VENCIDO hace ${Math.abs(payment.daysUntilDue)} día${Math.abs(payment.daysUntilDue) > 1 ? 's' : ''}`;
        } else if (payment.daysUntilDue === 0) {
            return 'VENCE HOY';
        } else if (payment.daysUntilDue === 1) {
            return 'Vence mañana';
        }
        return `Vence en ${payment.daysUntilDue} días`;
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
                <span style={{ fontSize: '1.5rem' }}>💰</span>
                <h3 style={{ margin: 0, color: '#1565c0' }}>Pagos Próximos</h3>
                <span style={{
                    backgroundColor: '#2196f3',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                }}>
                    {pendingPayments.length}
                </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {pendingPayments.map((payment) => {
                    const style = getStatusStyle(payment);
                    return (
                        <div
                            key={payment.id}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '0.75rem',
                                borderRadius: '6px',
                                backgroundColor: style.bg,
                                borderLeft: `4px solid ${style.border}`
                            }}
                        >
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontWeight: 'bold', color: '#333' }}>
                                        {payment.factura || 'Sin factura'}
                                    </span>
                                    {payment.estadoPago === 'urgente' && (
                                        <span style={{
                                            backgroundColor: '#f44336',
                                            color: 'white',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            fontSize: '0.7rem',
                                            fontWeight: 'bold'
                                        }}>
                                            URGENTE
                                        </span>
                                    )}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '2px' }}>
                                    {payment.insumo} — {payment.proveedor || 'Sin proveedor'}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: 'bold', color: style.text }}>
                                    {getStatusLabel(payment)}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#666' }}>
                                    {formatDate(payment.fechaPago)}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <p style={{
                marginTop: '1rem',
                marginBottom: 0,
                fontSize: '0.85rem',
                color: '#666',
                fontStyle: 'italic'
            }}>
                Mostrando pagos con vencimiento en los próximos 7 días
            </p>
        </div>
    );
}
