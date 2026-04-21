# CODEX MASTER PROMPT — ArcaApp

## Contexto del proyecto
Trabajás sobre una app SaaS de facturación electrónica conectada con ARCA para Argentina.

### Stack
- Monorepo con pnpm workspaces
- Backend: NestJS + Prisma + PostgreSQL (Supabase)
- Frontend: Next.js 14 + App Router + TanStack Query + React Hook Form + Zod + Tailwind
- Base ya levantando localmente
- Prisma migrado y seed funcionando
- Login JWT básico ya funcionando
- Frontend y backend ya levantan

## Regla principal
NO rediseñar la arquitectura.
NO hacer refactors grandes fuera del alcance.
NO tocar áreas no pedidas.
NO introducir mocks nuevos salvo que se pidan explícitamente.

## Objetivo de trabajo
Avanzar el MVP lo más rápido posible, con tareas pequeñas, cerradas y verificables.

## Orden de prioridad del proyecto
1. Seguridad y hardening del núcleo
2. CRUD real del panel
3. Factura borrador real
4. Integración ARCA en homologación
5. PDF, QR, Swagger, logging, throttling, tests

## Reglas de ejecución
1. Tocá solo los archivos necesarios.
2. Entregá cambios listos para reemplazar.
3. Si cambiás backend, verificá que no rompa `pnpm --filter api build`.
4. Si cambiás frontend, verificá que no rompa `pnpm --filter web build`.
5. Si tocás Prisma, verificá `pnpm --filter api prisma validate`.
6. Si tocás auth / guards / invoices, explicá cómo probarlo.
7. No cambies nombres de módulos o carpetas salvo necesidad fuerte.
8. No agregues dependencias innecesarias.
9. Si encontrás un problema crítico fuera del alcance, reportalo brevemente pero no te desvíes.

## Formato de entrega esperado
### 1. Resumen breve
- qué hiciste
- qué archivos tocaste

### 2. Archivos completos para reemplazar/agregar
Entregar archivos listos, no pseudocódigo.

### 3. Comandos a ejecutar
Solo los necesarios.

### 4. Cómo probar
Paso a paso, breve.

### 5. Riesgos o notas
Solo si realmente hace falta.

## Criterio de terminado por tarea
Una tarea está terminada si:
- compila
- no rompe build
- cumple el objetivo pedido
- incluye pasos de prueba
- no introduce deuda obvia innecesaria

## Cosas que NO hacer
- no usar Number() para dinero si la tarea toca cálculos monetarios
- no aceptar companyId libre si la tarea toca seguridad por empresa
- no mezclar implementación ARCA real con mocks sin aclararlo
- no esconder errores reales detrás de mensajes genéricos
- no cambiar 20 archivos si la tarea puede resolverse tocando 3 o 4

## Tono de trabajo
Directo, técnico, orientado a ejecución.
