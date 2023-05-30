import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrderStatusEnum } from '@core/common/enum/orderStatus.enum';
import { OrderDto } from '@core/woocommerce/dto/order.dto';
import { Order, OrderDocument } from '../schema/order.schema';

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

  async findAll() {
    try {
      const orders = await this.orderModel
        .find({
          status: OrderStatusEnum.PROCESSING,
        })
        .lean();
      return orders;
    } catch (error) {
      throw new BadRequestException('Cannot find orders on database');
    }
  }

  async findOrders(ids: any[]) {
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

  async findProductCompleted() {
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

  async findById(id: string) {
    try {
      const order = await this.orderModel.findById(id);
      return order;
    } catch (error) {
      throw new BadRequestException('Cannot find order with this id');
    }
  }

  async updateOrderBatch(orders: any[]) {
    try {
      const result = await this.orderModel.updateMany(
        {
          numeroPedido: {
            $in: [...orders.map((order) => order.numeroPedido)],
          },
        },
        {
          $set: {
            status: OrderStatusEnum.TERMINATED,
          },
        },
      );
      return result;
    } catch (error) {
      throw new BadRequestException('Cannot find order with this id');
    }
  }

  async updateOrderStatus(orders: any[]) {
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
