import { TransformInterceptor } from '@app/common/interceptors/transform.interceptor'
import { ParseInterceptor } from '@app/common/interceptors/parse.interceptor'
import { ErrorsInterceptor } from '@common/interceptors/errors.interceptor'
import { SwaggerService } from '@common/swagger/swagger.service'
import { setupGracefulShutdown } from 'nestjs-graceful-shutdown'
import { ConfigService } from './configuration.config'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from '@app/app.module'
import { NestFactory } from '@nestjs/core'

export class ServerConfig {
  private configService: ConfigService
  private swaggerService: SwaggerService
  constructor() {
    this.configService = new ConfigService()
    this.swaggerService = new SwaggerService()
  }

  async init() {
    const app = await NestFactory.create(AppModule, {
      logger:
        process.env.NODE_ENV !== 'production'
          ? ['log', 'error', 'warn', 'debug', 'verbose']
          : ['error', 'warn']
    })

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true
      })
    )

    const prefix = this.configService.get('server').prefix

    setupGracefulShutdown({ app })

    app.enableCors({
      credentials: true,
      allowedHeaders: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
      origin: '*'
    })

    app.use((req, res, next) => {
      if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS')
        res.header(
          'Access-Control-Allow-Headers',
          'Content-Type, Accept, Authorization, multipart/form-data'
        )
        return res.sendStatus(204)
      }
      next()
    })

    app.useGlobalInterceptors(
      new ErrorsInterceptor(),
      new TransformInterceptor(),
      new ParseInterceptor()
    )

    app.setGlobalPrefix(prefix)
    this.swaggerService.init(app)

    const port: number = +process.env.PORT || 3000
    await app
      .listen(port)
      .then(() => {
        console.log(`LISTENING ON PORT: ${port}`)
      })
      .catch(err => {
        console.log(`Unable to stabilish connection:: ${err.message}`)
      })
  }
}
