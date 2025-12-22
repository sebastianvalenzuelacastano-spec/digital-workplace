import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        // Check if database is already initialized
        const existing = await kv.get('panificadora:db');

        if (existing) {
            const db = existing as any;
            const collections = Object.keys(db).length;
            return NextResponse.json({
                message: 'Database already initialized',
                collections
            });
        }

        // Load backup data
        const backupPath = path.join(process.cwd(), 'src', 'data', 'db.json');
        const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));

        // Initialize database with backup data
        await kv.set('panificadora:db', backupData);

        const collections = Object.keys(backupData).length;

        return NextResponse.json({
            success: true,
            message: 'Database initialized successfully',
            collections
        });
    } catch (error: any) {
        console.error('Init KV error:', error);
        return NextResponse.json({
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
