import { Injectable } from '@nestjs/common';

@Injectable()
export class ReadinessService {
  checkCompany(companyId: string) {
    return {
      success: true,
      data: {
        companyId,
        checks: [
          { key: 'company', status: 'ok', message: 'Empresa creada' },
          { key: 'sales-point', status: 'warning', message: 'Revisar punto de venta' },
          { key: 'arca', status: 'warning', message: 'Integración pendiente' },
        ],
      },
    };
  }
}
