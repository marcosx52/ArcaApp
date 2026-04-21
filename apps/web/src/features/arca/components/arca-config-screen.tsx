'use client';

import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Building2, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/feedback/empty-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { StatusBadge } from '@/components/feedback/status-badge';
import { getActiveCompanyId } from '@/lib/auth';
import { mapError } from '@/lib/error-mapping';
import { ArcaReadinessSummary } from './arca-readiness-summary';
import { getTaxConfigReadiness, listTaxConfigs } from '../lib/tax-config-api';
import {
  arcaEnvironmentLabels,
  type ArcaEnvironment,
  type TaxConfigReadinessPayload,
  type TaxConfigRecord,
} from '../lib/tax-config';
import { TaxConfigEditor } from './tax-config-editor';

function groupByEnvironment(configs: TaxConfigRecord[]) {
  return configs.reduce<Record<ArcaEnvironment, TaxConfigRecord | undefined>>(
    (acc, config) => {
      acc[config.environment] = config;
      return acc;
    },
    { TESTING: undefined, PRODUCTION: undefined },
  );
}

function normalizeReadiness(readiness?: TaxConfigReadinessPayload) {
  const checks = readiness?.checks ?? [];
  const readyChecks = checks.filter((check) => check.status === 'ok').length;
  const warningChecks = checks.filter((check) => check.status === 'warning').length;
  const errorChecks = checks.filter((check) => check.status === 'error').length;

  return { checks, readyChecks, warningChecks, errorChecks };
}

export function ArcaConfigScreen() {
  const companyId = getActiveCompanyId();

  const configsQuery = useQuery({
    queryKey: ['arca', 'tax-config', companyId],
    queryFn: () => listTaxConfigs(companyId ?? ''),
    enabled: Boolean(companyId),
  });

  const readinessQuery = useQuery({
    queryKey: ['arca', 'tax-config', 'readiness', companyId],
    queryFn: () => getTaxConfigReadiness(companyId ?? ''),
    enabled: Boolean(companyId),
  });

  if (!companyId) {
    return (
      <EmptyState
        title="No hay empresa activa"
        description="Selecciona una empresa para ver y editar la configuracion ARCA."
        actionLabel="Ir a empresa"
        actionHref="/company"
      />
    );
  }

  if (configsQuery.isLoading || readinessQuery.isLoading) {
    return <LoadingState label="Cargando configuracion ARCA..." />;
  }

  if (configsQuery.isError) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5" />
          <div className="space-y-1">
            <p className="font-medium">No pudimos cargar la configuracion ARCA</p>
            <p className="text-sm">{mapError(configsQuery.error)}</p>
          </div>
        </div>
        <button
          type="button"
          className="mt-4 inline-flex items-center justify-center rounded-2xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
          onClick={() => configsQuery.refetch()}
        >
          Reintentar
        </button>
      </div>
    );
  }

  const configs = configsQuery.data ?? [];
  const configByEnvironment = groupByEnvironment(configs);
  const readiness = readinessQuery.data;
  const summary = normalizeReadiness(readiness);
  const totalConfigs = configs.length;

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white shadow-sm">
        <CardHeader className="relative">
          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                <Sparkles className="h-3.5 w-3.5" />
                Vertical ARCA real
              </div>
              <CardTitle className="text-2xl text-white">Configuracion fiscal de la empresa activa</CardTitle>
              <CardDescription className="max-w-2xl text-slate-300">
                Lectura y edicion real de `tax-config` con readiness separado para ver que falta antes de homologacion o produccion.
              </CardDescription>
            </div>
            <StatusBadge tone={summary.errorChecks > 0 ? 'danger' : summary.warningChecks > 0 ? 'warning' : 'success'}>
              {totalConfigs > 0 ? `${totalConfigs} config(s)` : 'Sin configuracion'}
            </StatusBadge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-300">
              <Building2 className="h-4 w-4" />
              Empresa activa
            </div>
            <p className="mt-3 break-all text-sm font-medium text-white">{companyId}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-300">
              <AlertTriangle className="h-4 w-4" />
              Readiness
            </div>
            <p className="mt-3 text-sm font-medium text-white">
              {summary.readyChecks}/{summary.checks.length || 0} checks listos
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-300">
              <Sparkles className="h-4 w-4" />
              Ambientes
            </div>
            <p className="mt-3 text-sm font-medium text-white">Testing y produccion editables desde esta pantalla</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Configuraciones cargadas</CardTitle>
            <CardDescription>Lista real obtenida desde `GET /tax-config`.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {configs.length > 0 ? (
              configs.map((config) => (
                <div
                  key={config.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900">{arcaEnvironmentLabels[config.environment]}</p>
                      <StatusBadge
                        tone={
                          config.configStatus === 'VALIDATED'
                            ? 'success'
                            : config.configStatus === 'BLOCKED'
                              ? 'danger'
                              : 'warning'
                        }
                      >
                        {config.configStatus}
                      </StatusBadge>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {config.arcaServiceType || 'Sin service type'} - {config.defaultCurrency || 'Sin moneda'}
                    </p>
                  </div>
                  <div className="text-right text-sm text-slate-500">
                    <p>{config.homologationEnabled ? 'Homologacion activa' : 'Homologacion inactiva'}</p>
                    <p>{config.productionEnabled ? 'Produccion activa' : 'Produccion inactiva'}</p>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                title="Todavia no hay tax config cargada"
                description="Creala desde uno de los formularios de abajo. El backend hace upsert por ambiente."
              />
            )}
          </CardContent>
        </Card>

        <ArcaReadinessSummary readiness={readiness} />
      </div>

      {readinessQuery.isError ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-medium">No pudimos cargar el readiness.</p>
          <p className="mt-1">{mapError(readinessQuery.error)}</p>
          <button
            type="button"
            className="mt-4 inline-flex items-center justify-center rounded-2xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
            onClick={() => readinessQuery.refetch()}
          >
            Reintentar
          </button>
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        <TaxConfigEditor companyId={companyId} environment="TESTING" config={configByEnvironment.TESTING} />
        <TaxConfigEditor companyId={companyId} environment="PRODUCTION" config={configByEnvironment.PRODUCTION} />
      </div>
    </div>
  );
}
