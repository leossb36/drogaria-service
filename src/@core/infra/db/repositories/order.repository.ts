import { OrderDto } from '@core/application/dto/order.dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../schema/order.schema';
import { OrderStatusEnum } from '@core/application/dto/enum/orderStatus.enum';

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
      const orders = this.orderModel.find({});
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
            $in: [...orders.map((order) => order.id)],
          },
        },
        { $set: { status: OrderStatusEnum.TERMINATED } },
      );
      return result;
    } catch (error) {
      throw new BadRequestException('Cannot find order with this id');
    }
  }
}
