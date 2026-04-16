# CODEX QUEUE — PRIORIDAD DE EJECUCIÓN

## LANE 1 — Hardening crítico
### B1
Reforzar seguridad por empresa:
- endurecer CompanyAccessGuard
- dejar de aceptar companyId libre donde no corresponda
- usar empresa activa del contexto de request

### B2
Corregir cálculos monetarios:
- reemplazar Number() por Decimal.js en invoices
- corregir addItem / updateItem
- no perder compatibilidad con Prisma Decimal

### B3
Corregir estado de invoices:
- recalculateTotals() NO debe marcar READY
- READY solo sale de validate()

### B4
Revisar /auth/me y endpoints protegidos:
- confirmar que todos usan guards correctos
- confirmar que no hay fallbacks peligrosos

## LANE 2 — CRUD real del panel
### B5
Customers end-to-end:
- listar
- crear
- editar
- archivar
- conectar frontend real con backend

### B6
Products end-to-end:
- listar
- crear
- editar
- archivar
- conectar frontend real con backend

### B7
Dashboard con datos reales mínimos:
- summary real desde backend
- cards del frontend consumiendo API real

## LANE 3 — Factura borrador real
### B8
Crear invoice draft real desde frontend

### B9
Agregar / editar / quitar invoice items con totales reales

### B10
Detalle de invoice + historial + validación previa

## LANE 4 — ARCA homologación real
### B11
Implementar WSAA real

### B12
Implementar WSFE real:
- FECAESolicitar
- FECompConsultar
- FECompUltimoAutorizado

### B13
Persistencia real de TA, CAE, observaciones y logs

### B14
Recheck de estado ARCA

## LANE 5 — Cierre MVP
### B15
PDF real + QR

### B16
Swagger

### B17
Rate limiting + logging estructurado

### B18
Tests mínimos
- auth
- cálculos monetarios
- mapper WSFE

---

# Orden recomendado real
1. B1
2. B2
3. B3
4. B5
5. B6
6. B8
7. B9
8. B10
9. B11
10. B12
11. B13
12. B15
13. B16
14. B17
15. B18
