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

        const fileName = `backup_panificadora_${new Date().toISOString().split('T')[0]}.json`;
        const fileContent = JSON.stringify(db, null, 2);

        // Return as downloadable file
        return new NextResponse(fileContent, {
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="${fileName}"`,
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
