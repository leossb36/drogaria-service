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

@Injectable()
export class CreateOrderUseCase {
  constructor(private readonly integration: VetorIntegrationGateway) {}

  async execute(dto: getWebhookDto): Promise<CreateOrderInformationModelView> {
    const [itens, totalPriceItens] = this.getItems(dto);
    const sendToVetor = {
      cdFilial: +process.env.CD_FILIAL,
      cgcFilial: process.env.CGC_FILIAL || '',
      dtEmissao: new Date().toISOString(),
      cliente: this.getClient(dto),
      vlrProdutos: totalPriceItens,
      vlrDescontos: Number(dto.discount_total),
      vlrFrete: Number(dto.shipping_total),
      vlrOutros: undefined,
      vlrTotal: Number(dto.total),
      vlrTroco: undefined,
      observacao: 'Venda Online',
      nrPedido: dto.id.toString(),
      retirar: true,
      itens,
    } as CreateOrderDto;

    const order = await this.integration.createOrder(sendToVetor, '/pedidos');

    if (!order || !ValidationHelper.isOk(order.status)) {
      throw new BadRequestException('Cannot create order');
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
      dtNascimento: '01/01/2000', // ValidationClientHelper.validateDate(billing?.birthdate),
      endereco: billing?.address_1,
      numero: billing?.number,
      complemento: '',
      cep: billing?.postcode,
      bairro: billing?.neighborhood,
      cidade: billing?.city,
      uf: billing?.state,
      email: billing.email,
    };
  }
  private getItems(dto: getWebhookDto): [Item[], number] {
    const { line_items } = dto;

    if (!line_items.length) {
      return [[], null];
    }

    const items = [];
    let totalPriceItems = 0;

    line_items?.map((item) => {
      const cdProduct = item.sku.split('-');
      totalPriceItems = totalPriceItems + Number(item.total);
      const data = {
        cdProduto: Number(cdProduct[0]),
        quantidade: item.quantity,
        vlrUnitario: item.price,
        vlrDesconto: undefined,
        vlrTotal: Number(item.total),
      } as Item;
      items.push(data);
    });
    return [items, totalPriceItems];
  }
}
