import { Injectable } from '@nestjs/common';

@Injectable()
export class ArcaConfigResolver {
  resolve(companyId: string) {
    return {
      companyId,
      environment: 'TESTING',
      service: 'wsfev1',
    };
  }
}
