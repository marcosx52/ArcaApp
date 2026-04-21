import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../database/prisma.service';
import { ALLOW_COMPANY_ROUTE_PARAM_KEY } from '../decorators/allow-company-route-param.decorator';
import type { CurrentCompanyContext } from '../decorators/current-company.decorator';

@Injectable()
export class CompanyAccessGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const allowedRouteParamKeys =
      this.reflector.getAllAndOverride<string[]>(ALLOW_COMPANY_ROUTE_PARAM_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    const userId = request.user?.id ?? request.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('No autenticado');
    }

    const companyId = this.extractCompanyId(request, allowedRouteParamKeys);
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
      throw new ForbiddenException('No tenes acceso a esa empresa');
    }

    request.currentCompanyId = companyId;
    request.currentCompany = {
      id: membership.companyId,
      membershipId: membership.id,
      userId: membership.userId,
      role: membership.role,
      isDefault: membership.isDefault,
    } satisfies CurrentCompanyContext;

    return true;
  }

  private extractCompanyId(request: any, allowedRouteParamKeys: string[]): string | null {
    const headerCompanyId = this.normalize(request.headers?.['x-company-id']);
    const routeCompanyId = this.extractRouteCompanyId(request, allowedRouteParamKeys);

    if (this.hasCompanyIdInQuery(request.query)) {
      throw new BadRequestException('companyId no se acepta por query');
    }

    const candidates = [headerCompanyId, routeCompanyId].filter(
      (value): value is string => Boolean(value),
    );
    const unique = [...new Set(candidates)];

    if (unique.length > 1) {
      throw new BadRequestException('Contexto de empresa inconsistente');
    }

    return unique[0] ?? null;
  }

  private extractRouteCompanyId(request: any, allowedRouteParamKeys: string[]): string | null {
    const candidates = allowedRouteParamKeys
      .map((paramKey) => this.normalize(request.params?.[paramKey]))
      .filter((value): value is string => Boolean(value));
    const unique = [...new Set(candidates)];

    if (unique.length > 1) {
      throw new BadRequestException('Contexto de empresa inconsistente');
    }

    return unique[0] ?? null;
  }

  private hasCompanyIdInQuery(query: unknown): boolean {
    if (!query || typeof query !== 'object') {
      return false;
    }

    return Object.prototype.hasOwnProperty.call(query, 'companyId');
  }

  private normalize(value: unknown): string | null {
    if (Array.isArray(value)) {
      return typeof value[0] === 'string' && value[0].trim() ? value[0].trim() : null;
    }

    return typeof value === 'string' && value.trim() ? value.trim() : null;
  }
}
