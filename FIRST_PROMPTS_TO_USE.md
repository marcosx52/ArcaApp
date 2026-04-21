# FIRST PROMPTS TO USE WITH CODEX

## Prompt 1 — B1 Seguridad por empresa
Tomá la tarea B1 del archivo CODEX QUEUE.

Objetivo:
- endurecer CompanyAccessGuard
- dejar de aceptar companyId libre en endpoints sensibles donde ya existe empresa activa
- usar CurrentCompany desde contexto seguro
- revisar customers, products, invoices, dashboard, documents y tax-config

Restricciones:
- no tocar ARCA
- no tocar frontend salvo que sea necesario para mantener x-company-id
- no refactorizar módulos fuera del alcance
- mantener compilación del backend

Entrega:
- resumen
- archivos completos
- comandos
- cómo probar
- riesgos

Checks:
- pnpm --filter api build
- si toca frontend, pnpm --filter web build

## Prompt 2 — B2 Decimal.js en invoices
Tomá la tarea B2 del archivo CODEX QUEUE.

Objetivo:
- reemplazar Number() por Decimal.js en cálculos monetarios de invoices
- mantener compatibilidad con Prisma Decimal
- no tocar ARCA
- no tocar frontend salvo que un DTO lo requiera

Además:
- revisar addItem
- revisar updateItem
- revisar cálculo de subtotal, discount, vat, total

Restricciones:
- no cambiar arquitectura
- no tocar otras áreas del sistema
- no marcar READY automáticamente

Checks:
- pnpm --filter api build
- pnpm --filter api prisma validate

## Prompt 3 — B5 Customers end-to-end
Tomá la tarea B5 del archivo CODEX QUEUE.

Objetivo:
- conectar customers end-to-end
- listar, crear, editar y archivar
- usar API real desde frontend
- manejar loading/error básico

Restricciones:
- no tocar auth
- no tocar ARCA
- no tocar invoices

Checks:
- pnpm --filter api build
- pnpm --filter web build
