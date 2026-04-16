export type CustomerType = 'INDIVIDUAL' | 'COMPANY' | 'FINAL_CONSUMER_PROFILE';
export type DocumentType = 'CUIT' | 'CUIL' | 'DNI' | 'SIN_DOCUMENTO';

export type CustomerFormValues = {
  customerType: CustomerType;
  legalName: string;
  documentType: DocumentType;
  documentNumber: string;
  taxCondition: string;
  email: string;
  phone: string;
  addressLine: string;
  city: string;
  province: string;
  notes: string;
  isFrequent: boolean;
  isActive: boolean;
};

export type CustomerRecord = {
  id: string;
  companyId: string;
  customerType: CustomerType;
  legalName: string;
  documentType: DocumentType;
  documentNumber: string;
  taxCondition: string;
  email: string | null;
  phone: string | null;
  addressLine: string | null;
  city: string | null;
  province: string | null;
  notes: string | null;
  isFrequent: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CustomerCreateInput = Omit<CustomerFormValues, 'isActive'>;
export type CustomerUpdateInput = Partial<CustomerCreateInput> & {
  isActive?: boolean;
};

export const customerTypeOptions: Array<{ value: CustomerType; label: string }> = [
  { value: 'INDIVIDUAL', label: 'Persona humana' },
  { value: 'COMPANY', label: 'Empresa' },
  { value: 'FINAL_CONSUMER_PROFILE', label: 'Consumidor final' },
];

export const documentTypeOptions: Array<{ value: DocumentType; label: string }> = [
  { value: 'CUIT', label: 'CUIT' },
  { value: 'CUIL', label: 'CUIL' },
  { value: 'DNI', label: 'DNI' },
  { value: 'SIN_DOCUMENTO', label: 'Sin documento' },
];

export const emptyCustomerFormValues: CustomerFormValues = {
  customerType: 'INDIVIDUAL',
  legalName: '',
  documentType: 'CUIT',
  documentNumber: '',
  taxCondition: '',
  email: '',
  phone: '',
  addressLine: '',
  city: '',
  province: '',
  notes: '',
  isFrequent: false,
  isActive: true,
};

export function customerTypeLabel(value: CustomerType) {
  return customerTypeOptions.find((option) => option.value === value)?.label ?? value;
}

export function documentTypeLabel(value: DocumentType) {
  return documentTypeOptions.find((option) => option.value === value)?.label ?? value;
}

export function toFormValues(customer: CustomerRecord): CustomerFormValues {
  return {
    customerType: customer.customerType,
    legalName: customer.legalName,
    documentType: customer.documentType,
    documentNumber: customer.documentNumber,
    taxCondition: customer.taxCondition,
    email: customer.email ?? '',
    phone: customer.phone ?? '',
    addressLine: customer.addressLine ?? '',
    city: customer.city ?? '',
    province: customer.province ?? '',
    notes: customer.notes ?? '',
    isFrequent: customer.isFrequent,
    isActive: customer.isActive,
  };
}

export function toCreateInput(values: CustomerFormValues): CustomerCreateInput {
  const { isActive, ...createInput } = values;
  return createInput;
}

export function toUpdateInput(values: CustomerFormValues): CustomerUpdateInput {
  return values;
}

export function formatCustomerDocument(customer: Pick<CustomerRecord, 'documentType' | 'documentNumber'>) {
  return `${documentTypeLabel(customer.documentType)} ${customer.documentNumber}`.trim();
}
