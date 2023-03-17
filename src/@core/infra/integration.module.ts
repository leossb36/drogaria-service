import { SerpApiIntegration } from '@core/infra/integration/serp-api.integration';
import { VetorIntegrationGateway } from '@core/infra/integration/vetor-api.integration';
import { Module } from '@nestjs/common';
import { WoocommerceIntegration } from './integration/woocommerce-api.integration';
import { WordpressIntegration } from './integration/wordpress-api.Integration';

@Module({
  providers: [
    VetorIntegrationGateway,
    SerpApiIntegration,
    WoocommerceIntegration,
    WordpressIntegration,
    {
      provide: 'axiosSerp',
      useFactory: () => ({
        baseURL: process.env.SERP_API_URL,
      }),
    },
  ],
  exports: [
    VetorIntegrationGateway,
    WoocommerceIntegration,
    SerpApiIntegration,
  ],
})
export class IntegrationModule {}
