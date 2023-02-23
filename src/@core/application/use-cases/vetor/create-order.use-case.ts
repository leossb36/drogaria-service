import {
  Cliente,
  CreateOrderDto,
  Item,
} from '@core/application/dto/createOrder.dto';
import { VetorIntegrationGateway } from '@core/infra/integration/vetor-api.integration';
import * as messages from '@common/messages/response-messages.json';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ValidationHelper } from '@core/utils/validation-helper';
import { CreateOrderInformationModelView } from '@core/application/mv/createOrderInformation.mv';
import { getWebhookDto } from '@core/application/dto/getWebhook.dto';
import { ValidationClientHelper } from '@core/utils/validation-client-helper';

@Injectable()
export class CreateOrderUseCase {
  constructor(private readonly integration: VetorIntegrationGateway) {}

  async execute(dto: getWebhookDto): Promise<CreateOrderInformationModelView> {
    const sendToVetor = {
      cdFilial: +process.env.CD_FILIAL,
      cgcFilial: 'farmacialuita',
      dtEmissao: new Date().toISOString(),
      cliente: this.getClient(dto),
      vlrProdutos: Number(dto.total),
      vlrDescontos: Number(dto.discount_total),
      vlrFrete: Number(dto.shipping_total),
      vlrOutros: undefined,
      vlrTotal: Number(dto.total),
      vlrTroco: undefined,
      observacao: undefined,
      nrPedido: dto.id.toString(),
      retirar: false,
      itens: this.getItems(dto),
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
      dtNascimento: ValidationClientHelper.validateDate(billing?.birthdate),
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
        cdBarrasProduto: item.sku,
        quantidade: item.quantity,
        vlrUnitario: item.price,
        vlrDesconto: undefined,
        vlrTotal: Number(item.total),
      } as Item;
      items.push(data);
    });
    return items;
  }
}
