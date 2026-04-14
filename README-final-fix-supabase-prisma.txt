USO

1. Guardá este archivo en la raíz del proyecto:
   facturacion-arca-starter\final-fix-supabase-prisma.ps1

2. Ejecutá:
   powershell -ExecutionPolicy Bypass -File .\final-fix-supabase-prisma.ps1

3. Cuando te pida la password de Supabase, pegala.

Qué hace:
- limpia espacios accidentales de la password
- la escapa para URL
- reescribe apps/api/.env sin comillas
- reescribe schema.prisma sin BOM
- valida Prisma
- corre generate, migrate y seed
- muestra URLs redactadas para revisar formato
