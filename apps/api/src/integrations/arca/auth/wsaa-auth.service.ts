import { BadGatewayException, BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { ArcaConfigResolver } from '../shared/arca-config.resolver';
import {
  ArcaConfigurationError,
  ArcaIntegrationError,
  ARCA_ERRORS,
  WsaaParsingError,
  WsaaSigningError,
  WsaaTransportError,
} from '../shared/arca-errors';
import { WsaaTicket } from '../shared/arca-types';
import { WsaaClient } from './wsaa-client';
import { WsaaCmsSigner } from './wsaa-cms-signer';
import { parseWsaaResponse } from './wsaa-response.parser';
import { buildWsaaTicketRequestWithMetadata } from './wsaa-ticket-builder';

@Injectable()
export class WsaaAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configResolver: ArcaConfigResolver,
    private readonly signer: WsaaCmsSigner,
    private readonly client: WsaaClient,
  ) {}

  async getTicket(companyId: string): Promise<WsaaTicket> {
    const config = await this.configResolver.resolve(companyId);
    const cachedTicket = await this.findActiveSession(
      companyId,
      config.environment,
      config.serviceName,
    );

    if (cachedTicket) {
      return cachedTicket;
    }

    await this.expireOldSessions(companyId, config.environment, config.serviceName);

    const ticketRequest = buildWsaaTicketRequestWithMetadata({
      serviceName: config.serviceName,
    });

    const requestLog = await this.prisma.arcaRequestLog.create({
      data: {
        companyId,
        requestType: 'WSAA_LOGIN',
        environment: config.environment,
        endpointName: 'LoginCms',
        requestPayload: {
          serviceName: ticketRequest.serviceName,
          uniqueId: ticketRequest.uniqueId,
          generationTime: ticketRequest.generationTime.toISOString(),
          expirationTime: ticketRequest.expirationTime.toISOString(),
          endpointUrl: config.wsaaUrl,
        },
      },
      select: { id: true },
    });

    try {
      const cmsBase64 = await this.signer.sign(ticketRequest.xml, {
        certificatePath: config.certificatePath,
        privateKeyPath: config.privateKeyPath,
        opensslBin: config.opensslBin,
        privateKeyPassphrase: config.privateKeyPassphrase,
        timeoutMs: config.timeoutMs,
      });

      const response = await this.client.loginCms(cmsBase64, {
        endpointUrl: config.wsaaUrl,
        timeoutMs: config.timeoutMs,
      });
      const parsed = parseWsaaResponse(response.body);

      const session = await this.prisma.arcaAuthSession.create({
        data: {
          companyId,
          environment: config.environment,
          serviceName: config.serviceName,
          tokenValue: parsed.token,
          signValue: parsed.sign,
          expiresAt: parsed.expiresAt,
          status: 'ACTIVE',
        },
      });

      await this.prisma.arcaRequestLog.update({
        where: { id: requestLog.id },
        data: {
          httpStatus: response.httpStatus,
          integrationResult: 'SUCCESS',
          responsePayload: {
            expiresAt: parsed.expiresAt.toISOString(),
          },
          respondedAt: new Date(),
        },
      });

      return {
        companyId: session.companyId,
        environment: session.environment,
        serviceName: session.serviceName,
        token: session.tokenValue || '',
        sign: session.signValue || '',
        expiresAt: session.expiresAt,
      };
    } catch (error) {
      await this.persistFailure(requestLog.id, error);
      throw this.toHttpException(error);
    }
  }

  private async findActiveSession(
    companyId: string,
    environment: 'TESTING',
    serviceName: string,
  ): Promise<WsaaTicket | null> {
    const minValidUntil = new Date(Date.now() + 60 * 1000);
    const session = await this.prisma.arcaAuthSession.findFirst({
      where: {
        companyId,
        environment,
        serviceName,
        status: 'ACTIVE',
        expiresAt: { gt: minValidUntil },
        tokenValue: { not: null },
        signValue: { not: null },
      },
      orderBy: { expiresAt: 'desc' },
    });

    if (!session?.tokenValue || !session.signValue) {
      return null;
    }

    return {
      companyId: session.companyId,
      environment: session.environment,
      serviceName: session.serviceName,
      token: session.tokenValue,
      sign: session.signValue,
      expiresAt: session.expiresAt,
    };
  }

  private expireOldSessions(companyId: string, environment: 'TESTING', serviceName: string) {
    return this.prisma.arcaAuthSession.updateMany({
      where: {
        companyId,
        environment,
        serviceName,
        status: 'ACTIVE',
        expiresAt: { lte: new Date() },
      },
      data: { status: 'EXPIRED' },
    });
  }

  private async persistFailure(requestLogId: string, error: unknown) {
    const arcaError = error instanceof ArcaIntegrationError ? error : null;
    const transportError = error instanceof WsaaTransportError ? error : null;
    const message = error instanceof Error ? error.message : 'Error desconocido';

    await this.prisma.arcaRequestLog.update({
      where: { id: requestLogId },
      data: {
        httpStatus: transportError?.httpStatus,
        integrationResult: this.resolveFailureResult(error),
        responsePayload: transportError?.responseBody
          ? { bodyPreview: transportError.responseBody.slice(0, 1000) }
          : undefined,
        errorCode: arcaError?.code || ARCA_ERRORS.UNKNOWN,
        errorMessage: message,
        respondedAt: new Date(),
      },
    });
  }

  private resolveFailureResult(error: unknown) {
    if (error instanceof WsaaParsingError) {
      return 'PARSING_ERROR';
    }

    if (error instanceof WsaaTransportError) {
      return 'TRANSPORT_ERROR';
    }

    return 'UNKNOWN';
  }

  private toHttpException(error: unknown) {
    if (error instanceof ArcaConfigurationError || error instanceof WsaaSigningError) {
      return new BadRequestException(error.message);
    }

    if (error instanceof WsaaTransportError || error instanceof WsaaParsingError) {
      return new BadGatewayException(error.message);
    }

    const message = error instanceof Error ? error.message : 'Error desconocido al obtener TA WSAA';
    return new BadGatewayException(message);
  }
}
