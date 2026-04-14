import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpsertCompanyTaxConfigDto } from './dto/upsert-company-tax-config.dto';

@Injectable()
export class CompanyTaxConfigService {
  constructor(private readonly prisma: PrismaService) {}

  get(companyId: string) {
    return this.prisma.companyTaxConfig.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async upsert(companyId: string, dto: UpsertCompanyTaxConfigDto) {
    const existing = await this.prisma.companyTaxConfig.findFirst({
      where: { companyId, environment: dto.environment },
    });

    if (existing) {
      return this.prisma.companyTaxConfig.update({
        where: { id: existing.id },
        data: dto,
      });
    }

    return this.prisma.companyTaxConfig.create({
      data: { companyId, ...dto },
    });
  }

  readiness(companyId: string) {
    return {
      success: true,
      data: {
        companyId,
        checks: [{ key: 'tax-config', status: 'warning', message: 'Revisar configuración ARCA' }],
      },
    };
  }
}
