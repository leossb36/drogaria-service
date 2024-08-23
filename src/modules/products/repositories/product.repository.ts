import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { PrismaService } from '@app/infra/db/prisma/prisma.service'
import { Prisma, products } from '@prisma/client'

@Injectable()
export class ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: any): Promise<products> {
    try {
      const product = await this.prisma.products.create({
        data: {
          ...dto
        }
      })
      return product
    } catch (error) {
      throw new InternalServerErrorException('Não foi possível criar o produto')
    }
  }

  async createMany(dtos: products[]): Promise<number> {
    try {
      const response = await this.prisma.products.createMany({
        data: dtos
      })

      return response.count
    } catch (error) {
      throw new InternalServerErrorException('Não foi possível criar o produto')
    }
  }

  async getProducts(skus: string[]) {
    try {
      const products = await this.prisma.products.findMany({
        where: {
          sku: {
            in: skus
          }
        }
      })
      return products
    } catch (error) {
      throw new InternalServerErrorException('Erro ao listar produtos')
    }
  }

  async getAllProducts() {
    try {
      const products = await this.prisma.products.findMany()
      return products
    } catch (error) {
      throw new InternalServerErrorException('Erro ao listar produtos')
    }
  }

  async updateProducts(dtos: products[]): Promise<number> {
    try {
      if (!dtos.length) {
        return 0
      }
      const response = await this.prisma.products.updateMany({
        where: {
          sku: {
            in: dtos.map(dto => dto.sku)
          }
        },
        data: dtos
      })

      return response.count
    } catch (error) {
      throw new InternalServerErrorException('Erro ao atualizar produtos')
    }
  }

  async createCategories(dtos: any[]): Promise<number> {
    try {
      const response = await this.prisma.categories.createMany({
        data: dtos
      })

      return response.count
    } catch (error) {
      throw new InternalServerErrorException('Erro ao criar categorias')
    }
  }

  async getCategories(): Promise<{ id: string; name: string }[]> {
    try {
      const categories = await this.prisma.categories.findMany({
        select: {
          id: true,
          name: true,
          woocommerceId: true
        }
      })
      return categories
    } catch (error) {
      throw new InternalServerErrorException('Erro ao listar categorias')
    }
  }

  async syncCategories(dto: any): Promise<void> {
    try {
      await this.prisma.categories.updateMany({
        where: {
          name: {
            contains: dto.slug,
            mode: Prisma.QueryMode.insensitive
          }
        },
        data: {
          woocommerceId: dto.id
        }
      })
    } catch (error) {
      throw new InternalServerErrorException('Erro ao listar categorias')
    }
  }
}
