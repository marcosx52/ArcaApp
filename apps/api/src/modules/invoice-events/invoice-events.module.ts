import { Module } from '@nestjs/common';
import { InvoiceEventsController } from './invoice-events.controller';
import { InvoiceEventsService } from './invoice-events.service';

@Module({
  controllers: [InvoiceEventsController],
  providers: [InvoiceEventsService],
  exports: [InvoiceEventsService],
})
export class InvoiceEventsModule {}
