'use client';

import { useState } from 'react';

export default function AyudaPage() {
    const [activeSection, setActiveSection] = useState<string>('inicio');

    const sections = [
        {
            id: 'inicio',
            title: '🏠 Inicio',
            icon: '🏠',
            content: (
                <div>
                    <h2 style={{ marginBottom: '20px', color: '#ff9800' }}>Bienvenido al Portal de Clientes</h2>
                    <p style={{ lineHeight: '1.8', marginBottom: '15px' }}>
                        Este portal te permite gestionar tus pedidos de forma rápida y sencilla.
                        Aquí encontrarás todo lo que necesitas saber para aprovechar al máximo nuestro sistema.
                    </p>
                    <div style={{ backgroundColor: '#e3f2fd', padding: '15px', borderRadius: '8px', marginTop: '20px' }}>
                        <strong style={{ color: '#1976d2' }}>💡 Consejo:</strong>
                        <p style={{ marginTop: '8px', color: '#555' }}>
                            Haz clic en las secciones de la izquierda para conocer cada funcionalidad del portal.
                        </p>
                    </div>
                </div>
            )
        },
        {
            id: 'nuevo-pedido',
            title: '📝 Nuevo Pedido',
            icon: '📝',
            content: (
                <div>
                    <h2 style={{ marginBottom: '20px', color: '#ff9800' }}>Crear un Pedido Individual</h2>
                    <div style={{ lineHeight: '1.8' }}>
                        <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>Pasos para crear un pedido:</h3>
                        <ol style={{ marginLeft: '20px', lineHeight: '2' }}>
                            <li><strong>Fecha de Entrega:</strong> Selecciona cuándo necesitas tu pedido</li>
                            <li><strong>Hora de Entrega:</strong> Elige la hora preferida (ej: 07:00)</li>
                            <li><strong>Productos:</strong> Busca y agrega productos desde la tabla
                                <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
                                    <li>Selecciona la unidad (Kg o Un)</li>
                                    <li>Ingresa la cantidad</li>
                                    <li>Haz clic en el botón ➕ para agregar</li>
                                </ul>
                            </li>
                            <li><strong>Observaciones:</strong> Agrega comentarios si es necesario</li>
                            <li><strong>Confirmar:</strong> Revisa tu pedido y haz clic en "Crear Pedido"</li>
                        </ol>

                        <div style={{ backgroundColor: '#fff3e0', padding: '15px', borderRadius: '8px', marginTop: '20px' }}>
                            <strong style={{ color: '#f57c00' }}>⚠️ Importante:</strong>
                            <p style={{ marginTop: '8px', color: '#555' }}>
                                Los pedidos deben realizarse con al menos 24 horas de anticipación.
                            </p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'pedidos-multiples',
            title: '📅 Pedidos Múltiples',
            icon: '📅',
            content: (
                <div>
                    <h2 style={{ marginBottom: '20px', color: '#ff9800' }}>Crear Varios Pedidos a la Vez</h2>
                    <p style={{ lineHeight: '1.8', marginBottom: '15px' }}>
                        Ideal para planificar tu semana completa de pedidos de una sola vez.
                    </p>

                    <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>Paso 1: Configuración Base</h3>
                    <ul style={{ marginLeft: '20px', lineHeight: '2' }}>
                        <li>Selecciona las fechas (puedes elegir múltiples días)</li>
                        <li>Define la hora de entrega (misma para todos)</li>
                        <li>Agrega los productos base que necesitas</li>
                    </ul>

                    <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>Paso 2: Personalización</h3>
                    <ul style={{ marginLeft: '20px', lineHeight: '2' }}>
                        <li>Revisa cada día en la vista previa</li>
                        <li>Ajusta cantidades específicas por día si es necesario</li>
                        <li>Agrega productos extras solo para ciertos días</li>
                        <li>Elimina productos de días específicos</li>
                    </ul>

                    <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>Paso 3: Confirmar</h3>
                    <p style={{ lineHeight: '1.8' }}>
                        Haz clic en "Crear X Pedidos" y todos se crearán automáticamente.
                    </p>

                    <div style={{ backgroundColor: '#e8f5e9', padding: '15px', borderRadius: '8px', marginTop: '20px' }}>
                        <strong style={{ color: '#2e7d32' }}>✅ Ventaja:</strong>
                        <p style={{ marginTop: '8px', color: '#555' }}>
                            Crea los pedidos de toda la semana en menos de 2 minutos.
                        </p>
                    </div>
                </div>
            )
        },
        {
            id: 'mis-pedidos',
            title: '📋 Mis Pedidos',
            icon: '📋',
            content: (
                <div>
                    <h2 style={{ marginBottom: '20px', color: '#ff9800' }}>Historial y Seguimiento</h2>
                    <p style={{ lineHeight: '1.8', marginBottom: '15px' }}>
                        Aquí puedes ver todos tus pedidos y su estado actual.
                    </p>

                    <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>Estados de Pedidos:</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                backgroundColor: '#fff3e0',
                                color: '#e65100',
                                fontWeight: '600',
                                fontSize: '0.85rem'
                            }}>Pendiente</span>
                            <span>Tu pedido fue recibido y está en proceso</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                backgroundColor: '#e3f2fd',
                                color: '#1565c0',
                                fontWeight: '600',
                                fontSize: '0.85rem'
                            }}>En Preparación</span>
                            <span>Estamos preparando tu pedido</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                backgroundColor: '#fff9c4',
                                color: '#f57f17',
                                fontWeight: '600',
                                fontSize: '0.85rem'
                            }}>En Camino</span>
                            <span>Tu pedido está siendo entregado</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                backgroundColor: '#e8f5e9',
                                color: '#2e7d32',
                                fontWeight: '600',
                                fontSize: '0.85rem'
                            }}>Entregado</span>
                            <span>Tu pedido fue entregado exitosamente</span>
                        </div>
                    </div>

                    <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>Acciones Disponibles:</h3>
                    <ul style={{ marginLeft: '20px', lineHeight: '2' }}>
                        <li><strong>Ver Detalles:</strong> Revisa los productos y cantidades</li>
                        <li><strong>Filtrar:</strong> Busca pedidos por fecha o estado</li>
                    </ul>
                </div>
            )
        },
        {
            id: 'reclamos',
            title: '📝 Reclamos y Sugerencias',
            icon: '📝',
            content: (
                <div>
                    <h2 style={{ marginBottom: '20px', color: '#ff9800' }}>Reporta Problemas o Comparte Ideas</h2>

                    <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>¿Cuándo usar esta función?</h3>
                    <div style={{ display: 'grid', gap: '15px', marginBottom: '20px' }}>
                        <div style={{ backgroundColor: '#ffebee', padding: '15px', borderRadius: '8px' }}>
                            <strong style={{ color: '#c62828' }}>🔴 Reclamos</strong>
                            <p style={{ marginTop: '8px', color: '#555' }}>
                                Productos con problemas, entregas tardías, errores en el pedido, etc.
                            </p>
                        </div>
                        <div style={{ backgroundColor: '#e3f2fd', padding: '15px', borderRadius: '8px' }}>
                            <strong style={{ color: '#1976d2' }}>🔵 Sugerencias</strong>
                            <p style={{ marginTop: '8px', color: '#555' }}>
                                Ideas para mejorar el servicio, nuevos productos, sugerencias de horarios, etc.
                            </p>
                        </div>
                    </div>

                    <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>Cómo reportar:</h3>
                    <ol style={{ marginLeft: '20px', lineHeight: '2' }}>
                        <li>Selecciona el tipo (Reclamo o Sugerencia)</li>
                        <li>Indica la fecha y hora del incidente</li>
                        <li>Selecciona el área relacionada</li>
                        <li>Proporciona tu email de contacto</li>
                        <li>Describe el problema o sugerencia en detalle</li>
                        <li>Adjunta fotos si es necesario (hasta 3)</li>
                    </ol>

                    <div style={{ backgroundColor: '#e8f5e9', padding: '15px', borderRadius: '8px', marginTop: '20px' }}>
                        <strong style={{ color: '#2e7d32' }}>💬 Respuesta:</strong>
                        <p style={{ marginTop: '8px', color: '#555' }}>
                            Recibirás una respuesta en tu email dentro de 24-48 horas.
                        </p>
                    </div>
                </div>
            )
        },
        {
            id: 'contacto',
            title: '📞 Contacto',
            icon: '📞',
            content: (
                <div>
                    <h2 style={{ marginBottom: '20px', color: '#ff9800' }}>¿Necesitas Ayuda?</h2>

                    <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
                        <h3 style={{ marginBottom: '15px' }}>Horario de Atención</h3>
                        <p style={{ lineHeight: '1.8' }}>
                            <strong>Lunes a Viernes:</strong> 7:00 - 18:00<br />
                            <strong>Sábados:</strong> 7:00 - 14:00<br />
                            <strong>Domingos:</strong> Cerrado
                        </p>
                    </div>

                    <div style={{ backgroundColor: '#e3f2fd', padding: '20px', borderRadius: '12px' }}>
                        <h3 style={{ marginBottom: '15px' }}>Canales de Contacto</h3>
                        <p style={{ lineHeight: '2' }}>
                            📧 <strong>Email:</strong> contacto@pansansebastian.cl<br />
                            📱 <strong>WhatsApp:</strong> +56 9 33745025<br />
                            📞 <strong>Teléfono:</strong> +56 9 33745025
                        </p>
                    </div>

                    <div style={{ backgroundColor: '#fff3e0', padding: '15px', borderRadius: '8px', marginTop: '20px' }}>
                        <strong style={{ color: '#f57c00' }}>💡 Tip:</strong>
                        <p style={{ marginTop: '8px', color: '#555' }}>
                            Para consultas sobre pedidos específicos, utiliza la sección de Reclamos y Sugerencias para un seguimiento más eficiente.
                        </p>
                    </div>
                </div>
            )
        }
    ];

    const currentSection = sections.find(s => s.id === activeSection) || sections[0];

    return (
        <div style={{ display: 'flex', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Sidebar */}
            <div style={{
                width: '250px',
                backgroundColor: '#fff',
                borderRadius: '12px',
                padding: '20px',
                height: 'fit-content',
                position: 'sticky',
                top: '20px'
            }}>
                <h3 style={{ marginBottom: '15px', color: '#333' }}>📚 Contenido</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {sections.map(section => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            style={{
                                padding: '12px 15px',
                                borderRadius: '8px',
                                border: 'none',
                                backgroundColor: activeSection === section.id ? '#ff9800' : 'transparent',
                                color: activeSection === section.id ? '#fff' : '#333',
                                cursor: 'pointer',
                                textAlign: 'left',
                                fontWeight: activeSection === section.id ? '600' : 'normal',
                                transition: 'all 0.2s'
                            }}
                        >
                            {section.icon} {section.title.replace(/^[^\s]+ /, '')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div style={{
                flex: 1,
                backgroundColor: '#fff',
                borderRadius: '12px',
                padding: '30px'
            }}>
                {currentSection.content}
            </div>
        </div>
    );
}
