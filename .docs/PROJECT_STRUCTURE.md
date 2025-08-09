# Satsang Home - Project Structure

## Directory Layout

```
satsang-home/
├── src/                      # Frontend (React Router)
│   ├── components/           # Reusable UI components
│   │   ├── ui/              # Base UI components (Button, Card, etc.)
│   │   ├── sidebar/         # Sidebar navigation component
│   │   └── service-frame/   # Iframe wrapper component
│   ├── features/            # Feature-based modules
│   │   ├── services/        # Service management feature
│   │   └── dashboard/       # Dashboard feature
│   ├── hooks/               # Custom React hooks
│   │   ├── use-config.ts    # Config loading hook
│   │   ├── use-service.ts   # Service state management
│   │   └── use-proxy.ts     # Proxy URL builder
│   ├── layouts/             # Layout components
│   │   └── app-layout.tsx   # Main app layout with sidebar
│   ├── lib/                 # External library configs
│   ├── providers/           # React context providers
│   │   └── config-provider.tsx
│   ├── routes/              # Route components
│   │   ├── _index.tsx       # Home route
│   │   └── service.$id.tsx  # Dynamic service route
│   ├── stores/              # State management (if needed)
│   ├── types/               # Frontend-specific types
│   ├── utils/               # Utility functions
│   └── assets/              # Static assets
│       └── tailwind.css
│
├── server/                   # Backend (Elysia)
│   ├── src/
│   │   ├── index.ts         # Elysia server entry point
│   │   ├── routes/          # API routes
│   │   │   ├── proxy.ts     # Proxy route handlers
│   │   │   ├── config.ts    # Config API endpoints
│   │   │   └── health.ts    # Health check endpoints
│   │   ├── middleware/      # Elysia middleware
│   │   │   ├── cors.ts      # CORS configuration
│   │   │   ├── auth.ts      # Authentication injection
│   │   │   ├── headers.ts   # Header manipulation
│   │   │   └── logger.ts    # Request logging
│   │   ├── services/        # Business logic
│   │   │   ├── config-loader.ts    # Config file management
│   │   │   ├── proxy-service.ts    # Proxy core logic
│   │   │   ├── url-rewriter.ts     # HTML/CSS/JS URL rewriting
│   │   │   ├── auth-injector.ts    # Auth header injection
│   │   │   └── session-manager.ts  # Per-service sessions
│   │   ├── plugins/         # Elysia plugins
│   │   │   ├── swagger.ts   # API documentation
│   │   │   └── static.ts    # Static file serving
│   │   ├── schemas/         # Validation schemas (using Elysia's t)
│   │   │   ├── config.ts    # Config validation
│   │   │   └── service.ts   # Service validation
│   │   └── utils/           # Server utilities
│   │       ├── errors.ts    # Error handling
│   │       └── constants.ts # Server constants
│   └── test/                # Server tests
│       ├── unit/
│       └── integration/
│
├── shared/                   # Shared between frontend & backend
│   └── types/
│       ├── config.ts        # Config type definitions
│       ├── service.ts       # Service type definitions
│       └── api.ts           # API response types
│
├── config/                   # Configuration files
│   ├── config.json          # User services configuration
│   └── config.example.json  # Example configuration
│
├── public/                   # Static files
├── build/                    # Build output (gitignored)
├── node_modules/            # Dependencies (gitignored)
│
├── package.json             # Root package.json with workspaces
├── bun.lockb               # Bun lock file
├── tsconfig.json           # Root TypeScript config
├── tsconfig.server.json    # Server TypeScript config
├── biome.jsonc             # Biome configuration
├── .env.example            # Environment variables example
├── docker/                 # Docker related files
│   ├── Dockerfile
│   └── docker-compose.yml
└── scripts/                # Build/dev scripts
    ├── dev.ts              # Development server runner
    └── build.ts            # Production build script
```

## Key Organizational Principles

### 1. **Separation of Concerns**
- **Frontend** (`src/`): React Router app
- **Backend** (`server/`): Elysia API server
- **Shared** (`shared/`): Common types used by both

### 2. **Elysia-Specific Organization**

#### Routes (`server/src/routes/`)
Each route file exports an Elysia instance:
```typescript
// proxy.ts
export const proxyRoutes = new Elysia({ prefix: '/proxy' })
  .use(authMiddleware)
  .get('/:serviceId/*', proxyHandler)
  .post('/:serviceId/*', proxyHandler)
```

#### Middleware (`server/src/middleware/`)
Chainable middleware as Elysia plugins:
```typescript
// headers.ts
export const headerMiddleware = new Elysia()
  .onBeforeHandle(({ set }) => {
    delete set.headers['X-Frame-Options']
    delete set.headers['Content-Security-Policy']
  })
```

#### Services (`server/src/services/`)
Business logic separated from routes:
- `proxy-service.ts`: Core proxy logic
- `config-loader.ts`: Config file operations
- `url-rewriter.ts`: HTML/CSS/JS rewriting

#### Plugins (`server/src/plugins/`)
Reusable Elysia plugins for common functionality

#### Schemas (`server/src/schemas/`)
Elysia's built-in validation using `t` schema:
```typescript
// config.ts
export const configSchema = t.Object({
  app: t.Object({
    title: t.String(),
    theme: t.Union([t.Literal('dark'), t.Literal('light')])
  }),
  services: t.Array(serviceSchema)
})
```

### 3. **Type Safety**
- Shared types in `shared/types/` imported by both frontend and backend
- Elysia's type inference for routes
- End-to-end type safety from API to UI

### 4. **Testing Structure**
- Frontend tests alongside components
- Backend tests in `server/test/`
- E2E tests in separate directory

### 5. **Configuration**
- User config in `config/config.json`
- Environment variables for secrets
- Example configs for documentation

## Development Workflow

### Running Services
```bash
# Development (runs both frontend and backend)
bun run dev

# Frontend only
bun run dev:frontend

# Backend only  
bun run dev:server

# Type checking
bun run typecheck
```

### Port Allocation
- Frontend: 3000 (Vite dev server)
- Backend: 3001 (Elysia server)
- Production: 3000 (serves both)

## Benefits of This Structure

1. **Clear Boundaries**: Frontend and backend are clearly separated
2. **Type Safety**: Shared types ensure consistency
3. **Scalability**: Easy to add new routes, middleware, or services
4. **Testability**: Each layer can be tested independently
5. **Elysia Patterns**: Follows Elysia's plugin-based architecture
6. **Developer Experience**: Clear where to put new code
7. **Build Optimization**: Can build/deploy separately if needed