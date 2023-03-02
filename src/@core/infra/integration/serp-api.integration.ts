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
      num: '10',
      safe: 'active',
    };
    try {
      const response = await getJson('google', { ...params });
      return response.images_results[0].original;
    } catch (error) {
      console.error(error.response.data);
    }
  }
}
