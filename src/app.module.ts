import { Module } from '@nestjs/common';
import { SwaggerModule } from '@common/swagger/swagger.module';
import { VetorModule } from '@core/vetor/vetor.module';
import { InfraModule } from '@config/infra.module';

const restImports = [SwaggerModule, InfraModule, VetorModule];

@Module({
  imports: [...restImports],
})
export class AppModule {}
