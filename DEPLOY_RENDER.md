# Guía de Deploy en Render

## Configuración de Variables de Entorno en Render

Para que el proyecto funcione correctamente en Render, debes configurar las siguientes variables de entorno:

### Variables Obligatorias

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `PYTHON_VERSION` | `3.11.9` | Versión de Python compatible |
| `DATABASE_URL` | `postgresql+asyncpg://...` | URL de conexión a PostgreSQL |
| `SECRET_KEY` | `tu-clave-secreta-super-larga` | Clave para JWT (mínimo 32 caracteres) |
| `ENVIRONMENT` | `production` | Ambiente de ejecución |
| `DEBUG` | `false` | Modo debug desactivado |
| `BACKEND_CORS_ORIGINS` | `*` | Orígenes CORS permitidos |

### Configuración de CORS

#### Opción 1: Permitir todos los orígenes (más simple)
```
BACKEND_CORS_ORIGINS=*
```

#### Opción 2: Orígenes específicos separados por comas
```
BACKEND_CORS_ORIGINS=https://miapp.com,https://www.miapp.com,https://miapp.render.com
```

#### NO USAR formato JSON en Render:
```
BACKEND_CORS_ORIGINS=["https://miapp.com"]  # INCORRECTO
```

### Variables Opcionales

| Variable | Valor por defecto | Descripción |
|----------|-------------------|-------------|
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `15` | Expiración de tokens JWT |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7` | Expiración de refresh tokens |
| `REDIS_URL` | - | URL de Redis (opcional) |
| `SENTRY_DSN` | - | DSN para monitoreo con Sentry |

## Configuración del Servicio en Render

### 1. Build Command
```bash
cd Backend && pip install -r requirements.txt
```

### 2. Start Command
```bash
./start.sh
```

O alternativamente:
```bash
cd Backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### 3. Runtime
```
Python 3
```

### 4. Plan
- Free (para pruebas)
- Starter o superior (para producción)

## Archivos de Configuración

### `render.yaml` (Blueprint)
```yaml
services:
  - type: web
    name: parques-distribuido-api
    env: python
    buildCommand: cd Backend && pip install -r requirements.txt
    startCommand: ./start.sh
    envVars:
      - key: PYTHON_VERSION
        value: 3.11.9
      - key: ENVIRONMENT
        value: production
      - key: DEBUG
        value: false
      - key: BACKEND_CORS_ORIGINS
        value: "*"
      - key: DATABASE_URL
        sync: false
      - key: SECRET_KEY
        generateValue: true
```

### `start.sh`
El script de inicio ya está configurado y hace lo siguiente:
1. Verifica variables de entorno críticas
2. Configura variables por defecto
3. Ejecuta migraciones de base de datos
4. Inicia el servidor con Uvicorn

## Proceso de Deploy

### Deploy Manual

1. **Crear cuenta en Render**: https://render.com
2. **Nuevo servicio**: Click en "New +" → "Web Service"
3. **Conectar repositorio**: Selecciona tu repositorio de GitHub
4. **Configuración**:
   - Name: `parques-distribuido-api`
   - Environment: `Python 3`
   - Build Command: `cd Backend && pip install -r requirements.txt`
   - Start Command: `./start.sh`
5. **Variables de entorno**: Agrega todas las variables listadas arriba
6. **Deploy**: Click en "Create Web Service"

### Deploy Automático (Blueprint)

1. **Fork o clona** el repositorio
2. En Render, click en "New +" → "Blueprint"
3. **Conecta tu repositorio**
4. Render detectará automáticamente `render.yaml`
5. **Configura las variables de entorno secretas**:
   - `DATABASE_URL`
   - `SECRET_KEY`
6. Click en "Apply"

## Troubleshooting

### Error: "error parsing value for field BACKEND_CORS_ORIGINS"

**Causa**: Variable con formato JSON o vacía

**Solución**: Usar string simple:
```
BACKEND_CORS_ORIGINS=*
```
o
```
BACKEND_CORS_ORIGINS=https://miapp.com,https://www.miapp.com
```

### Error: "DATABASE_URL no está configurada"

**Solución**: Asegúrate de agregar la variable en Render:
```
DATABASE_URL=postgresql+asyncpg://user:password@host/database?ssl=require
```

### Error: "SECRET_KEY no está configurada"

**Solución**: Genera una clave segura:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Y agrégala en Render:
```
SECRET_KEY=el-resultado-del-comando-anterior
```

### Error: "Module not found"

**Causa**: Dependencia no instalada

**Solución**: Verificar `requirements.txt` y hacer redeploy

### Error: "Exited with status 1"

**Causa**: Error en inicio de aplicación

**Solución**: 
1. Revisar logs en Render Dashboard
2. Verificar todas las variables de entorno
3. Verificar que `start.sh` tenga permisos de ejecución

## Verificar Deploy

### 1. Health Check
```bash
curl https://tu-app.onrender.com/health
```

Respuesta esperada:
```json
{
  "status": "healthy",
  "timestamp": 1737849600.123
}
```

### 2. Documentación API
```
https://tu-app.onrender.com/docs
```

### 3. Logs
Ve a Render Dashboard → Tu servicio → Logs

## Optimizaciones para Producción

### 1. Health Check en Render
Configura el health check path en Render:
```
/health
```

### 2. Workers
Para mejor rendimiento, edita `start.sh`:
```bash
exec uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 4
```

### 3. Base de Datos
- Usa **Neon** (incluido) o **Render PostgreSQL**
- Configura pooling: `pool_size=10`

### 4. Caché
- Agrega **Redis** desde Render Add-ons
- Configura `REDIS_URL` en variables de entorno

### 5. Monitoreo
- Agrega **Sentry** para errores:
  ```
  SENTRY_DSN=https://...@sentry.io/...
  ```

## Métricas y Logs

### Ver logs en tiempo real:
```bash
render logs -a parques-distribuido-api
```

### Métricas disponibles:
- CPU Usage
- Memory Usage
- Response Time
- Request Count
- Error Rate

## Seguridad

### Checklist de Seguridad:

- `DEBUG=false` en producción
- `SECRET_KEY` único y largo (32+ caracteres)
- Variables de entorno (no hardcodeadas)
- CORS configurado apropiadamente
- HTTPS habilitado (automático en Render)
- Database con SSL (`?ssl=require`)

## URLs Importantes

- **Dashboard**: https://dashboard.render.com
- **Documentación**: https://render.com/docs
- **Status**: https://status.render.com
- **Support**: https://render.com/support

## Siguientes Pasos

1. Deploy exitoso en Render
2. Conecta tu frontend a la API
3. Configura monitoreo con Sentry
4. Activa auto-deploy en GitHub
5. Configura dominio personalizado (opcional)

Tu API de Parqués está lista para producción!
