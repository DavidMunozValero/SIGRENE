# SIGRENE 🏊‍♂️

**System for Elite Swimmer Management and Performance** *(Sistema de Gestión del Rendimiento en Nadadores de Élite)*

SIGRENE es una plataforma digital segura diseñada para gestionar el seguimiento, registro y optimización del rendimiento de nadadores de élite. Actúa como base de datos centralizada y API para que los entrenadores inputen cargas de entrenamiento diarias, bienestar matutino y datos fisiológicos.

## Estado del Proyecto

⚠️ **Estado actual: Prototipo** - El frontend React está en desarrollo y algunas funcionalidades usan datos de demo. El backend está completamente funcional con MongoDB.

## 🎯 Funcionalidades Implementadas

- **Gestión de Nadadores**: CRUD completo de nadadores con seudónimo, datos personales, club y provincia
- **Registro de Entrenamiento Diario**: Registro de sesiones de agua y seco con volumen, estilos, RPE, tiempo, etc.
- **Cálculos Automatizados**: sRPE, TRIMP, densidad, tipo de sesión (backend)
- **Control Fisiológico**: HRV (RMSSD, SDNN), CMJ, dominadas, lactato, cortisol/testosterona
- **Composición Corporal**: Altura, peso, bioimpedancia (masa muscular, masa grasa, ósea, hidratación)
- **Análisis de Competición**: Tiempos parciales, análisis de fases, variables cinemáticas
- **Cálculo ACWR**: Ratio de carga aguda/crónica por nadador

## 🛠️ Tech Stack

- **Backend**: FastAPI (Python 3.12+) con MongoDB
- **Gestión de dependencias**: Poetry
- **Validación de datos**: Pydantic
- **Seguridad**: PyJWT, Passlib (Bcrypt)
- **Frontend**: React 19 + TanStack Router + Tailwind CSS + Radix UI

## 🚀 Guía de Instalación Local

### 1. Requisitos Previos

```bash
# Python 3.12+
python --version

# Poetry
poetry --version

# MongoDB Community Edition
brew services list | grep mongodb
```

### 2. Iniciar MongoDB (macOS)

```bash
brew services start mongodb-community
```

Verificar que está运行ando:
```bash
brew services list | grep mongodb
# Debería mostrar: mongodb-community started
```

### 3. Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```env
MONGO_URI=mongodb://localhost:27017/
MONGO_DB_NAME=sigrene_db
SECRET_KEY=tu_clave_secreta_aqui
```

### 4. Instalar Dependencias Backend

```bash
cd /Users/uclm/PycharmProjects/SIGRENE
poetry install
```

### 5. Iniciar el Backend

```bash
poetry run uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

La documentación interactiva de la API estará disponible en:
👉 **http://127.0.0.1:8000/docs**

### 6. Iniciar el Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

El frontend estará disponible en:
👉 **http://localhost:3000**

## 📂 Estructura del Proyecto

```
SIGRENE/
├── app/
│   ├── main.py              # FastAPI: endpoints y middleware
│   ├── models/
│   │   └── schemas.py      # Esquemas Pydantic de validación
│   ├── database/
│   │   └── mongodb.py      # Conexión a MongoDB
│   └── services/
│       ├── auth.py          # Autenticación JWT
│       └── calculations.py  # Cálculos deportivos (sRPE, TRIMP, ACWR)
├── frontend/                # React 19 + TanStack Router + Tailwind
│   ├── src/
│   │   ├── routes/         # Páginas de la aplicación
│   │   │   ├── login.tsx
│   │   │   ├── register.tsx
│   │   │   ├── app.coach.tsx
│   │   │   ├── app.coach.index.tsx
│   │   │   ├── app.coach.swimmers.tsx
│   │   │   ├── app.coach.wellness.tsx
│   │   │   ├── app.admin*.tsx
│   │   │   ├── app.director*.tsx
│   │   │   └── app.swimmer*.tsx
│   │   ├── components/
│   │   │   ├── AppShell.tsx    # Layout principal con sidebar
│   │   │   ├── AuthShell.tsx   # Layout para páginas de auth
│   │   │   ├── dashboard/Cards.tsx
│   │   │   └── ui/            # Componentes Radix UI
│   │   └── lib/
│   │       ├── api.ts          # Cliente API
│   │       └── utils.ts        # Utilidades
│   ├── package.json
│   ├── vite.config.ts
│   └── .env                   # VITE_API_URL (no commitear)
├── frontend_backup/         # Frontend vanilla HTML/JS (anterior)
├── AGENTS.md                # Documentación interna para agentes IA
├── spec.md                  # Especificaciones del proyecto
├── discovery.md             # Descubrimientos durante desarrollo
├── README.md
└── pyproject.toml           # Dependencias Python
```

## 🔐 Colecciones MongoDB

| Colección | Descripción |
|-----------|-------------|
| `usuarios` | Usuarios del sistema (entrenadores, admins) |
| `nadadores` | Datos fijos de nadadores (seudónimo, nombre, club) |
| `registros_diarios` | Sesiones de entrenamiento + wellness matutino |
| `controles_fisiologicos` | HRV, CMJ, lactato, cortisol/testosterona |
| `composicion_corporal` | Medidas morfológicas y bioimpedancia |
| `analisis_competicion` | Tiempos parciales, fases, variables cinemáticas |

## 🔌 Endpoints Principales (Backend)

### Autenticación
- `POST /api/v1/login` - Inicio de sesión
- `POST /api/v1/usuarios/registrar` - Registro de usuario

### Nadadores
- `GET /api/v1/nadadores/` - Listar nadadores
- `POST /api/v1/nadadores/` - Crear nadador
- `GET /api/v1/nadadores/{id}` - Obtener nadador
- `PUT /api/v1/nadadores/{id}` - Actualizar nadador
- `DELETE /api/v1/nadadores/{id}` - Eliminar nadador

### Registros Diarios
- `GET /api/v1/registros-diarios/` - Listar registros (con filtros)
- `POST /api/v1/registros-diarios/` - Crear registro
- `GET /api/v1/registros-diarios/nadador/{id}` - Registros por nadador

### Dashboard
- `GET /api/v1/dashboard/stats` - Estadísticas agregadas

### ACWR
- `GET /api/v1/acwr/{nadador_id}` - Historial ACWR de un nadador

## 📝 Notas de Desarrollo

- No hay test suite, CI/CD ni pre-commit hooks
- `poetry.lock` está en `.gitignore` pero es necesario para instalaciones reproducibles
- JWT expira tras 8 horas; tokens de recuperación de contraseña tras 30 minutos
- Todos los documentos tienen `created_at` y `updated_at` para trazabilidad temporal
- Los nadadores se cachean en localStorage (5 min TTL) para mejorar rendimiento de dropdowns

## 🗺️ Roadmap / Próximos Pasos

- [ ] Terminar de conectar todas las páginas del frontend React al backend
- [ ] Implementar invitaciones y gestión de roles (admin, director, coach, swimmer)
- [ ] Integración con SeaweedFS para almacenamiento de vídeos biomecánicos
- [ ] Dashboard agregado para directores técnicos
- [ ] Informes y exportación de datos
