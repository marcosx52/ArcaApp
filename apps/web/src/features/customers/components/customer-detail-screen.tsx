'use client';

import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, BadgeCheck, CalendarDays, PencilLine } from 'lucide-react';
import { EmptyState } from '@/components/feedback/empty-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { StatusBadge } from '@/components/feedback/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getActiveCompanyId } from '@/lib/auth';
import { mapError } from '@/lib/error-mapping';
import { archiveCustomer, getCustomer, updateCustomer } from '../lib/customers-api';
import { toFormValues, toUpdateInput } from '../lib/customers';
import { CustomerForm } from './customer-form';

type CustomerDetailScreenProps = {
  customerId: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function CustomerDetailScreen({ customerId }: CustomerDetailScreenProps) {
  const companyId = getActiveCompanyId();
  const queryClient = useQueryClient();
  const customerDetailQueryKey = ['customers', companyId ?? 'no-company', 'detail', customerId] as const;
  const customerListQueryKey = ['customers', companyId ?? 'no-company', 'list'] as const;

  const customerQuery = useQuery({
    queryKey: customerDetailQueryKey,
    queryFn: () => getCustomer(customerId),
    enabled: Boolean(companyId),
  });

  const updateMutation = useMutation({
    mutationFn: (values: Parameters<typeof updateCustomer>[1]) => updateCustomer(customerId, values),
    onSuccess: async (updatedCustomer) => {
      queryClient.setQueryData(customerDetailQueryKey, updatedCustomer);
      await queryClient.invalidateQueries({ queryKey: customerListQueryKey });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: () => archiveCustomer(customerId),
    onSuccess: async (archivedCustomer) => {
      queryClient.setQueryData(customerDetailQueryKey, archivedCustomer);
      await queryClient.invalidateQueries({ queryKey: customerListQueryKey });
    },
  });

  if (!companyId) {
    return <LoadingState label="Preparando empresa activa..." />;
  }

  if (customerQuery.isLoading) {
    return <LoadingState label="Cargando cliente..." />;
  }

  if (customerQuery.isError) {
    return (
      <EmptyState
        title="No pudimos abrir el cliente"
        description={mapError(customerQuery.error)}
        actionHref="/customers"
        actionLabel="Volver al listado"
      />
    );
  }

  const customer = customerQuery.data;

  if (!customer) {
    return (
      <EmptyState
        title="Cliente no encontrado"
        description="Ese registro no existe o no pertenece a la empresa activa."
        actionHref="/customers"
        actionLabel="Volver al listado"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/customers"
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
        <StatusBadge tone={customer.isActive ? 'success' : 'danger'}>
          {customer.isActive ? 'Activo' : 'Archivado'}
        </StatusBadge>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_0.85fr]">
        <CustomerForm
          key={`${customer.id}:${customer.updatedAt}`}
          title={`Editar cliente: ${customer.legalName}`}
          description="Cambios persistidos via PATCH /customers/:id y archivado via DELETE /customers/:id."
          submitLabel="Guardar cambios"
          defaultValues={toFormValues(customer)}
          showActiveField
          isSubmitting={updateMutation.isPending || archiveMutation.isPending}
          onSubmit={async (values) => {
            await updateMutation.mutateAsync(toUpdateInput(values));
          }}
          footer={
            <Button
              type="button"
              variant="outline"
              className="border-red-200 text-red-700 hover:bg-red-50"
              disabled={!customer.isActive || updateMutation.isPending || archiveMutation.isPending}
              onClick={() => {
                if (!window.confirm(`Archivar a ${customer.legalName}? El registro quedara inactivo.`)) return;
                archiveMutation.mutate();
              }}
            >
              {archiveMutation.isPending ? 'Archivando...' : customer.isActive ? 'Archivar cliente' : 'Cliente archivado'}
            </Button>
          }
        />

        <Card>
          <CardHeader>
            <CardTitle>Detalle rapido</CardTitle>
            <CardDescription>Informacion sincronizada con el backend.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-2 rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <PencilLine className="h-4 w-4" />
                Documento
              </div>
              <div className="font-medium text-slate-900">
                {customer.documentType} {customer.documentNumber}
              </div>
            </div>
            <div className="space-y-2 rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <BadgeCheck className="h-4 w-4" />
                Cliente frecuente
              </div>
              <div className="font-medium text-slate-900">{customer.isFrequent ? 'Si' : 'No'}</div>
            </div>
            <div className="space-y-2 rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <CalendarDays className="h-4 w-4" />
                Ultima actualizacion
              </div>
              <div className="font-medium text-slate-900">{formatDate(customer.updatedAt)}</div>
            </div>

            {updateMutation.isError || archiveMutation.isError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                {mapError(updateMutation.error ?? archiveMutation.error)}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
