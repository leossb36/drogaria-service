import { OrderStatusEnum } from '@core/common/enum/orderStatus.enum';

export class OrderDto {
  numeroPedido: number;
  cdOrcamento: number;
  situacao: number;
  status: `${OrderStatusEnum}`;
  items?: any[];
}
