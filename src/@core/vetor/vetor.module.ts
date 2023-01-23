import { GetProductVetorUseCase } from '@core/application/use-cases/vetor/getProductVetor.use-case';
import { VetorIntegrationRepositoryKey } from '@core/domain/vetor/IVetorRepository';
import { VetorIntegrationRepository } from '@core/infra/repository/vetor.repository';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { VetorIntegrationController } from './vetor.controller';

@Module({
  imports: [HttpModule],
  providers: [
    GetProductVetorUseCase,
    {
      provide: VetorIntegrationRepositoryKey,
      useClass: VetorIntegrationRepository,
    },
  ],
  controllers: [VetorIntegrationController],
})
export class VetorModule {}
