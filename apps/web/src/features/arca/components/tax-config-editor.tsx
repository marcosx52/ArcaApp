'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Save, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/feedback/status-badge';
import { mapError } from '@/lib/error-mapping';
import { upsertTaxConfig } from '../lib/tax-config-api';
import {
  arcaEnvironmentLabels,
  configStatusLabels,
  formatTaxConfigUpdatedAt,
  taxConfigStatusTone,
  toFormValues,
  toUpsertInput,
  type ArcaEnvironment,
  type TaxConfigFormValues,
  type TaxConfigRecord,
} from '../lib/tax-config';

type TaxConfigEditorProps = {
  companyId: string;
  environment: ArcaEnvironment;
  config?: TaxConfigRecord;
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{children}</span>;
}

function ToggleButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border px-4 py-2 text-sm font-medium transition ${
        active ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
      }`}
    >
      {label}
    </button>
  );
}

function TaxConfigFormField({
  label,
  helper,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  helper?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="space-y-2">
      <div className="flex items-end justify-between gap-3">
        <FieldLabel>{label}</FieldLabel>
        {helper ? <span className="text-xs text-slate-400">{helper}</span> : null}
      </div>
      <Input value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function TaxConfigTextareaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="space-y-2 md:col-span-2">
      <FieldLabel>{label}</FieldLabel>
      <textarea
        className="min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

export function TaxConfigEditor({ companyId, environment, config }: TaxConfigEditorProps) {
  const queryClient = useQueryClient();
  const [values, setValues] = useState<TaxConfigFormValues>(() => toFormValues(config));

  useEffect(() => {
    setValues(toFormValues(config));
  }, [config]);

  const mutation = useMutation({
    mutationFn: (payload: TaxConfigFormValues) => upsertTaxConfig(companyId, toUpsertInput(environment, payload)),
    onSuccess: async (savedConfig) => {
      queryClient.setQueryData(['arca', 'tax-config', companyId], (current: TaxConfigRecord[] | undefined) => {
        const configs = current ?? [];
        const next = configs.filter((item) => item.environment !== environment);
        next.push(savedConfig);
        next.sort((a, b) => a.environment.localeCompare(b.environment));
        return next;
      });

      await queryClient.invalidateQueries({ queryKey: ['arca', 'tax-config', companyId] });
      await queryClient.invalidateQueries({ queryKey: ['arca', 'tax-config', 'readiness', companyId] });
    },
  });

  const currentStatus = config?.configStatus ?? 'INCOMPLETE';

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              <Sparkles className="h-4 w-4" />
              {arcaEnvironmentLabels[environment]}
            </div>
            <CardTitle>{arcaEnvironmentLabels[environment]} config</CardTitle>
            <CardDescription>Edicion funcional conectada a `PUT /tax-config`.</CardDescription>
          </div>
          <StatusBadge tone={taxConfigStatusTone(currentStatus)}>{configStatusLabels[currentStatus]}</StatusBadge>
        </div>
        <div className="text-xs text-slate-500">Ultima actualizacion: {formatTaxConfigUpdatedAt(config?.updatedAt)}</div>
      </CardHeader>

      <CardContent>
        <form
          className="space-y-5"
          onSubmit={async (event) => {
            event.preventDefault();
            await mutation.mutateAsync(values);
          }}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <TaxConfigFormField
              label="ARCA service type"
              helper="Ej. wsfev1"
              value={values.arcaServiceType}
              onChange={(value) => setValues((current) => ({ ...current, arcaServiceType: value }))}
            />
            <TaxConfigFormField
              label="Next invoice flow"
              helper="Modo de emision"
              value={values.nextInvoiceFlowMode}
              onChange={(value) => setValues((current) => ({ ...current, nextInvoiceFlowMode: value }))}
            />
            <TaxConfigFormField
              label="Default currency"
              helper="Ej. PES"
              value={values.defaultCurrency}
              onChange={(value) => setValues((current) => ({ ...current, defaultCurrency: value }))}
            />
            <TaxConfigFormField
              label="Default invoice type C"
              value={values.defaultInvoiceTypeC}
              onChange={(value) => setValues((current) => ({ ...current, defaultInvoiceTypeC: value }))}
            />
            <TaxConfigFormField
              label="Default invoice type B"
              value={values.defaultInvoiceTypeB}
              onChange={(value) => setValues((current) => ({ ...current, defaultInvoiceTypeB: value }))}
            />
            <div className="space-y-2">
              <FieldLabel>Production enabled</FieldLabel>
              <div className="flex flex-wrap gap-2">
                <ToggleButton
                  label="Si"
                  active={values.productionEnabled}
                  onClick={() => setValues((current) => ({ ...current, productionEnabled: true }))}
                />
                <ToggleButton
                  label="No"
                  active={!values.productionEnabled}
                  onClick={() => setValues((current) => ({ ...current, productionEnabled: false }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <FieldLabel>Homologation enabled</FieldLabel>
              <div className="flex flex-wrap gap-2">
                <ToggleButton
                  label="Si"
                  active={values.homologationEnabled}
                  onClick={() => setValues((current) => ({ ...current, homologationEnabled: true }))}
                />
                <ToggleButton
                  label="No"
                  active={!values.homologationEnabled}
                  onClick={() => setValues((current) => ({ ...current, homologationEnabled: false }))}
                />
              </div>
            </div>
            <TaxConfigTextareaField
              label="Notes"
              value={values.notes}
              onChange={(value) => setValues((current) => ({ ...current, notes: value }))}
              placeholder="Observaciones de operacion, homologacion o salida a produccion."
            />
          </div>

          {mutation.isError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{mapError(mutation.error)}</div>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm text-slate-600">
              <p className="font-medium text-slate-900">Guardado real</p>
              <p className="mt-1">El formulario persiste o crea la configuracion del ambiente seleccionado.</p>
            </div>
            <Button type="submit" disabled={mutation.isPending} className="gap-2">
              <Save className="h-4 w-4" />
              {mutation.isPending ? 'Guardando...' : config ? 'Actualizar config' : 'Crear config'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
