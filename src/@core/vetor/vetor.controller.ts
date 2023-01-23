import { getProductVetorDto } from '@core/application/dto/getProductVetor.dto';
import { GetProductInformationModelView } from '@core/application/mv/getProductInformation.mv';
import { GetProductVetorUseCase } from '@core/application/use-cases/vetor/getProductVetor.use-case';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller('Vetor')
@ApiTags('vetor')
export class VetorIntegrationController {
  constructor(
    private readonly getProductVetorUseCase: GetProductVetorUseCase,
  ) {}

  @Get()
  async getProduct(
    @Query() query: getProductVetorDto,
  ): Promise<GetProductInformationModelView> {
    return this.getProductVetorUseCase.execute(query);
  }
}
