import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const clientId = searchParams.get('clientId');

        if (!clientId) {
            return NextResponse.json({ error: 'Client ID required' }, { status: 400 });
        }

        const db = readDb();
        const favoritos = db.favoritos || [];

        // Filter favorites for this client
        const clientFavorites = favoritos
            .filter((f: any) => f.clientId === Number(clientId))
            .map((f: any) => f.productoId);

        return NextResponse.json(clientFavorites);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { clientId, productoId } = body;

        if (!clientId || !productoId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const db = readDb();
        const favoritos = db.favoritos || [];

        const existingIndex = favoritos.findIndex(
            (f: any) => f.clientId === Number(clientId) && f.productoId === Number(productoId)
        );

        let isFavorite = false;

        if (existingIndex >= 0) {
            // Remove
            favoritos.splice(existingIndex, 1);
            isFavorite = false;
        } else {
            // Add
            favoritos.push({
                clientId: Number(clientId),
                productoId: Number(productoId),
                createdAt: new Date().toISOString()
            });
            isFavorite = true;
        }

        db.favoritos = favoritos;
        writeDb(db);

        return NextResponse.json({ isFavorite });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to toggle favorite' }, { status: 500 });
    }
}
