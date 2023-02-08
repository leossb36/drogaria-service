import { CreateOrderInformationModelView } from '@core/application/mv/createOrderInformation.mv';
import { CreateOrderUseCase } from './createOrder.use-case';
import * as messages from '@common/messages/response-messages.json';
import { defaultMockOrder } from '../__mocks__/order.mock';
import { VetorIntegrationGateway } from '@core/infra/integration/vetor.integration';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@config/configuration.config';

const makeSut = () => {
  const vetorIntegrationGateway = new VetorIntegrationGateway(
    new HttpService(),
    new ConfigService(),
  );
  const sut = new CreateOrderUseCase(vetorIntegrationGateway);

  return {
    sut,
    vetorIntegrationGateway,
  };
};

describe('CreateOrderUseCase', () => {
  let orderMockResolved: CreateOrderInformationModelView;
  const order = defaultMockOrder;

  beforeEach(() => {
    orderMockResolved = {
      data: {
        situacao: 0,
        cdOrcamento: 123,
        mensagem: messages.vetor.integration.create.order.success,
      },
      msg: messages.vetor.integration.create.order.success,
      status: 200,
    };
  });

  it('should create an order on vetor integration gateway', async () => {
    const { sut, vetorIntegrationGateway } = makeSut();

    jest
      .spyOn(vetorIntegrationGateway, 'createOrder')
      .mockResolvedValueOnce(orderMockResolved);

    const createOrder = await sut.execute(order);

    expect(createOrder).toBeCalledWith(order);
    expect(vetorIntegrationGateway.createOrder).toHaveBeenCalled();
  });
});
