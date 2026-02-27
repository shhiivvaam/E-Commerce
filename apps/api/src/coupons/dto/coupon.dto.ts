import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsBoolean,
    IsNumber,
    IsDateString,
    IsInt,
    Min,
} from 'class-validator';

export class CreateCouponDto {
    @ApiProperty({ example: 'SAVE20' })
    @IsString()
    @IsNotEmpty()
    code: string;

    @ApiProperty({ example: 20, description: 'Discount amount or percentage' })
    @IsNumber()
    @Min(0)
    discount: number;

    @ApiPropertyOptional({ example: false, description: 'If true, discount is a flat amount; otherwise percentage' })
    @IsBoolean()
    @IsOptional()
    isFlat?: boolean;

    @ApiProperty({ example: '2025-12-31T23:59:59Z' })
    @IsDateString()
    expiryDate: string;

    @ApiPropertyOptional({ example: 100 })
    @IsInt()
    @Min(1)
    @IsOptional()
    usageLimit?: number;

    @ApiPropertyOptional({ example: 50, description: 'Minimum cart total to apply coupon' })
    @IsNumber()
    @Min(0)
    @IsOptional()
    minTotal?: number;
}

export class UpdateCouponDto {
    @ApiPropertyOptional({ example: 25 })
    @IsNumber()
    @IsOptional()
    discount?: number;

    @ApiPropertyOptional()
    @IsBoolean()
    @IsOptional()
    isFlat?: boolean;

    @ApiPropertyOptional()
    @IsDateString()
    @IsOptional()
    expiryDate?: string;

    @ApiPropertyOptional()
    @IsInt()
    @Min(1)
    @IsOptional()
    usageLimit?: number;

    @ApiPropertyOptional()
    @IsNumber()
    @Min(0)
    @IsOptional()
    minTotal?: number;
}

export class ApplyCouponDto {
    @ApiProperty({ example: 'SAVE20' })
    @IsString()
    @IsNotEmpty()
    code: string;

    @ApiProperty({ example: 150, description: 'Current cart total to validate against minTotal' })
    @IsNumber()
    @Min(0)
    cartTotal: number;
}
