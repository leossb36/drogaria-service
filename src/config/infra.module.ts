import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from './configuration.config';

const connection = new ConfigService().get('mongo').url;

@Global()
@Module({
  imports: [
    MongooseModule.forRoot(connection),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.development', '.env.production'],
    }),
    HttpModule,
  ],
  providers: [ConfigService],
  exports: [HttpModule, ConfigService],
})
export class InfraModule {}
