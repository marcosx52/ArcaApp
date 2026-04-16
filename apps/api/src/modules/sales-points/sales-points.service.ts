import { Injectable, NotFoundException } from '@nestjs/common';
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

  async findOne(companyId: string, id: string) {
    const salesPoint = await this.prisma.salesPoint.findFirst({
      where: { id, companyId },
    });

    if (!salesPoint) throw new NotFoundException('Punto de venta no encontrado');
    return salesPoint;
  }

  async update(companyId: string, id: string, dto: UpdateSalesPointDto) {
    const result = await this.prisma.salesPoint.updateMany({
      where: { id, companyId },
      data: dto,
    });

    if (result.count === 0) throw new NotFoundException('Punto de venta no encontrado');

    return this.findOne(companyId, id);
  }
}
