import { Product } from '../dto/get-product.dto';

export interface IProduct {
  status: number;
  data: Product[];
  msg: string;
  total: number;
}
