import { Injectable } from '@nestjs/common';
import { ConfigService } from '@config/configuration.config';
import { google } from 'googleapis';

@Injectable()
export class GoogleApiIntegrationGateway {
  private searchEngineId: string;
  private auth: string;
  private customSearch;

  constructor(private readonly configService: ConfigService) {
    this.searchEngineId = this.configService.get('google').searchEngineId;
    (this.auth = this.configService.get('google').auth),
      (this.customSearch = google.customsearch('v1'));
  }

  async getImageProduct(query: unknown): Promise<any> {
    const referenceQuery = `${
      this.configService.get('reference').referenceName
    } ${query}`;
    const request = await this.customSearch.cse.list({
      auth: this.auth,
      cx: this.searchEngineId,
      q: referenceQuery,
      searchType: 'image',
      num: 1,
      relatedSite: this.configService.get('reference').url,
    });

    const imageList = request.data.items
      ? request.data.items.map((item) => {
          return item.link;
        })
      : undefined;

    return imageList;
  }
}
