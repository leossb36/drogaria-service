import { VetorIntegrationGateway } from '@core/infra/integration/vetor-api.integration';
import * as messages from '@common/messages/response-messages.json';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ValidationHelper } from '@core/utils/validation-helper';
import { ValidationClientHelper } from '@core/utils/validation-client-helper';
import {
  Cliente,
  CreateOrderDto,
  getWebhookDto,
  Item,
} from '@core/application/dto';
import { CreateOrderInformationModelView } from '@core/application/mv/create-order-information.mv';
import { OrderStatusEnum } from '@core/application/dto/enum/orderStatus.enum';
import { OrderRepository } from '@core/infra/db/repositories/mongo/order.repository';
import * as mysql from 'mysql2/promise';
import MysqlConnection from '@config/mysql.config';
import { GetProductsFromWoocommerceUseCase } from '../wordpress/get-products-from-woocommerce.use-case';

@Injectable()
export class CreateOrderUseCase {
  constructor(
    private readonly integration: VetorIntegrationGateway,
    private readonly orderRepository: OrderRepository,
    private readonly getProductsFromWoocommerceUseCase: GetProductsFromWoocommerceUseCase,
  ) {}

  async execute(dto: getWebhookDto): Promise<CreateOrderInformationModelView> {
    const itens = this.getItems(dto);
    const sendToVetor = {
      cdFilial: +process.env.CD_FILIAL,
      cgcFilial: process.env.CGC_FILIAL || '',
      dtEmissao: new Date().toISOString(),
      cliente: this.getClient(dto),
      vlrProdutos: Number(dto.total),
      vlrDescontos: Number(dto.discount_total),
      vlrFrete: dto.shipping_total !== '' ? Number(dto.shipping_total) : 0,
      vlrOutros: 0,
      vlrTotal: Number(dto.total),
      vlrTroco: 0,
      observacao: 'Venda Online',
      nrPedido: dto.id.toString(),
      retirar: false,
      itens,
    } as CreateOrderDto;

    const order = await this.integration.createOrder(sendToVetor, '/pedidos');

    if (!order || !ValidationHelper.isOk(order.status)) {
      throw new BadRequestException('Cannot create order');
    }

    const { data } = order;

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
      numeroPedido: dto.id,
      situacao: data.situacao,
      status: OrderStatusEnum.PROCESSING,
      items: items,
    });

    if (!createOnDataBase) {
      throw new BadRequestException(
        'Cannot save on database the vetor register',
      );
    }

    return {
      data: order.data,
      msg: messages.vetor.integration.create.order.success,
      status: order.status,
    };
  }

  private getClient(dto: getWebhookDto): Cliente {
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
  private getItems(dto: getWebhookDto): Item[] {
    const { line_items } = dto;

    if (!line_items.length) {
      return [];
    }

    const items = [];

    line_items?.map((item) => {
      const cdProduct = item.sku.split('-');

      const data = {
        cdProduto: Number(cdProduct[0]),
        quantidade: item.quantity,
        vlrUnitario: item.price,
        vlrDesconto: 0,
        vlrTotal: Number(item.total),
      } as Item;
      items.push(data);
    });
    return items;
  }
}
