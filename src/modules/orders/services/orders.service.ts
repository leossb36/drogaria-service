import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger
} from '@nestjs/common'
import { Reduce, setDelay, validateDate, validatePhone } from '@app/modules/utils/functions'
import { statusMap, VetorStatusEnum } from '@app/modules/shared/enum/status.enum'
import { WcService } from '@app/modules/shared/service/woocommerce.service'
import { VetorService } from '@app/modules/shared/service/vetor.service'
import { OrderStatusEnum } from '@app/modules/shared/enum/order.enum'
import { OrderRepository } from '../repositories/order.repository'
import { MESSAGES } from '@app/modules/common/constants/message'
import { ValidationHelper } from '@app/modules/utils/validation'
import { GetOrderModelView } from '../model-views/get-order.mv'
import MysqlConnection from '@app/config/db.config'
import { GetWebhookDto } from '../dtos/webhook.dto'
import mysql from 'mysql2/promise'

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name)

  constructor(
    private readonly wcService: WcService,
    private readonly vetorService: VetorService,
    private readonly orderRepository: OrderRepository
  ) {}

  async getByOrderNumber(orderNumber: number) {
    try {
      if (!orderNumber) {
        throw new BadRequestException(MESSAGES.NOT_FOUND)
      }
      const response = await this.orderRepository.getByOrderNumber(orderNumber)

      if (!response) {
        throw new BadRequestException(MESSAGES.ERROR)
      }

      return response
    } catch (error) {
      throw new InternalServerErrorException(error.message)
    }
  }

  async updateOrder(webhook: GetWebhookDto): Promise<number> {
    try {
      const order = await this.getByOrderNumber(+webhook.pedidoId)

      if (!order) {
        return 0
      }

      const orderStatus = ValidationHelper.setOrderStatus(webhook.status)
      const response = await this.wcService.updateOrderStatus(order.numeroPedido, orderStatus)

      if (!response) {
        return 0
      }

      const situation = statusMap[webhook.status as VetorStatusEnum]
      const updatedOrder = await this.orderRepository.updateOrderStatus(
        order.numeroPedido,
        situation,
        orderStatus
      )

      if (!updatedOrder) {
        return 0
      }

      return updatedOrder
    } catch (error) {
      throw new InternalServerErrorException(error.message)
    }
  }

  async createOrder(): Promise<GetOrderModelView> {
    try {
      const existentOrders = await this.wcService.getOrders()

      if (!existentOrders.length) {
        return null
      }

      const orderToProcess = await this.validateIfOrderWasSent(existentOrders)

      if (!orderToProcess.length) {
        return null
      }

      for (const order of orderToProcess) {
        const itens = await this.getItems(order)
        const paymentInfo = this.formateStringObservation(order)
        const vlrFrete = order.shipping_total !== '' ? Number(order.shipping_total) : 0
        const taxes = order.fee_lines.map(tax => Number(tax.total))
        const vlrOutros = Reduce(taxes)
        const orderTotal = Number(order.total)
        const discount = Reduce(itens.map(item => item.vlrDesconto))

        const produtosOnly = orderTotal - vlrFrete - vlrOutros - discount

        const vlrProdutos = Number(produtosOnly.toFixed(2))

        const payload = {
          cdFilial: +process.env.CD_FILIAL,
          cgcFilial: process.env.CGC_FILIAL || '',
          dtEmissao: new Date().toISOString(),
          cliente: this.getClient(order),
          vlrProdutos,
          vlrDescontos: discount,
          vlrFrete,
          vlrOutros,
          vlrTotal: Number(order.total),
          vlrTroco: 0,
          observacao: paymentInfo,
          nrPedido: order.id.toString(),
          retirar: false,
          itens
        }

        await setDelay(1000)

        const response = await this.vetorService.createOrder(payload, '/pedidos')

        if (!response && response.status !== 200) {
          this.logger.error('Erro de processamento na vetor')
          throw new InternalServerErrorException('Erro de processamento na vetor')
        }

        const dbConnection: mysql.Pool = await MysqlConnection.connect()

        const products = await this.wcService.getProducts(dbConnection, [])

        const items = []
        itens.filter(product => {
          const filteredItem = products.filter(
            item => Number(item.sku.split('-')[0]) === product.cdProduto
          )[0]
          items.push({
            woocommerceId: filteredItem.id,
            vetorId: product.cdProduto
          })
        })

        const createOnDataBase = await this.orderRepository.create({
          cdOrcamento: response.cdOrcamento,
          numeroPedido: order.id,
          situacao: response.situacao,
          status: OrderStatusEnum.PROCESSING,
          items: items
        })

        if (!createOnDataBase) {
          await MysqlConnection.endConnection(dbConnection)
          this.logger.error('Erro ao salvar registro no banco de dados')
          throw new InternalServerErrorException('Erro ao salvar registro no banco de dados')
        }

        await MysqlConnection.endConnection(dbConnection)

        return order
      }
    } catch (error) {
      this.logger.error('Erro interno:', error.message)
      throw new InternalServerErrorException(error.message)
    }
  }

  private getClient(dto: any) {
    const { billing } = dto
    return {
      nome: `${billing?.first_name} ${dto.billing?.last_name}`,
      cpfCgc: billing?.cpf,
      telefone: validatePhone(billing.phone),
      sexo: billing?.sex,
      dtNascimento: validateDate(billing?.birthdate),
      endereco: billing?.address_1,
      numero: billing?.number,
      complemento: '',
      cep: billing?.postcode,
      bairro: billing?.neighborhood,
      cidade: billing?.city,
      uf: billing?.state,
      email: billing.email,
      cidadeIBGE: 0,
      referencia: '',
      inscEstadual: '',
      inscMunicipal: ''
    }
  }

  private async getItems(dto: any) {
    const { line_items } = dto

    if (!line_items.length) {
      return []
    }

    const items = []

    for (const item of line_items) {
      const product = await this.wcService.productById(item.product_id.toString())
      const cdProduct = item.sku.split('-')

      const data = {
        cdProduto: Number(cdProduct[0]),
        cdBarrasProduto: product.data.attributes[0].options[0].toString(),
        quantidade: item.quantity,
        vlrUnitario: Number(item.price.toFixed(2)),
        vlrDesconto: Number(item.total_tax),
        vlrTotal: Number(item.total)
      }

      items.push(data)
    }
    return items
  }

  private async validateIfOrderWasSent(orders: any[]) {
    const sentOrders = await this.orderRepository.getOrders(orders.map(order => order.id))

    const ordersNotSent = orders.filter(
      order => !sentOrders.some(mongoOrder => order.id === mongoOrder.numeroPedido)
    )

    return ordersNotSent
  }

  private formateStringObservation(order: any) {
    const transaction = order.transaction_id ? `(${order.transaction_id.toString()})` : ''
    const date = new Intl.DateTimeFormat('pt-br', {
      dateStyle: 'full',
      timeStyle: 'long'
    }).format(new Date(order.date_paid))

    const message =
      order.shipping_total && order.shipping_total !== ''
        ? `Frete: RS ${order.shipping_total} - Entrega ao destinatário`
        : 'Retirada no local'

    return `Pagamento via ${order.payment_method_title.toString()} ${transaction}. Pago em ${date}. ${message}`
  }
}
