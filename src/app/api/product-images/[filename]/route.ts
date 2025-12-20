import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET(
    request: NextRequest,
    { params }: { params: { filename: string } }
) {
    try {
        const filename = params.filename;
        let filepath: string | null = null;

        // Try persistent volume first (for uploaded images)
        if (process.env.DB_PATH) {
            const persistentDir = path.dirname(process.env.DB_PATH);
            const productosDir = path.join(persistentDir, 'productos');
            const persistentPath = path.join(productosDir, filename);

            if (fs.existsSync(persistentPath)) {
                filepath = persistentPath;
            }
        }

        // Fallback to public folder (for pre-loaded images)
        if (!filepath) {
            const publicPath = path.join(process.cwd(), 'public', filename);
            if (fs.existsSync(publicPath)) {
                filepath = publicPath;
            }
        }

        // Also try public/productos
        if (!filepath) {
            const productosPath = path.join(process.cwd(), 'public', 'productos', filename);
            if (fs.existsSync(productosPath)) {
                filepath = productosPath;
            }
        }

        if (!filepath) {
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
