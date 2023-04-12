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
      throw new BadRequestException('Cannot save order on database');
    }
  }

  async createProductBatch(products: any[]) {
    try {
      const result = await this.productModel.insertMany(products);
      return result;
    } catch (error) {
      throw new BadRequestException('Cannot save order on database');
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

  async findProductsWithoutImage() {
    try {
      const orders = await this.productModel
        .find(
          {
            images: { $size: 0 },
          },
          undefined,
          { limit: 5 },
        )
        .lean();
      return orders;
    } catch (error) {
      throw new BadRequestException('Cannot find orders on database');
    }
  }

  async findById(id: string) {
    try {
      const order = await this.productModel.findById(id);
      return order;
    } catch (error) {
      throw new BadRequestException('Cannot find order with this id');
    }
  }

  async updateProductBatch(products: any[]) {
    try {
      await this.productModel.deleteMany({
        _id: {
          $in: [...products.map((product) => product._id)],
        },
      });

      const insertMany = await this.productModel.insertMany(products);
      return insertMany;
    } catch (error) {
      throw new BadRequestException('Cannot find order with this id');
    }
  }

  async getProductsBySku(skus: any[]) {
    try {
      const result = await this.productModel
        .find({
          sku: {
            $in: [...skus.map((sku) => sku.sku)],
          },
        })
        .lean();

      return result;
    } catch (error) {
      throw new BadRequestException('Cannot find order with this id');
    }
  }
}
