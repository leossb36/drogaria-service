import { ConfigService } from '@config/configuration.config';
import { delay } from '@core/utils/delay';
import { GetOrderDto } from '@core/order/dto/get-order.dto';
import { GetProductVetorDto } from '@core/order/dto/query-select.dto';
import { GetCategoryViewModel } from '@core/order/mv/get-category.mv';
import { IProduct } from '@core/order/mv/product.mv';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class VetorIntegrationGateway {
  private baseUrl: string;
  private headerRequest;
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.baseUrl = this.configService.get('api').url;
    this.headerRequest = {
      Authorization: `${this.configService.get('api').prefix} ${
        this.configService.get('api').token
      }`,
    };
  }

  async getProductInfo(
    endpoint: string,
    params?: GetProductVetorDto,
  ): Promise<any> {
    try {
      const response = await lastValueFrom(
        this.httpService.get(`${this.baseUrl}${endpoint}`, {
          headers: this.headerRequest,
          params: params,
        }),
      );

      return response.data;
    } catch (err) {
      console.error(err.data);
    }
  }

  async getCategories(
    endpoint: string,
    params?: GetProductVetorDto,
  ): Promise<GetCategoryViewModel[]> {
    try {
      const { data } = await lastValueFrom(
        this.httpService.get<IProduct>(`${this.baseUrl}${endpoint}`, {
          headers: this.headerRequest,
          params: params,
        }),
      );

      const categories = data.data.map((instance) => {
        return {
          code: instance.cdCategoria,
          categoryName: instance.nomeCategoria,
        };
      });

      return categories;
    } catch (err) {
      console.error(err.data);
    }
  }

  async getOrderInfo(params: GetOrderDto, endpoint: string): Promise<any> {
    await delay(1000);
    try {
      const response = await lastValueFrom(
        this.httpService.get(`${this.baseUrl}${endpoint}`, {
          headers: this.headerRequest,
          params: params,
        }),
      );

      return response;
    } catch (error) {
      console.log(error.response.message);
    }
  }

  async createOrder(body: unknown, endpoint: string): Promise<any> {
    try {
      const { data } = await lastValueFrom(
        this.httpService.post(`${this.baseUrl}${endpoint}`, body, {
          headers: this.headerRequest,
        }),
      );
      return data;
    } catch (error) {
      console.error(error.response.data);
    }
  }
}
