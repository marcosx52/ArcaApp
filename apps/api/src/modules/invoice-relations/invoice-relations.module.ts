import { Module } from '@nestjs/common';
import { InvoiceRelationsController } from './invoice-relations.controller';
import { InvoiceRelationsService } from './invoice-relations.service';

@Module({
  controllers: [InvoiceRelationsController],
  providers: [InvoiceRelationsService],
})
export class InvoiceRelationsModule {}
