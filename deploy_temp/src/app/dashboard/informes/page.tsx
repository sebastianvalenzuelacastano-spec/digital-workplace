'use client';

import { useState } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { formatDate } from '@/lib/dateUtils';

type ReportType = 'insumos' | 'banco' | 'ventas' | 'rendimiento' | 'pedidos' | 'caja_chica';

export default function ReportsPage() {
    const { orders, ventas, insumoTransactions, bankTransactions, rendimientos, cajaChica } = useDashboard();
    const [selectedReport, setSelectedReport] = useState<ReportType>('ventas');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const filterDataByDate = (data: any[], dateField: string = 'fecha') => {
        if (!dateFrom || !dateTo) return data;
        return data.filter(item => {
            const itemDate = item[dateField];
            return itemDate >= dateFrom && itemDate <= dateTo;
        });
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.text(`Reporte de ${selectedReport.toUpperCase()}`, 14, 15);
        doc.text(`Período: ${dateFrom || 'Inicio'} - ${dateTo || 'Fin'}`, 14, 25);

        let head: string[][] = [];
        let body: any[][] = [];

        switch (selectedReport) {
            case 'ventas':
                head = [['Fecha', 'Cliente', 'Kilos', 'Monto']];
                body = filterDataByDate(ventas).map(v => [v.fecha, v.cliente, v.kilos, `$${v.monto.toLocaleString()}`]);
                break;
            case 'rendimiento':
                head = [['Fecha', 'Kilos Prod.', 'Sacos', 'Rinde', 'Barrido', 'Merma']];
                body = filterDataByDate(rendimientos).map(r => [r.fecha, r.kilosProducidos, r.sacos, r.rinde, r.barrido, r.merma]);
                break;
            case 'banco':
                head = [['Fecha', 'Descripción', 'Documento', 'Entrada', 'Salida', 'Saldo']];
                body = filterDataByDate(bankTransactions).map(t => [t.fecha, t.descripcion, t.documento, `$${t.entrada.toLocaleString()}`, `$${t.salida.toLocaleString()}`, `$${t.saldo.toLocaleString()}`]);
                break;
            case 'insumos':
                head = [['Fecha', 'Insumo', 'Entrada', 'Salida', 'Proveedor', 'Estado Pago']];
                body = filterDataByDate(insumoTransactions).map(t => [t.fecha, t.insumo, t.cantidadEntrada || '-', t.cantidadSalida || '-', t.proveedor, t.estadoPago]);
                break;
            case 'pedidos':
                head = [['Fecha', 'Cliente', 'Productos', 'Total', 'Estado']];
                body = filterDataByDate(orders).map(o => [o.fecha, o.cliente, o.productos, `$${o.total.toLocaleString()}`, o.estado]);
                break;
            case 'caja_chica':
                head = [['Fecha', 'Área', 'Descripción', 'Monto']];
                body = filterDataByDate(cajaChica).map(c => [c.fecha, c.area, c.descripcion, `$${c.monto.toLocaleString()}`]);
                break;
        }

        autoTable(doc, {
            head: head,
            body: body,
            startY: 30,
        });

        doc.save(`reporte_${selectedReport}_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const handleExportExcel = () => {
        let data: any[] = [];

        switch (selectedReport) {
            case 'ventas':
                data = filterDataByDate(ventas);
                break;
            case 'rendimiento':
                data = filterDataByDate(rendimientos);
                break;
            case 'banco':
                data = filterDataByDate(bankTransactions);
                break;
            case 'insumos':
                data = filterDataByDate(insumoTransactions);
                break;
            case 'pedidos':
                data = filterDataByDate(orders);
                break;
            case 'caja_chica':
                data = filterDataByDate(cajaChica);
                break;
        }

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Reporte");
        XLSX.writeFile(wb, `reporte_${selectedReport}_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    return (
        <div>
            <h1 style={{ marginBottom: '2rem' }}>Informes Personalizados</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
                {/* Sidebar de filtros */}
                <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', height: 'fit-content' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Configuración</h3>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Tipo de Reporte</label>
                        <select
                            value={selectedReport}
                            onChange={(e) => setSelectedReport(e.target.value as ReportType)}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        >
                            <option value="ventas">Ventas</option>
                            <option value="rendimiento">Rendimiento</option>
                            <option value="banco">Banco</option>
                            <option value="insumos">Insumos</option>
                            <option value="pedidos">Pedidos</option>
                            <option value="caja_chica">Caja Chica</option>
                        </select>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Fecha Desde</label>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Fecha Hasta</label>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>
                </div>

                {/* Contenido principal */}
                <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Vista Previa del Reporte</h3>

                    {/* Tarjetas de información según el tipo de reporte */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                        {selectedReport === 'ventas' && (
                            <>
                                <div style={{ backgroundColor: '#e8f5e9', padding: '1rem', borderRadius: '8px' }}>
                                    <p style={{ fontSize: '0.85rem', color: '#666' }}>Total Ventas</p>
                                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4caf50' }}>
                                        ${filterDataByDate(ventas).reduce((sum, v) => sum + v.monto, 0).toLocaleString()}
                                    </p>
                                </div>
                                <div style={{ backgroundColor: '#e3f2fd', padding: '1rem', borderRadius: '8px' }}>
                                    <p style={{ fontSize: '0.85rem', color: '#666' }}>Total Kilos</p>
                                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2196f3' }}>
                                        {filterDataByDate(ventas).reduce((sum, v) => sum + v.kilos, 0)} kg
                                    </p>
                                </div>
                            </>
                        )}

                        {selectedReport === 'caja_chica' && (
                            <>
                                <div style={{ backgroundColor: '#e8f5e9', padding: '1rem', borderRadius: '8px' }}>
                                    <p style={{ fontSize: '0.85rem', color: '#666' }}>Total Gastos</p>
                                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f44336' }}>
                                        ${filterDataByDate(cajaChica).reduce((sum, c) => sum + c.monto, 0).toLocaleString()}
                                    </p>
                                </div>
                                <div style={{ backgroundColor: '#e3f2fd', padding: '1rem', borderRadius: '8px' }}>
                                    <p style={{ fontSize: '0.85rem', color: '#666' }}>Registros</p>
                                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2196f3' }}>
                                        {filterDataByDate(cajaChica).length}
                                    </p>
                                </div>
                            </>
                        )}

                        {/* Add similar dynamic summaries for other reports if needed, simplified for brevity */}
                    </div>

                    {/* Área de tabla/gráfico */}
                    <div style={{ padding: '2rem', backgroundColor: '#f5f5f5', borderRadius: '8px', textAlign: 'center', minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</p>
                        <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '0.5rem' }}>Reporte de {selectedReport.replace('_', ' ').toUpperCase()}</p>
                        <p style={{ fontSize: '0.9rem', color: '#999' }}>
                            {dateFrom && dateTo
                                ? `Período: ${formatDate(dateFrom)} - ${formatDate(dateTo)}`
                                : 'Mostrando todos los registros (seleccione fechas para filtrar)'}
                        </p>
                        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                            <button onClick={handleExportPDF} className="btn btn-secondary" style={{ padding: '8px 20px', cursor: 'pointer' }}>
                                📄 Exportar PDF
                            </button>
                            <button onClick={handleExportExcel} className="btn btn-secondary" style={{ padding: '8px 20px', cursor: 'pointer' }}>
                                📊 Exportar Excel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
