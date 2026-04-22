export type ArcaEmissionResult = {
  success: boolean;
  cae?: string;
  caeDueDate?: string;
  message: string;
};

export type ArcaEnvironmentName = 'TESTING' | 'PRODUCTION';

export type WsaaTicket = {
  companyId: string;
  environment: ArcaEnvironmentName;
  serviceName: string;
  token: string;
  sign: string;
  expiresAt: Date;
};

export type ArcaResolvedConfig = {
  companyId: string;
  cuit: string;
  environment: 'TESTING';
  serviceName: string;
  wsaaUrl: string;
  certificatePath: string;
  privateKeyPath: string;
  opensslBin: string;
  privateKeyPassphrase: string;
  timeoutMs: number;
};
