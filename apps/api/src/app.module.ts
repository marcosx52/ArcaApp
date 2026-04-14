import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { PrismaModule } from './database/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { CompanyTaxConfigModule } from './modules/company-tax-config/company-tax-config.module';
import { SalesPointsModule } from './modules/sales-points/sales-points.module';
import { CustomersModule } from './modules/customers/customers.module';
import { ProductsModule } from './modules/products/products.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { InvoiceEventsModule } from './modules/invoice-events/invoice-events.module';
import { InvoiceRelationsModule } from './modules/invoice-relations/invoice-relations.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ReadinessModule } from './modules/readiness/readiness.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { CompanyAccessGuard } from './common/guards/company-access.guard';

@Module({
  imports: [
    AppConfigModule,
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    CompaniesModule,
    CompanyTaxConfigModule,
    SalesPointsModule,
    CustomersModule,
    ProductsModule,
    InvoicesModule,
    InvoiceEventsModule,
    InvoiceRelationsModule,
    DocumentsModule,
    DashboardModule,
    ReadinessModule,
  ],
  providers: [JwtAuthGuard, CompanyAccessGuard],
})
export class AppModule {}
