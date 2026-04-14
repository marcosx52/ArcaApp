import { Module } from '@nestjs/common';
import { WsaaAuthService } from './auth/wsaa-auth.service';
import { ArcaConfigResolver } from './shared/arca-config.resolver';
import { WsfeEmissionService } from './wsfe/wsfe-emission.service';

@Module({
  providers: [WsaaAuthService, ArcaConfigResolver, WsfeEmissionService],
  exports: [WsaaAuthService, ArcaConfigResolver, WsfeEmissionService],
})
export class ArcaModule {}
