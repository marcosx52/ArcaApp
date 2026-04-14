import { Module } from '@nestjs/common';
import { SalesPointsController } from './sales-points.controller';
import { SalesPointsService } from './sales-points.service';

@Module({
  controllers: [SalesPointsController],
  providers: [SalesPointsService],
  exports: [SalesPointsService],
})
export class SalesPointsModule {}
