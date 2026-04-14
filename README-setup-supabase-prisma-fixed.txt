USO

1. Poné este archivo en la raíz del proyecto:
   facturacion-arca-starter\setup-supabase-prisma-fixed.ps1

2. Ejecutá:
   powershell -ExecutionPolicy Bypass -File .\setup-supabase-prisma-fixed.ps1

3. Cuando te pida la password de Supabase, pegala.

Qué corrige:
- el error de PowerShell por variables seguidas de ":"
- escapa la password por si tiene caracteres especiales
- escribe apps/api/.env
- agrega directUrl a schema.prisma si falta
- corre db:generate, db:migrate y db:seed
