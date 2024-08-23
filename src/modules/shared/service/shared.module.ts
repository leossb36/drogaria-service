import { WordpressService } from './wordpress.service'
import { WcService } from './woocommerce.service'
import { VetorService } from './vetor.service'
import { Module } from '@nestjs/common'

@Module({
  providers: [VetorService, WcService, WordpressService],
  exports: [VetorService, WcService, WordpressService]
})
export class SharedModule {}
