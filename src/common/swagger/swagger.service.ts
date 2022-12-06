import { Injectable } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@config/configuration.config';

@Injectable()
export class SwaggerService {
  private configService: ConfigService;
  constructor() {
    this.configService = new ConfigService();
  }
  init(app) {
    const config = new DocumentBuilder()
      .setTitle(this.configService.get('service').title)
      .setDescription(this.configService.get('service').description)
      .setVersion(this.configService.get('service').version)
      .addTag(this.configService.get('service').tag)
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('swagger', app, document);
  }
}
