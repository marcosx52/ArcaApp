import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'node:path';
import { PrismaService } from '../../../database/prisma.service';
import { ArcaResolvedConfig } from './arca-types';
import { ArcaConfigurationError } from './arca-errors';

@Injectable()
export class ArcaConfigResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async resolve(companyId: string): Promise<ArcaResolvedConfig> {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, cuit: true },
    });

    if (!company) {
      throw new ArcaConfigurationError('Empresa no encontrada para configurar ARCA');
    }

    const taxConfig = await this.prisma.companyTaxConfig.findFirst({
      where: { companyId, environment: 'TESTING' },
      orderBy: { updatedAt: 'desc' },
      select: { arcaServiceType: true },
    });

    const certificate = await this.prisma.companyCertificate.findFirst({
      where: {
        companyId,
        environment: 'TESTING',
        certificateStatus: { in: ['VALID', 'UPLOADED'] },
        OR: [{ validTo: null }, { validTo: { gt: new Date() } }],
      },
      orderBy: { updatedAt: 'desc' },
      select: {
        certificateStorageKey: true,
        privateKeyStorageKey: true,
      },
    });

    if (!certificate) {
      throw new ArcaConfigurationError(
        'No hay certificado de homologacion ARCA disponible para la empresa',
      );
    }

    return {
      companyId,
      cuit: company.cuit,
      environment: 'TESTING',
      serviceName: this.resolveWsaaServiceName(taxConfig?.arcaServiceType),
      wsaaUrl:
        this.configService.get<string>('arca.wsaaTestingUrl') ||
        'https://wsaahomo.afip.gov.ar/ws/services/LoginCms',
      certificatePath: this.resolveStoragePath(certificate.certificateStorageKey),
      privateKeyPath: this.resolveStoragePath(certificate.privateKeyStorageKey),
      opensslBin: this.configService.get<string>('arca.opensslBin') || 'openssl',
      privateKeyPassphrase: this.configService.get<string>('arca.privateKeyPassphrase') || '',
      timeoutMs: this.configService.get<number>('arca.wsaaTimeoutMs') || 15000,
    };
  }

  private resolveWsaaServiceName(serviceName?: string | null) {
    const defaultService = this.configService.get<string>('arca.defaultService') || 'wsfe';
    const candidate = (serviceName || defaultService).trim().toLowerCase();

    if (candidate === 'wsfev1') {
      return 'wsfe';
    }

    return candidate;
  }

  private resolveStoragePath(storageKey: string) {
    if (path.isAbsolute(storageKey)) {
      return storageKey;
    }

    const basePath = this.configService.get<string>('arca.certificatesBasePath') || process.cwd();
    return path.resolve(basePath, storageKey);
  }
}
