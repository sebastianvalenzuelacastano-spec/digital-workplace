'use client';

import { useState, useEffect } from 'react';

interface ClientData {
    id: number;
    username: string;
    casinoNombre: string;
    empresaId: number;
}

export default function NuevoReclamoPage() {
    const [clientData, setClientData] = useState<ClientData | null>(null);
    const [fechaIncidente, setFechaIncidente] = useState('');
    const [horaIncidente, setHoraIncidente] = useState('');
    const [tipo, setTipo] = useState('Reclamo');
    const [area, setArea] = useState('');
    const [email, setEmail] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [imagenes, setImagenes] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const data = localStorage.getItem('clientData');
        if (data) {
            setClientData(JSON.parse(data));
        }
    }, []);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const maxImages = 3;
        if (imagenes.length + files.length > maxImages) {
            alert(`Máximo ${maxImages} imágenes permitidas`);
            return;
        }

        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagenes(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        setImagenes(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        // Validation
        if (!fechaIncidente || !horaIncidente || !tipo || !area || !email || !descripcion) {
            alert('Por favor complete todos los campos requeridos');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Por favor ingrese un correo electrónico válido');
            return;
        }

        if (descripcion.length < 10) {
            alert('La descripción debe tener al menos 10 caracteres');
            return;
        }

        setSubmitting(true);

        try {
            const response = await fetch('/api/reclamos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    casinoId: clientData?.id,
                    empresaId: clientData?.empresaId,
                    fechaIncidente,
                    horaIncidente,
                    tipo,
                    area,
                    email,
                    descripcion,
                    imagenes
                })
            });

            if (response.ok) {
                alert('Reclamo creado exitosamente. Le responderemos a la brevedad.');
                // Reset form
                setFechaIncidente('');
                setHoraIncidente('');
                setTipo('Reclamo');
                setArea('');
                setEmail('');
                setDescripcion('');
                setImagenes([]);
            } else {
                const error = await response.json();
                alert('Error: ' + (error.error || 'No se pudo crear el reclamo'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al crear el reclamo');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '20px' }}>📝 Nuevo Reclamo o Sugerencia</h2>

            <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px' }}>
                {/* Incident Date & Time */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                            Fecha del Incidente *
                        </label>
                        <input
                            type="date"
                            value={fechaIncidente}
                            onChange={(e) => setFechaIncidente(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '6px',
                                border: '1px solid #ddd'
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                            Hora del Incidente *
                        </label>
                        <input
                            type="time"
                            value={horaIncidente}
                            onChange={(e) => setHoraIncidente(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '6px',
                                border: '1px solid #ddd'
                            }}
                        />
                    </div>
                </div>

                {/* Tipo */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                        Tipo *
                    </label>
                    <select
                        value={tipo}
                        onChange={(e) => setTipo(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '6px',
                            border: '1px solid #ddd'
                        }}
                    >
                        <option value="Reclamo">Reclamo</option>
                        <option value="Sugerencia">Sugerencia</option>
                    </select>
                </div>

                {/* Area */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                        Área del Reclamo *
                    </label>
                    <select
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '6px',
                            border: '1px solid #ddd'
                        }}
                    >
                        <option value="">Seleccionar...</option>
                        <option value="Administración">Administración</option>
                        <option value="Despacho">Despacho</option>
                        <option value="Producción">Producción</option>
                    </select>
                </div>

                {/* Email */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                        Correo Electrónico para Respuesta *
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ejemplo@correo.com"
                        style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '6px',
                            border: '1px solid #ddd'
                        }}
                    />
                    <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '5px' }}>
                        Le enviaremos la respuesta a este correo
                    </p>
                </div>

                {/* Description */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                        Descripción del Reclamo *
                    </label>
                    <textarea
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        placeholder="Describa detalladamente el problema..."
                        rows={5}
                        style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '6px',
                            border: '1px solid #ddd',
                            fontFamily: 'inherit',
                            resize: 'vertical'
                        }}
                    />
                    <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '5px' }}>
                        Mínimo 10 caracteres
                    </p>
                </div>

                {/* Images */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                        Imágenes (Opcional - Máximo 3)
                    </label>

                    {imagenes.length < 3 && (
                        <label style={{
                            display: 'inline-block',
                            padding: '12px 24px',
                            backgroundColor: '#e3f2fd',
                            color: '#1565c0',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }}>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageUpload}
                                style={{ display: 'none' }}
                            />
                            📷 Subir Imágenes
                        </label>
                    )}

                    {/* Image Previews */}
                    {imagenes.length > 0 && (
                        <div style={{ display: 'flex', gap: '10px', marginTop: '15px', flexWrap: 'wrap' }}>
                            {imagenes.map((img, index) => (
                                <div key={index} style={{ position: 'relative' }}>
                                    <img
                                        src={img}
                                        alt={`Preview ${index + 1}`}
                                        style={{
                                            width: '150px',
                                            height: '150px',
                                            objectFit: 'cover',
                                            borderRadius: '8px',
                                            border: '2px solid #ddd'
                                        }}
                                    />
                                    <button
                                        onClick={() => removeImage(index)}
                                        style={{
                                            position: 'absolute',
                                            top: '-8px',
                                            right: '-8px',
                                            backgroundColor: '#f44336',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '24px',
                                            height: '24px',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                    <button
                        onClick={() => window.location.href = '/pedidos/reclamos'}
                        style={{
                            padding: '12px 24px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            backgroundColor: '#fff',
                            cursor: 'pointer'
                        }}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || !fechaIncidente || !horaIncidente || !tipo || !area || !email || !descripcion}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: submitting || !fechaIncidente || !horaIncidente || !tipo || !area || !email || !descripcion ? '#ccc' : '#ff9800',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: submitting ? 'wait' : 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        {submitting ? 'Enviando...' : 'Enviar Reclamo'}
                    </button>
                </div>
            </div>
        </div>
    );
}
