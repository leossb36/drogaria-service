import { ConfigService } from '@config/configuration.config';
import { createCategoriesDto } from '@core/application/dto/create-category.dto';
import { getProductWooCommerce } from '@core/application/interface/get-product-woo.interface';
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
    } catch (error) {
      console.error(error.response.headers);
      console.error(error.response.data);
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
      console.error(err.response.headers);
      console.error(err.response.data);
    }
  }

  async getProductBySku(filter: string) {
    try {
      const product = await FetchAllProducts(this.woocommerceConfig).then(
        (result) => {
          return result.filter((product) => product.sku === filter);
        },
      );

      return product;
    } catch (error) {
      console.error(error.response.headers);
      console.error(error.response.data);
    }
  }

  async getProductById(filter: string) {
    try {
      const product = await FetchAllProducts(this.woocommerceConfig).then(
        (result) => {
          return result.filter((product) => product.id === Number(filter));
        },
      );

      return product;
    } catch (error) {
      console.error(error.response.headers);
      console.error(error.response.data);
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
    } catch (error) {
      console.error(error.response.headers);
      console.error(error.response.data);
    }
  }

  async createProduct(products: getProductWooCommerce[]): Promise<any> {
    const data = {
      create: [...products],
    };
    try {
      const response = await this.woocommerceConfig.post(
        'products/batch',
        data,
      );
      return response;
    } catch (error) {
      console.error(error.response.headers);
      console.error(error.response.data);
    }
  }

  async createOrder(body: unknown): Promise<any> {
    try {
      const response = await this.woocommerceConfig.post('order', body);
      return response;
    } catch (error) {
      console.error(error.response.headers);
      console.error(error.response.data);
    }
  }

  async createCategories(categories: createCategoriesDto[]): Promise<any> {
    const data = {
      create: [...categories],
    };
    try {
      const response = await this.woocommerceConfig.post(
        'products/categories/batch',
        data,
      );
      return response;
    } catch (error) {
      console.error(error.response.headers);
      console.error(error.response.data);
    }
  }

  async updateProductBatch(products: any) {
    const data = {
      update: [...products],
    };
    try {
      const response = await this.woocommerceConfig.put('products/batch', data);
      return response;
    } catch (error) {
      console.error(error.response.headers);
      console.error(error.response.data);
    }
  }

  async updateProductStock(id: number, body: unknown) {
    try {
      const response = await this.woocommerceConfig.put(`products/${id}`, body);
      return response;
    } catch (error) {
      console.error(error.response.headers);
      console.error(error.response.data);
    }
  }
}
