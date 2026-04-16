export type CompanyOnboardingStatus =
  | 'DRAFT'
  | 'PENDING_TAX_SETUP'
  | 'READY_FOR_HOMOLOGATION'
  | 'READY_FOR_PRODUCTION'
  | 'SUSPENDED';

export type CompanyReadinessCheckStatus = 'ok' | 'warning' | 'blocked';

export type CompanyRecord = {
  id: string;
  legalName: string;
  tradeName: string | null;
  cuit: string;
  taxProfile: string;
  vatCondition: string;
  addressLine: string | null;
  city: string | null;
  province: string | null;
  country: string | null;
  email: string | null;
  phone: string | null;
  onboardingStatus: CompanyOnboardingStatus;
  createdAt: string;
  updatedAt: string;
};

export type CompanyFormValues = {
  legalName: string;
  tradeName: string;
  taxProfile: string;
  vatCondition: string;
  addressLine: string;
  city: string;
  province: string;
  country: string;
  email: string;
  phone: string;
};

export type CompanyUpdateInput = Partial<{
  legalName: string;
  tradeName: string;
  taxProfile: string;
  vatCondition: string;
  addressLine: string;
  city: string;
  province: string;
  country: string;
  email: string;
  phone: string;
}>;

export type CompanyReadinessResponse = {
  success: true;
  data: {
    companyId: string;
    onboardingStatus: CompanyOnboardingStatus;
    isReadyForHomologation: boolean;
    isReadyForProduction: boolean;
    checks: Array<{
      key: string;
      status: CompanyReadinessCheckStatus;
      message: string;
    }>;
  };
};

export const emptyCompanyFormValues: CompanyFormValues = {
  legalName: '',
  tradeName: '',
  taxProfile: '',
  vatCondition: '',
  addressLine: '',
  city: '',
  province: '',
  country: 'AR',
  email: '',
  phone: '',
};

export const companyOnboardingStatusLabel: Record<CompanyOnboardingStatus, string> = {
  DRAFT: 'Borrador',
  PENDING_TAX_SETUP: 'Pendiente de configuración fiscal',
  READY_FOR_HOMOLOGATION: 'Lista para homologación',
  READY_FOR_PRODUCTION: 'Lista para producción',
  SUSPENDED: 'Suspendida',
};

export const companyOnboardingStatusTone: Record<CompanyOnboardingStatus, 'default' | 'warning' | 'success' | 'danger'> = {
  DRAFT: 'default',
  PENDING_TAX_SETUP: 'warning',
  READY_FOR_HOMOLOGATION: 'warning',
  READY_FOR_PRODUCTION: 'success',
  SUSPENDED: 'danger',
};

export const readinessStatusLabel: Record<CompanyReadinessCheckStatus, string> = {
  ok: 'OK',
  warning: 'Revisar',
  blocked: 'Bloqueado',
};

export const readinessStatusTone: Record<CompanyReadinessCheckStatus, 'success' | 'warning' | 'danger'> = {
  ok: 'success',
  warning: 'warning',
  blocked: 'danger',
};

export function toFormValues(company: CompanyRecord): CompanyFormValues {
  return {
    legalName: company.legalName ?? '',
    tradeName: company.tradeName ?? '',
    taxProfile: company.taxProfile ?? '',
    vatCondition: company.vatCondition ?? '',
    addressLine: company.addressLine ?? '',
    city: company.city ?? '',
    province: company.province ?? '',
    country: company.country ?? 'AR',
    email: company.email ?? '',
    phone: company.phone ?? '',
  };
}

function toOptionalString(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function toUpdateInput(values: CompanyFormValues): CompanyUpdateInput {
  return {
    legalName: toOptionalString(values.legalName),
    tradeName: toOptionalString(values.tradeName),
    taxProfile: toOptionalString(values.taxProfile),
    vatCondition: toOptionalString(values.vatCondition),
    addressLine: toOptionalString(values.addressLine),
    city: toOptionalString(values.city),
    province: toOptionalString(values.province),
    country: toOptionalString(values.country),
    email: toOptionalString(values.email),
    phone: toOptionalString(values.phone),
  };
}

export function formatCompanyLocation(company: CompanyRecord) {
  return [company.addressLine, company.city, company.province, company.country]
    .filter(Boolean)
    .join(', ');
}

