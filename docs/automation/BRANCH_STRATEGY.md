# Strategy recomendada para GitHub

## Ramas
- `main`: estable
- `develop` o `dev`: integración opcional
- `feature/*`: trabajo de Codex o tareas específicas

## Política recomendada
1. Nadie mergea directo a `main`
2. Todo cambio entra por PR
3. CI y CodeQL deben pasar
4. Si un PR toca:
   - auth
   - guards
   - invoices
   - prisma
   entonces hacer revisión más cuidadosa

## Cómo usarlo con Codex
Cada tarea para Codex debería:
- tener objetivo claro
- tocar un área limitada
- incluir criterio de terminado
- no refactorizar fuera de alcance
