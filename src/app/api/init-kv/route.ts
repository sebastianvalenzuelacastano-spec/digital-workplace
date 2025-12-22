import { NextResponse } from 'next/server';
import Redis from 'ioredis';
import fs from 'fs';
import path from 'path';

const DB_KEY = 'panificadora:db';

// API route to initialize Redis database with backup data
export async function GET() {
    try {
        const redis = new Redis(process.env.REDIS_URL || '');

        // Check if already initialized
        const existing = await redis.get(DB_KEY);
        if (existing) {
            const data = JSON.parse(existing);
            await redis.quit();
            return NextResponse.json({
                message: 'Database already initialized',
                collections: Object.keys(data).length
            });
        }

        // Read backup file
        const backupPath = path.join(process.cwd(), 'src/data/db.json');
        const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));

        // Store in Redis
        await redis.set(DB_KEY, JSON.stringify(backupData));

        // Verify
        const stored = await redis.get(DB_KEY);
        const storedData = stored ? JSON.parse(stored) : null;

        await redis.quit();

        return NextResponse.json({
            success: true,
            message: 'Database initialized successfully',
            collections: storedData ? Object.keys(storedData).length : 0
        });

    } catch (error: any) {
        console.error('Init Redis error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
