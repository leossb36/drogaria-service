import { Product } from '@core/infra/integration/model/product.model';
import { ApiProperty } from '@nestjs/swagger';
import { BaseModelView } from './base.mv';

export class GetProductInformationModelView extends BaseModelView {
  @ApiProperty()
  data: Array<Product>;
}
