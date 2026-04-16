'use client';

import { BadgeCheck, CircleAlert, Clock3, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/feedback/status-badge';
import { readinessTone, type TaxConfigReadinessPayload } from '../lib/tax-config';

type ArcaReadinessSummaryProps = {
  readiness?: TaxConfigReadinessPayload;
};

function readinessLabel(status: TaxConfigReadinessPayload['checks'][number]['status']) {
  switch (status) {
    case 'ok':
      return 'Listo';
    case 'error':
      return 'Error';
    case 'warning':
    default:
      return 'Revision';
  }
}

export function ArcaReadinessSummary({ readiness }: ArcaReadinessSummaryProps) {
  const checks = readiness?.checks ?? [];
  const okCount = checks.filter((check) => check.status === 'ok').length;
  const warningCount = checks.filter((check) => check.status === 'warning').length;
  const errorCount = checks.filter((check) => check.status === 'error').length;
  const completedPercent = checks.length > 0 ? Math.round((okCount / checks.length) * 100) : 0;

  return (
    <Card className="border-slate-200 bg-white/90 shadow-sm">
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-2 text-slate-500">
          <ShieldCheck className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-[0.2em]">Readiness</span>
        </div>
        <CardTitle>Resumen tecnico y fiscal</CardTitle>
        <CardDescription>Estado actual del canal ARCA para la empresa activa.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-500">
              <BadgeCheck className="h-4 w-4" />
              OK
            </div>
            <p className="mt-2 text-2xl font-semibold">{okCount}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-500">
              <CircleAlert className="h-4 w-4" />
              Revision
            </div>
            <p className="mt-2 text-2xl font-semibold">{warningCount}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-500">
              <Clock3 className="h-4 w-4" />
              Pendientes
            </div>
            <p className="mt-2 text-2xl font-semibold">{errorCount}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-900">Cobertura de checks</p>
              <p className="text-xs text-slate-500">
                {checks.length > 0 ? `${completedPercent}% resuelto sobre ${checks.length} validaciones` : 'Sin validaciones aun'}
              </p>
            </div>
            <StatusBadge tone={errorCount > 0 ? 'danger' : warningCount > 0 ? 'warning' : 'success'}>
              {errorCount > 0 ? 'Bloqueado' : warningCount > 0 ? 'En revision' : 'Listo'}
            </StatusBadge>
          </div>

          <div className="mt-4 space-y-3">
            {checks.length > 0 ? (
              checks.map((check) => (
                <div key={check.key} className="flex items-start justify-between gap-4 rounded-2xl bg-slate-50 p-3">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">{check.key}</p>
                    <p className="mt-1 text-sm text-slate-500">{check.message}</p>
                  </div>
                  <StatusBadge tone={readinessTone(check.status)}>{readinessLabel(check.status)}</StatusBadge>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">Todavia no hay checks devueltos por el backend.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

