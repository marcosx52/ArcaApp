'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, FileWarning, ReceiptText, ShieldCheck, Wallet } from 'lucide-react';
import { LoadingState } from '@/components/feedback/loading-state';
import { StatusBadge } from '@/components/feedback/status-badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { mapError } from '@/lib/error-mapping';
import { getDashboardSummary } from '../lib/dashboard-api';

function formatCurrency(value: string) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function DashboardScreen() {
  const summaryQuery = useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: getDashboardSummary,
  });

  if (summaryQuery.isLoading) {
    return <LoadingState label="Cargando resumen operativo..." />;
  }

  if (summaryQuery.isError) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        <p className="font-medium">No pudimos cargar el dashboard.</p>
        <p className="mt-1">{mapError(summaryQuery.error)}</p>
      </div>
    );
  }

  const summary = summaryQuery.data?.data;

  if (!summary) {
    return <LoadingState label="Preparando panel..." />;
  }

  const cards = [
    { title: 'Facturado', value: formatCurrency(summary.todayTotalAmount), icon: Wallet },
    { title: 'Emitidos', value: String(summary.todayIssuedCount), icon: ReceiptText },
    { title: 'Borradores', value: String(summary.draftCount), icon: FileWarning },
    {
      title: 'Readiness',
      value: summary.readiness.isReadyForProduction ? 'Produccion lista' : 'En preparacion',
      icon: ShieldCheck,
    },
  ];

  const operationalNotes = [
    summary.todayIssuedCount
      ? `Hay ${summary.todayIssuedCount} comprobante(s) emitido(s) para la empresa activa.`
      : 'Todavia no hay comprobantes emitidos para la empresa activa.',
    summary.draftCount
      ? `Hay ${summary.draftCount} borrador(es) que conviene revisar antes de emitir.`
      : 'No hay borradores pendientes en este momento.',
    summary.failedCount
      ? `Atencion: hay ${summary.failedCount} comprobante(s) con error para revisar.`
      : 'No se registran comprobantes fallidos en el resumen actual.',
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.title}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{item.title}</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-50">{item.value}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-100 p-3 text-slate-700 dark:bg-slate-800 dark:text-slate-100">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Panorama operativo</CardTitle>
            <CardDescription>Lectura rapida del estado actual, basada en datos reales del backend.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {operationalNotes.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-700 dark:border-slate-800 dark:text-slate-200"
              >
                {item}
              </div>
            ))}

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/invoices"
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white"
              >
                Ver comprobantes
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/arca-config"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-100 dark:hover:bg-slate-900"
              >
                Revisar ARCA
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado del canal</CardTitle>
            <CardDescription>Readiness resumido para homologacion y produccion.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Onboarding</span>
              <StatusBadge tone="warning">{summary.readiness.onboardingStatus}</StatusBadge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Homologacion</span>
              <StatusBadge tone={summary.readiness.isReadyForHomologation ? 'success' : 'warning'}>
                {summary.readiness.isReadyForHomologation ? 'Lista' : 'Pendiente'}
              </StatusBadge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Produccion</span>
              <StatusBadge tone={summary.readiness.isReadyForProduction ? 'success' : 'danger'}>
                {summary.readiness.isReadyForProduction ? 'Lista' : 'No lista'}
              </StatusBadge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
