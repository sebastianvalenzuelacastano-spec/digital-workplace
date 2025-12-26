import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { hashPassword, comparePassword } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const { casinoId, currentPassword, newPassword } = await request.json();
        const supabase = createServerClient();

        // Find casino
        const { data: casino, error: findError } = await supabase
            .from('casinos_sucursales')
            .select('*')
            .eq('id', casinoId)
            .single();

        if (findError || !casino) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }

        // Verify current password
        const isValid = await comparePassword(currentPassword, casino.password_hash);
        if (!isValid) {
            return NextResponse.json({ error: 'Contraseña actual incorrecta' }, { status: 401 });
        }

        // Validate new password
        if (!newPassword || newPassword.length < 6) {
            return NextResponse.json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' }, { status: 400 });
        }

        // Hash and save new password
        const newPasswordHash = await hashPassword(newPassword);

        const { error: updateError } = await supabase
            .from('casinos_sucursales')
            .update({
                password_hash: newPasswordHash,
                must_change_password: false
            })
            .eq('id', casinoId);

        if (updateError) {
            console.error('Error updating password:', updateError);
            return NextResponse.json({ error: 'Error al actualizar contraseña' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Contraseña actualizada correctamente' });

    } catch (error) {
        console.error('Client change password error:', error);
        return NextResponse.json({ error: 'Error' }, { status: 500 });
    }
}
