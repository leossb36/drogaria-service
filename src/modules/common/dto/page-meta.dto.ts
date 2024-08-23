import { PageMetaDtoParameters } from '../interface'
import { ApiProperty } from '@nestjs/swagger'

export class PageMetaDto {
  @ApiProperty()
  readonly page: number

  @ApiProperty()
  readonly limit: number

  @ApiProperty()
  readonly totalCount: number

  @ApiProperty()
  readonly pageCount: number

  @ApiProperty()
  readonly hasPreviousPage: boolean

  @ApiProperty()
  readonly hasNextPage: boolean

  constructor({ pageOptionsDto, totalCount }: PageMetaDtoParameters) {
    this.page = pageOptionsDto.page
    this.limit = pageOptionsDto.limit
    this.totalCount = totalCount
    this.pageCount = Math.ceil(this.totalCount / this.limit)
    this.hasPreviousPage = this.page > 1
    this.hasNextPage = this.page < this.pageCount
  }
}
