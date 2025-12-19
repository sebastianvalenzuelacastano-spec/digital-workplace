import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';

/**
 * Export data to CSV file
 */
export function exportToCSV<T extends Record<string, unknown>>(
    data: T[],
    filename: string,
    columns: { key: keyof T; header: string }[]
) {
    // Transform data to only include specified columns with headers
    const rows = data.map(item =>
        columns.reduce((acc, col) => {
            acc[col.header] = item[col.key];
            return acc;
        }, {} as Record<string, unknown>)
    );

    const csv = Papa.unparse(rows);
    downloadFile(csv, `${filename}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Export data to PDF file
 */
export function exportToPDF<T extends Record<string, unknown>>(
    data: T[],
    filename: string,
    title: string,
    columns: { key: keyof T; header: string }[]
) {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(16);
    doc.text(title, 14, 15);

    // Add date
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-CL')}`, 14, 22);

    // Prepare table data
    const headers = columns.map(col => col.header);
    const rows = data.map(item =>
        columns.map(col => {
            const value = item[col.key];
            // Format numbers with locale
            if (typeof value === 'number') {
                return value.toLocaleString('es-CL');
            }
            return String(value ?? '');
        })
    );

    // Add table
    autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 28,
        styles: {
            fontSize: 9,
            cellPadding: 3,
        },
        headStyles: {
            fillColor: [59, 130, 246],
            textColor: 255,
            fontStyle: 'bold',
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245],
        },
    });

    doc.save(`${filename}.pdf`);
}

/**
 * Helper to download file
 */
function downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Format date for export
 */
export function formatDateForExport(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-CL');
}

/**
 * Format currency for export
 */
export function formatCurrencyForExport(amount: number): string {
    return `$${amount.toLocaleString('es-CL')}`;
}
