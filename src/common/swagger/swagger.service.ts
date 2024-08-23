import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { ConfigService } from '@config/configuration.config'
import { Injectable } from '@nestjs/common'

@Injectable()
export class SwaggerService {
  private configService: ConfigService
  constructor() {
    this.configService = new ConfigService()
  }
  init(app) {
    const options = {
      definition: {
        info: {
          title: this.configService.get('service').title,
          version: this.configService.get('service').version,
          description: this.configService.get('service').description
        }
      }
    }
    if (!this.configService.get('server').isEnabled) return
    const config = new DocumentBuilder()
      .setTitle(options.definition.info.title)
      .setDescription(options.definition.info.description)
      .setVersion(options.definition.info.version)
      .setExternalDoc('Json document download URL', `/swagger.json`)
      .addBearerAuth()
      .build()
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup(`${this.configService.get('server').prefix}/docs`, app, document, {
      jsonDocumentUrl: 'swagger.json'
    })
  }
}
