'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';

interface ImportResult {
    success: boolean;
    message: string;
    count?: number;
    errors?: string[];
}

export default function ImportarDatosPage() {
    const [importing, setImporting] = useState(false);
    const [results, setResults] = useState<ImportResult | null>(null);
    const [selectedType, setSelectedType] = useState<'productos' | 'trabajadores' | 'empresas'>('productos');

    const processExcel = async (file: File) => {
        setImporting(true);
        setResults(null);

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            if (jsonData.length === 0) {
                setResults({ success: false, message: 'El archivo Excel está vacío' });
                return;
            }

            // Send to API
            const token = localStorage.getItem('token');
            const response = await fetch('/api/importar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    type: selectedType,
                    data: jsonData
                })
            });

            const result = await response.json();

            if (response.ok) {
                setResults({
                    success: true,
                    message: `Se importaron ${result.count} ${selectedType} correctamente`,
                    count: result.count
                });
            } else {
                setResults({
                    success: false,
                    message: result.error || 'Error al importar',
                    errors: result.errors
                });
            }
        } catch (error) {
            console.error('Error processing Excel:', error);
            setResults({
                success: false,
                message: 'Error al procesar el archivo Excel'
            });
        } finally {
            setImporting(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processExcel(file);
        }
    };

    const downloadTemplate = () => {
        let headers: string[] = [];
        let sampleData: Record<string, string | number>[] = [];

        switch (selectedType) {
            case 'productos':
                headers = ['nombre', 'categoria', 'activo'];
                sampleData = [
                    { nombre: 'Pan Marraqueta', categoria: 'Pan Tradicional', activo: 'si' },
                    { nombre: 'Hallulla', categoria: 'Pan Tradicional', activo: 'si' }
                ];
                break;
            case 'trabajadores':
                headers = ['rut', 'nombre', 'cargo', 'telefono', 'email', 'activo'];
                sampleData = [
                    { rut: '12345678-9', nombre: 'Juan Pérez', cargo: 'Repartidor', telefono: '+56912345678', email: 'juan@email.com', activo: 'si' },
                    { rut: '98765432-1', nombre: 'María López', cargo: 'Panadero', telefono: '+56987654321', email: 'maria@email.com', activo: 'si' }
                ];
                break;
            case 'empresas':
                headers = ['rut', 'nombre', 'contacto', 'telefono', 'email'];
                sampleData = [
                    { rut: '76123456-7', nombre: 'Empresa ABC', contacto: 'Pedro Soto', telefono: '+56912345678', email: 'contacto@abc.cl' },
                    { rut: '76987654-3', nombre: 'Restaurant XYZ', contacto: 'Ana Muñoz', telefono: '+56987654321', email: 'ventas@xyz.cl' }
                ];
                break;
        }

        const ws = XLSX.utils.json_to_sheet(sampleData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Datos');
        XLSX.writeFile(wb, `plantilla_${selectedType}.xlsx`);
    };

    return (
        <div>
            <h2 style={{ marginBottom: '20px' }}>📥 Importar Datos desde Excel</h2>

            <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', maxWidth: '600px' }}>
                {/* Type Selection */}
                <div style={{ marginBottom: '25px' }}>
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                        ¿Qué deseas importar?
                    </label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {(['productos', 'trabajadores', 'empresas'] as const).map(type => (
                            <button
                                key={type}
                                onClick={() => { setSelectedType(type); setResults(null); }}
                                style={{
                                    padding: '12px 20px',
                                    borderRadius: '8px',
                                    border: selectedType === type ? '2px solid #1976d2' : '1px solid #ddd',
                                    backgroundColor: selectedType === type ? '#e3f2fd' : '#fff',
                                    color: selectedType === type ? '#1976d2' : '#333',
                                    fontWeight: selectedType === type ? 'bold' : 'normal',
                                    cursor: 'pointer',
                                    textTransform: 'capitalize'
                                }}
                            >
                                {type === 'productos' && '📦 '}
                                {type === 'trabajadores' && '👷 '}
                                {type === 'empresas' && '🏢 '}
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Template Download */}
                <div style={{
                    marginBottom: '25px',
                    padding: '15px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '8px'
                }}>
                    <p style={{ marginBottom: '10px', fontSize: '0.9rem' }}>
                        <strong>Paso 1:</strong> Descarga la plantilla de Excel con el formato correcto
                    </p>
                    <button
                        onClick={downloadTemplate}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#4caf50',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                        }}
                    >
                        📄 Descargar Plantilla de {selectedType}
                    </button>
                </div>

                {/* File Upload */}
                <div style={{ marginBottom: '25px' }}>
                    <p style={{ marginBottom: '10px', fontSize: '0.9rem' }}>
                        <strong>Paso 2:</strong> Sube el archivo Excel con tus datos
                    </p>
                    <label style={{
                        display: 'block',
                        padding: '30px',
                        border: '2px dashed #ddd',
                        borderRadius: '8px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        backgroundColor: '#fafafa'
                    }}>
                        <input
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                            disabled={importing}
                        />
                        {importing ? (
                            <span>⏳ Importando...</span>
                        ) : (
                            <>
                                <span style={{ fontSize: '2rem', display: 'block', marginBottom: '10px' }}>📤</span>
                                <span>Haz clic o arrastra tu archivo Excel aquí</span>
                            </>
                        )}
                    </label>
                </div>

                {/* Results */}
                {results && (
                    <div style={{
                        padding: '15px',
                        borderRadius: '8px',
                        backgroundColor: results.success ? '#e8f5e9' : '#ffebee',
                        color: results.success ? '#2e7d32' : '#c62828'
                    }}>
                        <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                            {results.success ? '✅ ' : '❌ '}{results.message}
                        </p>
                        {results.errors && results.errors.length > 0 && (
                            <ul style={{ marginTop: '10px', paddingLeft: '20px', fontSize: '0.9rem' }}>
                                {results.errors.map((err, i) => (
                                    <li key={i}>{err}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

                {/* Instructions */}
                <div style={{
                    marginTop: '25px',
                    padding: '15px',
                    backgroundColor: '#fff3e0',
                    borderRadius: '8px',
                    fontSize: '0.9rem'
                }}>
                    <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>💡 Instrucciones:</p>
                    <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
                        <li>Usa la plantilla descargada como base</li>
                        <li>No cambies los nombres de las columnas</li>
                        <li>El campo "activo" puede ser: si, no, 1, 0, true, false</li>
                        <li>Los datos se agregarán a los existentes</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
