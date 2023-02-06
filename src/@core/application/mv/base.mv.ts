import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export abstract class BaseModelView {
  @ApiProperty()
  @IsNumber()
  status: number;

  @ApiProperty()
  @IsString()
  msg: string;

  @ApiProperty()
  @IsNumber()
  total?: number;
}
