import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async summary(companyId: string) {
    const { start, end } = this.getTodayRange();
    const issuedTodayWhere: Prisma.InvoiceWhereInput = {
      companyId,
      status: 'ISSUED',
      OR: [
        { emittedAt: { gte: start, lt: end } },
        { emittedAt: null, issueDate: { gte: start, lt: end } },
      ],
    };

    const [todayIssuedCount, todayTotals, draftCount, failedCount, company] = await Promise.all([
      this.prisma.invoice.count({ where: issuedTodayWhere }),
      this.prisma.invoice.aggregate({
        where: issuedTodayWhere,
        _sum: { totalAmount: true },
      }),
      this.prisma.invoice.count({ where: { companyId, status: 'DRAFT' } }),
      this.prisma.invoice.count({ where: { companyId, status: 'FAILED' } }),
      this.prisma.company.findUnique({
        where: { id: companyId },
        select: { onboardingStatus: true },
      }),
    ]);

    const onboardingStatus = company?.onboardingStatus ?? 'DRAFT';

    return {
      success: true,
      data: {
        todayIssuedCount,
        todayTotalAmount: todayTotals._sum.totalAmount?.toString() ?? '0',
        draftCount,
        failedCount,
        readiness: {
          onboardingStatus,
          isReadyForHomologation:
            onboardingStatus === 'READY_FOR_HOMOLOGATION' ||
            onboardingStatus === 'READY_FOR_PRODUCTION',
          isReadyForProduction: onboardingStatus === 'READY_FOR_PRODUCTION',
        },
      },
    };
  }

  private getTodayRange() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    return { start, end };
  }
}
