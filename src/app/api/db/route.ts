import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { headers } from 'next/headers';

// Force dynamic - never cache this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const isAuthenticated = async () => {
    const headersList = await headers();
    const token = headersList.get('authorization')?.split(' ')[1];
    if (!token) return false;
    return verifyToken(token) !== null;
};

export async function GET() {
    if (!await isAuthenticated()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const data = readDb();
    if (!data) {
        return NextResponse.json({ error: 'Database not found' }, { status: 404 });
    }
    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const headersList = await headers();
    const token = headersList.get('authorization')?.split(' ')[1];

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token) as any;
    if (!decoded) {
        console.log('Invalid token');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('User:', decoded.username, 'Role:', decoded.role);

    const body = await request.json();

    // If user is not manager, check for deletions
    if (decoded.role !== 'manager') {
        const currentDb = readDb();
        if (currentDb) {
            // Check each collection for deletions
            const collections = [
                'orders', 'ventas', 'payments', 'rendimientos',
                'insumoTransactions', 'bankTransactions', 'cajaChica',
                'maestroAreas', 'maestroInsumos', 'gastosGenerales'
            ];

            for (const collection of collections) {
                const currentItems = currentDb[collection] || [];
                const newItems = body[collection] || [];

                // If new list is shorter, something was deleted
                if (newItems.length < currentItems.length) {
                    return NextResponse.json({
                        error: 'Forbidden: Only managers can delete items',
                        details: `Deletion detected in ${collection}`
                    }, { status: 403 });
                }

                // Also check if any specific ID is missing (in case length is same but items swapped)
                const newIds = new Set(newItems.map((i: any) => i.id));
                for (const item of currentItems) {
                    if (!newIds.has(item.id)) {
                        return NextResponse.json({
                            error: 'Forbidden: Only managers can delete items',
                            details: `Item ${item.id} missing from ${collection}`
                        }, { status: 403 });
                    }
                }
            }
        }
    }

    // CRITICAL: Always preserve the users array from the original database
    // The frontend should never modify users
    const currentDb = readDb();
    if (currentDb && currentDb.users) {
        body.users = currentDb.users;
    }

    writeDb(body);
    return NextResponse.json({ success: true });
}
