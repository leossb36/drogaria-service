import { ConfigService } from './configuration.config'
import { Global, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { HttpModule } from '@nestjs/axios'

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.development', '.env.production']
    }),
    HttpModule
  ],
  providers: [ConfigService],
  exports: [HttpModule, ConfigService]
})
export class InfraModule {}
