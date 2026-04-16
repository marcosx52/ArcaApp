import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { QueryCustomersDto } from './dto/query-customers.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(companyId: string, query: QueryCustomersDto) {
    return this.prisma.customer.findMany({
      where: {
        companyId,
        ...(typeof query.isActive === 'string' ? { isActive: query.isActive === 'true' } : {}),
        ...(typeof query.isFrequent === 'string' ? { isFrequent: query.isFrequent === 'true' } : {}),
        ...(query.q
          ? {
              OR: [
                { legalName: { contains: query.q, mode: 'insensitive' } },
                { documentNumber: { contains: query.q } },
              ],
            }
          : {}),
      },
      orderBy: [{ isActive: 'desc' }, { legalName: 'asc' }],
    });
  }

  create(companyId: string, dto: CreateCustomerDto) {
    return this.prisma.customer.create({
      data: { companyId, ...dto },
    });
  }

  async findOne(companyId: string, id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, companyId },
    });

    if (!customer) throw new NotFoundException('Cliente no encontrado');
    return customer;
  }

  async update(companyId: string, id: string, dto: UpdateCustomerDto) {
    await this.findOne(companyId, id);

    return this.prisma.customer.update({
      where: { id },
      data: dto,
    });
  }

  async archive(companyId: string, id: string) {
    await this.findOne(companyId, id);

    return this.prisma.customer.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
