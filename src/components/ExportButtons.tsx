'use client';

import { exportToCSV, exportToPDF } from '@/lib/exportUtils';

interface Column<T> {
    key: keyof T;
    header: string;
}

interface ExportButtonsProps<T extends Record<string, unknown>> {
    data: T[];
    filename: string;
    title: string;
    columns: Column<T>[];
}

export default function ExportButtons<T extends Record<string, unknown>>({
    data,
    filename,
    title,
    columns
}: ExportButtonsProps<T>) {
    const handleExportCSV = () => {
        exportToCSV(data, filename, columns);
    };

    const handleExportPDF = () => {
        exportToPDF(data, filename, title, columns);
    };

    return (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
                onClick={handleExportCSV}
                style={{
                    padding: '6px 12px',
                    fontSize: '0.85rem',
                    backgroundColor: '#4caf50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                }}
            >
                📊 Excel
            </button>
            <button
                onClick={handleExportPDF}
                style={{
                    padding: '6px 12px',
                    fontSize: '0.85rem',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                }}
            >
                📄 PDF
            </button>
        </div>
    );
}
