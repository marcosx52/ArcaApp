export const AUTH_TOKEN_KEY = 'arca_auth_token';
export const ACTIVE_COMPANY_ID_KEY = 'arca_active_company_id';
export const ACTIVE_COMPANY_CHANGE_EVENT = 'arca-active-company-change';

function emitActiveCompanyChange(companyId: string | null) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(ACTIVE_COMPANY_CHANGE_EVENT, {
      detail: { companyId },
    }),
  );
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function getActiveCompanyId(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(ACTIVE_COMPANY_ID_KEY);
}

export function setActiveCompanyId(companyId: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ACTIVE_COMPANY_ID_KEY, companyId);
  emitActiveCompanyChange(companyId);
}

export function clearActiveCompanyId() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(ACTIVE_COMPANY_ID_KEY);
  emitActiveCompanyChange(null);
}

export function clearSession() {
  clearAuthToken();
  clearActiveCompanyId();
}
