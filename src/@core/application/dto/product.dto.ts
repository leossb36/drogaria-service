import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';

export class Product {
  @ApiProperty()
  @IsNumber()
  cdFilial: number;

  @ApiProperty()
  @IsNumber()
  cdProduto: number;

  @ApiProperty()
  @IsString()
  descricao: string;

  @ApiProperty()
  @IsString()
  descricaoUsual: string;

  @ApiProperty()
  @IsString()
  codigoBarras: string;

  @ApiProperty()
  inativo: boolean;

  @ApiProperty()
  @IsNumber()
  cdMarca?: number;

  @ApiProperty()
  @IsString()
  nomeMarca?: string;

  @ApiProperty()
  @IsNumber()
  cdFabricante?: number;

  @ApiProperty()
  @IsString()
  nomeFabricante?: string;

  @ApiProperty()
  @IsNumber()
  cdLinha?: number;

  @ApiProperty()
  @IsString()
  nomeLinha?: string;

  @ApiProperty()
  @IsNumber()
  cdCategoria?: number;

  @ApiProperty()
  @IsString()
  nomeCategoria?: string;

  @ApiProperty()
  @IsNumber()
  qtdEstoque: number;

  @ApiProperty()
  @IsNumber()
  vlrTabela: number;

  @ApiProperty()
  @IsNumber()
  percDesconto: number;

  @ApiProperty()
  @IsNumber()
  vlrOferta: number;

  @ApiProperty()
  @IsDate()
  dtUltimaAlteracao: Date;

  @ApiProperty()
  @IsString()
  @IsOptional()
  imageUrl?: string;
}
