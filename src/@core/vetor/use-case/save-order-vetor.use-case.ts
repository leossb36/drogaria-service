import MysqlConnection from '@config/mysql.config';
import { VetorIntegrationGateway } from '@core/infra/integration/vetor-api.integration';
import { WoocommerceIntegration } from '@core/infra/integration/woocommerce-api.integration';
import { ValidationHelper } from '@core/utils/validation-helper';
import { BadRequestException, Injectable } from '@nestjs/common';
import * as mysql from 'mysql2/promise';
import { OrderStatusEnum } from '@core/common/enum/orderStatus.enum';
import * as messages from '@common/messages/response-messages.json';
import { ValidationClientHelper } from '@core/utils/validation-client-helper';
import { GetProductsFromWoocommerceUseCase } from '@core/wordpress/use-case/get-products-from-woocommerce.use-case';
import { Cliente, CreateOrderDto, Item } from '../dto/create-order.dto';
import { OrderRepository } from '@core/infra/db/repositories/order.repository';

@Injectable()
export class SaveOrderVetorUseCase {
  constructor(
    private readonly integration: VetorIntegrationGateway,
    private readonly woocommerceIntegration: WoocommerceIntegration,
    private readonly orderRepository: OrderRepository,
    private readonly getProductsFromWoocommerceUseCase: GetProductsFromWoocommerceUseCase,
  ) {}

  async execute() {
    const ordersFromWoocommerce =
      await this.woocommerceIntegration.getOrdersByStatus();

    if (!ordersFromWoocommerce.data.length) {
      return {
        data: 0,
        msg: `There's no order to send to vetor - 1`,
        status: 200,
      };
    }

    const ordersNotSent = await this.validateIfOrderWasSent(
      ordersFromWoocommerce.data,
    );

    if (!ordersNotSent.length) {
      return {
        data: 0,
        msg: `There's no order to send to vetor - 2`,
        status: 200,
      };
    }

    for (const order of ordersNotSent) {
      const itens = await this.getItems(order);
      const paymentInfo = this.formateStringObservation(order);
      const vlrFrete =
        order.shipping_total !== '' ? Number(order.shipping_total) : 0;
      const sendToVetor = {
        cdFilial: +process.env.CD_FILIAL,
        cgcFilial: process.env.CGC_FILIAL || '',
        dtEmissao: new Date().toISOString(),
        cliente: this.getClient(order),
        vlrProdutos: Number(Number(Number(order.total) - vlrFrete).toFixed(2)),
        vlrDescontos: 0,
        vlrFrete,
        vlrOutros: 0,
        vlrTotal: Number(order.total),
        vlrTroco: 0,
        observacao: paymentInfo,
        nrPedido: order.id.toString(),
        retirar: false,
        itens,
      } as CreateOrderDto;

      const result = await this.integration.createOrder(
        sendToVetor,
        '/pedidos',
      );

      if (!result || !ValidationHelper.isOk(result.status)) {
        throw new BadRequestException('Cannot create order');
      }

      const { data } = result;

      const pool: mysql.Pool = await MysqlConnection.connect();
      const productsFromWooCommerce =
        await this.getProductsFromWoocommerceUseCase.execute(pool, []);

      const items = [];
      itens.filter((product) => {
        const filteredItem = productsFromWooCommerce.filter(
          (item) => Number(item.sku.split('-')[0]) === product.cdProduto,
        )[0];
        items.push({
          woocommerceId: filteredItem.id,
          vetorId: product.cdProduto,
        });
      });

      const createOnDataBase = await this.orderRepository.create({
        cdOrcamento: data.cdOrcamento,
        numeroPedido: order.id,
        situacao: data.situacao,
        status: OrderStatusEnum.PROCESSING,
        items: items,
      });

      if (!createOnDataBase) {
        await MysqlConnection.endConnection(pool);
        throw new BadRequestException(
          'Cannot save on database the vetor register',
        );
      }

      await MysqlConnection.endConnection(pool);

      return {
        data: order.data,
        msg: messages.vetor.integration.create.order.success,
        status: order.status,
      };
    }
  }
  private getClient(dto: any): Cliente {
    const { billing } = dto;
    return {
      nome: `${billing?.first_name} ${dto.billing?.last_name}`,
      cpfCgc: billing?.cpf,
      telefone: ValidationClientHelper.validatePhone(billing.phone),
      sexo: billing?.sex,
      dtNascimento: ValidationClientHelper.validateDate(billing?.birthdate),
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
      inscMunicipal: '',
    };
  }
  private async getItems(dto: any): Promise<Item[]> {
    const { line_items } = dto;

    if (!line_items.length) {
      return [];
    }

    const items = [];

    for (const item of line_items) {
      const product = await this.woocommerceIntegration.productById(
        item.product_id.toString(),
      );
      const cdProduct = item.sku.split('-');

      const data = {
        cdProduto: Number(cdProduct[0]),
        cdBarrasProduto: product.data.attributes[0].options[0].toString(),
        quantidade: item.quantity,
        vlrUnitario: item.price,
        vlrDesconto: 0,
        vlrTotal: Number(item.total),
      } as Item;
      items.push(data);
    }
    return items;
  }

  private async validateIfOrderWasSent(orders: any[]) {
    const sentOrders = await this.orderRepository.findOrders(
      orders.map((order) => order.id),
    );

    const ordersNotSent = orders.filter(
      (order) =>
        !sentOrders.some((mongoOrder) => order.id === mongoOrder.numeroPedido),
    );

    return ordersNotSent;
  }

  private formateStringObservation(order: any) {
    const transaction = order.transaction_id
      ? `(${order.transaction_id.toString()})`
      : '';
    const date = new Intl.DateTimeFormat('pt-br', {
      dateStyle: 'full',
      timeStyle: 'long',
    }).format(new Date(order.date_paid));

    return `Pagamento via ${order.payment_method_title.toString()} ${transaction}. Pago em ${date}. Frete: R$ ${
      order.shipping_total
    }`;
  }
}
