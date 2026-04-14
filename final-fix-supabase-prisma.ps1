param(
  [string]$ProjectRef = "rqiankcttxrspxcbugbi"
)

$ErrorActionPreference = "Stop"

function Write-Utf8NoBom {
  param(
    [Parameter(Mandatory=$true)][string]$Path,
    [Parameter(Mandatory=$true)][string]$Content
  )
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $Content, $utf8NoBom)
}

function Mask-Url {
  param([string]$Url)
  if ([string]::IsNullOrWhiteSpace($Url)) { return $Url }
  return ($Url -replace ':(.*?)@', ':********@')
}

Write-Host ""
Write-Host "=== Final fix Supabase URL + Prisma ===" -ForegroundColor Cyan
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

$passwordPlain = $passwordPlain.Trim()
$encodedPassword = [System.Uri]::EscapeDataString($passwordPlain)

# Usamos session pooler 5432 para app y migraciones, para evitar IPv6/direct por ahora.
$databaseUrl = "postgresql://postgres.${ProjectRef}:${encodedPassword}@aws-1-sa-east-1.pooler.supabase.com:5432/postgres"
$directUrl   = "postgresql://postgres.${ProjectRef}:${encodedPassword}@aws-1-sa-east-1.pooler.supabase.com:5432/postgres"

$apiEnvPath = Join-Path $PSScriptRoot "apps\api\.env"
$schemaPath = Join-Path $PSScriptRoot "apps\api\prisma\schema.prisma"

if (-not (Test-Path $schemaPath)) {
  throw "No encuentro apps\api\prisma\schema.prisma. Ejecutá este script desde la raíz del proyecto."
}

$envContent = @"
DATABASE_URL=$databaseUrl
DIRECT_URL=$directUrl
PORT=3001
JWT_SECRET=dev-secret
STORAGE_DRIVER=local
"@

Write-Utf8NoBom -Path $apiEnvPath -Content $envContent
Write-Host "OK: apps/api/.env reescrito sin comillas y sin BOM" -ForegroundColor Green

$schema = Get-Content -Path $schemaPath -Raw
$schema = $schema.TrimStart([char]0xFEFF)

if ($schema -notmatch 'directUrl\s*=\s*env\("DIRECT_URL"\)') {
  $schema = $schema -replace 'datasource\s+db\s*\{\s*provider\s*=\s*"postgresql"\s*url\s*=\s*env\("DATABASE_URL"\)\s*\}', @'
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
'@
  Write-Utf8NoBom -Path $schemaPath -Content $schema
  Write-Host "OK: schema.prisma actualizado con directUrl" -ForegroundColor Green
} else {
  Write-Utf8NoBom -Path $schemaPath -Content $schema
  Write-Host "OK: schema.prisma reescrito sin BOM" -ForegroundColor Green
}

Write-Host ""
Write-Host "DATABASE_URL => $(Mask-Url $databaseUrl)" -ForegroundColor DarkGray
Write-Host "DIRECT_URL   => $(Mask-Url $directUrl)" -ForegroundColor DarkGray
Write-Host ""

Write-Host "== Validando Prisma schema ==" -ForegroundColor Cyan
pnpm --filter api prisma validate
if ($LASTEXITCODE -ne 0) { throw "Fallo prisma validate" }

Write-Host ""
Write-Host "== Ejecutando Prisma ==" -ForegroundColor Cyan
pnpm db:generate
if ($LASTEXITCODE -ne 0) { throw "Fallo pnpm db:generate" }

pnpm db:migrate
if ($LASTEXITCODE -ne 0) { throw "Fallo pnpm db:migrate" }

pnpm db:seed
if ($LASTEXITCODE -ne 0) { throw "Fallo pnpm db:seed" }

Write-Host ""
Write-Host "Listo. Prisma quedó generado, migrado y sembrado." -ForegroundColor Green
Write-Host "Siguiente paso:" -ForegroundColor Cyan
Write-Host "  pnpm dev:api"
Write-Host "  pnpm dev:web"
