import { Controller, Get } from '@nestjs/common';

/** 健康检查：验证服务可启动、可路由。无需鉴权。 */
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
