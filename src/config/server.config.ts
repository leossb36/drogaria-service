import { SwaggerService } from '@common/swagger/swagger.service';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { ConfigService } from './configuration.config';

export class ServerConfig {
  private configService: ConfigService;
  private swaggerService: SwaggerService;
  constructor() {
    this.configService = new ConfigService();
    this.swaggerService = new SwaggerService();
  }

  async init() {
    const app = await NestFactory.create(AppModule);
    app.enableCors();
    app.useGlobalPipes(new ValidationPipe());
    app.setGlobalPrefix(this.configService.get('server').prefix);
    this.swaggerService.init(app);

    await app.listen(process.env.PORT || 3000);
  }
}
