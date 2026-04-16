'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CompanyFormValues } from '../lib/company';

type CompanyFormProps = {
  title: string;
  description: string;
  submitLabel: string;
  defaultValues: CompanyFormValues;
  onSubmit: (values: CompanyFormValues) => Promise<void>;
  isSubmitting?: boolean;
  footer?: React.ReactNode;
};

export function CompanyForm({
  title,
  description,
  submitLabel,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  footer,
}: CompanyFormProps) {
  const { register, handleSubmit, formState, reset } = useForm<CompanyFormValues>({
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-slate-700">Razón social</span>
              <Input {...register('legalName', { required: true })} placeholder="Empresa Demo SA" />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Nombre de fantasía</span>
              <Input {...register('tradeName')} placeholder="Demo Facturación" />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Perfil fiscal</span>
              <Input {...register('taxProfile', { required: true })} placeholder="Responsable inscripto" />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Condición IVA</span>
              <Input {...register('vatCondition', { required: true })} placeholder="IVA Responsable Inscripto" />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">País</span>
              <Input {...register('country')} placeholder="AR" />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-slate-700">Dirección</span>
              <Input {...register('addressLine')} placeholder="Av. Siempre Viva 123" />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Ciudad</span>
              <Input {...register('city')} placeholder="Córdoba" />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Provincia</span>
              <Input {...register('province')} placeholder="Córdoba" />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <Input {...register('email')} type="email" placeholder="empresa@demo.com" />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Teléfono</span>
              <Input {...register('phone')} placeholder="+54 11 5555-5555" />
            </label>
          </div>

          {formState.errors.legalName || formState.errors.taxProfile || formState.errors.vatCondition ? (
            <p className="text-sm text-red-600">Completá razón social, perfil fiscal y condición IVA para guardar.</p>
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

