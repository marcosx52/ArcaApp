export type InvoiceStatus =
  | 'DRAFT'
  | 'READY'
  | 'SENDING'
  | 'ISSUED'
  | 'FAILED'
  | 'CANCELLED_LOGICALLY';

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  errors?: unknown;
  meta?: Record<string, unknown>;
};
