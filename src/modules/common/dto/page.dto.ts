import { ApiProperty } from '@nestjs/swagger'
import { PageMetaDto } from './page-meta.dto'
import { IsArray } from 'class-validator'

export class PageDto<T> {
  @IsArray()
  @ApiProperty({ isArray: true, type: Object })
  readonly data: T[]

  @ApiProperty({ type: PageMetaDto })
  readonly meta: PageMetaDto

  constructor(data: T[], meta: PageMetaDto) {
    this.data = data
    this.meta = meta
  }
}
