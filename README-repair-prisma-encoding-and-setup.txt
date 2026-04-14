USO

1. Poné este archivo en la raíz del proyecto:
   facturacion-arca-starter\repair-prisma-encoding-and-setup.ps1

2. Ejecutá:
   powershell -ExecutionPolicy Bypass -File .\repair-prisma-encoding-and-setup.ps1

3. Cuando te pida la password de Supabase, pegala.

Qué arregla:
- reescribe apps/api/.env en UTF-8 sin BOM
- reescribe apps/api/prisma/schema.prisma en UTF-8 sin BOM
- elimina el BOM invisible que Prisma está rechazando
- asegura directUrl en el datasource
- corre db:generate, db:migrate y db:seed
