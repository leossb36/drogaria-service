import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrderStatusEnum } from '@core/common/enum/orderStatus.enum';
import { OrderDto } from '@core/product/dto/order.dto';
import { Order, OrderDocument } from '../schema/order.schema';
import { FinishStatusEnum } from '@core/common/enum/woocommerce-status.enum';

@Injectable()
export class OrderRepository {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
  ) {}

  async create(dto: OrderDto): Promise<Order> {
    const order = new this.orderModel(dto);

    try {
      return order.save();
    } catch (error) {
      throw new BadRequestException('Cannot save order on database');
    }
  }

  async findAll(): Promise<any> {
    try {
      const orders = await this.orderModel
        .find({
          status: { $in: [OrderStatusEnum.PROCESSING, OrderStatusEnum.HOLD] },
        })
        .lean();
      return orders;
    } catch (error) {
      throw new BadRequestException('Cannot find orders on database');
    }
  }

  async findOrders(ids: any[]): Promise<any> {
    try {
      const orders = await this.orderModel
        .find({
          numeroPedido: {
            $in: [...ids],
          },
        })
        .lean();
      return orders;
    } catch (error) {
      throw new BadRequestException('Cannot find orders on database');
    }
  }

  async findProductCompleted(): Promise<any> {
    try {
      const orders = await this.orderModel.aggregate([
        {
          $match: {
            status: OrderStatusEnum.TERMINATED,
          },
        },
        {
          $unset: ['cdOrcamento', 'numeroPedido', 'situacao', 'status', '__v'],
        },
      ]);
      return orders;
    } catch (error) {
      throw new BadRequestException('Cannot find orders on database');
    }
  }

  async findById(id: string): Promise<any> {
    try {
      const order = await this.orderModel.findById(id);
      return order;
    } catch (error) {
      throw new BadRequestException('Cannot find order with this id');
    }
  }

  async updateOrderBatch(orders: any[]): Promise<any> {
    try {
      const updateOperations = orders.map((order) => {
        const status = Object.values(FinishStatusEnum).includes(order.status)
          ? OrderStatusEnum.TERMINATED
          : order.status;
        return {
          updateOne: {
            filter: { numeroPedido: order.numeroPedido },
            update: { $set: { status } },
          },
        };
      });

      const result = await this.orderModel.bulkWrite(updateOperations);
      return result;
    } catch (error) {
      throw new BadRequestException('Cannot find order with this id');
    }
  }

  async updateManyOrderStatus(orders: any[]): Promise<any> {
    try {
      await this.orderModel.deleteMany({
        sku: {
          $in: [...orders.map((order) => order.numeroPedido)],
        },
      });

      const insertMany = await this.orderModel.insertMany(orders);
      return insertMany;
    } catch (error) {
      throw new BadRequestException('Cannot find order with this id');
    }
  }

  async updateOrderStatus(orders: any[]): Promise<any> {
    try {
      const result = await this.orderModel.updateMany(
        {
          _id: {
            $in: [...orders.map((order) => order._id)],
          },
        },
        {
          $set: {
            status: OrderStatusEnum.FINISHED,
          },
        },
      );
      return result;
    } catch (error) {
      throw new BadRequestException('Cannot find order with this id');
    }
  }
}
