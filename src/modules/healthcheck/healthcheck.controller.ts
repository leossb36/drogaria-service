import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

@ApiTags('HealthCheck')
@Controller()
export class HealthCheckController {
  @Get('health')
  getHealthCheck() {
    return { message: 'online' }
  }
}
