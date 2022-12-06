import { Module } from '@nestjs/common';
import { SwaggerModule } from '@common/swagger/swagger.module';

const restImports = [SwaggerModule];

@Module({
  imports: [...restImports],
})
export class AppModule {}
