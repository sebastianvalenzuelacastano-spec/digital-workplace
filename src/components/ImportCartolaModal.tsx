'use client';

import { useState } from 'react';
import Modal from './Modal';

interface MovimientoParsed {
    _index: number;
    fecha: string;
    descripcion: string;
    entrada: number;
    salida: number;
    documento: string;
    observacion: string;
    areaPago: string;
}

interface ImportCartolaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (movimientos: MovimientoParsed[]) => void;
}

export default function ImportCartolaModal({ isOpen, onClose, onImport }: ImportCartolaModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [movimientos, setMovimientos] = useState<MovimientoParsed[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState<'upload' | 'preview'>('upload');
    const [editingCell, setEditingCell] = useState<{ index: number; field: string } | null>(null);

    // Opciones para área de pago
    const areasPago = ['', 'O.Gerencia', 'OPER. CENTRALES', 'Agustinas', 'O.Florencia', 'D.Gerencia', 'Guiness'];

    // Función para actualizar un movimiento
    const handleUpdateMovimiento = (index: number, field: string, value: string) => {
        setMovimientos(prev => prev.map(mov =>
            mov._index === index ? { ...mov, [field]: value } : mov
        ));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            // Validar que sea Excel
            const validExtensions = ['.xlsx', '.xls'];
            const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();

            if (!validExtensions.includes(fileExtension)) {
                setError('Por favor selecciona un archivo Excel (.xlsx o .xls)');
                return;
            }

            setFile(selectedFile);
            setError('');
        }
    };

    const handleProcessFile = async () => {
        if (!file) return;

        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/import-cartola', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setMovimientos(data.movimientos);
                setStep('preview');
            } else {
                setError(data.error || 'Error al procesar el archivo');
            }
        } catch (err) {
            setError('Error al cargar el archivo');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmImport = () => {
        onImport(movimientos);
        handleClose();
    };

    const handleClose = () => {
        setFile(null);
        setMovimientos([]);
        setStep('upload');
        setError('');
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="📥 Importar Cartola Bancaria"
        >
            {step === 'upload' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{
                        padding: '20px',
                        backgroundColor: '#e3f2fd',
                        borderRadius: '8px',
                        marginBottom: '10px'
                    }}>
                        <p style={{ fontSize: '0.9rem', margin: 0, color: '#1565c0' }}>
                            ℹ️ Sube tu cartola bancaria en formato Excel (.xlsx o .xls) de Banco Santander.
                            El sistema detectará automáticamente las columnas de Fecha, Cargo, Abono y Descripción.
                        </p>
                    </div>

                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: 'bold',
                            fontSize: '0.9rem'
                        }}>
                            Selecciona archivo Excel *
                        </label>
                        <input
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleFileChange}
                            style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: '4px',
                                border: '1px solid #ccc'
                            }}
                        />
                        {file && (
                            <p style={{ marginTop: '8px', fontSize: '0.85rem', color: '#666' }}>
                                📄 {file.name} ({(file.size / 1024).toFixed(2)} KB)
                            </p>
                        )}
                    </div>

                    {error && (
                        <div style={{
                            padding: '12px',
                            backgroundColor: '#ffebee',
                            color: '#c62828',
                            borderRadius: '6px',
                            fontSize: '0.9rem'
                        }}>
                            ❌ {error}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button
                            onClick={handleProcessFile}
                            disabled={!file || loading}
                            className="btn btn-primary"
                            style={{
                                flex: 1,
                                opacity: !file || loading ? 0.5 : 1,
                                cursor: !file || loading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loading ? 'Procesando...' : 'Procesar Archivo'}
                        </button>
                        <button
                            type="button"
                            onClick={handleClose}
                            style={{
                                flex: 1,
                                padding: '10px',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                                backgroundColor: '#fff',
                                cursor: 'pointer'
                            }}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{
                        padding: '15px',
                        backgroundColor: '#e8f5e9',
                        borderRadius: '8px'
                    }}>
                        <p style={{ margin: 0, fontWeight: 'bold', color: '#2e7d32' }}>
                            ✅ Se detectaron {movimientos.length} movimientos
                        </p>
                        <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#666' }}>
                            Revisa los datos y confirma la importación
                        </p>
                    </div>

                    <div style={{
                        maxHeight: '400px',
                        overflowY: 'auto',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px'
                    }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f5f5f5', zIndex: 1 }}>
                                <tr style={{ borderBottom: '2px solid #ddd' }}>
                                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '0.8rem' }}>Fecha</th>
                                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '0.8rem' }}>Descripción ✏️</th>
                                    <th style={{ padding: '8px', textAlign: 'right', fontSize: '0.8rem' }}>Monto</th>
                                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '0.8rem' }}>Doc ✏️</th>
                                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '0.8rem' }}>Área ✏️</th>
                                </tr>
                            </thead>
                            <tbody>
                                {movimientos.map((mov) => (
                                    <tr key={mov._index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                        <td style={{ padding: '6px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{mov.fecha}</td>
                                        <td
                                            style={{ padding: '6px', fontSize: '0.8rem', cursor: 'pointer', maxWidth: '200px' }}
                                            onDoubleClick={() => setEditingCell({ index: mov._index, field: 'descripcion' })}
                                            title="Doble clic para editar"
                                        >
                                            {editingCell?.index === mov._index && editingCell?.field === 'descripcion' ? (
                                                <input
                                                    type="text"
                                                    defaultValue={mov.descripcion}
                                                    autoFocus
                                                    style={{ width: '100%', padding: '4px', fontSize: '0.8rem' }}
                                                    onBlur={(e) => {
                                                        handleUpdateMovimiento(mov._index, 'descripcion', e.target.value);
                                                        setEditingCell(null);
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            handleUpdateMovimiento(mov._index, 'descripcion', e.currentTarget.value);
                                                            setEditingCell(null);
                                                        }
                                                        if (e.key === 'Escape') setEditingCell(null);
                                                    }}
                                                />
                                            ) : mov.descripcion}
                                        </td>
                                        <td style={{
                                            padding: '6px',
                                            textAlign: 'right',
                                            color: mov.entrada > 0 ? '#2e7d32' : '#c62828',
                                            fontWeight: 'bold',
                                            fontSize: '0.8rem',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {mov.entrada > 0 ? `+$${mov.entrada.toLocaleString('es-CL')}` : `-$${mov.salida.toLocaleString('es-CL')}`}
                                        </td>
                                        <td
                                            style={{ padding: '6px', fontSize: '0.8rem', cursor: 'pointer' }}
                                            onDoubleClick={() => setEditingCell({ index: mov._index, field: 'documento' })}
                                            title="Doble clic para editar"
                                        >
                                            {editingCell?.index === mov._index && editingCell?.field === 'documento' ? (
                                                <input
                                                    type="text"
                                                    defaultValue={mov.documento}
                                                    autoFocus
                                                    style={{ width: '80px', padding: '4px', fontSize: '0.8rem' }}
                                                    onBlur={(e) => {
                                                        handleUpdateMovimiento(mov._index, 'documento', e.target.value);
                                                        setEditingCell(null);
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            handleUpdateMovimiento(mov._index, 'documento', e.currentTarget.value);
                                                            setEditingCell(null);
                                                        }
                                                        if (e.key === 'Escape') setEditingCell(null);
                                                    }}
                                                />
                                            ) : (mov.documento || '-')}
                                        </td>
                                        <td
                                            style={{ padding: '6px', fontSize: '0.8rem', cursor: 'pointer' }}
                                            onDoubleClick={() => setEditingCell({ index: mov._index, field: 'areaPago' })}
                                            title="Doble clic para editar"
                                        >
                                            {editingCell?.index === mov._index && editingCell?.field === 'areaPago' ? (
                                                <select
                                                    defaultValue={mov.areaPago}
                                                    autoFocus
                                                    style={{ padding: '4px', fontSize: '0.8rem' }}
                                                    onBlur={(e) => {
                                                        handleUpdateMovimiento(mov._index, 'areaPago', e.target.value);
                                                        setEditingCell(null);
                                                    }}
                                                    onChange={(e) => {
                                                        handleUpdateMovimiento(mov._index, 'areaPago', e.target.value);
                                                        setEditingCell(null);
                                                    }}
                                                >
                                                    {areasPago.map(area => (
                                                        <option key={area} value={area}>{area || '(vacío)'}</option>
                                                    ))}
                                                </select>
                                            ) : (mov.areaPago || '-')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button
                            onClick={handleConfirmImport}
                            className="btn btn-primary"
                            style={{ flex: 1 }}
                        >
                            ✅ Confirmar Importación ({movimientos.length} movimientos)
                        </button>
                        <button
                            type="button"
                            onClick={() => setStep('upload')}
                            style={{
                                flex: 1,
                                padding: '10px',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                                backgroundColor: '#fff',
                                cursor: 'pointer'
                            }}
                        >
                            ← Volver
                        </button>
                    </div>
                </div>
            )}
        </Modal>
    );
}
