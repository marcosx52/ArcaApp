param(
  [string]$ProjectRef = "rqiankcttxrspxcbugbi"
)

$ErrorActionPreference = "Stop"

Write-Host "== Supabase + Prisma setup ==" -ForegroundColor Cyan
Write-Host "Project ref: $ProjectRef"

$passwordSecure = Read-Host "Pega la database password de Supabase" -AsSecureString
$passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($passwordSecure))

$root = Get-Location
$apiEnvPath = Join-Path $root "apps/api/.env"
$schemaPath = Join-Path $root "apps/api/prisma/schema.prisma"

if (!(Test-Path $schemaPath)) {
  throw "No encontré apps/api/prisma/schema.prisma. Ejecutá este script desde la raíz del proyecto."
}

# Local dev on IPv4: use Supavisor session mode (5432) for runtime and migrations.
$databaseUrl = "postgresql://postgres.$ProjectRef:$passwordPlain@aws-1-sa-east-1.pooler.supabase.com:5432/postgres"
$directUrl   = "postgresql://postgres.$ProjectRef:$passwordPlain@aws-1-sa-east-1.pooler.supabase.com:5432/postgres"

$envContent = @"
DATABASE_URL="$databaseUrl"
DIRECT_URL="$directUrl"
PORT=3001
JWT_SECRET=dev-secret
STORAGE_DRIVER=local
"@

Set-Content -Path $apiEnvPath -Value $envContent -Encoding UTF8
Write-Host "OK .env escrito en apps/api/.env" -ForegroundColor Green

$schema = Get-Content -Raw $schemaPath

$pattern = '(?s)datasource\s+db\s*\{.*?\}'
$replacement = @"
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
"@

if ($schema -match $pattern) {
  $newSchema = [System.Text.RegularExpressions.Regex]::Replace($schema, $pattern, $replacement, 1)
  Set-Content -Path $schemaPath -Value $newSchema -Encoding UTF8
  Write-Host "OK datasource db actualizado en schema.prisma" -ForegroundColor Green
} else {
  throw "No pude encontrar el bloque datasource db en schema.prisma"
}

Write-Host ""
Write-Host "Ahora ejecuto Prisma generate + migrate + seed..." -ForegroundColor Cyan
pnpm db:generate
pnpm db:migrate
pnpm db:seed

Write-Host ""
Write-Host "Si todo salió bien, seguí con:" -ForegroundColor Cyan
Write-Host "pnpm dev:api"
Write-Host "pnpm dev:web"
