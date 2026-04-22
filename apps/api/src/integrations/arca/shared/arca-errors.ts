export const ARCA_ERRORS = {
  UNKNOWN: 'ARCA_UNKNOWN',
  CONFIGURATION: 'ARCA_CONFIGURATION',
  WSAA_SIGNING: 'ARCA_WSAA_SIGNING',
  WSAA_TRANSPORT: 'ARCA_WSAA_TRANSPORT',
  WSAA_PARSING: 'ARCA_WSAA_PARSING',
};

export class ArcaIntegrationError extends Error {
  constructor(
    message: string,
    readonly code: string = ARCA_ERRORS.UNKNOWN,
  ) {
    super(message);
  }
}

export class ArcaConfigurationError extends ArcaIntegrationError {
  constructor(message: string) {
    super(message, ARCA_ERRORS.CONFIGURATION);
  }
}

export class WsaaSigningError extends ArcaIntegrationError {
  constructor(message: string) {
    super(message, ARCA_ERRORS.WSAA_SIGNING);
  }
}

export class WsaaTransportError extends ArcaIntegrationError {
  constructor(
    message: string,
    readonly httpStatus?: number,
    readonly responseBody?: string,
  ) {
    super(message, ARCA_ERRORS.WSAA_TRANSPORT);
  }
}

export class WsaaParsingError extends ArcaIntegrationError {
  constructor(message: string) {
    super(message, ARCA_ERRORS.WSAA_PARSING);
  }
}
