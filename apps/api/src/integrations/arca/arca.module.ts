import { Module } from '@nestjs/common';
import { WsaaAuthService } from './auth/wsaa-auth.service';
import { WsaaClient } from './auth/wsaa-client';
import { WsaaCmsSigner } from './auth/wsaa-cms-signer';
import { ArcaConfigResolver } from './shared/arca-config.resolver';
import { WsfeEmissionService } from './wsfe/wsfe-emission.service';

@Module({
  providers: [
    WsaaAuthService,
    WsaaClient,
    WsaaCmsSigner,
    ArcaConfigResolver,
    WsfeEmissionService,
  ],
  exports: [WsaaAuthService, ArcaConfigResolver, WsfeEmissionService],
})
export class ArcaModule {}
