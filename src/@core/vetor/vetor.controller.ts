import { getProductVetorDto } from '@core/application/dto/getProductVetor.dto';
import { GetProductInformationModelView } from '@core/application/mv/getProductInformation.mv';
import { GetProductVetorUseCase } from '@core/application/use-cases/vetor/getProductVetor.use-case';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Vetor')
@Controller('vetor')
export class VetorIntegrationController {
  constructor(
    private readonly getProductVetorUseCase: GetProductVetorUseCase,
  ) {}

  @Get('/products')
  async getProduct(
    @Query() query: getProductVetorDto,
  ): Promise<GetProductInformationModelView> {
    return this.getProductVetorUseCase.execute(query);
  }
}
