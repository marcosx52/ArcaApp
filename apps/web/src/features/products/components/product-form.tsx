'use client';

import clsx from 'clsx';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { mapError } from '@/lib/error-mapping';
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

type ProductFormFieldName = keyof Pick<
  ProductFormValues,
  'itemType' | 'code' | 'name' | 'description' | 'unitName' | 'referencePrice' | 'taxTreatment' | 'vatRate'
>;

const selectClassName =
  'w-full rounded-2xl border bg-white px-4 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10 disabled:cursor-not-allowed disabled:opacity-60';

const selectInvalidClassName = 'border-red-300 bg-red-50/60 focus:border-red-400 focus:ring-red-500/20';

const productFieldErrorMessages: Record<
  ProductFormFieldName,
  { matches: string[]; message: string }
> = {
  itemType: {
    matches: ['itemtype'],
    message: 'Selecciona un tipo de item valido.',
  },
  code: {
    matches: ['code'],
    message: 'Revisa el codigo ingresado.',
  },
  name: {
    matches: ['name'],
    message: 'Ingresa el nombre del producto.',
  },
  description: {
    matches: ['description'],
    message: 'Revisa la descripcion ingresada.',
  },
  unitName: {
    matches: ['unitname'],
    message: 'Revisa la unidad ingresada.',
  },
  referencePrice: {
    matches: ['referenceprice'],
    message: 'Revisa el precio de referencia.',
  },
  taxTreatment: {
    matches: ['taxtreatment'],
    message: 'Selecciona un tratamiento fiscal valido.',
  },
  vatRate: {
    matches: ['vatrate'],
    message: 'Revisa el IVA %.',
  },
};

function normalizeMessage(message: string) {
  return message.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function getProductSubmitFeedback(error: unknown): {
  fieldErrors: Partial<Record<ProductFormFieldName, string>>;
  formError?: string;
} {
  const message = mapError(error);
  const normalizedMessage = normalizeMessage(message);

  const fieldErrors = Object.entries(productFieldErrorMessages).reduce<Partial<Record<ProductFormFieldName, string>>>(
    (result, [fieldName, config]) => {
      if (config.matches.some((match) => normalizedMessage.includes(match))) {
        result[fieldName as ProductFormFieldName] = config.message;
      }

      return result;
    },
    {},
  );

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  return {
    fieldErrors,
    formError:
      normalizedMessage === 'request failed'
        ? 'No pudimos guardar el producto. Revisa los datos e intenta de nuevo.'
        : message,
  };
}

function getErrorMessage(error: unknown) {
  return typeof error === 'string' ? error : undefined;
}

function getLabelClassName(hasError: boolean) {
  return clsx('text-sm font-medium', hasError ? 'text-red-700' : 'text-slate-700');
}

function getSelectFieldClassName(hasError: boolean) {
  return clsx(selectClassName, hasError ? selectInvalidClassName : 'border-slate-200');
}

function FieldErrorText({ id, message }: { id: string; message?: string }) {
  if (!message) return null;

  return (
    <p id={id} className="text-sm text-red-600">
      {message}
    </p>
  );
}

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
  const { clearErrors, formState, handleSubmit, register, setError } = useForm<ProductFormValues>({
    defaultValues,
  });

  const itemTypeErrorMessage = getErrorMessage(formState.errors.itemType?.message);
  const codeErrorMessage = getErrorMessage(formState.errors.code?.message);
  const nameErrorMessage = getErrorMessage(formState.errors.name?.message);
  const descriptionErrorMessage = getErrorMessage(formState.errors.description?.message);
  const unitNameErrorMessage = getErrorMessage(formState.errors.unitName?.message);
  const referencePriceErrorMessage = getErrorMessage(formState.errors.referencePrice?.message);
  const taxTreatmentErrorMessage = getErrorMessage(formState.errors.taxTreatment?.message);
  const vatRateErrorMessage = getErrorMessage(formState.errors.vatRate?.message);
  const rootErrorMessage = getErrorMessage(formState.errors.root?.message);

  const handleFormSubmit = handleSubmit(async (values) => {
    clearErrors();

    try {
      await onSubmit(values);
    } catch (error) {
      const submitFeedback = getProductSubmitFeedback(error);
      const fieldEntries = Object.entries(submitFeedback.fieldErrors) as Array<[ProductFormFieldName, string]>;

      if (fieldEntries.length > 0) {
        fieldEntries.forEach(([fieldName, message], index) => {
          setError(
            fieldName,
            {
              type: 'server',
              message,
            },
            {
              shouldFocus: index === 0,
            },
          );
        });
        return;
      }

      if (submitFeedback.formError) {
        setError('root', {
          type: 'server',
          message: submitFeedback.formError,
        });
      }
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleFormSubmit} noValidate>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className={getLabelClassName(Boolean(itemTypeErrorMessage))}>Tipo de item</span>
              <select
                className={getSelectFieldClassName(Boolean(itemTypeErrorMessage))}
                aria-invalid={Boolean(itemTypeErrorMessage)}
                aria-describedby={itemTypeErrorMessage ? 'product-item-type-error' : undefined}
                {...register('itemType', {
                  onChange: () => {
                    clearErrors('itemType');
                  },
                })}
              >
                {productItemTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <FieldErrorText id="product-item-type-error" message={itemTypeErrorMessage} />
            </label>

            <label className="space-y-2">
              <span className={getLabelClassName(Boolean(codeErrorMessage))}>Codigo</span>
              <Input
                aria-invalid={Boolean(codeErrorMessage)}
                aria-describedby={codeErrorMessage ? 'product-code-error' : undefined}
                {...register('code', {
                  onChange: () => {
                    clearErrors('code');
                  },
                })}
                placeholder="SKU-001"
              />
              <FieldErrorText id="product-code-error" message={codeErrorMessage} />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className={getLabelClassName(Boolean(nameErrorMessage))}>
                Nombre <span className="text-red-600">*</span>
              </span>
              <Input
                aria-invalid={Boolean(nameErrorMessage)}
                aria-describedby={nameErrorMessage ? 'product-name-error' : undefined}
                {...register('name', {
                  required: 'Ingresa el nombre del producto.',
                  validate: (value) => value.trim().length > 0 || 'Ingresa el nombre del producto.',
                  onChange: () => {
                    clearErrors('name');
                  },
                })}
                placeholder="Ej. Servicio de diseno"
              />
              <FieldErrorText id="product-name-error" message={nameErrorMessage} />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className={getLabelClassName(Boolean(descriptionErrorMessage))}>Descripcion</span>
              <Input
                aria-invalid={Boolean(descriptionErrorMessage)}
                aria-describedby={descriptionErrorMessage ? 'product-description-error' : undefined}
                {...register('description', {
                  onChange: () => {
                    clearErrors('description');
                  },
                })}
                placeholder="Descripcion breve del producto o servicio"
              />
              <FieldErrorText id="product-description-error" message={descriptionErrorMessage} />
            </label>

            <label className="space-y-2">
              <span className={getLabelClassName(Boolean(unitNameErrorMessage))}>Unidad</span>
              <Input
                aria-invalid={Boolean(unitNameErrorMessage)}
                aria-describedby={unitNameErrorMessage ? 'product-unit-name-error' : undefined}
                {...register('unitName', {
                  onChange: () => {
                    clearErrors('unitName');
                  },
                })}
                placeholder="Unidad, hora, kg..."
              />
              <FieldErrorText id="product-unit-name-error" message={unitNameErrorMessage} />
            </label>

            <label className="space-y-2">
              <span className={getLabelClassName(Boolean(referencePriceErrorMessage))}>Precio de referencia</span>
              <Input
                aria-invalid={Boolean(referencePriceErrorMessage)}
                aria-describedby={referencePriceErrorMessage ? 'product-reference-price-error' : undefined}
                {...register('referencePrice', {
                  onChange: () => {
                    clearErrors('referencePrice');
                  },
                })}
                inputMode="decimal"
                placeholder="120000.00"
              />
              <FieldErrorText id="product-reference-price-error" message={referencePriceErrorMessage} />
            </label>

            <label className="space-y-2">
              <span className={getLabelClassName(Boolean(taxTreatmentErrorMessage))}>Tratamiento fiscal</span>
              <select
                className={getSelectFieldClassName(Boolean(taxTreatmentErrorMessage))}
                aria-invalid={Boolean(taxTreatmentErrorMessage)}
                aria-describedby={taxTreatmentErrorMessage ? 'product-tax-treatment-error' : undefined}
                {...register('taxTreatment', {
                  onChange: () => {
                    clearErrors('taxTreatment');
                  },
                })}
              >
                <option value="">Sin definir</option>
                {productTaxTreatmentOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <FieldErrorText id="product-tax-treatment-error" message={taxTreatmentErrorMessage} />
            </label>

            <label className="space-y-2">
              <span className={getLabelClassName(Boolean(vatRateErrorMessage))}>IVA %</span>
              <Input
                aria-invalid={Boolean(vatRateErrorMessage)}
                aria-describedby={vatRateErrorMessage ? 'product-vat-rate-error' : undefined}
                {...register('vatRate', {
                  onChange: () => {
                    clearErrors('vatRate');
                  },
                })}
                inputMode="decimal"
                placeholder="21"
              />
              <FieldErrorText id="product-vat-rate-error" message={vatRateErrorMessage} />
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

          {rootErrorMessage ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {rootErrorMessage}
            </p>
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
