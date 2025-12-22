import { NextResponse } from 'next/server';
import { readDb, initializeDb } from '@/lib/db';

export async function GET() {
    try {
        let db = await readDb();

        const status = {
            databaseExists: !!db,
            collections: db ? Object.keys(db) : [],
            productosCatalogoExists: !!(db?.productosCatalogo),
            productosCatalogoCount: db?.productosCatalogo?.length || 0,
        };

        // Auto-initialize if database doesn't exist
        if (!db) {
            console.log('Database not found, auto-initializing...');
            await initializeDb();
            db = await readDb();

            status.databaseExists = !!db;
            status.collections = db ? Object.keys(db) : [];
            status.productosCatalogoExists = !!(db?.productosCatalogo);
            status.productosCatalogoCount = db?.productosCatalogo?.length || 0;
            status.autoInitialized = true;
        }

        return NextResponse.json({
            success: true,
            status,
            message: db ? 'Database is ready' : 'Database initialization failed'
        });
    } catch (error: any) {
        console.error('Database check error:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
