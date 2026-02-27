import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsInt, Min } from 'class-validator';

export class CreateVariantDto {
  @ApiPropertyOptional({ example: 'M', description: 'Size (e.g. S, M, L, XL)' })
  @IsString()
  @IsOptional()
  size?: string;

  @ApiPropertyOptional({ example: 'Red', description: 'Color name or hex' })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({
    example: 'SKU-RED-M',
    description: 'Unique SKU for this variant',
  })
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiProperty({ example: 50, description: 'Stock quantity for this variant' })
  @IsInt()
  @Min(0)
  stock: number;

  @ApiPropertyOptional({
    example: 5.0,
    description:
      'Price difference from base product price (positive adds, negative subtracts)',
  })
  @IsNumber()
  @IsOptional()
  priceDiff?: number;
}

export class UpdateVariantDto {
  @ApiPropertyOptional({ example: 'L' })
  @IsString()
  @IsOptional()
  size?: string;

  @ApiPropertyOptional({ example: 'Blue' })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ example: 'SKU-BLUE-L' })
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiPropertyOptional({ example: 30 })
  @IsInt()
  @Min(0)
  @IsOptional()
  stock?: number;

  @ApiPropertyOptional({ example: -10.0 })
  @IsNumber()
  @IsOptional()
  priceDiff?: number;
}
