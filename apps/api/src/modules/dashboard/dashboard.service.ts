import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async summary(companyId: string) {
    const [todayIssuedCount, draftCount, failedCount, invoices] = await Promise.all([
      this.prisma.invoice.count({ where: { companyId, status: 'ISSUED' } }),
      this.prisma.invoice.count({ where: { companyId, status: 'DRAFT' } }),
      this.prisma.invoice.count({ where: { companyId, status: 'FAILED' } }),
      this.prisma.invoice.findMany({ where: { companyId } }),
    ]);

    const total = invoices.reduce((acc, invoice) => acc + Number(invoice.totalAmount), 0);

    return {
      success: true,
      data: {
        todayIssuedCount,
        todayTotalAmount: String(total),
        draftCount,
        failedCount,
        readiness: {
          onboardingStatus: 'PENDING_TAX_SETUP',
          isReadyForHomologation: false,
          isReadyForProduction: false,
        },
      },
    };
  }
}
