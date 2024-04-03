import { CreateImageOnWordpressUseCase } from '@core/wordpress/use-case/create-image-on-wordpress.use-case';
import { VetorIntegrationGateway } from '@core/infra/integration/vetor-api.integration';
import { WoocommerceIntegration } from './integration/woocommerce-api.integration';
import { SerpApiIntegration } from '@core/infra/integration/serp-api.integration';
import { Module } from '@nestjs/common';

@Module({
  providers: [
    CreateImageOnWordpressUseCase,
    VetorIntegrationGateway,
    WoocommerceIntegration,
    SerpApiIntegration,
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
