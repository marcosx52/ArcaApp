'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  ArrowRight,
  Building2,
  MapPin,
  RefreshCw,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/feedback/empty-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { StatusBadge } from '@/components/feedback/status-badge';
import { mapError } from '@/lib/error-mapping';
import { getActiveCompanyId, setActiveCompanyId } from '@/lib/auth';
import { CompanyForm } from './company-form';
import {
  companyOnboardingStatusLabel,
  companyOnboardingStatusTone,
  formatCompanyLocation,
  readinessStatusLabel,
  readinessStatusTone,
  toFormValues,
  toUpdateInput,
  type CompanyFormValues,
  type CompanyRecord,
} from '../lib/company';
import { getCompany, getCompanyReadiness, listCompanies, updateCompany } from '../lib/company-api';

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function summarizeReadiness(checks: Array<{ status: 'ok' | 'warning' | 'blocked' }>) {
  return checks.reduce(
    (acc, check) => {
      acc[check.status] += 1;
      acc.total += 1;
      return acc;
    },
    { ok: 0, warning: 0, blocked: 0, total: 0 },
  );
}

export function CompanyScreen() {
  const queryClient = useQueryClient();
  const [activeCompanyId, setActiveCompanyIdState] = useState<string | null>(null);

  const companiesQuery = useQuery({
    queryKey: ['companies'],
    queryFn: listCompanies,
  });

  useEffect(() => {
    setActiveCompanyIdState(getActiveCompanyId());
  }, []);

  useEffect(() => {
    const companies = companiesQuery.data ?? [];
    if (companies.length === 0) return;

    const isCurrentValid = activeCompanyId ? companies.some((company) => company.id === activeCompanyId) : false;
    if (isCurrentValid) return;

    const fallbackCompanyId = companies[0]?.id ?? null;
    if (fallbackCompanyId) {
      setActiveCompanyIdState(fallbackCompanyId);
      setActiveCompanyId(fallbackCompanyId);
    }
  }, [activeCompanyId, companiesQuery.data]);

  const selectedCompany = useMemo(() => {
    const companies = companiesQuery.data ?? [];
    return companies.find((company) => company.id === activeCompanyId) ?? null;
  }, [activeCompanyId, companiesQuery.data]);

  const companyQuery = useQuery({
    queryKey: ['companies', activeCompanyId],
    queryFn: () => getCompany(activeCompanyId ?? ''),
    enabled: Boolean(activeCompanyId),
  });

  const readinessQuery = useQuery({
    queryKey: ['companies', activeCompanyId, 'readiness'],
    queryFn: () => getCompanyReadiness(activeCompanyId ?? ''),
    enabled: Boolean(activeCompanyId),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      companyId,
      values,
    }: {
      companyId: string;
      values: CompanyFormValues;
    }) => updateCompany(companyId, toUpdateInput(values)),
    onSuccess: async (updatedCompany) => {
      queryClient.setQueryData<CompanyRecord>(['companies', updatedCompany.id], updatedCompany);
      queryClient.setQueryData<CompanyRecord[]>(['companies'], (current) =>
        current?.map((company) => (company.id === updatedCompany.id ? updatedCompany : company)),
      );
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['companies', updatedCompany.id] }),
        queryClient.invalidateQueries({ queryKey: ['companies', updatedCompany.id, 'readiness'] }),
        queryClient.invalidateQueries({ queryKey: ['companies'] }),
      ]);
    },
  });

  if (companiesQuery.isLoading) {
    return <LoadingState label="Cargando empresas..." />;
  }

  if (companiesQuery.isError) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>No pudimos cargar las empresas</CardTitle>
            <CardDescription>{mapError(companiesQuery.error)}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => companiesQuery.refetch()}>Reintentar</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const companies = companiesQuery.data ?? [];

  if (companies.length === 0) {
    return (
      <EmptyState
        title="No hay empresas disponibles"
        description="Tu usuario no tiene empresas asociadas todavía, así que no hay nada para mostrar ni editar."
      />
    );
  }

  const company = companyQuery.data ?? selectedCompany;
  const companyFormValues = company ? toFormValues(company) : null;
  const readiness = readinessQuery.data?.data ?? null;
  const readinessChecks = readiness?.checks ?? [];
  const readinessSummary = summarizeReadiness(readinessChecks);
  const readinessPercent = readinessSummary.total > 0 ? Math.round((readinessSummary.ok / readinessSummary.total) * 100) : 0;
  const contactLabel = company
    ? [company.email, company.phone].filter(Boolean).join(' · ') || 'Sin contacto'
    : 'Sin contacto';

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-slate-900/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
        <CardContent className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
              <Sparkles className="h-3.5 w-3.5" />
              Empresa activa desde localStorage
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">Empresa</h1>
              <p className="max-w-2xl text-sm text-white/70">
                Editamos la empresa activa con datos reales de `/companies/:id` y resumimos el readiness para saber si está
                lista para homologación o producción.
              </p>
            </div>
            {company ? (
              <div className="flex flex-wrap gap-2">
                <StatusBadge tone={companyOnboardingStatusTone[company.onboardingStatus]}>
                  {companyOnboardingStatusLabel[company.onboardingStatus]}
                </StatusBadge>
                <StatusBadge tone="default">{company.cuit}</StatusBadge>
              </div>
            ) : null}
          </div>

          {company ? (
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-white/50">Empresa</p>
                <p className="mt-1 font-medium">{company.legalName}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-white/50">Última edición</p>
                <p className="mt-1 font-medium">{formatDateTime(company.updatedAt)}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-white/50">Readiness</p>
                <p className="mt-1 font-medium">
                  {readinessQuery.isLoading ? 'Cargando...' : `${readinessPercent}% listo`}
                </p>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.6fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div>
                <CardTitle>Empresas accesibles</CardTitle>
                <CardDescription>Seleccioná cuál queda activa en `localStorage`.</CardDescription>
              </div>
                <Button
                  type="button"
                  variant="outline"
                  aria-label="Refrescar empresas"
                  onClick={() => companiesQuery.refetch()}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {companies.map((item) => {
                const isActive = item.id === activeCompanyId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveCompanyIdState(item.id);
                      setActiveCompanyId(item.id);
                    }}
                    className={`w-full rounded-3xl border p-4 text-left transition ${
                      isActive
                        ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="font-medium">{item.legalName}</p>
                        <p className={`text-sm ${isActive ? 'text-white/70' : 'text-slate-500'}`}>{item.cuit}</p>
                      </div>
                      <StatusBadge tone={isActive ? 'success' : 'default'}>
                        {isActive ? 'Activa' : 'Cambiar'}
                      </StatusBadge>
                    </div>
                    <div className={`mt-3 flex items-center gap-2 text-sm ${isActive ? 'text-white/70' : 'text-slate-500'}`}>
                      <ArrowRight className="h-4 w-4" />
                      {item.tradeName ?? 'Sin nombre de fantasía'}
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumen operativo</CardTitle>
              <CardDescription>Datos útiles para ubicar el contexto fiscal y operativo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-start gap-3 rounded-3xl border border-slate-200 p-4">
                <div className="rounded-2xl bg-slate-100 p-2 text-slate-700">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-slate-500">Razón social</p>
                  <p className="font-medium text-slate-900">{company?.legalName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-3xl border border-slate-200 p-4">
                <div className="rounded-2xl bg-slate-100 p-2 text-slate-700">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-slate-500">Ubicación</p>
                  <p className="font-medium text-slate-900">
                    {company ? formatCompanyLocation(company) || 'Sin dirección cargada' : 'Sin datos'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-3xl border border-slate-200 p-4">
                <div className="rounded-2xl bg-slate-100 p-2 text-slate-700">
                  <UserRound className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-slate-500">Contacto</p>
                  <p className="font-medium text-slate-900">{contactLabel}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {companyQuery.isLoading ? <LoadingState label="Cargando detalle de la empresa..." /> : null}

          {companyQuery.isError ? (
            <Card>
              <CardHeader>
                <CardTitle>No pudimos abrir la empresa activa</CardTitle>
                <CardDescription>{mapError(companyQuery.error)}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button onClick={() => companyQuery.refetch()}>Reintentar</Button>
              </CardContent>
            </Card>
          ) : null}

          {company ? (
            <CompanyForm
              key={company.id}
              title={`Editar empresa: ${company.legalName}`}
              description="Los cambios se guardan en `/companies/:id` y refrescan el readiness asociado."
              submitLabel="Guardar cambios"
              defaultValues={companyFormValues ?? toFormValues(company)}
              isSubmitting={updateMutation.isPending}
              onSubmit={async (values) => {
                await updateMutation.mutateAsync({ companyId: company.id, values });
              }}
              footer={
                <Link
                  href="/arca-config"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
                >
                  Ver ARCA
                  <ArrowRight className="h-4 w-4" />
                </Link>
              }
            />
          ) : null}

          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div>
                <CardTitle>Readiness</CardTitle>
                <CardDescription>Resumen útil para saber qué falta antes de operar en serio.</CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                aria-label="Refrescar readiness"
                onClick={() => readinessQuery.refetch()}
                disabled={!activeCompanyId}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-5">
              {readinessQuery.isLoading ? <LoadingState label="Cargando readiness..." /> : null}

              {readinessQuery.isError ? (
                <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <p className="font-medium">No pudimos cargar el readiness.</p>
                  <p className="mt-1">{mapError(readinessQuery.error)}</p>
                </div>
              ) : null}

              {readiness ? (
                <>
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-3xl border border-slate-200 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Completos</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900">{readinessSummary.ok}</p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Revisiones</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900">{readinessSummary.warning}</p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Bloqueos</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900">{readinessSummary.blocked}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <StatusBadge tone={readiness.isReadyForHomologation ? 'success' : 'warning'}>
                      {readiness.isReadyForHomologation ? 'Lista para homologación' : 'Todavía no lista para homologación'}
                    </StatusBadge>
                    <StatusBadge tone={readiness.isReadyForProduction ? 'success' : 'warning'}>
                      {readiness.isReadyForProduction ? 'Lista para producción' : 'Todavía no lista para producción'}
                    </StatusBadge>
                    <StatusBadge tone={company ? companyOnboardingStatusTone[company.onboardingStatus] : 'default'}>
                      {readiness.onboardingStatus ? companyOnboardingStatusLabel[readiness.onboardingStatus] : 'Sin estado'}
                    </StatusBadge>
                  </div>

                  <div className="space-y-3">
                    {readinessChecks.map((check) => (
                      <div key={check.key} className="flex items-start justify-between gap-4 rounded-3xl border border-slate-200 p-4">
                        <div className="space-y-1">
                          <p className="font-medium text-slate-900">{check.key}</p>
                          <p className="text-sm text-slate-500">{check.message}</p>
                        </div>
                        <StatusBadge tone={readinessStatusTone[check.status]}>
                          {readinessStatusLabel[check.status]}
                        </StatusBadge>
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>

          {updateMutation.isError ? (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-800">No pudimos guardar la empresa</CardTitle>
                <CardDescription className="text-red-700">{mapError(updateMutation.error)}</CardDescription>
              </CardHeader>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
