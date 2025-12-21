'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                if (data.user.mustChangePassword) {
                    setShowChangePassword(true);
                } else {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('role', data.user.role);
                    localStorage.setItem('permissions', JSON.stringify(data.user.permissions || []));
                    window.dispatchEvent(new Event('storage')); // Trigger storage event for other components
                    localStorage.setItem('username', data.user.username);
                    router.push('/dashboard');
                }
            } else {
                setError(data.error || 'Error al iniciar sesión');
            }
        } catch (err) {
            setError('Error de conexión');
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, newPassword }),
            });

            if (response.ok) {
                alert('Contraseña actualizada correctamente. Por favor ingresa nuevamente.');
                setShowChangePassword(false);
                setPassword('');
                setNewPassword('');
            } else {
                const data = await response.json();
                setError(data.error || 'Error al cambiar contraseña');
            }
        } catch (err) {
            setError('Error de conexión');
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: 'var(--color-background)'
        }}>
            <div style={{
                backgroundColor: '#fff',
                padding: '2rem',
                borderRadius: 'var(--border-radius)',
                boxShadow: 'var(--box-shadow)',
                width: '100%',
                maxWidth: '400px'
            }}>
                <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Digital Workplace</h1>
                {error && <p style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}

                {!showChangePassword ? (
                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Usuario</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Contraseña</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Ingresar</button>
                    </form>
                ) : (
                    <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <p style={{ textAlign: 'center', color: '#666' }}>Debes cambiar tu contraseña provisional</p>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Nueva Contraseña</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Actualizar Contraseña</button>
                    </form>
                )}
            </div>
        </div>
    );
}
