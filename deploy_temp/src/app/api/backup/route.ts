import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        // Get the path to the persistent database
        const defaultDbPath = path.join(process.cwd(), 'src/data/db.json');
        const dbPath = process.env.DB_PATH || defaultDbPath;

        if (!fs.existsSync(dbPath)) {
            return NextResponse.json({
                error: 'Database file not found'
            }, { status: 404 });
        }

        // Read the file
        const fileContent = fs.readFileSync(dbPath, 'utf-8');
        const fileName = `backup_panificadora_${new Date().toISOString().split('T')[0]}.json`;

        // Return as downloadable file
        return new NextResponse(fileContent, {
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="${fileName}"`,
            },
        });
    } catch (error) {
        return NextResponse.json({
            error: 'Internal Server Error',
            details: String(error)
        }, { status: 500 });
    }
}
