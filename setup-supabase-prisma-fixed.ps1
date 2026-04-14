param(
  [string]$ProjectRef = "rqiankcttxrspxcbugbi"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "=== Setup Supabase + Prisma ===" -ForegroundColor Cyan
Write-Host "Project ref: $ProjectRef" -ForegroundColor DarkGray
Write-Host ""

$passwordSecure = Read-Host "Pega la database password de Supabase" -AsSecureString
$ptr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($passwordSecure)
try {
  $passwordPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
}
finally {
  if ($ptr -ne [IntPtr]::Zero) {
    [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
  }
}

if ([string]::IsNullOrWhiteSpace($passwordPlain)) {
  throw "No se recibió ninguna password."
}

# Si la password tiene caracteres especiales, la escapamos para que la URL quede válida.
$encodedPassword = [System.Uri]::EscapeDataString($passwordPlain)

$databaseUrl = "postgresql://postgres.${ProjectRef}:${encodedPassword}@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
$directUrl   = "postgresql://postgres.${ProjectRef}:${encodedPassword}@aws-1-sa-east-1.pooler.supabase.com:5432/postgres"

$apiEnvPath = Join-Path $PSScriptRoot "apps\api\.env"
$schemaPath = Join-Path $PSScriptRoot "apps\api\prisma\schema.prisma"

if (-not (Test-Path $schemaPath)) {
  throw "No encuentro apps\api\prisma\schema.prisma. Ejecutá este script desde la raíz del proyecto."
}

$envContent = @"
DATABASE_URL=""$databaseUrl""
DIRECT_URL=""$directUrl""
PORT=3001
JWT_SECRET=dev-secret
STORAGE_DRIVER=local
"@

Set-Content -Path $apiEnvPath -Value $envContent -Encoding UTF8
Write-Host "OK: apps/api/.env actualizado" -ForegroundColor Green

$schema = Get-Content -Path $schemaPath -Raw

if ($schema -notmatch 'directUrl\s*=\s*env\("DIRECT_URL"\)') {
  $schema = $schema -replace 'datasource\s+db\s*\{\s*provider\s*=\s*"postgresql"\s*url\s*=\s*env\("DATABASE_URL"\)\s*\}', @'
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
'@

  Set-Content -Path $schemaPath -Value $schema -Encoding UTF8
  Write-Host "OK: schema.prisma actualizado con directUrl" -ForegroundColor Green
}
else {
  Write-Host "OK: schema.prisma ya tenía directUrl" -ForegroundColor Green
}

Write-Host ""
Write-Host "== Ejecutando Prisma ==" -ForegroundColor Cyan
pnpm db:generate
if ($LASTEXITCODE -ne 0) { throw "Falló pnpm db:generate" }

pnpm db:migrate
if ($LASTEXITCODE -ne 0) { throw "Falló pnpm db:migrate" }

pnpm db:seed
if ($LASTEXITCODE -ne 0) { throw "Falló pnpm db:seed" }

Write-Host ""
Write-Host "Listo. Prisma quedó generado, migrado y sembrado." -ForegroundColor Green
Write-Host "Siguiente paso:" -ForegroundColor Cyan
Write-Host "  pnpm dev:api"
Write-Host "  pnpm dev:web"
