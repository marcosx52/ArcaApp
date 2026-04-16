import { SetMetadata } from '@nestjs/common';

export const ALLOW_COMPANY_ROUTE_PARAM_KEY = 'allow_company_route_param';

export const AllowCompanyRouteParam = (...paramNames: string[]) =>
  SetMetadata(ALLOW_COMPANY_ROUTE_PARAM_KEY, paramNames.length > 0 ? paramNames : ['companyId']);
