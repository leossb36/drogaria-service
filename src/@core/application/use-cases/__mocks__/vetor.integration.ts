export const VetorIntegrationGatewayStub = jest.fn().mockImplementation(() => ({
  createOrder: jest.fn(),
  getOrderInfo: jest.fn(),
  getProductInfo: jest.fn(),
}));
