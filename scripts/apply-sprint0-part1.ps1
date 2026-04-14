$ErrorActionPreference = 'Stop'

Write-Host ''
Write-Host '=== Aplicando Sprint 0 - Parte 1 ===' -ForegroundColor Cyan
Write-Host ''

pnpm --filter api install
if ($LASTEXITCODE -ne 0) { throw 'Falló pnpm --filter api install' }

$apiEnvPath = Join-Path $PSScriptRoot '..\apps\api\.env'
if (Test-Path $apiEnvPath) {
  $envText = Get-Content $apiEnvPath -Raw
  if ($envText -notmatch 'CORS_ORIGIN=') {
    Add-Content -Path $apiEnvPath -Value "`r`nCORS_ORIGIN=http://localhost:3000`r`nJWT_EXPIRES_IN=8h"
    Write-Host 'OK: apps/api/.env actualizado con CORS_ORIGIN y JWT_EXPIRES_IN' -ForegroundColor Green
  } else {
    Write-Host 'OK: apps/api/.env ya tenía CORS_ORIGIN' -ForegroundColor Green
  }
}

Write-Host ''
Write-Host 'Siguiente paso:' -ForegroundColor Cyan
Write-Host '  pnpm dev:api'
Write-Host '  pnpm dev:web'
