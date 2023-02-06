import { ApiProperty } from '@nestjs/swagger';

export class GetOrderDto {
  @ApiProperty()
  numeroPedido: number;

  @ApiProperty()
  cdOrcamento: number;
}
