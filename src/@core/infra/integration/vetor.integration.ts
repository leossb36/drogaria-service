import { ConfigService } from '@config/configuration.config';
import { CreateOrderDto } from '@core/application/dto/createOrder.dto';
import { GetProductVetorDto } from '@core/application/dto/getProductVetor.dto';
import { IProduct } from '@core/application/interface/product.interface';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { GetOrderDto } from '@core/application/dto/getOrder.dto';

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
    params: GetProductVetorDto,
    endpoint: string,
  ): Promise<IProduct> {
    try {
      const { data } = await lastValueFrom(
        this.httpService.get<IProduct>(`${this.baseUrl}${endpoint}`, {
          headers: this.headerRequest,
          params: params,
        }),
      );

      return data;
    } catch (err) {
      console.error(err.data);
    }
  }

  async getOrderInfo(params: GetOrderDto, endpoint: string): Promise<any> {
    const { data } = await lastValueFrom(
      this.httpService.get(`${this.baseUrl}${endpoint}`, {
        headers: this.headerRequest,
        params: params,
      }),
    );

    return data;
  }

  async createOrder(body: CreateOrderDto, endpoint: string): Promise<any> {
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
