import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../schema/product.schema';

@Injectable()
export class ProductRepository {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async create(dto: any): Promise<Product> {
    const product = new this.productModel(dto);

    try {
      return await product.save();
    } catch (error) {
      throw new BadRequestException('Cannot save product on database');
    }
  }

  async createProductBatch(products: any[]) {
    try {
      const result = await this.productModel.insertMany(products);
      return result;
    } catch (error) {
      throw new BadRequestException('Cannot save product on database: batch');
    }
  }

  async findAll() {
    try {
      const orders = await this.productModel.find({});
      return orders;
    } catch (error) {
      throw new BadRequestException('Cannot find orders on database');
    }
  }

  async findProductsWithoutImage(skus: any[], limit: number) {
    try {
      const products = await this.productModel
        .find(
          {
            sku: {
              $in: [...skus.map((sku) => sku)],
            },
            images: { $size: 0 },
          },
          undefined,
          { limit },
        )
        .lean();
      return products;
    } catch (error) {
      throw new BadRequestException('Cannot find products on database');
    }
  }

  async findProductsWithImage(skus: any[], limit: number) {
    try {
      const products = await this.productModel
        .find(
          {
            sku: {
              $in: [...skus.map((sku) => sku)],
            },
            images: { $size: 1 },
          },
          undefined,
          { limit },
        )
        .lean();
      return products;
    } catch (error) {
      throw new BadRequestException('Cannot find products on database');
    }
  }
  async deleteAllWithoutImage() {
    try {
      const response = await this.productModel.deleteMany({
        images: { $size: 0 },
      });
      return response;
    } catch (error) {
      throw new BadRequestException('Cannot find products on database');
    }
  }

  async findProductsWithoutImageAndNotInWooCommerce(
    skus: any[],
    limit: number,
  ) {
    try {
      const products = await this.productModel
        .find(
          {
            sku: {
              $nin: [...skus.map((sku) => sku)],
            },
            images: { $size: 0 },
          },
          undefined,
          { limit },
        )
        .lean();
      return products;
    } catch (error) {
      throw new BadRequestException('Cannot find products on database');
    }
  }

  async findProductsWithImageAndNotInWooCommerce(skus: any[], limit: number) {
    try {
      const products = await this.productModel
        .find(
          {
            sku: {
              $nin: [...skus.map((sku) => sku)],
            },
            images: { $size: 1 },
          },
          undefined,
          { limit },
        )
        .lean();
      return products;
    } catch (error) {
      throw new BadRequestException('Cannot find products on database');
    }
  }

  async findById(id: string) {
    try {
      const product = await this.productModel.findById(id);
      return product;
    } catch (error) {
      throw new BadRequestException('Cannot find product with this id');
    }
  }

  async findBySku(sku: string) {
    try {
      const product = await this.productModel
        .find({
          sku: {
            $eq: { sku },
          },
          images: { $size: 1 },
        })
        .lean();
      return product as unknown as Product;
    } catch (error) {
      throw new BadRequestException('Cannot find product with this id');
    }
  }

  async updateProductBatch(products: any[]) {
    try {
      await this.productModel.deleteMany({
        sku: {
          $in: [...products.map((product) => product.sku)],
        },
      });

      const insertMany = await this.productModel.insertMany(products);
      return insertMany;
    } catch (error) {
      throw new BadRequestException('Cannot find product with this id');
    }
  }
  async deleteAll(products: any[]) {
    try {
      const response = await this.productModel.deleteMany({
        sku: {
          $in: [...products.map((product) => product.sku)],
        },
      });
      return response;
    } catch (error) {
      throw new BadRequestException('Cannot find product with this id');
    }
  }

  async getProductsBySku(skus: any[]) {
    try {
      const result = await this.productModel
        .find({
          sku: {
            $in: [...skus.map((sku) => sku)],
          },
          images: { $size: 1 },
        })
        .lean();

      return result;
    } catch (error) {
      throw new BadRequestException('Cannot find product with this id');
    }
  }

  async getProductsSku(skus: any[]) {
    try {
      const result = await this.productModel
        .find({
          sku: {
            $in: [...skus.map((sku) => sku)],
          },
        })
        .lean();

      return result;
    } catch (error) {
      throw new BadRequestException('Cannot find product with this id');
    }
  }
}
