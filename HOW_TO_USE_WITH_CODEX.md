# Cómo usar este paquete con Codex

## Flujo sugerido
1. Elegir una tarea de `CODEX QUEUE`
2. Copiar uno de los prompts de `FIRST PROMPTS TO USE WITH CODEX`
3. Ajustarlo si hace falta
4. Ejecutar la tarea en una rama nueva
5. Dejar que CI y CodeQL revisen
6. Recién después mergear

## Recomendación
No darle a Codex más de una tarea de backend crítica al mismo tiempo.
Sí podés correr en paralelo:
- un lane de hardening
- un lane de frontend CRUD
siempre que no toquen los mismos archivos.

## Definición práctica
Codex = ejecutor
GitHub Actions = checker
CodeQL = scanner
Vos = decisor final
