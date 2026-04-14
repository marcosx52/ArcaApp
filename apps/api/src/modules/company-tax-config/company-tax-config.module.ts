import { Module } from '@nestjs/common';
import { CompanyTaxConfigController } from './company-tax-config.controller';
import { CompanyTaxConfigService } from './company-tax-config.service';

@Module({
  controllers: [CompanyTaxConfigController],
  providers: [CompanyTaxConfigService],
  exports: [CompanyTaxConfigService],
})
export class CompanyTaxConfigModule {}
