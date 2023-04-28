import { SerpApiIntegration } from '@core/infra/integration/serp-api.integration';
import { VetorIntegrationGateway } from '@core/infra/integration/vetor-api.integration';
import { Module } from '@nestjs/common';
import { WoocommerceIntegration } from './integration/woocommerce-api.integration';
import { WordpressIntegration } from './integration/wordpress-api.Integration';
import { CreateImageOnWordpressUseCase } from '@core/application/use-cases/wordpress/create-image-on-wordpress.use-case';

@Module({
  providers: [
    VetorIntegrationGateway,
    SerpApiIntegration,
    WoocommerceIntegration,
    WordpressIntegration,
    CreateImageOnWordpressUseCase,
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
