import { Product } from '@core/infra/integration/model/product.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class GetProductInformationModelView {
  @ApiProperty()
  @IsNumber()
  status: number;

  @ApiProperty()
  data: Array<Product>;

  @ApiProperty()
  @IsString()
  msg: string;

  @ApiProperty()
  @IsNumber()
  total: number;
}
