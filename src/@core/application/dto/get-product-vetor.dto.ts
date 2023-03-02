import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class GetProductVetorDto {
  @Expose()
  @IsOptional()
  @ApiProperty({
    required: false,
  })
  '$select'?: string;

  @Expose()
  @IsOptional()
  @ApiProperty({
    required: false,
  })
  '$orderby'?: string;

  @Expose()
  @IsOptional()
  @ApiProperty({
    required: false,
  })
  '$top'?: string;

  @Expose()
  @IsOptional()
  @ApiProperty({
    required: false,
  })
  '$skip'?: string;

  @Expose()
  @IsOptional()
  @ApiProperty({
    required: false,
  })
  '$count'?: string;

  @Expose()
  @IsOptional()
  @ApiProperty({
    required: false,
  })
  '$filter'?: string;
}
