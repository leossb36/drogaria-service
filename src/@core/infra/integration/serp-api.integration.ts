import { ConfigService } from '@config/configuration.config';
import { Injectable } from '@nestjs/common';
import { getJson } from 'serpapi';

@Injectable()
export class SerpApiIntegration {
  constructor(private readonly configService: ConfigService) {}

  async getImageUrl(query: string) {
    const params = {
      api_key: this.configService.get('serpApi').secret_key,
      q: query,
      tbm: 'isch',
      safe: 'active',
      google_domain: 'google.com.br',
      hl: 'pt',
      gl: 'br',
      ijn: '0',
    };
    try {
      const response = await getJson('google', { ...params });
      if (response.images_results[0].original)
        return response.images_results[0].original;
      else {
        return response.images_results[0].thumbnail;
      }
    } catch (error) {
      console.error(error.response.data);
    }
  }
}
