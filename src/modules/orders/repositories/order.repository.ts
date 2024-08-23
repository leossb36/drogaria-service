import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { PrismaService } from '@app/infra/db/prisma/prisma.service'
import { CreateOrderDto } from '../dtos/create-order.dto'
import { orders } from '@prisma/client'

@Injectable()
export class OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async updateOrderStatus(
    orderNumber: number,
    situation: number,
    orderStatus: string
  ): Promise<number> {
    try {
      const query = await this.prisma.orders.updateMany({
        where: {
          numeroPedido: orderNumber
        },
        data: {
          situacao: situation,
          status: orderStatus,
          updated_at: new Date()
        }
      })

      return query.count
    } catch (error) {
      throw new InternalServerErrorException(error.message)
    }
  }

  async getByOrderNumber(orderNumber: number) {
    try {
      const query = await this.prisma.orders.findFirst({
        where: {
          numeroPedido: orderNumber
        }
      })

      return query
    } catch (error) {
      throw new InternalServerErrorException(error.message)
    }
  }

  async create(dto: CreateOrderDto): Promise<orders> {
    try {
      const order = await this.prisma.orders.create({
        data: dto
      })

      return order
    } catch (error) {
      throw new InternalServerErrorException('Não foi possível criar o pedido')
    }
  }

  async getOrders(ids: string[]): Promise<orders[]> {
    try {
      const orders = await this.prisma.orders.findMany({
        where: {
          id: {
            in: ids
          }
        }
      })

      return orders
    } catch (error) {
      throw new InternalServerErrorException('Erro ao listar pedidos')
    }
  }

  // async findAll(): Promise<any[]> {
  //   try {
  //     const orders = await this.orderModel
  //       .find({
  //         status: { $in: [OrderStatusEnum.PROCESSING, OrderStatusEnum.HOLD] }
  //       })
  //       .lean()
  //     return orders
  //   } catch (error) {
  //     throw new BadRequestException('Cannot find orders on database')
  //   }
  // }

  // async findOrders(ids: any[]): Promise<any[]> {
  //   try {
  //     const orders = await this.orderModel
  //       .find({
  //         numeroPedido: {
  //           $in: [...ids]
  //         }
  //       })
  //       .lean()
  //     return orders
  //   } catch (error) {
  //     throw new BadRequestException('Cannot find orders on database')
  //   }
  // }

  // async findProductCompleted(): Promise<any> {
  //   try {
  //     const orders = await this.orderModel.aggregate([
  //       {
  //         $match: {
  //           status: OrderStatusEnum.TERMINATED
  //         }
  //       },
  //       {
  //         $unset: ['cdOrcamento', 'numeroPedido', 'situacao', 'status', '__v']
  //       }
  //     ])
  //     return orders
  //   } catch (error) {
  //     throw new BadRequestException('Cannot find orders on database')
  //   }
  // }

  // async findById(id: string): Promise<any> {
  //   try {
  //     const order = await this.orderModel.findById(id)
  //     return order
  //   } catch (error) {
  //     throw new BadRequestException('Cannot find order with this id')
  //   }
  // }

  // async getByOrderId(numeroPedido: number): Promise<any> {
  //   const query = await this.orderModel.findOne({ numeroPedido }).lean()

  //   return query
  // }

  // async updateOrderBatch(orders: any[]): Promise<any> {
  //   try {
  //     const updateOperations = orders.map(order => {
  //       const status = Object.values(FinishStatusEnum).includes(order.status)
  //         ? OrderStatusEnum.TERMINATED
  //         : order.status
  //       return {
  //         updateOne: {
  //           filter: { numeroPedido: order.numeroPedido },
  //           update: { $set: { status } }
  //         }
  //       }
  //     })

  //     return await this.orderModel.bulkWrite(updateOperations)
  //   } catch (error) {
  //     throw new BadRequestException('Cannot find order with this id')
  //   }
  // }

  // async updateManyOrderStatus(orders: any[]): Promise<any> {
  //   try {
  //     await this.orderModel.deleteMany({
  //       sku: {
  //         $in: [...orders.map(order => order.numeroPedido)]
  //       }
  //     })

  //     const insertMany = await this.orderModel.insertMany(orders)
  //     return insertMany
  //   } catch (error) {
  //     throw new BadRequestException('Cannot find order with this id')
  //   }
  // }

  // async updateOrderStatus(orders: any[]): Promise<any> {
  //   try {
  //     const result = await this.orderModel.updateMany(
  //       {
  //         _id: {
  //           $in: [...orders.map(order => order._id)]
  //         }
  //       },
  //       {
  //         $set: {
  //           status: OrderStatusEnum.FINISHED
  //         }
  //       }
  //     )
  //     return result
  //   } catch (error) {
  //     throw new BadRequestException('Cannot find order with this id')
  //   }
  // }

  // async updateOrder(order: any) {
  //   const updatedOrder = await this.orderModel
  //     .updateOne(
  //       { numeroPedido: order.data.id },
  //       {
  //         $set: {
  //           status: order.data.status
  //         }
  //       }
  //     )
  //     .lean()

  //   return updatedOrder.modifiedCount
  // }
}
