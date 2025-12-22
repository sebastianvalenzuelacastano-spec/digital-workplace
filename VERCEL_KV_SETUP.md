# Configuración de Vercel KV

## Paso 1: Crear la base de datos KV en Vercel

1. **Ve al dashboard de Vercel**: https://vercel.com/dashboard
2. **Click en tu proyecto**: `digital-workplace`
3. **Ve a la pestaña "Storage"** (arriba)
4. **Click en "Create Database"**
5. **Selecciona "KV (Redis)"**
6. **Configuración**:
   - Database Name: `panificadora-db`
   - Region: `iad1` (US East - más cercano a Chile)
7. **Click en "Create"**

## Paso 2: Conectar a tu proyecto

1. Después de crear, verás la opción **"Connect to Project"**
2. Selecciona tu proyecto: `digital-workplace`
3. Click en **"Connect"**

## Paso 3: Obtener las variables de entorno

Vercel automáticamente agregará estas variables a tu proyecto:
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

## Paso 4: Avisar cuando esté listo

Una vez que hayas completado estos pasos, avísame y yo:
1. Instalaré el paquete `@vercel/kv`
2. Migraré el código de `db.json` a KV
3. Cargaré tus datos del backup a KV
4. Haré deploy

---

## Notas

- **Plan Gratis**: 256 MB, 30,000 comandos/día
- **Datos actuales**: ~27 KB (muy por debajo del límite)
- **Sin costo adicional** para tu uso actual

## Avísame cuando termines el Paso 3
