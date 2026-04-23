# SIGRENE 🏊‍♂️

**System for Elite Swimmer Management and Performance** *(Sistema de Gestión del Rendimiento en Nadadores de Élite)*

SIGRENE es una plataforma digital segura diseñada para gestionar el seguimiento, registro y optimización del rendimiento de nadadores de élite. Actúa como base de datos centralizada y API para que los entrenadores inputen cargas de entrenamiento diarias, bienestar matutino y datos fisiológicos.

## Estado del Proyecto

✅ **Prototipo en producción** — El frontend React y el backend FastAPI están desplegados y conectados a MongoDB Atlas. Todas las funcionalidades de gestión de nadadores, registro de entrenamientos, wellness matutino, control de carga y análisis de competición están operativas.

---

## 🏗️ Arquitectura del Sistema

```
                            ┌─────────────────────────────────────────────┐
                            │                INTERNET                       │
                            └─────────────────┬───────────────────────────┘
                                              │
                            ┌─────────────────▼───────────────────────────┐
                            │                  VERCEL                     │
                            │         (Frontend SPA - React)              │
                            │   https://sigrene.vercel.app (ejemplo)        │
                            │                                              │
                            │   • Serve el React app compiled               │
                            │   • Maneja Routing SPA (todas las rutas      │
                            │     apuntan a index.html)                     │
                            │   • No ejecuta código de backend              │
                            └─────────────────┬───────────────────────────┘
                                              │ HTTPS (fetch)
                                              │ api.getToken() → JWT Bearer
                                              ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│                             RAILWAY (Backend)                                  │
│                        https://sigrene-backend.railway.app                     │
│                                                                                │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │                      FASTAPI (Python)                                    │  │
│  │                                                                          │  │
│  │   POST   /api/v1/login          → Autenticación con JWT                 │  │
│  │   GET    /api/v1/me             → Perfil del usuario autenticado        │  │
│  │   GET    /api/v1/nadadores/     → CRUD de nadadores                     │  │
│  │   POST   /api/v1/registros-diarios/  → Registrar entreno + wellness     │  │
│  │   GET    /api/v1/acwr/{id}      → Ratio de carga aguda/crónica         │  │
│  │   POST   /api/v1/admin/aprobar/{email} → Aprobar registro pending       │  │
│  │                                                                          │  │
│  │   • Valida JWT en cada request                                           │  │
│  │   • Enruta a lógica de negocio                                           │  │
│  │   • Convierte datos al formato definido por Pydantic schemas            │  │
│  └──────────────────────────────────┬──────────────────────────────────────┘  │
│                                     │ pymongo (async driver)                  │
└─────────────────────────────────────┼────────────────────────────────────────┘
                                      │ MongoDB wire protocol (TLS)
                                      ▼
┌────────────────────────────────────────────────────────────────────────────────┐
│                           MONGODB ATLAS (Cluster0 Free Tier)                    │
│                                                                                 │
│  Base de datos en la nube (MongoDB Inc.) accesible desde cualquier IP           │
│  autorizada. Sin necesidad de instalar MongoDB localmente.                        │
│                                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐                    │
│  │  Collection  │  │  Collection  │  │    Collection     │                    │
│  │  usuarios    │  │  nadadores   │  │ registros_diarios │                    │
│  │              │  │              │  │                  │                    │
│  │  email       │  │  seudónimo   │  │  fecha           │                    │
│  │  password    │  │  nombre      │  │  sesion (agua/  │                    │
│  │  rol         │  │  club        │  │    seco)         │                    │
│  │  nombre_com- │  │  provincia   │  │  wellness_manana │                    │
│  │  pleto       │  │  nacimiento   │  │  srpe, trimp    │                    │
│  └──────────────┘  └──────────────┘  └──────────────────┘                    │
│                                                                                 │
│  Replica set de 3 nodos (1 primario + 2 secundarios) en la nube gratuita.       │
└────────────────────────────────────────────────────────────────────────────────┘
```

### ¿Por qué esta arquitectura?

| Componente | Herramienta | Razón de elección |
|---|---|---|
| **Base de datos** | MongoDB Atlas Cluster0 | Base de datos NoSQL en la nube gratuita, ideal para datos heterogéneos (wellness, entrenamientos, composición corporal). No requiere instalar MongoDB localmente. |
| **Backend** | Railway | Despliegue automático desde GitHub. Detecta Python/FastAPI, configura el puerto 8000 y las variables de entorno. Plan gratuito generoso. |
| **Frontend** | Vercel | Despliegue automático desde GitHub. Optimizado para React SPA con rewriting de rutas. CDN global para carga rápida. |
| **Comunicación** | REST + JWT | El frontend hace peticiones HTTPS al backend con un token JWT en la cabecera `Authorization: Bearer <token>`. El token se guarda en localStorage del navegador. |

### Cómo fluye la información

1. **Registro/Login**: El usuario escribe su email y contraseña en el frontend. El navegador envía estas credenciales por HTTPS al backend en Railway. El backend valida contra MongoDB Atlas y devuelve un **token JWT** (un texto cifrado que expira en 8 horas).
2. **Sesión activa**: El navegador guarda el JWT en `localStorage`. En cada petición posterior, el navegador envía el token en la cabecera. El backend lo descifra y sabe quién es el usuario sin necesidad de sesiones en el servidor.
3. **Lectura de datos**: El frontend solicita nadadores, registros o estadísticas al backend. El backend consulta MongoDB Atlas, formatea los datos y los devuelve como JSON.
4. **Logout**: El backend invalida el token. El frontend borra el JWT de `localStorage` y redirige al login.

---

## 🛠️ Tech Stack

### Backend
- **FastAPI** (Python 3.12+) — Framework web asíncrono. Elegido por su rendimiento, validación automática con Pydantic y documentación interactiva en `/docs`.
- **MongoDB Atlas** — Base de datos NoSQL en la nube (Cluster0 free tier). Almacena documentos JSON-like: nadadores, registros de entreno, controles fisiológicos, etc.
- **PyMongo** — Driver oficial de MongoDB para Python.
- **Pydantic** — Validación automática de datos de entrada y salida. Define la forma de cada documento (campos, tipos, valores por defecto).
- **PyJWT + Passlib/Bcrypt** — JWT para autenticación stateless (sin sesiones de servidor) y Bcrypt para hashear contraseñas.
- **Poetry** — Gestor de dependencias Python. Garantiza versiones exactas de cada paquete.

### Frontend
- **React 19** — Librería de UI con componentes.
- **TanStack Router** — Enrutado declarativo basado en archivos. Define rutas como archivos `.tsx` en `frontend/src/routes/`.
- **TanStack Query** — Gestión de estado servidor (fetching, caching, invalidación). No se usa Redux.
- **Tailwind CSS** — Utility-first CSS. Estilos definidos directamente en las etiquetas HTML.
- **Radix UI** — Componentes accesibles (dialog, dropdown, checkbox) sobre los que se construyen los de SIGRENE.
- **Vite** — Bundler de desarrollo y build. Compila TypeScript, optimiza assets y sirve en localhost:3000.
- **i18n** (custom) — Sistema propio de internacionalización con `LanguageProvider`, `useLanguage` hook y traducción de todas las cadenas visibles.

---

## 🚀 Instalación Local

> Para desarrollo local se usa MongoDB Community local. Para producción se usa MongoDB Atlas.

### 1. Requisitos Previos

```bash
python --version   # Python 3.12+
node --version    # Node 18+ (recomendado 20+)
```

### 2. Iniciar MongoDB Community (macOS)

```bash
brew services start mongodb-community
```

Verificar que está corriendo:
```bash
brew services list | grep mongodb
# Debe mostrar: mongodb-community started
```

### 3. Variables de Entorno

Crear archivo `.env` en la raíz del proyecto (NO commitear este archivo):

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

---

## ☁️ Despliegue en Producción

### MongoDB Atlas (Base de datos)

1. Crear cuenta gratuita en [cloud.mongodb.com](https://cloud.mongodb.com)
2. Crear un **Cluster0** free tier (3 nodos replicados, 512 MB almacenamiento)
3. En **Network Access**, añadir la IP del servicio de Railway (o `0.0.0.0/0` para permitir desde cualquier IP)
4. En **Database Access**, crear un usuario con permisos de lectura/escritura
5. Copiar la **connection string** (reemplazar `<password>` con la clave del usuario)
6. Añadir la connection string como variable de entorno `MONGO_URI` en Railway

**¿Por qué Atlas?** El Cluster0 free tier es completamente funcional y gratuito para proyectos pequeños/medianos. Al estar replicado en 3 nodos, la base de datos no se cae si un servidor tiene problemas. Además elimina la necesidad de mantener un servidor propio de MongoDB.

### Railway (Backend)

1. Crear cuenta en [railway.app](https://railway.app) (conectar con GitHub)
2. Nuevo proyecto → **Deploy from GitHub repo**
3. Seleccionar el repositorio
4. Railway detecta automáticamente que es Python/FastAPI
5. Añadir variables de entorno:
   - `MONGO_URI` — connection string de Atlas
   - `MONGO_DB_NAME` — nombre de la base de datos
   - `SECRET_KEY` — clave secreta para firmar JWTs
6. Railway asigna un dominio público automáticamente (ejemplo: `https://sigrene-backend.up.railway.app`)

**¿Por qué Railway?** Despliegue en segundos desde GitHub, detección automática de frameworks, dominio HTTPS gratuito y plan gratuito suficiente para el prototipo. Alternativas considered: Render, Fly.io.

### Vercel (Frontend)

1. Crear cuenta en [vercel.com](https://vercel.com) (conectar con GitHub)
2. Nuevo proyecto → importar el repositorio
3. Vercel detecta automáticamente React + Vite
4. Configurar variable de entorno:
   - `VITE_API_URL` → URL del backend (ejemplo: `https://sigrene-backend.up.railway.app/api/v1`)
5. Deploy automático en cada push a `main`

El archivo `vercel.json` en la raíz del proyecto configura el build:

```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**¿Por qué Vercel?** CDN global, deploy instantáneo, dominio HTTPS gratuito y optimizado para SPA. Las peticiones de la app van directas al backend de Railway.

**Nota sobre rewrites**: La línea `"rewrites"` es crítica. indica a Vercel que todas las rutas (`/app/admin`, `/app/coach`, etc.) deben servir `index.html`. Sin esto, Vercel intentaría buscar archivos estáticos y devolvería 404 para las rutas internas de la SPA.

---

## 📂 Estructura del Proyecto

```
SIGRENE/
├── app/
│   ├── main.py              # FastAPI: endpoints, middleware, CORS
│   ├── models/
│   │   └── schemas.py      # Esquemas Pydantic de validación de datos
│   ├── database/
│   │   └── mongodb.py      # Cliente MongoDB + funciones de conexión
│   └── services/
│       ├── auth.py          # Creación y validación de tokens JWT
│       └── calculations.py  # Cálculos deportivos (sRPE, TRIMP, ACWR)
├── frontend/
│   ├── src/
│   │   ├── routes/         # Páginas definidas como archivos TanStack Router
│   │   │   ├── __root.tsx           # Root layout (LanguageProvider, CookieBanner)
│   │   │   ├── index.tsx            # Landing page pública
│   │   │   ├── login.tsx            # Login
│   │   │   ├── register.tsx         # Registro de federación
│   │   │   ├── forgot-password.tsx  # Recuperar contraseña
│   │   │   ├── invite.tsx           # Aceptar invitación (coach/swimmer)
│   │   │   ├── roles.tsx            # Página informativa de roles
│   │   │   ├── features.tsx         # Página informativa de funcionalidades
│   │   │   ├── contact.tsx          # Página de contacto
│   │   │   ├── terms.tsx            # Términos y condiciones
│   │   │   ├── privacy.tsx          # Política de privacidad (RGPD)
│   │   │   ├── app.admin.tsx        # Layout admin (auth guard)
│   │   │   ├── app.admin.index.tsx  # Dashboard admin
│   │   │   ├── app.admin.settings.tsx
│   │   │   ├── app.admin.users.tsx
│   │   │   ├── app.admin.pending.tsx
│   │   │   ├── app.admin.preview.tsx
│   │   │   ├── app.admin.register-trainer.tsx
│   │   │   ├── app.admin.invitations.tsx
│   │   │   ├── app.coach.tsx        # Layout coach (auth guard)
│   │   │   ├── app.coach.index.tsx  # Mi grupo
│   │   │   ├── app.coach.swimmers.tsx
│   │   │   ├── app.coach.wellness.tsx
│   │   │   ├── app.director.tsx     # Layout director (auth guard)
│   │   │   ├── app.director.index.tsx
│   │   │   ├── app.director.groups.tsx
│   │   │   ├── app.director.reports.tsx
│   │   │   ├── app.swimmer.tsx      # Layout swimmer (auth guard)
│   │   │   ├── app.swimmer.index.tsx # Wellness matutino
│   │   │   ├── app.swimmer.history.tsx
│   │   │   └── app.swimmer.profile.tsx
│   │   ├── components/
│   │   │   ├── AppShell.tsx        # Layout interno con sidebar y topbar
│   │   │   ├── AuthShell.tsx        # Layout para páginas de autenticación
│   │   │   ├── SiteHeader.tsx      # Navegación pública con LanguageSwitcher
│   │   │   ├── SiteFooter.tsx      # Pie de página público
│   │   │   ├── LanguageSwitcher.tsx # Botones ES/EN con banderas SVG planas
│   │   │   ├── CookieBanner.tsx    # Banner de consentimiento RGPD
│   │   │   ├── dashboard/Cards.tsx # Componentes de UI (PageHeader, StatCard, etc.)
│   │   │   └── ui/                  # Componentes base (Button, Input, Label...)
│   │   └── lib/
│   │       ├── api.ts          # Cliente API (todas las llamadas al backend)
│   │       ├── i18n.tsx        # Sistema de internacionalización (ES/EN)
│   │       └── utils.ts        # Utilidades varias
│   ├── package.json
│   ├── vite.config.ts
│   └── .env                    # VITE_API_URL (no commitear)
├── vercel.json                 # Config de despliegue Vercel (build + rewrites SPA)
├── pyproject.toml              # Dependencias Python (Poetry)
├── AGENTS.md                   # Documentación interna para agentes IA
└── README.md
```

---

## 🔐 Colecciones MongoDB

| Colección | Descripción |
|-----------|-------------|
| `usuarios` | Cuentas de usuario del sistema (email, contraseña hasheada, rol, nombre completo, foto de perfil) |
| `nadadores` | Datos fijos de nadadores: seudónimo, nombre, fecha nacimiento, género, club, provincia, contacto de emergencia |
| `registros_diarios` | Sesiones de entrenamiento (agua/seco) + registro matutino de wellness. Incluye campos calculados por el backend (sRPE, TRIMP, tipo de sesión) |
| `controles_fisiologicos` | HRV (RMSSD, SDNN), CMJ, dominadas, lactato, cortisol, testosterona. Ratio C/T se calcula en backend |
| `composicion_corporal` | Altura, peso, envergadura, bioimpedancia (masa muscular, masa grasa, ósea, hidratación) |
| `analisis_competicion` | Tiempos parciales, análisis de fases (salida, viraje, sumergida), variables cinemáticas (SL, SR, stroke index) |

---

## 🔌 Endpoints Principales (Backend)

### Autenticación
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/v1/login` | Inicio de sesión. Recibe email + password, devuelve JWT |
| `POST` | `/api/v1/logout` | Invalida la sesión del usuario |
| `POST` | `/api/v1/usuarios/registrar` | Solicitud de registro de federación (pendiente de aprobación) |
| `POST` | `/api/v1/usuarios/recuperar` | Envía email con enlace para restablecer contraseña |
| `POST` | `/api/v1/usuarios/reset-password` | Restablece contraseña con token válido (30 min) |

### Perfil de Usuario
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/v1/me` | Obtener perfil del usuario autenticado |
| `PUT` | `/api/v1/me` | Actualizar nombre, contraseña o foto de perfil |

### Nadadores
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/v1/nadadores/` | Listar nadadores (con filtros: skip, limit, group_id, search) |
| `POST` | `/api/v1/nadadores/` | Crear nadador |
| `GET` | `/api/v1/nadadores/{id}` | Obtener un nadador |
| `PUT` | `/api/v1/nadadores/{id}` | Actualizar nadador |
| `DELETE` | `/api/v1/nadadores/{id}` | Eliminar nadador |

### Registros Diarios (Entrenamiento + Wellness)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/v1/registros-diarios/` | Listar registros con filtros |
| `POST` | `/api/v1/registros-diarios/` | Crear registro (sesión + wellness) |
| `GET` | `/api/v1/registros-diarios/nadador/{id}` | Registros de un nadador |
| `PUT` | `/api/v1/registros-diarios/{id}` | Actualizar registro |
| `DELETE` | `/api/v1/registros-diarios/{id}` | Eliminar registro |

### Dashboard y Métricas
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/v1/dashboard/stats` | Estadísticas agregadas de la federación |
| `GET` | `/api/v1/acwr/{nadador_id}` | Historial ACWR de un nadador (ratio carga aguda/crónica) |

### Administración
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/v1/admin/registros-pendientes` | Solicitudes de registro pendientes de aprobación |
| `POST` | `/api/v1/admin/aprobar/{email}` | Aprobar solicitud de registro |
| `POST` | `/api/v1/admin/rechazar/{email}` | Rechazar solicitud |
| `GET` | `/api/v1/usuarios/` | Listar usuarios del sistema |
| `PUT` | `/api/v1/usuarios/{email}` | Actualizar usuario (rol, activo) |
| `DELETE` | `/api/v1/usuarios/{email}` | Eliminar usuario |

---

## 📝 Notas de Desarrollo

- **Sin test suite, CI/CD ni pre-commit hooks** — el proyecto se desarrolla directamente en main
- **`poetry.lock` en `.gitignore`** — `poetry.lock` se genera automáticamente y garantiza instalaciones reproducibles, pero está excluido del control de versiones
- **JWT expira en 8 horas**; tokens de recuperación de contraseña expiran en 30 minutos
- Todos los documentos MongoDB tienen campos `created_at` y `updated_at` para trazabilidad temporal
- Los nadadores se cachean en `localStorage` (TTL 5 min) para mejorar el rendimiento de los dropdowns
- **Nadadores cacheados en localStorage**: `localStorage("sigrene_swimmers_cache")` con estructura `{ data, timestamp }`
- **Consentimiento de cookies**: el banner RGPD se muestra en todas las páginas para usuarios sin preferencia guardada en `localStorage("sigrene_cookie_consent")`
- **Auth guards**: todas las rutas `/app/*` están protegidas por `beforeLoad` hooks en TanStack Router que verifican `api.isAuthenticated()` y redirigen a `/login` si no hay token JWT válido
- **Internacionalización**: todas las cadenas visibles están traducidas a español (por defecto) e inglés. El idioma se guarda en `localStorage("sigrene_lang")`
