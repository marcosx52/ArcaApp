import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(companyId: string, query: QueryProductsDto) {
    return this.prisma.product.findMany({
      where: {
        companyId,
        ...(typeof query.isActive === 'string' ? { isActive: query.isActive === 'true' } : {}),
        ...(query.itemType ? { itemType: query.itemType } : {}),
        ...(query.q ? { name: { contains: query.q, mode: 'insensitive' } } : {}),
      },
      orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
    });
  }

  create(companyId: string, dto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        companyId,
        ...dto,
        referencePrice: dto.referencePrice,
        vatRate: dto.vatRate,
      },
    });
  }

  async findOne(companyId: string, id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, companyId },
    });

    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }

  async update(companyId: string, id: string, dto: UpdateProductDto) {
    await this.findOne(companyId, id);

    return this.prisma.product.update({
      where: { id },
      data: {
        ...dto,
        referencePrice: dto.referencePrice,
        vatRate: dto.vatRate,
      },
    });
  }

  async archive(companyId: string, id: string) {
    await this.findOne(companyId, id);

    return this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
