import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET(
    request: NextRequest,
    { params }: { params: { filename: string } }
) {
    try {
        const filename = params.filename;

        // Get image from persistent volume
        if (!process.env.DB_PATH) {
            return NextResponse.json({ error: 'Not configured' }, { status: 404 });
        }

        const persistentDir = path.dirname(process.env.DB_PATH);
        const productosDir = path.join(persistentDir, 'productos');
        const filepath = path.join(productosDir, filename);

        if (!fs.existsSync(filepath)) {
            return NextResponse.json({ error: 'Image not found' }, { status: 404 });
        }

        const fileBuffer = fs.readFileSync(filepath);

        // Determine content type
        const ext = path.extname(filename).toLowerCase();
        const contentType = ext === '.png' ? 'image/png'
            : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg'
                : ext === '.webp' ? 'image/webp'
                    : 'application/octet-stream';

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        console.error('Error serving image:', error);
        return NextResponse.json({ error: 'Error serving image' }, { status: 500 });
    }
}
