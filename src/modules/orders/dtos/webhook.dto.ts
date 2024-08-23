import { IsNumber, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class NotaFiscal {
  @ApiProperty()
  @IsString()
  dataEmissao: string

  @ApiProperty()
  @IsNumber()
  serie: number

  @ApiProperty()
  @IsNumber()
  numero: number

  @ApiProperty()
  @IsString()
  chaveAcesso: string

  @ApiProperty()
  @IsNumber()
  valor: number
}

export class GetWebhookDto {
  @ApiProperty()
  @IsString()
  pedidoId: string

  @ApiProperty()
  @IsString()
  dataStatus: string

  @ApiProperty()
  @IsString()
  status: string

  @ApiProperty()
  notaFiscal: NotaFiscal
}
