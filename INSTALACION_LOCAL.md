# Guía de Instalación y Ejecución - Windows

## Requisitos

- **Python 3.11, 3.12 o 3.13** (3.13 funciona con las últimas versiones de librerías)
- **Git** (opcional, para clonar el repositorio)
- **PostgreSQL** (opcional, usamos Neon en la nube por defecto)

## Instalación Rápida

### 1. Clonar el repositorio (si aún no lo tienes)
```powershell
git clone https://github.com/GeorgeKonrad29/Parques_Distribuido_IA.git
cd Parques_Distribuido_IA
```

### 2. Configurar el proyecto

```powershell
cd Backend
```

### 3. Crear entorno virtual

```powershell
python -m venv venv
```

### 4. Activar entorno virtual

```powershell
.\venv\Scripts\Activate.ps1
```

Si tienes problemas con la política de ejecución de PowerShell:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 5. Actualizar pip

```powershell
python -m pip install --upgrade pip
```

### 6. Instalar dependencias principales

```powershell
pip install fastapi uvicorn[standard] pydantic pydantic-settings python-socketio sqlalchemy asyncpg alembic redis python-jose[cryptography] passlib[bcrypt] python-multipart slowapi
```

### 7. Instalar dependencias adicionales

```powershell
pip install numpy pandas joblib python-dotenv email-validator httpx aiofiles aiohttp --only-binary :all:
```

> ⚠️ **Nota**: Usamos `--only-binary :all:` para evitar problemas con compiladores C++ en Windows

### 8. Configurar variables de entorno

El archivo `.env` ya está creado con valores por defecto. Puedes modificarlo si es necesario:

```powershell
notepad .env
```

Variables importantes:
- `BACKEND_CORS_ORIGINS=*` - Permite todos los orígenes (desarrollo)
- `DATABASE_URL` - Ya configurado con Neon PostgreSQL
- `SECRET_KEY` - Cambiar en producción

### 9. Ejecutar migraciones (opcional)

```powershell
alembic upgrade head
```

### 10. Iniciar el servidor

```powershell
.\venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

O simplemente:
```powershell
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## Acceder a la aplicación

Una vez iniciado el servidor, accede a:

- **API**: http://localhost:8000
- **Documentación interactiva (Swagger)**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health check**: http://localhost:8000/health

## Solución de Problemas

### Error: "Microsoft Visual C++ 14.0 or greater is required"

Si obtienes este error al instalar dependencias, usa `--only-binary :all:`:

```powershell
pip install numpy pandas --only-binary :all:
```

### Error: "ModuleNotFoundError"

Asegúrate de que el entorno virtual esté activado:
```powershell
.\venv\Scripts\Activate.ps1
```

Reinstala las dependencias:
```powershell
pip install -r requirements.txt
```

### Error con CORS

Si tienes problemas de CORS, edita el archivo `.env`:
```
BACKEND_CORS_ORIGINS=*
```

### El servidor no inicia

1. Verifica que el puerto 8000 no esté en uso:
```powershell
netstat -ano | findstr :8000
```

2. Si está en uso, mata el proceso o usa otro puerto:
```powershell
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

## Probar la API

### Usando curl:
```powershell
curl http://localhost:8000/health
```

### Usando PowerShell:
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/health" -Method Get
```

### Respuesta esperada:
```json
{
  "status": "healthy",
  "timestamp": 1737849600.123
}
```

## Comandos Útiles

### Ver logs en tiempo real
El servidor en modo `--reload` muestra logs automáticamente.

### Detener el servidor
Presiona `Ctrl+C` en la terminal donde corre el servidor.

### Desactivar entorno virtual
```powershell
deactivate
```

### Actualizar dependencias
```powershell
pip install --upgrade fastapi uvicorn pydantic sqlalchemy
```

## Próximos Pasos

1. Servidor corriendo en local
2. Conecta tu frontend a `http://localhost:8000`
3. Usa la autenticación JWT para proteger endpoints
4. Prueba el juego de Parqués
5. Experimenta con los bots de IA

## Tips

- Usa la documentación interactiva en `/docs` para probar endpoints
- El modo `--reload` recarga automáticamente cuando cambias código
- Los logs muestran todas las peticiones HTTP y errores
- Usa variables de entorno para configuración sensible

Listo para jugar Parqués!
