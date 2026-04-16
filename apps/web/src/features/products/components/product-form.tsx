'use client';

import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ProductFormValues, productItemTypeOptions, productTaxTreatmentOptions } from '../lib/products';

type ProductFormProps = {
  title: string;
  description: string;
  submitLabel: string;
  defaultValues: ProductFormValues;
  onSubmit: (values: ProductFormValues) => Promise<void>;
  isSubmitting?: boolean;
  showActiveField?: boolean;
  footer?: React.ReactNode;
};

export function ProductForm({
  title,
  description,
  submitLabel,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  showActiveField = false,
  footer,
}: ProductFormProps) {
  const { register, handleSubmit, formState } = useForm<ProductFormValues>({
    defaultValues,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Tipo de ítem</span>
              <select className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm" {...register('itemType')}>
                {productItemTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Código</span>
              <Input {...register('code')} placeholder="SKU-001" />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-slate-700">Nombre</span>
              <Input {...register('name', { required: true })} placeholder="Ej. Servicio de diseño" />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-slate-700">Descripción</span>
              <Input {...register('description')} placeholder="Descripción breve del producto o servicio" />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Unidad</span>
              <Input {...register('unitName')} placeholder="Unidad, hora, kg..." />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Precio de referencia</span>
              <Input {...register('referencePrice')} inputMode="decimal" placeholder="120000.00" />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Tratamiento fiscal</span>
              <select className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm" {...register('taxTreatment')}>
                <option value="">Sin definir</option>
                {productTaxTreatmentOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">IVA %</span>
              <Input {...register('vatRate')} inputMode="decimal" placeholder="21" />
            </label>

            {showActiveField ? (
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-slate-900"
                    {...register('isActive')}
                  />
                  Producto activo
                </label>
              </div>
            ) : null}
          </div>

          {formState.errors.name ? <p className="text-sm text-red-600">Completá el nombre para continuar.</p> : null}

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : submitLabel}
            </Button>
            {footer}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
