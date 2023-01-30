import { ConfigService } from '@config/configuration.config';
import { getProductVetorDto } from '@core/application/dto/getProductVetor.dto';
import { IProduct } from '@core/application/interface/product.interface';
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

  async get(params: getProductVetorDto, endpoint: string): Promise<any> {
    const { data } = await lastValueFrom(
      this.httpService.get(`${this.baseUrl}${endpoint}`, {
        headers: this.headerRequest,
        params: params,
      }),
    );

    return data;
  }
}
