import { Product } from '@core/infra/integration/model/product.model';

export class GetProductInformationModelView {
  status: number;
  data: Array<Product>;
  msg: string;
  total: number;
}
