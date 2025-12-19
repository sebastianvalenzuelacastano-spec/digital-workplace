import { NextResponse } from 'next/server';
import { createBackup, listBackups, restoreBackup } from '@/lib/backup';

// GET - List all backups
export async function GET() {
    try {
        const backups = listBackups();
        return NextResponse.json({ backups });
    } catch (error) {
        console.error('Error listing backups:', error);
        return NextResponse.json(
            { error: 'Error al listar respaldos' },
            { status: 500 }
        );
    }
}

// POST - Create a new backup
export async function POST() {
    try {
        const filename = createBackup();
        return NextResponse.json({
            success: true,
            message: 'Respaldo creado exitosamente',
            filename
        });
    } catch (error) {
        console.error('Error creating backup:', error);
        return NextResponse.json(
            { error: 'Error al crear respaldo' },
            { status: 500 }
        );
    }
}

// PUT - Restore a specific backup
export async function PUT(request: Request) {
    try {
        const { filename } = await request.json();

        if (!filename) {
            return NextResponse.json(
                { error: 'Nombre de archivo requerido' },
                { status: 400 }
            );
        }

        const success = restoreBackup(filename);

        if (success) {
            return NextResponse.json({
                success: true,
                message: 'Respaldo restaurado exitosamente'
            });
        } else {
            return NextResponse.json(
                { error: 'Respaldo no encontrado' },
                { status: 404 }
            );
        }
    } catch (error) {
        console.error('Error restoring backup:', error);
        return NextResponse.json(
            { error: 'Error al restaurar respaldo' },
            { status: 500 }
        );
    }
}
