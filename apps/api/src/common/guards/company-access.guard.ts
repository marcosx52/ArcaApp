import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CompanyAccessGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const userId = request.user?.id ?? request.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('No autenticado');
    }

    const companyId = this.extractCompanyId(request);
    if (!companyId) {
      throw new BadRequestException('Falta contexto de empresa');
    }

    const membership = await this.prisma.userCompany.findFirst({
      where: {
        userId,
        companyId,
      },
    });

    if (!membership) {
      throw new ForbiddenException('No tenés acceso a esa empresa');
    }

    request.currentCompanyId = companyId;
    request.currentCompany = membership;

    return true;
  }

  private extractCompanyId(request: any): string | null {
    const headerCompanyId = this.normalize(request.headers?.['x-company-id']);
    const queryCompanyId = this.normalize(request.query?.companyId);
    const paramCompanyId = this.normalize(request.params?.companyId);
    const companyIdFromCompanyRoute = request.route?.path?.startsWith('companies/:id')
      ? this.normalize(request.params?.id)
      : null;

    const candidates = [headerCompanyId, queryCompanyId, paramCompanyId, companyIdFromCompanyRoute].filter(Boolean);

    const unique = [...new Set(candidates)];
    if (unique.length > 1) {
      throw new BadRequestException('Contexto de empresa inconsistente');
    }

    return unique[0] ?? null;
  }

  private normalize(value: unknown): string | null {
    if (Array.isArray(value)) {
      return typeof value[0] === 'string' && value[0].trim() ? value[0].trim() : null;
    }

    return typeof value === 'string' && value.trim() ? value.trim() : null;
  }
}
