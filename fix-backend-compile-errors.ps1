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
Write-Host "=== Fix backend compile errors ===" -ForegroundColor Cyan
Write-Host ""

$servicePath = Join-Path $PSScriptRoot "apps\api\src\modules\invoice-events\invoice-events.service.ts"

if (-not (Test-Path $servicePath)) {
  throw "No encuentro apps\api\src\modules\invoice-events\invoice-events.service.ts. Ejecutá este script desde la raíz del proyecto."
}

$serviceContent = @'
import { Injectable } from '@nestjs/common';
import { InvoiceEventType, InvoiceStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class InvoiceEventsService {
  constructor(private readonly prisma: PrismaService) {}

  findByInvoice(invoiceId: string) {
    return this.prisma.invoiceEvent.findMany({
      where: { invoiceId },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(data: {
    invoiceId: string;
    companyId: string;
    actorUserId?: string;
    eventType: InvoiceEventType;
    previousStatus?: InvoiceStatus;
    newStatus?: InvoiceStatus;
    message?: string;
    payloadSnapshot?: Prisma.InputJsonValue;
  }) {
    const createData: Prisma.InvoiceEventUncheckedCreateInput = {
      invoiceId: data.invoiceId,
      companyId: data.companyId,
      actorUserId: data.actorUserId,
      eventType: data.eventType,
      previousStatus: data.previousStatus,
      newStatus: data.newStatus,
      message: data.message,
      payloadSnapshot: data.payloadSnapshot,
    };

    return this.prisma.invoiceEvent.create({
      data: createData,
    });
  }
}
'@

Write-Utf8NoBom -Path $servicePath -Content $serviceContent
Write-Host "OK: invoice-events.service.ts corregido" -ForegroundColor Green

Write-Host ""
Write-Host "== Instalando joi en apps/api ==" -ForegroundColor Cyan
pnpm --filter api add joi
if ($LASTEXITCODE -ne 0) { throw "Fallo la instalación de joi" }

Write-Host ""
Write-Host "Listo. Ahora corré:" -ForegroundColor Green
Write-Host "  pnpm dev:api"
Write-Host "  pnpm dev:web"
