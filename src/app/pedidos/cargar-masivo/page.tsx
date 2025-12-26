'use client';

import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

interface ClientData {
    id: number;
    username: string;
    casinoNombre: string;
    empresaId: number;
}

interface Producto {
    id: number;
    nombre: string;
    precio: number;
}

export default function CargarPedidosPage() {
    const [clientData, setClientData] = useState<ClientData | null>(null);
    const [productos, setProductos] = useState<Producto[]>([]);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string; count?: number } | null>(null);

    useEffect(() => {
        const data = localStorage.getItem('clientData');
        if (data) {
            setClientData(JSON.parse(data));
        }
        loadProductos();
    }, []);

    const loadProductos = async () => {
        try {
            const token = localStorage.getItem('clientToken');
            const response = await fetch('/api/productos-catalogo', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const prods = await response.json();
            setProductos(Array.isArray(prods) ? prods.filter((p: any) => p.activo) : []);
        } catch (error) {
            console.error('Error loading products:', error);
        }
    };

    const downloadTemplate = () => {
        // ===== Hoja 1: Pedidos =====
        const exampleRows = [
            { 'Fecha Entrega': '26/12/2024', 'Hora Entrega': '07:00', 'Producto': productos[0]?.nombre || '', 'Cantidad': 5, 'Unidad': 'Kg' },
            { 'Fecha Entrega': '26/12/2024', 'Hora Entrega': '07:00', 'Producto': productos[1]?.nombre || '', 'Cantidad': 3, 'Unidad': 'Un' },
            { 'Fecha Entrega': '27/12/2024', 'Hora Entrega': '07:00', 'Producto': productos[0]?.nombre || '', 'Cantidad': 5, 'Unidad': 'Kg' }
        ];

        // Create empty rows for the week
        const emptyRows = Array(50).fill(null).map(() => ({
            'Fecha Entrega': '',
            'Hora Entrega': '',
            'Producto': '',
            'Cantidad': '',
            'Unidad': 'Kg'
        }));

        const pedidosData = [...exampleRows, ...emptyRows];
        const wsPedidos = XLSX.utils.json_to_sheet(pedidosData);

        // Set column widths for Pedidos sheet
        wsPedidos['!cols'] = [
            { wch: 15 }, // Fecha Entrega
            { wch: 12 }, // Hora Entrega
            { wch: 30 }, // Producto
            { wch: 10 }, // Cantidad
            { wch: 10 }  // Unidad
        ];

        // ===== Hoja 2: Lista de Productos =====
        const productosData = productos.map(p => ({
            'Producto': p.nombre,
            'Precio': p.precio ? `$${p.precio.toLocaleString()}` : 'Precio por consultar',
            'Copiar →': '← Copia este nombre exactamente'
        }));

        const wsProductos = XLSX.utils.json_to_sheet(productosData);
        wsProductos['!cols'] = [
            { wch: 30 }, // Producto
            { wch: 12 }, // Precio
            { wch: 35 }  // Instrucción
        ];

        // ===== Hoja 3: Instrucciones =====
        const instrucciones = [
            { 'INSTRUCCIONES': 'Cómo usar esta plantilla:' },
            { 'INSTRUCCIONES': '' },
            { 'INSTRUCCIONES': '1. Ve a la hoja "Pedidos"' },
            { 'INSTRUCCIONES': '2. Llena Fecha Entrega (DD/MM/YYYY), ejemplo: 26/12/2024' },
            { 'INSTRUCCIONES': '3. Llena Hora Entrega (HH:MM), ejemplo: 07:00' },
            { 'INSTRUCCIONES': '4. Para Producto: Ve a la hoja "Productos Disponibles" y COPIA el nombre exacto' },
            { 'INSTRUCCIONES': '5. Llena Cantidad (número)' },
            { 'INSTRUCCIONES': '6. Unidad: escribe "Kg" o "Un"' },
            { 'INSTRUCCIONES': '' },
            { 'INSTRUCCIONES': '⚠️ IMPORTANTE:' },
            { 'INSTRUCCIONES': '- Los nombres de productos deben ser EXACTOS (copia/pega desde hoja Productos)' },
            { 'INSTRUCCIONES': '- Puedes tener varios pedidos para el mismo día con diferentes horas' },
            { 'INSTRUCCIONES': '- Borra las filas de ejemplo antes de subir' },
            { 'INSTRUCCIONES': '- Solo llena las filas que necesites' }
        ];

        const wsInstrucciones = XLSX.utils.json_to_sheet(instrucciones);
        wsInstrucciones['!cols'] = [{ wch: 80 }];

        // Create workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, wsInstrucciones, 'Instrucciones');
        XLSX.utils.book_append_sheet(wb, wsPedidos, 'Pedidos');
        XLSX.utils.book_append_sheet(wb, wsProductos, 'Productos Disponibles');

        XLSX.writeFile(wb, `plantilla_pedidos_${clientData?.casinoNombre || 'cliente'}.xlsx`);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setResult(null);

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            if (jsonData.length === 0) {
                setResult({ success: false, message: 'El archivo está vacío' });
                setUploading(false);
                return;
            }

            // Send to API
            const response = await fetch('/api/cargar-pedidos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    pedidos: jsonData,
                    casinoId: clientData?.id
                })
            });

            const apiResult = await response.json();

            if (response.ok) {
                setResult({
                    success: true,
                    message: `✅ ${apiResult.count} pedidos creados exitosamente`,
                    count: apiResult.count
                });
            } else {
                setResult({
                    success: false,
                    message: apiResult.error || 'Error al procesar los pedidos'
                });
            }
        } catch (error) {
            console.error('Error:', error);
            setResult({ success: false, message: 'Error al procesar el archivo' });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '20px' }}>📤 Carga Masiva de Pedidos</h2>

            <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', marginBottom: '20px' }}>
                <div style={{ marginBottom: '25px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
                    <h3 style={{ marginBottom: '10px', color: '#1565c0' }}>ℹ️ Cómo funciona</h3>
                    <ol style={{ marginLeft: '20px', lineHeight: '1.8' }}>
                        <li>Descarga la plantilla Excel con tus productos</li>
                        <li>Llena las fechas, horas, cantidades y unidades</li>
                        <li>Sube el archivo - se crearán todos los pedidos automáticamente</li>
                    </ol>
                    <p style={{ marginTop: '10px', fontSize: '0.9rem', color: '#666' }}>
                        💡 Puedes crear múltiples pedidos para el mismo día con diferentes horas
                    </p>
                </div>

                {/* Download Template */}
                <div style={{ marginBottom: '25px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                    <p style={{ marginBottom: '10px', fontWeight: '600' }}>
                        Paso 1: Descarga la plantilla
                    </p>
                    <button
                        onClick={downloadTemplate}
                        disabled={productos.length === 0}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: productos.length > 0 ? '#4caf50' : '#ccc',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: productos.length > 0 ? 'pointer' : 'not-allowed',
                            fontWeight: '600'
                        }}
                    >
                        📄 Descargar Plantilla Excel
                    </button>
                    {productos.length === 0 && (
                        <p style={{ marginTop: '10px', color: '#c62828', fontSize: '0.9rem' }}>
                            No hay productos disponibles
                        </p>
                    )}
                </div>

                {/* Upload File */}
                <div style={{ marginBottom: '25px' }}>
                    <p style={{ marginBottom: '10px', fontWeight: '600' }}>
                        Paso 2: Sube tu archivo con los pedidos
                    </p>
                    <label style={{
                        display: 'block',
                        padding: '40px',
                        border: '2px dashed #ddd',
                        borderRadius: '8px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        backgroundColor: '#fafafa'
                    }}>
                        <input
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleFileUpload}
                            disabled={uploading}
                            style={{ display: 'none' }}
                        />
                        {uploading ? (
                            <span>⏳ Procesando pedidos...</span>
                        ) : (
                            <>
                                <span style={{ fontSize: '3rem', display: 'block', marginBottom: '10px' }}>📤</span>
                                <span style={{ fontSize: '1.1rem' }}>Haz clic o arrastra tu archivo Excel aquí</span>
                            </>
                        )}
                    </label>
                </div>

                {/* Result */}
                {result && (
                    <div style={{
                        padding: '15px',
                        borderRadius: '8px',
                        backgroundColor: result.success ? '#e8f5e9' : '#ffebee',
                        color: result.success ? '#2e7d32' : '#c62828',
                        fontWeight: '600'
                    }}>
                        {result.message}
                    </div>
                )}

                {/* Instructions */}
                <div style={{ marginTop: '25px', padding: '15px', backgroundColor: '#fff3e0', borderRadius: '8px' }}>
                    <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>📋 Formato del Excel:</p>
                    <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f5f5f5' }}>
                                <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Columna</th>
                                <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Formato</th>
                                <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Ejemplo</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={{ padding: '8px', border: '1px solid #ddd' }}>Fecha Entrega</td>
                                <td style={{ padding: '8px', border: '1px solid #ddd' }}>DD/MM/YYYY</td>
                                <td style={{ padding: '8px', border: '1px solid #ddd' }}>26/12/2024</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '8px', border: '1px solid #ddd' }}>Hora Entrega</td>
                                <td style={{ padding: '8px', border: '1px solid #ddd' }}>HH:MM</td>
                                <td style={{ padding: '8px', border: '1px solid #ddd' }}>07:00</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '8px', border: '1px solid #ddd' }}>Producto</td>
                                <td style={{ padding: '8px', border: '1px solid #ddd' }}>Nombre exacto</td>
                                <td style={{ padding: '8px', border: '1px solid #ddd' }}>Pan Marraqueta</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '8px', border: '1px solid #ddd' }}>Cantidad</td>
                                <td style={{ padding: '8px', border: '1px solid #ddd' }}>Número</td>
                                <td style={{ padding: '8px', border: '1px solid #ddd' }}>5</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '8px', border: '1px solid #ddd' }}>Unidad</td>
                                <td style={{ padding: '8px', border: '1px solid #ddd' }}>Kg o Un</td>
                                <td style={{ padding: '8px', border: '1px solid #ddd' }}>Kg</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
