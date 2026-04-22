import 'reflect-metadata';
import { HttpException, INestApplicationContext, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppConfigModule } from '../src/config/config.module';
import { PrismaModule } from '../src/database/prisma.module';
import { PrismaService } from '../src/database/prisma.service';
import { WsaaClient } from '../src/integrations/arca/auth/wsaa-client';
import { WsaaCmsSigner } from '../src/integrations/arca/auth/wsaa-cms-signer';
import { WsaaAuthService } from '../src/integrations/arca/auth/wsaa-auth.service';
import { ArcaConfigResolver } from '../src/integrations/arca/shared/arca-config.resolver';

@Module({
  imports: [AppConfigModule, PrismaModule],
})
class WsaaHomologationTestModule {}

type CliOptions = {
  companyId?: string;
  showSecrets: boolean;
};

async function main() {
  const options = parseOptions();

  if (!options.companyId) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  let app: INestApplicationContext | undefined;

  try {
    app = await NestFactory.createApplicationContext(WsaaHomologationTestModule, {
      logger: false,
    });

    const prisma = app.get(PrismaService);
    const configService = app.get(ConfigService);
    const authService = new WsaaAuthService(
      prisma,
      new ArcaConfigResolver(prisma, configService),
      new WsaaCmsSigner(),
      new WsaaClient(),
    );
    const ticket = await authService.getTicket(options.companyId);

    console.log('WSAA homologacion OK');
    console.log(`companyId: ${ticket.companyId}`);
    console.log(`environment: ${ticket.environment}`);
    console.log(`serviceName: ${ticket.serviceName}`);
    console.log(`token obtenido: ${formatSecret(ticket.token, options.showSecrets)}`);
    console.log(`sign obtenido: ${formatSecret(ticket.sign, options.showSecrets)}`);
    console.log(`expiresAt: ${ticket.expiresAt.toISOString()}`);
  } catch (error) {
    console.error('WSAA homologacion ERROR');
    console.error(`companyId: ${options.companyId}`);
    console.error(`message: ${extractErrorMessage(error)}`);
    console.error('');
    console.error('Revisar requisitos:');
    console.error('- DATABASE_URL y JWT_SECRET cargados en apps/api/.env');
    console.error('- ARCA_CERTIFICATES_BASE_PATH apuntando a la carpeta de certificados');
    console.error('- CompanyCertificate TESTING con certificateStorageKey y privateKeyStorageKey');
    console.error('- Archivos de certificado y private key existentes y legibles');
    console.error('- ARCA_OPENSSL_BIN apuntando a un ejecutable OpenSSL disponible');
    process.exitCode = 1;
  } finally {
    if (app) {
      await app.get(PrismaService).$disconnect();
      await app.close();
    }
  }
}

function parseOptions(): CliOptions {
  const args = process.argv.slice(2);

  return {
    companyId:
      readOption(args, '--companyId') ||
      readOption(args, '--company-id') ||
      process.env.ARCA_TEST_COMPANY_ID,
    showSecrets: args.includes('--show-secrets'),
  };
}

function readOption(args: string[], optionName: string) {
  const inlineArg = args.find((arg) => arg.startsWith(`${optionName}=`));
  if (inlineArg) {
    return inlineArg.slice(optionName.length + 1).trim();
  }

  const optionIndex = args.indexOf(optionName);
  if (optionIndex >= 0) {
    return args[optionIndex + 1]?.trim();
  }

  return undefined;
}

function formatSecret(value: string, showSecrets: boolean) {
  if (showSecrets) {
    return value;
  }

  if (value.length <= 16) {
    return `si (len=${value.length})`;
  }

  return `si (len=${value.length}, preview=${value.slice(0, 8)}...${value.slice(-8)})`;
}

function extractErrorMessage(error: unknown) {
  if (error instanceof HttpException) {
    const response = error.getResponse();

    if (typeof response === 'string') {
      return response;
    }

    if (response && typeof response === 'object' && 'message' in response) {
      const message = (response as { message: string | string[] }).message;
      return Array.isArray(message) ? message.join('; ') : message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Error desconocido';
}

function printUsage() {
  console.error('Uso: pnpm --filter api arca:wsaa:test -- --companyId=<companyId>');
  console.error('Tambien se puede usar ARCA_TEST_COMPANY_ID=<companyId>.');
}

void main();
