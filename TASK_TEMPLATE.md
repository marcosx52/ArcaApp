# TASK TEMPLATE FOR CODEX

## Título
[poner título de la tarea]

## Objetivo
[qué se quiere lograr]

## Alcance
[qué sí entra]

## Fuera de alcance
[qué NO entra]

## Archivos que puede tocar
- [lista de archivos/carpetas]

## Restricciones
- no refactorizar fuera del alcance
- mantener arquitectura actual
- no tocar mocks/ARCA salvo que se pida
- no romper builds

## Criterio de terminado
- [lista verificable]

## Checks que debe pasar
- pnpm --filter api build
- pnpm --filter web build
- pnpm --filter api prisma validate   (si toca prisma)
- [agregar tests puntuales si aplica]

## Entrega esperada
1. resumen
2. archivos completos
3. comandos
4. cómo probar
