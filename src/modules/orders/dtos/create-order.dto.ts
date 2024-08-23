import { OrderStatusEnum } from '@app/modules/shared/enum/order.enum'

export class CreateOrderDto {
  numeroPedido: number
  cdOrcamento: number
  situacao: number
  status: `${OrderStatusEnum}`
  items?: any[]
}
