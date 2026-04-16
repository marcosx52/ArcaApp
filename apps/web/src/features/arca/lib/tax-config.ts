export type ArcaEnvironment = 'TESTING' | 'PRODUCTION';

export type ConfigStatus = 'INCOMPLETE' | 'PENDING_VALIDATION' | 'VALIDATED' | 'BLOCKED';

export type TaxConfigFormValues = {
  arcaServiceType: string;
  productionEnabled: boolean;
  homologationEnabled: boolean;
  nextInvoiceFlowMode: string;
  defaultCurrency: string;
  defaultInvoiceTypeC: string;
  defaultInvoiceTypeB: string;
  notes: string;
};

export type TaxConfigRecord = TaxConfigFormValues & {
  id: string;
  companyId: string;
  environment: ArcaEnvironment;
  configStatus: ConfigStatus;
  createdAt: string;
  updatedAt: string;
};

export type TaxConfigUpsertInput = TaxConfigFormValues & {
  environment: ArcaEnvironment;
};

export type TaxConfigReadinessCheck = {
  key: string;
  status: 'ok' | 'warning' | 'error';
  message: string;
};

export type TaxConfigReadinessPayload = {
  companyId: string;
  checks: TaxConfigReadinessCheck[];
};

export const arcaEnvironmentLabels: Record<ArcaEnvironment, string> = {
  TESTING: 'Testing',
  PRODUCTION: 'Produccion',
};

export const configStatusLabels: Record<ConfigStatus, string> = {
  INCOMPLETE: 'Incompleta',
  PENDING_VALIDATION: 'Pendiente de validacion',
  VALIDATED: 'Validada',
  BLOCKED: 'Bloqueada',
};

export const emptyTaxConfigFormValues: TaxConfigFormValues = {
  arcaServiceType: 'wsfev1',
  productionEnabled: false,
  homologationEnabled: true,
  nextInvoiceFlowMode: 'manual',
  defaultCurrency: 'PES',
  defaultInvoiceTypeC: 'Factura C',
  defaultInvoiceTypeB: 'Factura B',
  notes: '',
};

export function taxConfigStatusTone(status: ConfigStatus) {
  switch (status) {
    case 'VALIDATED':
      return 'success' as const;
    case 'BLOCKED':
      return 'danger' as const;
    case 'PENDING_VALIDATION':
    case 'INCOMPLETE':
    default:
      return 'warning' as const;
  }
}

export function readinessTone(status: TaxConfigReadinessCheck['status']) {
  switch (status) {
    case 'ok':
      return 'success' as const;
    case 'error':
      return 'danger' as const;
    case 'warning':
    default:
      return 'warning' as const;
  }
}

export function toFormValues(config?: Partial<TaxConfigRecord> | null): TaxConfigFormValues {
  return {
    arcaServiceType: config?.arcaServiceType ?? emptyTaxConfigFormValues.arcaServiceType,
    productionEnabled: config?.productionEnabled ?? emptyTaxConfigFormValues.productionEnabled,
    homologationEnabled: config?.homologationEnabled ?? emptyTaxConfigFormValues.homologationEnabled,
    nextInvoiceFlowMode: config?.nextInvoiceFlowMode ?? emptyTaxConfigFormValues.nextInvoiceFlowMode,
    defaultCurrency: config?.defaultCurrency ?? emptyTaxConfigFormValues.defaultCurrency,
    defaultInvoiceTypeC: config?.defaultInvoiceTypeC ?? emptyTaxConfigFormValues.defaultInvoiceTypeC,
    defaultInvoiceTypeB: config?.defaultInvoiceTypeB ?? emptyTaxConfigFormValues.defaultInvoiceTypeB,
    notes: config?.notes ?? emptyTaxConfigFormValues.notes,
  };
}

export function toUpsertInput(environment: ArcaEnvironment, values: TaxConfigFormValues): TaxConfigUpsertInput {
  return {
    environment,
    arcaServiceType: values.arcaServiceType.trim(),
    productionEnabled: values.productionEnabled,
    homologationEnabled: values.homologationEnabled,
    nextInvoiceFlowMode: values.nextInvoiceFlowMode.trim(),
    defaultCurrency: values.defaultCurrency.trim(),
    defaultInvoiceTypeC: values.defaultInvoiceTypeC.trim(),
    defaultInvoiceTypeB: values.defaultInvoiceTypeB.trim(),
    notes: values.notes.trim(),
  };
}

export function formatTaxConfigUpdatedAt(value?: string) {
  if (!value) return 'Sin actualizaciones';

  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

