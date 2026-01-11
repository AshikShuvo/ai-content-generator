# 🏗️ Docker Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          USER / BROWSER                              │
│                     http://localhost:3000                            │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 │ HTTP
                                 │
┌────────────────────────────────▼────────────────────────────────────┐
│                     DOCKER COMPOSE NETWORK                           │
│                  (ai-content-creator-network)                        │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              APPLICATION CONTAINER (Port 3000)               │  │
│  │                                                               │  │
│  │  ┌─────────────────────────────────────────────────────┐    │  │
│  │  │           NestJS Application                        │    │  │
│  │  │                                                      │    │  │
│  │  │  API Routes (/api/*)   │   Static Files (/)        │    │  │
│  │  │  ├─ /api/auth          │   └─ React Client         │    │  │
│  │  │  ├─ /api/content       │      (from dist/)         │    │  │
│  │  │  ├─ /api/docs          │                           │    │  │
│  │  │  └─ /api/...           │                           │    │  │
│  │  │                                                      │    │  │
│  │  └──────┬──────────────────────────────┬──────────────┘    │  │
│  │         │                               │                   │  │
│  │         │ Prisma ORM                    │ Bull Queue       │  │
│  │         │                               │                   │  │
│  └─────────┼───────────────────────────────┼───────────────────┘  │
│            │                               │                      │
│            │                               │                      │
│  ┌─────────▼────────────────┐   ┌─────────▼────────────────┐     │
│  │   MongoDB Container      │   │    Redis Container       │     │
│  │                          │   │                          │     │
│  │  Port: 27017             │   │  Port: 6379             │     │
│  │  Database: ai-content-   │   │  Purpose: Bull Queue    │     │
│  │            creator        │   │           Job Storage   │     │
│  │                          │   │                          │     │
│  │  Volume: mongodb_data    │   │  Volume: redis_data     │     │
│  │         (persistent)     │   │         (persistent)    │     │
│  └──────────────────────────┘   └──────────────────────────┘     │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

## Multi-Stage Build Process

```
┌─────────────────────────────────────────────────────────────────────┐
│                     STAGE 1: CLIENT BUILDER                          │
│                                                                      │
│  FROM node:18-alpine                                                │
│  ├─ Copy package files                                              │
│  ├─ Install dependencies                                            │
│  ├─ Copy client source code                                         │
│  └─ Build client (npm run build)                                   │
│                                                                      │
│  OUTPUT: apps/client/dist/                                          │
└──────────────────────────────┬───────────────────────────────────────┘
                               │
┌──────────────────────────────▼───────────────────────────────────────┐
│                     STAGE 2: API BUILDER                             │
│                                                                      │
│  FROM node:18-alpine                                                │
│  ├─ Copy package files                                              │
│  ├─ Install dependencies                                            │
│  ├─ Copy API source code                                            │
│  ├─ Generate Prisma client                                          │
│  └─ Build API (npm run build)                                       │
│                                                                      │
│  OUTPUT: apps/api/dist/                                             │
└──────────────────────────────┬───────────────────────────────────────┘
                               │
┌──────────────────────────────▼───────────────────────────────────────┐
│                  STAGE 3: PRODUCTION RUNTIME                         │
│                                                                      │
│  FROM node:18-alpine                                                │
│  ├─ Install dumb-init (signal handling)                             │
│  ├─ Create non-root user                                            │
│  ├─ Install ONLY production dependencies                            │
│  ├─ Copy built API from Stage 2                                     │
│  ├─ Copy built client from Stage 1 → ../client/dist                │
│  ├─ Generate Prisma client                                          │
│  └─ Set up health checks                                            │
│                                                                      │
│  OUTPUT: Optimized production image (~500 MB)                       │
│  RUNS AS: non-root user (nestjs:nodejs)                             │
└──────────────────────────────────────────────────────────────────────┘
```

## Development vs Production

### Development Mode (docker-compose.dev.yml)

```
┌───────────────────────────────────────────────────────────────┐
│                    DEVELOPER MACHINE                           │
└─────────────┬──────────────────────────┬──────────────────────┘
              │                          │
              │                          │
    ┌─────────▼─────────┐      ┌────────▼──────────┐
    │  API Container    │      │ Client Container  │
    │  Port: 3000       │      │ Port: 5173        │
    │                   │      │                   │
    │  npm run dev      │      │ npm run dev       │
    │  (hot reload)     │      │ (hot reload)      │
    │                   │      │                   │
    │  Source mounted:  │      │ Source mounted:   │
    │  ./apps/api/src   │      │ ./apps/client/src │
    └─────────┬─────────┘      └───────────────────┘
              │
              │
    ┌─────────▼─────────┐      ┌───────────────────┐
    │    MongoDB        │      │      Redis        │
    │  (development)    │      │  (development)    │
    └───────────────────┘      └───────────────────┘

   Changes in src/ → Auto reload → Instant feedback
```

### Production Mode (docker-compose.yml)

```
┌───────────────────────────────────────────────────────────────┐
│                      PUBLIC INTERNET                           │
└──────────────────────────────┬────────────────────────────────┘
                               │
                               │
                  ┌────────────▼───────────────┐
                  │   Application Container    │
                  │   Port: 3000 (ONLY)        │
                  │                            │
                  │   Built API + Built Client │
                  │   (No source code)         │
                  │   (Production deps only)   │
                  │   (Optimized image)        │
                  └────────────┬───────────────┘
                               │
                               │
             ┌─────────────────┴──────────────────┐
             │                                    │
    ┌────────▼─────────┐              ┌──────────▼────────┐
    │    MongoDB       │              │      Redis        │
    │  (production)    │              │  (production)     │
    │  Persistent data │              │  Persistent data  │
    └──────────────────┘              └───────────────────┘

   Single port → No CORS → Simpler deployment
```

### Production with Nginx (docker-compose.prod.yml)

```
┌───────────────────────────────────────────────────────────────┐
│                      PUBLIC INTERNET                           │
│                  https://yourdomain.com                        │
└──────────────────────────────┬────────────────────────────────┘
                               │
                               │ HTTPS (443)
                               │
                  ┌────────────▼───────────────┐
                  │    Nginx Container         │
                  │    Ports: 80, 443          │
                  │                            │
                  │    - SSL Termination       │
                  │    - Rate Limiting         │
                  │    - Static Caching        │
                  │    - Security Headers      │
                  │    - Gzip Compression      │
                  └────────────┬───────────────┘
                               │
                               │ HTTP (internal)
                               │
                  ┌────────────▼───────────────┐
                  │   Application Container    │
                  │   Port: 3000 (internal)    │
                  │                            │
                  │   API + Client             │
                  │   (Not exposed to public)  │
                  └────────────┬───────────────┘
                               │
                               │
             ┌─────────────────┴──────────────────┐
             │                                    │
    ┌────────▼─────────┐              ┌──────────▼────────┐
    │    MongoDB       │              │      Redis        │
    │  (with limits)   │              │  (with limits)    │
    │  CPU: 1.0        │              │  CPU: 0.5         │
    │  Mem: 1G         │              │  Mem: 512M        │
    └──────────────────┘              └───────────────────┘

   Nginx → Enhanced security, performance, SSL
```

## Data Flow: Content Generation

```
┌──────────┐
│  User    │
└─────┬────┘
      │
      │ 1. POST /api/content/generate
      │    (title, prompt, contentType)
      │
      ▼
┌───────────────────────────────┐
│   API Container               │
│                               │
│   ContentController           │
│   ├─ Validate input           │
│   ├─ Get user from JWT        │
│   └─ Call ContentService      │
│         │                     │
│         ▼                     │
│   ContentService              │
│   ├─ Create Content in DB    │──────┐
│   │   (status: PENDING)       │      │
│   ├─ Create Bull job          │──┐   │
│   │   (60s delay)             │  │   │
│   └─ Return jobId (202)      │  │   │
└───────────────────────────────┘  │   │
      │                            │   │
      │ 2. Return 202 Accepted     │   │
      │    {jobId: "..."}          │   │
      │                            │   │
      ▼                            │   │
┌──────────┐                       │   │
│  User    │                       │   │
│ (polling)│                       │   │
└──────────┘                       │   │
                                   │   │
      ┌────────────────────────────┘   │
      │ 3. Queue job                   │
      ▼                                │
┌───────────────────┐                  │
│  Redis Container  │                  │
│                   │                  │
│  Bull Queue       │                  │
│  ├─ Store job     │                  │
│  └─ Wait 60s      │                  │
└─────────┬─────────┘                  │
          │                            │
          │ 4. After 60 seconds        │
          │                            │
          ▼                            │
┌───────────────────────────────┐      │
│   API Container               │      │
│                               │      │
│   ContentProcessor            │      │
│   ├─ Update status:           │──────┤
│   │   PROCESSING              │      │ 5. Update DB
│   ├─ Call Gemini AI           │      │
│   ├─ Generate content          │      │
│   ├─ Save generated text      │──────┘
│   └─ Update status:           │──────┐
│       COMPLETED                │      │ 6. Update DB
└───────────────────────────────┘      │
                                       │
                                       ▼
                              ┌─────────────────┐
                              │ MongoDB         │
                              │ Container       │
                              │                 │
                              │ Content {       │
                              │   status: DONE  │
                              │   text: "..."   │
                              │ }               │
                              └─────────────────┘
```

## Volume Persistence

```
┌────────────────────────────────────────────────────────────┐
│                    DOCKER HOST                              │
│                                                             │
│  /var/lib/docker/volumes/                                  │
│    │                                                        │
│    ├─ mongodb_data/                                        │
│    │    └─ _data/                                          │
│    │       └─ [MongoDB database files]                     │
│    │                                                        │
│    └─ redis_data/                                          │
│         └─ _data/                                          │
│            └─ [Redis persistence files]                    │
│                                                             │
└─────────────────┬──────────────────┬────────────────────────┘
                  │                  │
                  │ Mount            │ Mount
                  │                  │
         ┌────────▼────────┐    ┌───▼──────────┐
         │   MongoDB       │    │    Redis     │
         │   Container     │    │  Container   │
         │                 │    │              │
         │ /data/db ───────┘    │ /data ───────┘
         │ (inside container)   │ (inside container)
         └──────────────────┘    └──────────────┘

   Data persists even if containers are removed!
   docker-compose down → Data safe
   docker-compose down -v → Data deleted
```

## Network Isolation

```
┌─────────────────────────────────────────────────────────────┐
│                     DOCKER HOST                              │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │    Docker Network: ai-content-creator-network         │  │
│  │    Subnet: 172.20.0.0/16                              │  │
│  │                                                        │  │
│  │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │  │
│  │   │   MongoDB   │  │    Redis    │  │     App     │ │  │
│  │   │  172.20.0.2 │  │ 172.20.0.3  │  │ 172.20.0.4  │ │  │
│  │   └─────────────┘  └─────────────┘  └──────┬──────┘ │  │
│  │         ▲                 ▲                  │        │  │
│  │         │                 │                  │        │  │
│  │         └─────────────────┴──────────────────┘        │  │
│  │           Containers can communicate                  │  │
│  │           using service names (DNS)                   │  │
│  │           mongodb:27017, redis:6379                   │  │
│  └────────────────────────────────┬────────────────────┘  │
│                                   │                        │
│                            Port Mapping                    │
│                            3000:3000                       │
└───────────────────────────────────┼────────────────────────┘
                                    │
                         ┌──────────▼──────────┐
                         │   Public Internet   │
                         │  localhost:3000     │
                         └─────────────────────┘

   Only port 3000 exposed to host
   Internal services not accessible from outside
```

## File Organization

```
ai-content-creator/
├── 🐳 Docker Files
│   ├── Dockerfile                      ← Multi-stage production build
│   ├── Dockerfile.dev                  ← Development build
│   ├── docker-compose.yml              ← Production services
│   ├── docker-compose.dev.yml          ← Development services
│   ├── docker-compose.prod.yml         ← Production + Nginx
│   ├── .dockerignore                   ← Build optimization
│   └── nginx.conf                      ← Reverse proxy config
│
├── 🚀 Scripts
│   ├── quick-start.sh                  ← Interactive deployment
│   ├── test-docker.sh                  ← Automated testing
│   └── Makefile                        ← Command shortcuts
│
├── 📚 Documentation
│   ├── START_HERE.md                   ← Quick start guide
│   ├── DOCKER_DEPLOYMENT.md            ← Complete deployment docs
│   ├── DOCKER_SETUP_COMPLETE.md        ← Setup summary
│   ├── DEPLOYMENT_CHECKLIST.md         ← Step-by-step checklist
│   └── DOCKER_FILES_OVERVIEW.md        ← File reference
│
├── 🔧 Configuration
│   ├── .env.docker                     ← Environment template
│   └── .env                            ← Your secrets (not in git)
│
└── 📦 Application
    └── apps/
        ├── api/                        ← NestJS backend
        └── client/                     ← React frontend
```

---

**This architecture provides:**
- ✅ Single port deployment (3000)
- ✅ Container isolation
- ✅ Data persistence
- ✅ Scalability
- ✅ Security
- ✅ Easy deployment

**Start with:** `./quick-start.sh` or `docker-compose up -d`
