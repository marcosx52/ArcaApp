$ErrorActionPreference = "Stop"

function Write-Utf8NoBom {
  param(
    [Parameter(Mandatory=$true)][string]$Path,
    [Parameter(Mandatory=$true)][string]$Content
  )
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $Content, $utf8NoBom)
}

Write-Host ""
Write-Host "=== Fix Next.js config for apps/web ===" -ForegroundColor Cyan
Write-Host ""

$webDir = Join-Path $PSScriptRoot "apps\web"
$tsConfigPath = Join-Path $webDir "next.config.ts"
$mjsConfigPath = Join-Path $webDir "next.config.mjs"
$backupPath = Join-Path $webDir "next.config.ts.bak"

if (-not (Test-Path $webDir)) {
  throw "No encuentro apps\web. Ejecutá este script desde la raíz del proyecto."
}

if (Test-Path $tsConfigPath) {
  Move-Item -Force $tsConfigPath $backupPath
  Write-Host "OK: next.config.ts renombrado a next.config.ts.bak" -ForegroundColor Green
} else {
  Write-Host "OK: next.config.ts no existe, sigo igual" -ForegroundColor Green
}

$mjsContent = @'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
'@

Write-Utf8NoBom -Path $mjsConfigPath -Content $mjsContent
Write-Host "OK: apps/web/next.config.mjs creado" -ForegroundColor Green

Write-Host ""
Write-Host "Siguiente paso:" -ForegroundColor Cyan
Write-Host "  pnpm dev:web"
