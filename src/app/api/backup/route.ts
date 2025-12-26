import { NextResponse } from 'next/server';
import { readDb } from '@/lib/db';

export async function GET() {
    try {
        // Read from the actual database (Vercel KV in production, local in dev)
        const db = await readDb();

        if (!db) {
            return NextResponse.json({
                error: 'Database not found or empty'
            }, { status: 404 });
        }

        const dateStr = new Date().toISOString().split('T')[0];
        const fileName = `backup_panificadora_${dateStr}.json`;
        const fileContent = JSON.stringify(db, null, 2);

        // Return as downloadable file with explicit headers
        return new NextResponse(fileContent, {
            status: 200,
            headers: {
                'Content-Type': 'application/octet-stream',
                'Content-Disposition': `attachment; filename="${fileName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
                'Content-Length': String(Buffer.byteLength(fileContent, 'utf-8')),
                'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
        });
    } catch (error) {
        console.error('Backup error:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: String(error)
        }, { status: 500 });
    }
}
