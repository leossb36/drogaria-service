import { OrderStatusEnum } from './enum/orderStatus.enum';

export class OrderDto {
  numeroPedido: number;
  cdOrcamento: number;
  situacao: number;
  status: `${OrderStatusEnum}`;
}
