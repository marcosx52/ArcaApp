'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { EmptyState } from '@/components/feedback/empty-state';
import { mapError } from '@/lib/error-mapping';
import { createCustomer } from '../lib/customers-api';
import { CustomerForm } from './customer-form';
import { emptyCustomerFormValues, toCreateInput } from '../lib/customers';

export function CustomerCreateScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: async (customer) => {
      await queryClient.invalidateQueries({ queryKey: ['customers'] });
      router.push(`/customers/${customer.id}`);
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link
          href="/customers"
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
      </div>

      {createMutation.isError ? (
        <EmptyState
          title="No pudimos crear el cliente"
          description={mapError(createMutation.error)}
        />
      ) : null}

      <CustomerForm
        title="Nuevo cliente"
        description="Alta funcional conectada al backend."
        submitLabel="Crear cliente"
        defaultValues={emptyCustomerFormValues}
        isSubmitting={createMutation.isPending}
        onSubmit={async (values) => {
          await createMutation.mutateAsync(toCreateInput(values));
        }}
      />
    </div>
  );
}
