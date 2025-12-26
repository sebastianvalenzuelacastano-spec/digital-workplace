import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { comparePassword, signToken } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();
        const supabase = createServerClient();

        // Find casino by username
        const { data: casino, error: casinoError } = await supabase
            .from('casinos_sucursales')
            .select('*')
            .eq('username', username)
            .eq('activo', true)
            .single();

        if (casinoError || !casino) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 401 });
        }

        // Verify password
        const isValid = await comparePassword(password, casino.password_hash);

        if (!isValid) {
            return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
        }

        // Get empresa info
        const { data: empresa, error: empresaError } = await supabase
            .from('empresas_clientes')
            .select('*')
            .eq('id', casino.empresa_id)
            .eq('activo', true)
            .single();

        if (empresaError || !empresa) {
            return NextResponse.json({ error: 'Empresa no activa' }, { status: 401 });
        }

        // Generate token for client
        const token = signToken({
            id: casino.id,
            username: casino.username,
            role: 'cliente',
            empresaId: empresa.id,
            empresaNombre: empresa.nombre,
            casinoNombre: casino.nombre
        });

        return NextResponse.json({
            success: true,
            token,
            cliente: {
                id: casino.id,
                username: casino.username,
                casinoNombre: casino.nombre,
                empresaId: empresa.id,
                empresaNombre: empresa.nombre,
                empresaRut: empresa.rut,
                mustChangePassword: casino.must_change_password || false
            }
        });

    } catch (error) {
        console.error('Client login error:', error);
        return NextResponse.json({ error: 'Error de autenticación' }, { status: 500 });
    }
}
