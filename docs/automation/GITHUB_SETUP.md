# GitHub Automation Setup

Este paquete agrega una base de automatización para el repo:

- `CI` para instalación, validación de Prisma y builds de API/Web
- `CodeQL` para análisis de seguridad
- `pull_request_template.md`
- `.gitignore` endurecido para evitar secretos

## Qué hace cada workflow

### `ci.yml`
Corre en push y pull request:
- `pnpm install --frozen-lockfile`
- chequeo de archivos `.env` trackeados
- `pnpm prisma validate` en `apps/api`
- build de API
- build de Web

### `codeql.yml`
Corre en push, pull request y semanalmente:
- inicializa CodeQL
- autobuild
- analiza JS/TS

## Activación recomendada en GitHub

### 1. Subí estos archivos
Commit y push a tu repo.

### 2. Habilitá branch protection en `main`
Reglas recomendadas:
- Require a pull request before merging
- Require status checks to pass before merging
- Checks recomendados:
  - `Validate / Build`
  - `Analyze`
- Do not allow force pushes

### 3. Revisá CodeQL
En GitHub:
- Security
- Code scanning alerts

### 4. Flujo recomendado de trabajo
- Crear ramas feature
- Abrir PR
- Esperar CI + CodeQL
- Recién después mergear

## Nota importante
Este paquete no agrega tests porque hoy el repo todavía no tiene una suite estable. Cuando armemos tests, sumamos otro job al CI.

## Checks locales útiles
```bash
pnpm install
pnpm --filter api prisma validate
pnpm --filter api build
pnpm --filter web build
```
