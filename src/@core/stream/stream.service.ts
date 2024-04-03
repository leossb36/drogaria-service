import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateStreamUseCase } from './use-case/create-stream.use-case';
import { GetStreamUseCase } from './use-case/get-stream.use-case';
import { GetProductModelView } from '@core/product/mv/get-product.mv';
import { GetProductWoocommerceModelView } from '@core/product/mv/get-product-woo.mv';

@Injectable()
export class StreamService {
  constructor(
    private readonly createStreamUseCase: CreateStreamUseCase,
    private readonly getStreamUseCase: GetStreamUseCase,
  ) {}

  async createStream(): Promise<number> {
    const response = await this.createStreamUseCase.execute();

    if (!response) {
      throw new BadRequestException('Cannot create stream file');
    }

    return response;
  }

  async getStream(): Promise<GetProductModelView[]> {
    const response = await this.getStreamUseCase.readStream();

    if (!response.length) {
      return [];
    }

    return response;
  }

  async getStreamBuilt(): Promise<GetProductWoocommerceModelView[]> {
    const response = await this.getStreamUseCase.readFromJson();

    if (!response.length) {
      return [];
    }

    return response;
  }
}
