import { ConfigService } from '@config/configuration.config';
import { GetProductVetorDto, GetOrderDto } from '@core/application/dto';
import { IProduct } from '@core/application/interface/product.interface';
import { GetCategoryViewModel } from '@core/application/mv/get-category.mv';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class VetorIntegrationGateway {
  private baseUrl: string;
  private headerRequest;
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
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
    try {
      const { data } = await lastValueFrom(
        this.httpService.get(`${this.baseUrl}${endpoint}`, {
          headers: this.headerRequest,
          params: params,
        }),
      );

      return data;
    } catch (error) {
      console.error(error.response.data);
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
