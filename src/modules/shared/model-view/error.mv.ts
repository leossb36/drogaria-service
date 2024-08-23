import { IsNumber, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class ErrorResponse {
  @ApiProperty()
  @IsString()
  message: string

  @ApiProperty()
  @IsString()
  error: string

  @ApiProperty()
  @IsNumber()
  statusCode: number
}
