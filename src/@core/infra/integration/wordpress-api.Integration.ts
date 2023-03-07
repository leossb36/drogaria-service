import { ConfigService } from '@config/configuration.config';
import { authenticationDto } from '@core/auth/dto/auth.dto';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class WordpressIntegration {
  private readonly wordpressConfig;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.wordpressConfig = {
      url: this.configService.get('wordpress').url,
    };
  }

  async authentication(body: authenticationDto): Promise<any> {
    try {
      const { data } = await lastValueFrom(
        this.httpService.post(
          `${this.wordpressConfig.url}/wp-json/jwt-auth/v1/token`,
          body,
        ),
      );

      return data;
    } catch (error) {
      console.error(error.response.data);
    }
  }
}
