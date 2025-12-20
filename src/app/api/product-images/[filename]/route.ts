import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ filename: string }> }
) {
    try {
        // In Next.js 15, params is a Promise
        const params = await context.params;
        const filename = params.filename;

        if (!filename) {
            return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
        }

        let filepath: string | null = null;

        console.log('[product-images] Looking for:', filename);

        // Try persistent volume first (for uploaded images on Railway)
        if (process.env.DB_PATH) {
            const persistentDir = path.dirname(process.env.DB_PATH);
            const productosDir = path.join(persistentDir, 'productos');
            const persistentPath = path.join(productosDir, filename);

            console.log('[product-images] Checking persistent:', persistentPath);
            if (fs.existsSync(persistentPath)) {
                filepath = persistentPath;
                console.log('[product-images] Found in persistent volume');
            }
        }

        // Try public root folder (for pre-loaded images like marraqueta.png)
        if (!filepath) {
            const publicPath = path.join(process.cwd(), 'public', filename);
            console.log('[product-images] Checking public root:', publicPath);
            if (fs.existsSync(publicPath)) {
                filepath = publicPath;
                console.log('[product-images] Found in public root');
            }
        }

        // Try public/productos folder
        if (!filepath) {
            const productosPath = path.join(process.cwd(), 'public', 'productos', filename);
            console.log('[product-images] Checking public/productos:', productosPath);
            if (fs.existsSync(productosPath)) {
                filepath = productosPath;
                console.log('[product-images] Found in public/productos');
            }
        }

        if (!filepath) {
            console.error('[product-images] Image not found:', filename);
            return NextResponse.json({ error: 'Image not found', filename }, { status: 404 });
        }

        const fileBuffer = fs.readFileSync(filepath);

        // Determine content type
        const ext = path.extname(filename).toLowerCase();
        const contentType = ext === '.png' ? 'image/png'
            : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg'
                : ext === '.webp' ? 'image/webp'
                    : 'application/octet-stream';

        console.log('[product-images] Serving:', filepath, 'as', contentType);

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        console.error('[product-images] Error serving image:', error);
        return NextResponse.json({ error: 'Error serving image', details: String(error) }, { status: 500 });
    }
}
