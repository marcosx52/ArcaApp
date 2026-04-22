import { Injectable } from '@nestjs/common';
import { WsaaTransportError } from '../shared/arca-errors';

type LoginCmsOptions = {
  endpointUrl: string;
  timeoutMs: number;
};

export type WsaaLoginCmsResponse = {
  httpStatus: number;
  body: string;
};

@Injectable()
export class WsaaClient {
  async loginCms(cmsBase64: string, options: LoginCmsOptions): Promise<WsaaLoginCmsResponse> {
    if (typeof fetch !== 'function') {
      throw new WsaaTransportError('El runtime de Node no tiene fetch disponible para invocar WSAA');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs);

    try {
      const response = await fetch(options.endpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          SOAPAction: '""',
        },
        body: this.buildEnvelope(cmsBase64),
        signal: controller.signal,
      });
      const body = await response.text();

      if (!response.ok) {
        throw new WsaaTransportError(
          `WSAA respondio HTTP ${response.status}`,
          response.status,
          body,
        );
      }

      return {
        httpStatus: response.status,
        body,
      };
    } catch (error) {
      if (error instanceof WsaaTransportError) {
        throw error;
      }

      const message = error instanceof Error ? error.message : 'Error desconocido';
      throw new WsaaTransportError(`No se pudo invocar WSAA homologacion: ${message}`);
    } finally {
      clearTimeout(timeout);
    }
  }

  private buildEnvelope(cmsBase64: string) {
    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsaa="http://wsaa.view.sua.dvadac.desein.afip.gov">',
      '  <soapenv:Header/>',
      '  <soapenv:Body>',
      '    <wsaa:loginCms>',
      `      <wsaa:in0>${escapeXml(cmsBase64)}</wsaa:in0>`,
      '    </wsaa:loginCms>',
      '  </soapenv:Body>',
      '</soapenv:Envelope>',
    ].join('\n');
  }
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
