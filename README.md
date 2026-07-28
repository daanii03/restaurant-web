# Tu Restaurante — Web del Restaurante

Sitio web oficial del restaurante Tu Restaurante. Incluye carta digital, sistema de reservas con confirmación por email, panel de administración para gestionar platos y reservas, y cancelación mediante enlace firmado.

## Funcionalidades

- **Carta digital** con platos, categorías, alérgenos y filtrado por cliente
- **Reservas online** con selección de fecha, hora y comensales
- **Confirmación por email** vía Resend con enlace de cancelación firmado con HMAC
- **Panel de administración** protegido con sesión cookie firmada
- **Gestión de platos** (crear, editar, eliminar) con asignación de alérgenos
- **Vista responsive** con tabla en desktop y tarjetas en móvil
- **SEO**: Open Graph, JSON-LD (Restaurant schema), meta tags, canonical
- **Seguridad**: CSP, HSTS, X-Frame-Options, sameSite cookies, escape HTML en emails, comparación timingSafeEqual

## Stack

| Capa | Tecnología |
|---|---|
| Framework | [Astro](https://astro.build) 7 |
| UI | React 19 + Tailwind CSS 4 |
| Base de datos | Turso (libSQL) |
| Email | Resend |
| Autenticación | HMAC + bcryptjs |
| Validación | Zod 4 |
| Despliegue | Node adapter (Vercel-ready) |

## Requisitos

- Node.js 20+
- pnpm 9+
- Cuenta en [Turso](https://turso.tech) para la base de datos
- Cuenta en [Resend](https://resend.com) para el envío de emails

## Configuración

Clona el repositorio y configura las variables de entorno:

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales:

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | URL de conexión a Turso |
| `AUTH_TOKEN` | Token de autenticación de Turso |
| `RESEND_API_KEY` | API key de Resend |
| `ADMIN_SECRET` | Secreto para firmar la cookie de sesión |
| `CANCEL_SECRET` | Secreto para firmar el enlace de cancelación |
| `PUBLIC_SITE_URL` | URL pública del sitio (ej: `http://localhost:4321`) |

Instala dependencias e inicia el servidor de desarrollo:

```bash
pnpm install
pnpm dev
```

## Scripts

| Comando | Acción |
|---|---|
| `pnpm dev` | Inicia servidor de desarrollo en `localhost:4321` |
| `pnpm build` | Construye el sitio para producción en `dist/` |
| `pnpm preview` | Previsualiza la build localmente |
| `pnpm astro check` | Ejecuta type checking |

## Estructura

```
src/
├── assets/              # Imágenes del proyecto
├── components/
│   ├── admin/           # Componentes del panel (StatsCards, ReservationTable, etc.)
│   ├── AdminReservationPanel.tsx
│   ├── DishForm.tsx
│   ├── Calendar.tsx
│   └── ...
├── db/
│   ├── client.ts        # Conexión a Turso
│   ├── queries.ts       # Consultas SQL
│   └── schema.ts        # Interfaces TypeScript
├── layouts/
│   ├── Layout.astro     # Layout público (SEO, JSON-LD)
│   └── LayoutDashboard.astro  # Layout admin con sidebar
├── pages/
│   ├── api/             # Endpoints (reservas, platos, login, logout)
│   ├── admin/           # Panel de administración
│   ├── cancel-reservation/
│   ├── index.astro
│   └── menu.astro
├── utils/
│   ├── auth.ts          # Verificación de sesión HMAC
│   ├── email.ts         # Envío de emails con Resend
│   └── hours.ts         # Horarios y slots disponibles
└── middleware.ts         # Security headers
```

## Despliegue

### Vercel

1. Cambia el adapter en `astro.config.mjs` de `@astrojs/node` a `@astrojs/vercel`
2. Conecta el repositorio en Vercel
3. Añade todas las variables de entorno en el panel de Vercel
4. Despliega

El rate limiter en memoria actual no funciona en el entorno serverless de Vercel. Si se necesita, migrar a [Upstash Ratelimit](https://upstash.com/docs/redis/sdks/ratelimit-ts/overview).

### Base de datos

Las tablas se crean con `pnpm db:seed` (consulta `scripts/seed.ts` para el esquema completo).
