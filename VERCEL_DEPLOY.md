# Guía de Deploy a Vercel

## Paso 1: Crear cuenta en Vercel

1. Ve a https://vercel.com
2. Click en "Sign Up"
3. Selecciona "Continue with GitHub"
4. Autoriza a Vercel para acceder a tus repositorios

## Paso 2: Importar el proyecto

1. En el dashboard de Vercel, click "Add New..."
2. Selecciona "Project"
3. Busca el repositorio: `sebastianvalenzuelacastano-spec/digital-workplace`
4. Click "Import"

## Paso 3: Configurar el proyecto

**Framework Preset:** Next.js (se detecta automáticamente)

**Build Settings:**
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

**Root Directory:** `.` (dejar por defecto)

**Environment Variables:** (ninguna necesaria por ahora)

## Paso 4: Deploy

1. Click "Deploy"
2. Espera 2-3 minutos
3. ¡Listo! Tu app estará en: `https://tu-proyecto.vercel.app`

## Paso 5: Configurar dominio personalizado (Opcional)

1. En el proyecto de Vercel, ve a "Settings" → "Domains"
2. Agrega: `pansansebastian.cl`
3. Sigue las instrucciones para actualizar DNS

**Configuración DNS:**
- Tipo: CNAME
- Nombre: @ (o www)
- Valor: cname.vercel-dns.com

## Ventajas de Vercel

✅ Deploy automático en cada push a GitHub
✅ Preview deployments para cada PR
✅ Cache inteligente que funciona
✅ CDN global automático
✅ SSL/HTTPS automático
✅ Rollback instantáneo si algo falla
✅ Logs en tiempo real

## Notas Importantes

- **Datos persistentes:** Tu `db.json` se mantendrá en el servidor actual
- **Primer deploy:** Puede tardar 3-5 minutos
- **Deploys siguientes:** 1-2 minutos
- **Dominio temporal:** Vercel te da uno gratis (.vercel.app)

## Troubleshooting

Si hay errores en el build:
1. Revisa los logs en Vercel dashboard
2. El código ya está probado y funciona
3. Vercel mostrará errores claros (no como Railway)

## Después del deploy

Una vez desplegado en Vercel:
1. Prueba todas las páginas
2. Verifica que no hay errores de cache
3. Configura tu dominio personalizado
4. Desactiva Railway (opcional)
