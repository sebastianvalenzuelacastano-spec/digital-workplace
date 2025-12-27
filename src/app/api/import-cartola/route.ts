import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Convertir File a ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Leer archivo Excel
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convertir a JSON sin encabezados (header: 1 = array de arrays)
        const rawData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });

        console.log('Total filas leídas:', rawData.length);
        console.log('Primeras 5 filas:', rawData.slice(0, 5));

        if (rawData.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'El archivo está vacío o no tiene datos'
            }, { status: 400 });
        }

        // Formato Santander (según usuario):
        // Columna A (índice 0): Monto (negativo = salida, positivo = entrada)
        // Columna B (índice 1): Descripción/Glosa
        // Columna C (índice 2): Fecha
        // Columna D (índice 3): Número de documento

        const movimientos: any[] = [];

        for (let i = 0; i < rawData.length; i++) {
            const row = rawData[i];
            if (!row || row.length < 2) continue;

            // Columna A: Monto
            const montoRaw = row[0];
            // Columna B: Descripción
            const descripcion = row[1];
            // Columna C: Fecha (o puede estar en otra posición)
            let fechaRaw = row[2];
            // Columna D o E: Documento (columna 4 o 5, evitar la fecha)
            const documentoRaw = row[4] || row[5];

            // Parsear monto - debe ser un número
            let monto = 0;
            if (typeof montoRaw === 'number') {
                monto = montoRaw;
            } else if (typeof montoRaw === 'string') {
                // Limpiar formato chileno: puntos como separador de miles, coma como decimal
                const cleanMonto = montoRaw.replace(/\./g, '').replace(',', '.');
                monto = parseFloat(cleanMonto) || 0;
            }

            // Si no hay monto válido, saltar fila
            if (monto === 0) continue;

            // Parsear fecha
            let fecha = '';

            // Buscar fecha en columnas C o D
            for (let col = 2; col <= 4; col++) {
                const cellValue = row[col];
                if (!cellValue) continue;

                if (typeof cellValue === 'number') {
                    // Fecha como número Excel
                    const excelDate = XLSX.SSF.parse_date_code(cellValue);
                    if (excelDate && excelDate.y > 2000) {
                        fecha = `${excelDate.y}-${String(excelDate.m).padStart(2, '0')}-${String(excelDate.d).padStart(2, '0')}`;
                        break;
                    }
                } else if (typeof cellValue === 'string' && cellValue.includes('/')) {
                    // Fecha como string DD/MM/YYYY
                    const parts = cellValue.split('/');
                    if (parts.length === 3) {
                        const [day, month, year] = parts;
                        const fullYear = year.length === 2 ? '20' + year : year;
                        fecha = `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                        break;
                    }
                }
            }

            // Determinar entrada/salida basado en signo del monto
            let entrada = 0;
            let salida = 0;
            if (monto > 0) {
                entrada = monto;
            } else {
                salida = Math.abs(monto);
            }

            movimientos.push({
                _index: i,
                fecha: fecha || '',
                descripcion: String(descripcion || '').trim(),
                entrada,
                salida,
                documento: String(documentoRaw || '').trim() || '-',
                observacion: '',
                areaPago: ''
            });
        }

        // Filtrar solo movimientos con fecha válida
        const movimientosValidos = movimientos.filter(m => m.fecha && (m.entrada > 0 || m.salida > 0));

        console.log(`Movimientos procesados: ${movimientosValidos.length}`);
        if (movimientosValidos.length > 0) {
            console.log('Primer movimiento:', movimientosValidos[0]);
            console.log('Último movimiento:', movimientosValidos[movimientosValidos.length - 1]);
        }

        return NextResponse.json({
            success: true,
            movimientos: movimientosValidos,
            total: movimientosValidos.length
        });

    } catch (error) {
        console.error('Error processing Excel:', error);
        return NextResponse.json({
            error: 'Error al procesar el archivo Excel',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
