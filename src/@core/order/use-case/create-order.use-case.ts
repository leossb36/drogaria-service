import MysqlConnection from '@config/mysql.config';
import { VetorIntegrationGateway } from '@core/infra/integration/vetor-api.integration';
import { WoocommerceIntegration } from '@core/infra/integration/woocommerce-api.integration';
import { BadRequestException, Injectable } from '@nestjs/common';
import * as mysql from 'mysql2/promise';
import { OrderStatusEnum } from '@core/common/enum/orderStatus.enum';
import { ValidationClientHelper } from '@core/utils/validation-client-helper';
import { GetProductsFromWoocommerceUseCase } from '@core/wordpress/use-case/get-products-from-woocommerce.use-case';
import { Cliente, CreateOrderDto, Item } from '../dto/create-order.dto';
import { OrderRepository } from '@core/infra/db/repositories/order.repository';
import { delay } from '@core/utils/delay';
import { OperationHelper } from '@core/utils/operation-helper';

@Injectable()
export class CreateOrderUseCase {
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
      const taxes = order.fee_lines.map((tax) => Number(tax.total));
      const vlrOutros = OperationHelper.reduce(taxes);
      const orderTotal = Number(order.total);
      const discount = OperationHelper.reduce(
        itens.map((item) => item.vlrDesconto),
      );

      const produtosOnly = orderTotal - vlrFrete - vlrOutros - discount;

      const vlrProdutos = Number(produtosOnly.toFixed(2));
      const sendToVetor = {
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
        itens,
      } as CreateOrderDto;

      await delay(1000);

      const result = await this.integration.createOrder(
        sendToVetor,
        '/pedidos',
      );

      if (!result.data || result.data.situacao === 0) {
        throw new BadRequestException('Cannot create order');
      }

      const pool: mysql.Pool = await MysqlConnection.connect();
      const productsFromWooCommerce =
        await this.getProductsFromWoocommerceUseCase.execute(pool, []);

      const items = [];
      itens.filter((product) => {
        const filteredItem = productsFromWooCommerce.filter(
          (item) => Number(item.sku) === product.cdProduto,
        )[0];
        items.push({
          woocommerceId: filteredItem.id,
          vetorId: product.cdProduto,
        });
      });

      const createOnDataBase = await this.orderRepository.create({
        cdOrcamento: result.data?.cdOrcamento,
        numeroPedido: order.id,
        situacao: result.data?.situacao,
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

      return result.data;
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
      const cdProduct = item.sku;

      const data = {
        cdProduto: Number(cdProduct[0]),
        cdBarrasProduto: product.data.attributes[0].options[0].toString(),
        quantidade: item.quantity,
        vlrUnitario: Number(item.price.toFixed(2)),
        vlrDesconto: Number(item.total_tax),
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

    const message =
      order.shipping_total && order.shipping_total !== ''
        ? `Frete: RS ${order.shipping_total} - Entrega ao destinatário`
        : 'Retirada no local';

    return `Pagamento via ${order.payment_method_title.toString()} ${transaction}. Pago em ${date}. ${message}`;
  }
}
