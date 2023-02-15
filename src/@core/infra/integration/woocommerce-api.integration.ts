import { ConfigService } from '@config/configuration.config';
import FetchAllProducts from '@core/utils/fetch-helper';
import { Injectable } from '@nestjs/common';
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

@Injectable()
export class WoocommerceIntegration {
  private readonly woocommerceConfig;

  constructor(private readonly configService: ConfigService) {
    this.woocommerceConfig = new WooCommerceRestApi({
      url: this.configService.get('woocommerce').url,
      consumerKey: this.configService.get('woocommerce').consumerKey,
      consumerSecret: this.configService.get('woocommerce').consumerSecret,
      version: 'wc/v3',
    });
  }

  async getAllProducts(): Promise<any> {
    try {
      const response = await FetchAllProducts(this.woocommerceConfig);
      return response;
    } catch (err) {
      console.error(err.data);
    }
  }

  async getAllProductsSku(): Promise<string[]> {
    try {
      const skus = await FetchAllProducts(this.woocommerceConfig).then(
        (result) => {
          return result.map((product) => product.sku);
        },
      );

      return skus;
    } catch (err) {
      console.error(err.data);
    }
  }

  async getAllProductsIds(): Promise<string[]> {
    try {
      const ids = await FetchAllProducts(this.woocommerceConfig).then(
        (result) => {
          return result.map((product) => product.id);
        },
      );
      return ids;
    } catch (err) {
      console.error(err.data);
    }
  }

  async createProduct(body: unknown): Promise<any> {
    try {
      const response = await this.woocommerceConfig.post('products', body);
      return response;
    } catch (error) {
      console.error(error.response.data);
    }
  }

  async createOrder(body: unknown): Promise<any> {
    try {
      const response = await this.woocommerceConfig.post('order', body);
      return response;
    } catch (error) {
      console.error(error.response.data);
    }
  }

  async createCategories(body: unknown): Promise<any> {
    try {
      const response = await this.woocommerceConfig.post(
        'products/categories',
        body,
      );
      return response;
    } catch (error) {
      console.error(error.response.data);
    }
  }
}
