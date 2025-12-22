import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import fs from 'fs';
import path from 'path';

const DB_KEY = 'panificadora:db';

// API route to initialize KV database with backup data
// Call this once: GET /api/init-kv
export async function GET() {
    try {
        // Check if already initialized
        const existing = await kv.get(DB_KEY);
        if (existing) {
            return NextResponse.json({
                message: 'Database already initialized',
                collections: Object.keys(existing as any).length
            });
        }

        // Read backup file
        const backupPath = path.join(process.cwd(), 'src/data/db.json');
        const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));

        // Store in KV
        await kv.set(DB_KEY, backupData);

        // Verify
        const stored = await kv.get(DB_KEY);

        return NextResponse.json({
            success: true,
            message: 'Database initialized successfully',
            collections: Object.keys(stored as any).length
        });

    } catch (error: any) {
        console.error('Init KV error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
