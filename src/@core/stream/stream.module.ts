import { Module } from '@nestjs/common';
import { CreateStreamUseCase } from './use-case/create-stream.use-case';
import { GetStreamUseCase } from './use-case/get-stream.use-case';
import { IntegrationModule } from '@core/infra/integration.module';
import { StreamService } from './stream.service';

@Module({
  imports: [IntegrationModule],
  providers: [StreamService, CreateStreamUseCase, GetStreamUseCase],
  exports: [StreamService, CreateStreamUseCase, GetStreamUseCase],
})
export class StreamModule {}
