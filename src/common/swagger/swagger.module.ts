import { SwaggerService } from './swagger.service'
import { Module } from '@nestjs/common'

@Module({
  providers: [SwaggerService]
})
export class SwaggerModule {}
