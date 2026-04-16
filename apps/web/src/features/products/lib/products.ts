export type ProductItemType = 'PRODUCT' | 'SERVICE';
export type ProductTaxTreatment = 'GRAVADO' | 'EXENTO' | 'NO_ALCANZADO';

export type ProductFormValues = {
  itemType: ProductItemType;
  code: string;
  name: string;
  description: string;
  unitName: string;
  referencePrice: string;
  taxTreatment: ProductTaxTreatment | '';
  vatRate: string;
  isActive: boolean;
};

export type ProductRecord = {
  id: string;
  companyId: string;
  itemType: ProductItemType;
  code: string | null;
  name: string;
  description: string | null;
  unitName: string | null;
  referencePrice: string | null;
  taxTreatment: ProductTaxTreatment | null;
  vatRate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProductCreateInput = {
  itemType: ProductItemType;
  code?: string;
  name: string;
  description?: string;
  unitName?: string;
  referencePrice?: string;
  taxTreatment?: ProductTaxTreatment;
  vatRate?: string;
};

export type ProductUpdateInput = Partial<ProductCreateInput> & {
  isActive?: boolean;
};

export const productItemTypeOptions: Array<{ value: ProductItemType; label: string }> = [
  { value: 'PRODUCT', label: 'Producto' },
  { value: 'SERVICE', label: 'Servicio' },
];

export const productTaxTreatmentOptions: Array<{ value: ProductTaxTreatment; label: string }> = [
  { value: 'GRAVADO', label: 'Gravado' },
  { value: 'EXENTO', label: 'Exento' },
  { value: 'NO_ALCANZADO', label: 'No alcanzado' },
];

export const emptyProductFormValues: ProductFormValues = {
  itemType: 'PRODUCT',
  code: '',
  name: '',
  description: '',
  unitName: '',
  referencePrice: '',
  taxTreatment: '',
  vatRate: '',
  isActive: true,
};

export function productItemTypeLabel(value: ProductItemType) {
  return productItemTypeOptions.find((option) => option.value === value)?.label ?? value;
}

export function productTaxTreatmentLabel(value: ProductTaxTreatment) {
  return productTaxTreatmentOptions.find((option) => option.value === value)?.label ?? value;
}

export function toProductFormValues(product: ProductRecord): ProductFormValues {
  return {
    itemType: product.itemType,
    code: product.code ?? '',
    name: product.name,
    description: product.description ?? '',
    unitName: product.unitName ?? '',
    referencePrice: product.referencePrice ?? '',
    taxTreatment: product.taxTreatment ?? '',
    vatRate: product.vatRate ?? '',
    isActive: product.isActive,
  };
}

function omitEmptyFields(values: Record<string, string | boolean | undefined>) {
  return Object.fromEntries(
    Object.entries(values)
      .map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value] as const)
      .filter(([, value]) => value !== '' && value !== undefined),
  );
}

export function toProductCreateInput(values: ProductFormValues): ProductCreateInput {
  const { isActive, ...createInput } = values;
  return omitEmptyFields(createInput) as ProductCreateInput;
}

export function toProductUpdateInput(values: ProductFormValues): ProductUpdateInput {
  return omitEmptyFields(values) as ProductUpdateInput;
}

export function formatProductPrice(value: string | null) {
  if (!value) return 'Sin precio';

  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) return value;

  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 2,
  }).format(numericValue);
}
