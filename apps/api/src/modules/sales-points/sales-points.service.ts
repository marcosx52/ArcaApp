import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSalesPointDto } from './dto/create-sales-point.dto';
import { UpdateSalesPointDto } from './dto/update-sales-point.dto';

@Injectable()
export class SalesPointsService {
  constructor(private readonly prisma: PrismaService) {}

  list(companyId: string) {
    return this.prisma.salesPoint.findMany({ where: { companyId }, orderBy: { posNumber: 'asc' } });
  }

  create(companyId: string, dto: CreateSalesPointDto) {
    return this.prisma.salesPoint.create({ data: { companyId, ...dto } });
  }

  update(id: string, dto: UpdateSalesPointDto) {
    return this.prisma.salesPoint.update({ where: { id }, data: dto });
  }

  findOne(id: string) {
    return this.prisma.salesPoint.findUnique({ where: { id } });
  }
}
