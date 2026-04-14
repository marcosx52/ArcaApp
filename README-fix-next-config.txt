USO

1. Guardá este archivo en la raíz del proyecto:
   facturacion-arca-starter\fix-next-config.ps1

2. Ejecutá:
   powershell -ExecutionPolicy Bypass -File .\fix-next-config.ps1

Qué hace:
- renombra apps/web/next.config.ts a apps/web/next.config.ts.bak
- crea apps/web/next.config.mjs compatible con Next 14
- deja el frontend listo para volver a levantar
