import { Product } from '../dto/product.dto';

export interface IProduct {
  status: number;
  data: Product[];
  msg: string;
  total: number;
}
