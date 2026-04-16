'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { EmptyState } from '@/components/feedback/empty-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { getActiveCompanyId } from '@/lib/auth';
import { mapError } from '@/lib/error-mapping';
import { createProduct } from '../lib/products-api';
import { emptyProductFormValues, toProductCreateInput } from '../lib/products';
import { ProductForm } from './product-form';

export function ProductCreateScreen() {
  const companyId = getActiveCompanyId();
  const router = useRouter();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: async (product) => {
      if (companyId) {
        await queryClient.invalidateQueries({ queryKey: ['products', companyId, 'list'] });
      }

      router.push(`/products/${product.id}`);
    },
  });

  if (!companyId) {
    return <LoadingState label="Preparando empresa activa..." />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link
          href="/products"
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
      </div>

      {createMutation.isError ? <EmptyState title="No pudimos crear el producto" description={mapError(createMutation.error)} /> : null}

      <ProductForm
        title="Nuevo producto"
        description="Alta funcional conectada al backend."
        submitLabel="Crear producto"
        defaultValues={emptyProductFormValues}
        isSubmitting={createMutation.isPending}
        onSubmit={async (values) => {
          await createMutation.mutateAsync(toProductCreateInput(values));
        }}
      />
    </div>
  );
}
