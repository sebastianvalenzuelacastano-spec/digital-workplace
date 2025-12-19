import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Validate file type
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({
                error: 'Invalid file type. Only PNG, JPG, and WEBP are allowed.'
            }, { status: 400 });
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return NextResponse.json({
                error: 'File too large. Maximum size is 5MB.'
            }, { status: 400 });
        }

        // Generate safe filename
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Use timestamp + original filename for uniqueness
        const timestamp = Date.now();
        const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `${timestamp}_${originalName}`;

        // Save to public/productos
        const filepath = path.join(process.cwd(), 'public', 'productos', filename);
        await writeFile(filepath, buffer);

        // Return relative URL
        const imageUrl = `/productos/${filename}`;

        return NextResponse.json({
            success: true,
            url: imageUrl
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({
            error: 'Failed to upload image'
        }, { status: 500 });
    }
}
