import { ProductController } from './controllers/products.controller'
import { ProductRepository } from './repositories/product.repository'
import { PrismaModule } from '@app/infra/db/prisma/prisma.module'
import { SharedModule } from '../shared/service/shared.module'
import { ProductService } from './services/products.service'
import { Global, Module } from '@nestjs/common'

@Global()
@Module({
  imports: [SharedModule, PrismaModule],
  controllers: [ProductController],
  providers: [ProductService, ProductRepository]
})
export class ProductModule {}
