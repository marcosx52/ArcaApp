'use client';

import { apiClient } from './api-client';

export type SessionCompany = {
  companyId: string;
  role: string;
  isDefault: boolean;
};

export type SessionUser = {
  id: string;
  email: string;
  fullName: string;
  status: string;
  companies: SessionCompany[];
};

export type SessionResponse = {
  success: boolean;
  data: SessionUser;
  message: string;
};

export function getSession() {
  return apiClient.get<SessionResponse>('/auth/me');
}
