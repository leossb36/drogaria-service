import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class Item {
  @ApiProperty()
  @IsNumber()
  cdProduto: number;

  @ApiProperty()
  @IsString()
  cdBarrasProduto: string;

  @ApiProperty()
  @IsNumber()
  quantidade: number;

  @ApiProperty()
  @IsNumber()
  vlrUnitario: number;

  @ApiProperty()
  @IsNumber()
  vlrDesconto: number;

  @ApiProperty()
  @IsNumber()
  vlrTotal: number;
}

export class Cliente {
  @ApiProperty()
  @IsString()
  nome: string;

  @ApiProperty()
  @IsString()
  cpfCgc: string;

  @ApiProperty()
  @IsString()
  telefone: string;

  @ApiProperty()
  @IsString()
  sexo: string;

  @ApiProperty()
  @IsString()
  dtNascimento: string;

  @ApiProperty()
  @IsString()
  endereco: string;

  @ApiProperty()
  @IsString()
  numero: string;

  @ApiProperty()
  @IsString()
  complemento: string;

  @ApiProperty()
  @IsString()
  cep: string;

  @ApiProperty()
  @IsString()
  bairro: string;

  @ApiProperty()
  @IsString()
  cidade: string;

  @ApiProperty()
  @IsString()
  uf: string;

  @ApiProperty()
  @IsNumber()
  cidadeIBGE: number;

  @ApiProperty()
  @IsString()
  referencia: string;

  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsString()
  inscEstadual: string;

  @ApiProperty()
  @IsString()
  inscMunicipal: string;
}

export class CreateOrderDto {
  @ApiProperty()
  @IsNumber()
  cdFilial: number;

  @ApiProperty()
  @IsString()
  cgcFilial: string;

  @ApiProperty()
  @IsString()
  dtEmissao: string;

  @ApiProperty()
  cliente: Cliente;

  @ApiProperty()
  @IsNumber()
  vlrProdutos: number;

  @ApiProperty()
  @IsNumber()
  vlrDescontos: number;

  @ApiProperty()
  @IsNumber()
  vlrFrete: number;

  @ApiProperty()
  @IsNumber()
  vlrOutros: number;

  @ApiProperty()
  @IsNumber()
  vlrTotal: number;

  @ApiProperty()
  @IsNumber()
  vlrTroco: number;

  @ApiProperty()
  @IsString()
  observacao: string;

  @ApiProperty()
  @IsString()
  nrPedido: string;

  @ApiProperty()
  @IsBoolean()
  retirar: boolean;

  @ApiProperty()
  itens: Item[];
}
