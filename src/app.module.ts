import { Module } from '@nestjs/common';
import { SwaggerModule } from '@common/swagger/swagger.module';
import { VetorModule } from '@core/vetor/vetor.module';

const restImports = [SwaggerModule, VetorModule];

@Module({
  imports: [...restImports],
})
export class AppModule {}
