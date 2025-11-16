# Parques_Distribuido_IA

Un juego de parques como sistema distribuido con un Bot IA avanzado, sistema de recomendaciones inteligente, comunicación en tiempo real y sincronización distribuida.

## 🎮 Características Principales

- **Motor de Juego Parqués Completo**: Implementación completa del juego tradicional colombiano
- **Sistema de Autenticación JWT**: Registro, login y gestión de usuarios segura
- **WebSocket en Tiempo Real**: Comunicación instantánea entre jugadores con Socket.io
- **Bot IA Avanzado**: Múltiples algoritmos (Random, Minimax, MCTS) con diferentes niveles de dificultad
- **Sistema de Recomendaciones**: Motor inteligente basado en patrones de juego y preferencias
- **Sincronización Distribuida**: Algoritmo Berkeley para coordinación temporal entre nodos
- **API REST Completa**: Endpoints documentados para todas las funcionalidades

## 🏗️ Arquitectura del Sistema

```
Backend/
├── app/
│   ├── api/v1/          # Endpoints REST API
│   ├── auth/            # Sistema de autenticación JWT
│   ├── core/            # Configuración y utilidades
│   ├── db/              # Modelos y base de datos
│   ├── game/            # Motor de juego Parqués
│   ├── websocket/       # Sistema WebSocket
│   ├── ai/              # Sistema de IA y bots
│   ├── recommendations/ # Motor de recomendaciones
│   ├── distributed/     # Sincronización distribuida
│   └── main.py          # Aplicación principal
```

## 🚀 Server

### Requisitos Previos

- **Python 3.11.9** (RECOMENDADO - evita problemas de compatibilidad)
- PostgreSQL
- pip

> ⚠️ **IMPORTANTE**: Python 3.13 tiene incompatibilidades con Pydantic. Use Python 3.11.9 o 3.12.x

### Instalación y Configuración

1. **Clonar el repositorio**:
```bash
git clone https://github.com/GeorgeKonrad29/Parques_Distribuido_IA.git
cd Parques_Distribuido_IA/Backend
```

2. **Instalar dependencias**:
```bash
pip install -r requirements.txt
```

3. **Configurar base de datos**:
```bash
# Aplicar migraciones
alembic upgrade head
```

4. **Ejecutar el servidor**:
```bash
# Servidor de desarrollo con recarga automática
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Servidor de producción
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 🌐 Endpoints Principales

#### Autenticación
- `POST /api/v1/auth/register` - Registro de usuario
- `POST /api/v1/auth/login` - Inicio de sesión
- `GET /api/v1/auth/profile` - Perfil del usuario

#### Juego
- `POST /api/v1/game/create` - Crear nueva partida
- `POST /api/v1/game/{game_id}/join` - Unirse a partida
- `GET /api/v1/game/{game_id}/state` - Estado del juego
- `POST /api/v1/game/{game_id}/move` - Realizar movimiento
- `POST /api/v1/game/{game_id}/roll-dice` - Lanzar dado
- `POST /api/v1/game/{game_id}/pass-turn` - Pasar turno

#### WebSocket
- `GET /api/v1/websocket/rooms` - Listar salas activas
- `WebSocket /ws/{game_id}` - Conexión WebSocket para juego

#### IA y Bots
- `POST /api/v1/ai/bot/create` - Crear bot IA
- `POST /api/v1/ai/bot/{bot_id}/move` - Movimiento del bot
- `GET /api/v1/ai/difficulty-levels` - Niveles de dificultad
- `POST /api/v1/ai/bot/{bot_id}/configure` - Configurar bot

#### Recomendaciones
- `GET /api/v1/recommendations/user/{user_id}` - Recomendaciones personalizadas
- `POST /api/v1/recommendations/feedback` - Enviar feedback
- `GET /api/v1/recommendations/trending` - Tendencias populares
- `GET /api/v1/recommendations/similar-players` - Jugadores similares

#### Sincronización Distribuida
- `GET /api/v1/sync/health` - Estado del sistema de sincronización
- `GET /api/v1/sync/time` - Tiempo sincronizado del nodo
- `POST /api/v1/sync/nodes/register` - Registrar nodo
- `GET /api/v1/sync/metrics` - Métricas de sincronización

### 🔧 Módulos del Sistema

#### 1. **Motor de Juego** (`app/game/`)
- **Constantes**: Configuración del tablero y reglas
- **Validaciones**: Validación de movimientos y reglas
- **Servicios**: Lógica de negocio del juego
- **Endpoints**: API REST para interacciones de juego

#### 2. **Sistema WebSocket** (`app/websocket/`)
- **Manager**: Gestión de conexiones y salas
- **Events**: Eventos en tiempo real (movimientos, chat, notificaciones)
- **Authentication**: Autenticación JWT para WebSocket
- **Rooms**: Sistema de salas por partida

#### 3. **Sistema de IA** (`app/ai/`)
- **RandomBot**: Bot con movimientos aleatorios
- **MinimaxBot**: Bot con algoritmo Minimax y poda alfa-beta
- **MCTSBot**: Bot con Monte Carlo Tree Search
- **Difficulty Levels**: Configuración de dificultad adaptativa
- **Evaluation**: Funciones de evaluación de posiciones

#### 4. **Sistema de Recomendaciones** (`app/recommendations/`)
- **Pattern Analyzer**: Análisis de patrones de juego
- **Recommendation Engine**: Motor de recomendaciones personalizado
- **Service**: Servicios de recomendaciones y feedback
- **ML Models**: Modelos de aprendizaje automático

#### 5. **Sincronización Distribuida** (`app/distributed/`)
- **Berkeley Algorithm**: Implementación del algoritmo Berkeley
- **Sync Service**: Servicio de sincronización distribuida
- **Node Management**: Gestión de nodos maestro/esclavo
- **Time Coordination**: Coordinación temporal entre nodos

### 📡 Comunicación en Tiempo Real

El sistema utiliza **Socket.io** para comunicación bidireccional:

```javascript
// Conexión WebSocket
const socket = io(`ws://localhost:8000/ws/${gameId}`, {
    auth: {
        token: "jwt_token_here"
    }
});

// Eventos principales
socket.on('game_updated', (data) => {
    // Actualizar estado del juego
});

socket.on('player_moved', (data) => {
    // Procesar movimiento de jugador
});

socket.on('dice_rolled', (data) => {
    // Mostrar resultado del dado
});
```

### 🤖 Integración con IA

```javascript
// Crear bot IA
const bot = await fetch('/api/v1/ai/bot/create', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        bot_type: 'minimax',
        difficulty: 'medium',
        game_id: gameId
    })
});

// Solicitar movimiento del bot
const move = await fetch(`/api/v1/ai/bot/${botId}/move`, {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        game_state: currentGameState
    })
});
```

### 📊 Sistema de Recomendaciones

```javascript
// Obtener recomendaciones personalizadas
const recommendations = await fetch(`/api/v1/recommendations/user/${userId}`, {
    headers: {
        'Authorization': `Bearer ${token}`
    }
});

// Enviar feedback
await fetch('/api/v1/recommendations/feedback', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        recommendation_id: recId,
        rating: 5,
        feedback_type: 'positive'
    })
});
```

### 🔄 Sincronización Distribuida

```javascript
// Verificar estado de sincronización
const syncStatus = await fetch('/api/v1/sync/health');

// Obtener tiempo sincronizado
const syncTime = await fetch('/api/v1/sync/time/synchronized');

// Sincronizar evento de juego
await fetch('/api/v1/sync/events/sync', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        event_type: 'move',
        game_id: gameId,
        timestamp: Date.now(),
        data: moveData
    })
});
```

### 🔍 Health Check

El servidor proporciona un endpoint de health check:

```bash
curl http://localhost:8000/health
```

Respuesta:
```json
{
    "status": "healthy",
    "timestamp": 1763247964.58042
}
```

### 📝 Logs y Monitoreo

- **Logs del servidor**: `Backend/server.log`
- **Métricas de IA**: Disponibles en `/api/v1/ai/metrics`
- **Métricas de sincronización**: Disponibles en `/api/v1/sync/metrics`
- **Estado de WebSocket**: Disponible en `/api/v1/websocket/status`

### 🛠️ Desarrollo

Para desarrollo del frontend, el servidor debe estar ejecutándose en `http://localhost:8000` con CORS habilitado para permitir conexiones desde el cliente.

El servidor incluye:
- **Recarga automática** en modo desarrollo
- **Documentación automática** en `/docs` (Swagger UI)
- **Esquemas OpenAPI** en `/openapi.json`
- **WebSocket testing** en `/ws-test`

### 🔐 Autenticación

Todos los endpoints protegidos requieren un token JWT en el header:
```
Authorization: Bearer <jwt_token>
```

El token se obtiene mediante login y debe incluirse en todas las peticiones autenticadas y conexiones WebSocket.

## 🔧 Troubleshooting

### Error: `ForwardRef._evaluate() missing 1 required keyword-only argument: 'recursive_guard'`

**Problema**: Python 3.13 incompatible con Pydantic 2.6.1

**Solución**:
1. **Opción 1 (Recomendada)**: Cambiar a Python 3.11.9
   ```bash
   # Con pyenv
   pyenv install 3.11.9
   pyenv local 3.11.9
   
   # Recrear entorno virtual
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   # o
   venv\Scripts\activate     # Windows
   
   pip install -r Backend/requirements.txt
   ```

2. **Opción 2**: Usar Python 3.12.x
   ```bash
   # Similar al anterior pero con 3.12.x
   pyenv install 3.12.7
   pyenv local 3.12.7
   ```

### Error: `ModuleNotFoundError: No module named 'socketio'`

**Problema**: Falta instalar `python-socketio`

**Solución**:
```bash
cd Backend
pip install -r requirements.txt
```

### Para Render

**Build Command**: `cd Backend && pip install -r requirements.txt`
**Start Command**: `./start.sh`

**Variables de entorno obligatorias**:
```
PYTHON_VERSION=3.11.9
DATABASE_URL=postgresql+asyncpg://neondb_owner:npg_BjwQ2ZtsCnR5@ep-young-salad-a8nr0kos-pooler.eastus2.azure.neon.tech/neondb?ssl=require
SECRET_KEY=tu-clave-secreta-super-segura-para-produccion-2024
ENVIRONMENT=production
DEBUG=false
BACKEND_CORS_ORIGINS=*
```

> ⚠️ **IMPORTANTE para CORS**: 
> - Para permitir todos los orígenes: `BACKEND_CORS_ORIGINS=*`
> - Para orígenes específicos: `BACKEND_CORS_ORIGINS=https://miapp.com,https://www.miapp.com`
> - NO usar formato JSON en Render: `["https://miapp.com"]` ❌
