import { ApiProperty } from '@nestjs/swagger';

export class GetOrderInformationModelView {
  @ApiProperty()
  situacao: number;

  @ApiProperty()
  cdOrcamento: number;

  @ApiProperty()
  mensagem: string;
}
