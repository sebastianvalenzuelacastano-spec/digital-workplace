import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const clientId = searchParams.get('clientId');

        if (!clientId) {
            return NextResponse.json({ error: 'Client ID required' }, { status: 400 });
        }

        const supabase = createServerClient();

        const { data, error } = await supabase
            .from('favoritos')
            .select('producto_id')
            .eq('client_id', parseInt(clientId));

        if (error) {
            console.error('Error fetching favoritos:', error);
            return NextResponse.json([]);
        }

        const productoIds = (data || []).map((f: any) => f.producto_id);
        return NextResponse.json(productoIds);

    } catch (error) {
        console.error('Error in favoritos GET:', error);
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

        const supabase = createServerClient();

        // Check if exists
        const { data: existing } = await supabase
            .from('favoritos')
            .select('id')
            .eq('client_id', clientId)
            .eq('producto_id', productoId)
            .single();

        let isFavorite = false;

        if (existing) {
            // Remove
            await supabase
                .from('favoritos')
                .delete()
                .eq('id', existing.id);
            isFavorite = false;
        } else {
            // Add
            await supabase
                .from('favoritos')
                .insert({
                    client_id: clientId,
                    producto_id: productoId
                });
            isFavorite = true;
        }

        return NextResponse.json({ isFavorite });

    } catch (error) {
        console.error('Error in favoritos POST:', error);
        return NextResponse.json({ error: 'Failed to toggle favorite' }, { status: 500 });
    }
}
