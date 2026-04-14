import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateCompanyDto) {
    return this.prisma.company.create({ data });
  }

  async findAllByUser(userId: string) {
    const memberships = await this.prisma.userCompany.findMany({
      where: { userId },
      include: { company: true },
      orderBy: { createdAt: 'desc' },
    });

    return memberships.map((membership) => membership.company);
  }

  findById(id: string) {
    return this.prisma.company.findUnique({ where: { id } });
  }

  update(id: string, data: UpdateCompanyDto) {
    return this.prisma.company.update({ where: { id }, data });
  }

  findMembership(userId: string, companyId: string) {
    return this.prisma.userCompany.findFirst({
      where: { userId, companyId },
    });
  }
}
