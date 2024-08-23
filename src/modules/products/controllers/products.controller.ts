import { Controller, Get, InternalServerErrorException, Patch, Post } from '@nestjs/common'
import { ProductService } from '../services/products.service'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

@Controller('products')
@ApiTags('Product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @ApiOperation({ summary: 'Criar produtos no ecommerce' })
  async createProducts(): Promise<void | null> {
    try {
      await this.productService.createProducts()
    } catch (error) {
      throw new InternalServerErrorException(error.message)
    }
  }

  @Patch()
  @ApiOperation({ summary: 'Atualizacao de produtos' })
  async updateProducts(): Promise<void> {
    try {
      await this.productService.updateProducts()
    } catch (error) {
      throw new InternalServerErrorException(error.message)
    }
  }

  @Get('seeds')
  @ApiOperation({ summary: 'Lista produtos do seed' })
  async getProductsSeed() {
    try {
      return await this.productService.readStream()
    } catch (error) {
      throw new InternalServerErrorException(error.message)
    }
  }

  @Post('seeds')
  @ApiOperation({ summary: 'Criar produtos nos seeds' })
  async createSeeds(): Promise<void> {
    try {
      await this.productService.saveOnStream()
    } catch (error) {
      throw new InternalServerErrorException(error.message)
    }
  }

  @Post('category')
  @ApiOperation({ summary: 'Criacao de categorias' })
  async createCategory(): Promise<void> {
    try {
      await this.productService.createCategories()
    } catch (error) {
      throw new InternalServerErrorException(error.message)
    }
  }

  @Get('categories')
  @ApiOperation({ summary: 'Lista as categorias' })
  async getCategories() {
    try {
      return await this.productService.getCategories()
    } catch (error) {
      throw new InternalServerErrorException(error.message)
    }
  }

  @Patch('categories')
  @ApiOperation({ summary: 'Sincroniza as categorias' })
  async syncCategories() {
    try {
      return await this.productService.syncCategories()
    } catch (error) {
      throw new InternalServerErrorException(error.message)
    }
  }
}
