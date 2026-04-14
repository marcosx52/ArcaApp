import { Injectable } from '@nestjs/common';
import { WsaaAuthService } from '../auth/wsaa-auth.service';
import { mapInvoiceToWsfePayload } from './wsfe-payload.mapper';
import { mapWsfeResponse } from './wsfe-response.mapper';
import { WsfeClient } from './wsfe-client';

@Injectable()
export class WsfeEmissionService {
  private readonly client = new WsfeClient();

  constructor(private readonly authService: WsaaAuthService) {}

  async emit(companyId: string, invoice: Record<string, unknown>) {
    const auth = await this.authService.getTicket(companyId);
    const payload = mapInvoiceToWsfePayload(invoice);
    const rawResponse = await this.client.emit(payload, auth);
    return mapWsfeResponse(rawResponse);
  }
}
