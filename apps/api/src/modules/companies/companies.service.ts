import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CompaniesRepository } from './companies.repository';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(private readonly repo: CompaniesRepository) {}

  create(dto: CreateCompanyDto) {
    return this.repo.create(dto);
  }

  findAll(userId: string) {
    return this.repo.findAllByUser(userId);
  }

  async findOne(id: string, userId: string) {
    await this.ensureAccess(id, userId);
    const company = await this.repo.findById(id);
    if (!company) throw new NotFoundException('Empresa no encontrada');
    return company;
  }

  async update(id: string, userId: string, dto: UpdateCompanyDto) {
    await this.ensureAccess(id, userId);
    return this.repo.update(id, dto);
  }

  async readiness(id: string, userId: string) {
    await this.ensureAccess(id, userId);
    const company = await this.repo.findById(id);

    return {
      success: true,
      data: {
        companyId: id,
        onboardingStatus: company?.onboardingStatus ?? 'DRAFT',
        isReadyForHomologation: false,
        isReadyForProduction: false,
        checks: [
          { key: 'company', status: company ? 'ok' : 'blocked', message: company ? 'Empresa creada' : 'Falta crear empresa' },
          { key: 'arca', status: 'warning', message: 'Falta completar readiness ARCA' },
        ],
      },
    };
  }

  private async ensureAccess(companyId: string, userId: string) {
    const membership = await this.repo.findMembership(userId, companyId);
    if (!membership) {
      throw new ForbiddenException('No tenés acceso a esa empresa');
    }
  }
}
