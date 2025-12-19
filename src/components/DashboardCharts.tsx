'use client';

import { useDashboard } from '@/context/DashboardContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

export default function DashboardCharts() {
    const { ventas, cajaChica, rendimientos } = useDashboard();

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    // Sales comparison data
    const currentMonthSales = ventas
        .filter(v => {
            const date = new Date(v.fecha);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        })
        .reduce((sum, v) => sum + v.monto, 0);

    const previousMonthSales = ventas
        .filter(v => {
            const date = new Date(v.fecha);
            return date.getMonth() === previousMonth && date.getFullYear() === previousMonthYear;
        })
        .reduce((sum, v) => sum + v.monto, 0);

    const salesComparisonData = [
        { name: monthNames[previousMonth], ventas: previousMonthSales },
        { name: monthNames[currentMonth], ventas: currentMonthSales }
    ];

    // Expenses by area data
    const expensesByArea = cajaChica.reduce((acc, item) => {
        if (!acc[item.area]) {
            acc[item.area] = 0;
        }
        acc[item.area] += item.monto;
        return acc;
    }, {} as Record<string, number>);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

    const expensesPieData = Object.entries(expensesByArea).map(([name, value]) => ({
        name,
        value
    }));

    // Performance trend data (last 7 days with data)
    const performanceData = [...rendimientos]
        .sort((a, b) => a.fecha.localeCompare(b.fecha))
        .slice(-7)
        .map(r => ({
            fecha: r.fecha.slice(5), // MM-DD format
            rendimiento: r.rinde,
            kilos: r.kilosProducidos
        }));

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
        }}>
            {/* Sales Comparison Chart */}
            <div style={{
                backgroundColor: '#fff',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                padding: '1rem'
            }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: '#333' }}>
                    📊 Ventas: Mes Actual vs Anterior
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={salesComparisonData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                        <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Ventas']} />
                        <Bar dataKey="ventas" fill="#4caf50" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
                <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                    {currentMonthSales > previousMonthSales ? (
                        <span style={{ color: '#4caf50', fontWeight: 'bold' }}>
                            📈 +{((currentMonthSales - previousMonthSales) / (previousMonthSales || 1) * 100).toFixed(1)}%
                        </span>
                    ) : currentMonthSales < previousMonthSales ? (
                        <span style={{ color: '#f44336', fontWeight: 'bold' }}>
                            📉 {((currentMonthSales - previousMonthSales) / (previousMonthSales || 1) * 100).toFixed(1)}%
                        </span>
                    ) : (
                        <span style={{ color: '#666' }}>Sin cambio</span>
                    )}
                </div>
            </div>

            {/* Expenses by Area Pie Chart */}
            {expensesPieData.length > 0 && (
                <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    padding: '1rem'
                }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: '#333' }}>
                        🥧 Gastos por Área
                    </h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={expensesPieData}
                                cx="50%"
                                cy="50%"
                                outerRadius={70}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                                labelLine={false}
                            >
                                {expensesPieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Gasto']} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Performance Trend Line Chart */}
            {performanceData.length > 0 && (
                <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    padding: '1rem'
                }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: '#333' }}>
                        📈 Tendencia de Rendimiento
                    </h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={performanceData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="fecha" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="rendimiento"
                                stroke="#2196f3"
                                strokeWidth={2}
                                name="Rinde (kg/saco)"
                            />
                            <Line
                                type="monotone"
                                dataKey="kilos"
                                stroke="#4caf50"
                                strokeWidth={2}
                                name="Kilos Producidos"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
