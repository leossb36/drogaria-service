import { ConfigService } from '@config/configuration.config';
import { CategoryIdsEnum } from '@core/common/enum/category.enum';
import FetchAllProducts, {
  getProductsWithoutImages,
  getProductsWithoutImagesFull,
} from '@core/utils/fetch-helper';
import { Injectable } from '@nestjs/common';
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import * as mysql from 'mysql2/promise';
import { CreateImageOnWordpressUseCase } from '@core/wordpress/use-case/create-image-on-wordpress.use-case';
import { getProductWooCommerceModelView } from '@core/woocommerce/mv/get-product-woo.mv';
import { createCategoriesDto } from '@core/woocommerce/dto/create-category.dto';

@Injectable()
export class WoocommerceIntegration {
  private readonly woocommerceConfig;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly createImageOnWordpressUseCase: CreateImageOnWordpressUseCase,
  ) {
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

  async getAllProductsByIds(ids: any[]): Promise<any> {
    try {
      const response = await FetchAllProducts(this.woocommerceConfig);
      const filtered = response.filter((product) => ids.includes(product.id));
      return filtered;
    } catch (error) {
      console.error(error.response.headers);
      console.error(error.response.data);
    }
  }

  async productById(id: string): Promise<any> {
    try {
      const response = await this.woocommerceConfig.get(`products/${id}`);
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

  async getProductsWithoutImage(): Promise<any[]> {
    try {
      const products = await getProductsWithoutImages(this.woocommerceConfig);

      return products;
    } catch (err) {
      console.error(err.response.headers);
      console.error(err.response.data);
    }
  }

  async getProductsWithoutImageFull(): Promise<any[]> {
    try {
      const products = await getProductsWithoutImagesFull(
        this.woocommerceConfig,
      );

      return products;
    } catch (err) {
      console.error(err.response);
    }
  }

  async getAllCategories(): Promise<any[]> {
    try {
      const categories = await this.woocommerceConfig.get(
        `products/categories?include=${Object.values(CategoryIdsEnum)}`,
      );
      return categories.data;
    } catch (err) {
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

  async createProductBatch(
    products: getProductWooCommerceModelView[],
  ): Promise<any> {
    const data = {
      create: products.map((product) => ({
        ...product,
        status:
          product.stock_quantity > 0 && product.images.length
            ? 'publish'
            : 'draft',
      })),
    };
    try {
      const response = await this.woocommerceConfig.post(
        'products/batch',
        data,
      );
      return response.data;
    } catch (error) {
      console.error(error.response.headers);
      console.error(error.response.data);
    }
  }

  async deactivateProducts(products: any[]): Promise<any> {
    const productIds = products.map((product) => product.id);
    const data = {
      update: productIds.map((productId) => ({
        id: productId,
        status: 'draft',
      })),
    };
    try {
      const response = await this.woocommerceConfig.post(
        'products/batch',
        data,
      );
      return response;
    } catch (error) {
      throw error;
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

  async getOrdersByStatus(): Promise<any> {
    try {
      const response = await this.woocommerceConfig.get(
        'orders?status=processing',
      );

      return response;
    } catch (error) {
      console.log(error);
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

  async updateProductImage(product: any) {
    const data = {
      images: [{ src: product.images[0].src }],
    };
    try {
      const response = await this.woocommerceConfig.put(
        `products/${product.id}`,
        data,
      );
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

  async updateOrderBatch(body: any) {
    const data = {
      update: [...body],
    };
    try {
      const response = await this.woocommerceConfig.post(`orders/batch`, data);
      return response;
    } catch (error) {
      console.error(error.response.headers);
      console.error(error.response.data);
    }
  }

  async createMedia(product: any, pool: mysql.Pool) {
    const consumerKey = this.configService.get('woocommerce').consumerKey;
    const consumerSecret = this.configService.get('woocommerce').consumerSecret;
    const url = `${this.configService.get('woocommerce').url}/wp-json/wc/v3`;
    const endpoint = 'products';

    const body = {
      images: [{ src: product.images[0].src }],
      status: product.stock_quantity > 0 ? 'publish' : 'draft',
    };

    try {
      const response = await lastValueFrom(
        this.httpService.patch(
          `${url}/${endpoint}/${product.id}`,
          { ...body },
          {
            headers: { 'Accept-Encoding': '*' },
            auth: {
              username: consumerKey,
              password: consumerSecret,
            },
            timeout: 15000,
          },
        ),
      );

      return response.data;
    } catch (error) {
      console.log('Timeout:::', error.message || error.response?.data?.message);
      await this.createImageOnWordpressUseCase.addImage(pool, product.id);
    }
  }
}
