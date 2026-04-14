import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('health')
  health() {
    return {
      success: true,
      data: { status: 'ok', service: 'api' },
      message: 'API healthy',
    };
  }

  @Get('ready')
  ready() {
    return {
      success: true,
      data: { ready: true },
      message: 'API ready',
    };
  }
}
