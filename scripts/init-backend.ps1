#requires -Version 5.1
<#
.SYNOPSIS
    Inicializa el backend de Penguk: NestJS + TypeScript + Prisma/PostgreSQL +
    Redis/BullMQ + JWT/Passport, con los módulos del Domain Model ya creados.

.DESCRIPTION
    Ejecutar desde la carpeta donde quieres que se cree la carpeta "backend/".
    Requiere: Node.js LTS, npm, Docker Desktop (para Postgres/Redis locales).

.NOTES
    Ver referencias: overview.md, technologies.md, adr/ADR-0001 a ADR-0008.
#>

param(
    [string]$ProjectName = "backend"
)

$ErrorActionPreference = "Stop"

function Write-Step {
    param([string]$Message)
    Write-Host "`n==> $Message" -ForegroundColor Cyan
}

function Test-CommandExists {
    param([string]$Command)
    return [bool](Get-Command $Command -ErrorAction SilentlyContinue)
}

# ---------------------------------------------------------------------------
# 0. Verificar prerrequisitos
# ---------------------------------------------------------------------------
Write-Step "Verificando prerrequisitos"

if (-not (Test-CommandExists "node")) {
    Write-Error "Node.js no está instalado. Instala Node.js LTS antes de continuar."
    exit 1
}
if (-not (Test-CommandExists "npm")) {
    Write-Error "npm no está instalado."
    exit 1
}
if (-not (Test-CommandExists "docker")) {
    Write-Warning "Docker no encontrado. Necesitarás Docker para levantar Postgres/Redis localmente (docker-compose.yml se creará igual)."
}

$nodeVersion = node -v
Write-Host "Node.js detectado: $nodeVersion"

# ---------------------------------------------------------------------------
# 1. Crear proyecto NestJS (ADR-0002)
# ---------------------------------------------------------------------------
Write-Step "Creando proyecto NestJS en ./$ProjectName"

if (-not (Test-CommandExists "nest")) {
    Write-Host "Instalando @nestjs/cli globalmente..."
    npm install -g @nestjs/cli
}

nest new $ProjectName --package-manager npm --skip-git
Set-Location $ProjectName

# ---------------------------------------------------------------------------
# 2. Instalar dependencias de producción
# ---------------------------------------------------------------------------
Write-Step "Instalando dependencias (Prisma, Auth, Redis/BullMQ, Swagger)"

# Config y validación
npm install @nestjs/config class-validator class-transformer

# Prisma / PostgreSQL (ADR-0003, ADR-0004)
npm install @prisma/client
npm install -D prisma

# Auth: JWT + Passport, GitHub OAuth + local (ADR-0008)
npm install @nestjs/jwt @nestjs/passport passport passport-jwt passport-github2 passport-local
npm install -D @types/passport-jwt @types/passport-github2 @types/passport-local
npm install bcrypt
npm install -D @types/bcrypt

# Redis + BullMQ (ADR-0005)
npm install @nestjs/bullmq bullmq ioredis

# REST API docs (ADR-0006, docs/api)
npm install @nestjs/swagger

Write-Host "Dependencias de producción instaladas." -ForegroundColor Green

# ---------------------------------------------------------------------------
# 3. Instalar dependencias de desarrollo / testing (testing-strategy.md)
# ---------------------------------------------------------------------------
Write-Step "Instalando dependencias de testing"

npm install -D supertest @types/supertest
# Jest ya viene incluido por defecto con "nest new"

# ---------------------------------------------------------------------------
# 4. Inicializar Prisma
# ---------------------------------------------------------------------------
Write-Step "Inicializando Prisma"

npx prisma init --datasource-provider postgresql

# ---------------------------------------------------------------------------
# 5. Generar módulos de NestJS (uno por Bounded Context / c4-component-backend.md)
# ---------------------------------------------------------------------------
Write-Step "Generando módulos del Domain Model"

$modules = @(
    "auth",
    "users",
    "problems",
    "reviews",
    "notes",
    "integrations",
    "contests",
    "dashboard",
    "statistics",
    "jobs"          # Background Job Module, ver c4-container.md
)

foreach ($module in $modules) {
    Write-Host "Generando módulo: $module"
    nest generate module "$module" --no-spec
    nest generate service "$module" --no-spec
    nest generate controller "$module" --no-spec
}

# El módulo "jobs" es infraestructura de background jobs, no expone
# controlador REST propio (c4-container.md) — se elimina el controller generado.
Remove-Item -Path "src/jobs/jobs.controller.ts" -ErrorAction SilentlyContinue

# ---------------------------------------------------------------------------
# 6. Crear docker-compose.yml (Postgres + Redis, ci-cd.md)
# ---------------------------------------------------------------------------
Write-Step "Creando docker-compose.yml"

$dockerCompose = @"
version: "3.9"

services:
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: penguk
      POSTGRES_PASSWORD: penguk
      POSTGRES_DB: penguk
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    ports:
      - "6379:6379"

volumes:
  postgres_data:
"@

Set-Content -Path "docker-compose.yml" -Value $dockerCompose -Encoding UTF8

# ---------------------------------------------------------------------------
# 7. Crear .env.example (technologies.md -- Authentication, Data & Messaging)
# ---------------------------------------------------------------------------
Write-Step "Creando .env.example"

$envExample = @"
# Database (ADR-0003, ADR-0004)
DATABASE_URL="postgresql://penguk:penguk@localhost:5432/penguk?schema=public"

# Redis / BullMQ (ADR-0005)
REDIS_HOST=localhost
REDIS_PORT=6379

# Auth (ADR-0008)
JWT_SECRET=changeme
JWT_EXPIRES_IN=1h

GITHUB_CLIENT_ID=changeme
GITHUB_CLIENT_SECRET=changeme
GITHUB_CALLBACK_URL=http://localhost:3000/v1/auth/github/callback

# App
PORT=3000
NODE_ENV=development
"@

Set-Content -Path ".env.example" -Value $envExample -Encoding UTF8
Copy-Item ".env.example" ".env"

# ---------------------------------------------------------------------------
# 8. Levantar Postgres y Redis (si Docker está disponible)
# ---------------------------------------------------------------------------
if (Test-CommandExists "docker") {
    Write-Step "Levantando Postgres y Redis con docker-compose"
    docker compose up -d
}
else {
    Write-Warning "Docker no disponible: levanta Postgres y Redis manualmente antes de correr las migraciones."
}

# ---------------------------------------------------------------------------
# 9. Inicializar Git (si no existe)
# ---------------------------------------------------------------------------
Write-Step "Inicializando Git"

if (-not (Test-Path ".git")) {
    git init | Out-Null
    Set-Content -Path ".gitignore" -Value @"
node_modules/
dist/
.env
*.log
"@ -Encoding UTF8 -Force
}

# ---------------------------------------------------------------------------
# 10. Resumen final
# ---------------------------------------------------------------------------
Write-Step "Listo"

Write-Host @"

Backend inicializado en ./$ProjectName

Módulos generados: $($modules -join ', ')

Próximos pasos:
  1. cd $ProjectName
  2. Define tu schema.prisma según database/erd.md (User, Account, Integration,
     Problem, Tag, ProblemReview, Review, Contest, ContestParticipation,
     Upsolve, Repository, Note).
  3. npx prisma migrate dev --name init
  4. npm run start:dev

"@ -ForegroundColor Green