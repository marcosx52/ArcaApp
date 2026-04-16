import { CompanyRole } from '@prisma/client';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type CurrentCompanyContext = {
  id: string;
  membershipId: string;
  userId: string;
  role: CompanyRole;
  isDefault: boolean;
};

type CurrentCompanySelector = keyof CurrentCompanyContext | 'context';

export const CurrentCompany = createParamDecorator(
  (data: CurrentCompanySelector | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const company = request.currentCompany as CurrentCompanyContext | null | undefined;

    if (!company) {
      return null;
    }

    if (data === 'context') {
      return company;
    }

    if (data) {
      return company[data];
    }

    return company.id;
  },
);
