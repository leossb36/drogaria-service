import { Product } from '@core/infra/integration/model/product.model';

export interface IProduct {
  status: number;
  data: Product;
  msg: string;
  total: number;
}
