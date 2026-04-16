'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CustomerFormValues, customerTypeOptions, documentTypeOptions } from '../lib/customers';
import { useForm } from 'react-hook-form';

type CustomerFormProps = {
  title: string;
  description: string;
  submitLabel: string;
  defaultValues: CustomerFormValues;
  onSubmit: (values: CustomerFormValues) => Promise<void>;
  isSubmitting?: boolean;
  showActiveField?: boolean;
  footer?: React.ReactNode;
};

export function CustomerForm({
  title,
  description,
  submitLabel,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  showActiveField = false,
  footer,
}: CustomerFormProps) {
  const { register, handleSubmit, formState } = useForm<CustomerFormValues>({
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
              <span className="text-sm font-medium text-slate-700">Tipo de cliente</span>
              <select
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm"
                {...register('customerType')}
              >
                {customerTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Razón social / nombre</span>
              <Input {...register('legalName', { required: true })} placeholder="Ej. Juan Pérez" />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Tipo de documento</span>
              <select
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm"
                {...register('documentType')}
              >
                {documentTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Número de documento</span>
              <Input {...register('documentNumber', { required: true })} placeholder="20-12345678-9" />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-slate-700">Condición fiscal</span>
              <Input {...register('taxCondition', { required: true })} placeholder="Responsable inscripto" />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <Input {...register('email')} type="email" placeholder="cliente@empresa.com" />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Teléfono</span>
              <Input {...register('phone')} placeholder="+54 11 5555-5555" />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-slate-700">Dirección</span>
              <Input {...register('addressLine')} placeholder="Av. Siempre Viva 123" />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Ciudad</span>
              <Input {...register('city')} placeholder="Buenos Aires" />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Provincia</span>
              <Input {...register('province')} placeholder="CABA" />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-slate-700">Notas</span>
              <Input {...register('notes')} placeholder="Observaciones internas" />
            </label>

            <div className="flex flex-wrap gap-4 md:col-span-2">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-slate-900"
                  {...register('isFrequent')}
                />
                Cliente frecuente
              </label>

              {showActiveField ? (
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-slate-900"
                    {...register('isActive')}
                  />
                  Cliente activo
                </label>
              ) : null}
            </div>
          </div>

          {formState.errors.legalName ||
          formState.errors.documentNumber ||
          formState.errors.taxCondition ? (
            <p className="text-sm text-red-600">Completá los campos obligatorios para continuar.</p>
          ) : null}

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
