import { SwaggerService } from '@common/swagger/swagger.service';
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
    const port: number = this.configService.get('server').port;

    const app = await NestFactory.create(AppModule);
    this.swaggerService.init(app);

    await app.listen(port).then(() => {
      console.log(`API running on port ${port}`);
    });
  }
}
