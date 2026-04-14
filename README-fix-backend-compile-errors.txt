USO

1. Guardá este archivo en la raíz del proyecto:
   facturacion-arca-starter\fix-backend-compile-errors.ps1

2. Ejecutá:
   powershell -ExecutionPolicy Bypass -File .\fix-backend-compile-errors.ps1

Qué arregla:
- instala joi en apps/api
- corrige el tipado Prisma de apps/api/src/modules/invoice-events/invoice-events.service.ts

Después:
- pnpm dev:api
- pnpm dev:web
