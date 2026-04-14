import { Injectable } from '@nestjs/common';

@Injectable()
export class WsaaAuthService {
  async getTicket(companyId: string) {
    return {
      companyId,
      token: 'mock-token',
      sign: 'mock-sign',
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 12),
    };
  }
}
