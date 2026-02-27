import { IsString, IsInt, Min, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddCartItemDto {
    @ApiProperty({ description: 'The ID of the product to add to cart' })
    @IsString()
    productId: string;

    @ApiPropertyOptional({ description: 'The ID of the specific product variant (if applicable)' })
    @IsString()
    @IsOptional()
    variantId?: string;

    @ApiProperty({ description: 'Quantity to add', default: 1 })
    @IsInt()
    @Min(1)
    quantity: number;
}

export class UpdateCartItemDto {
    @ApiProperty({ description: 'New quantity for the cart item', default: 1 })
    @IsInt()
    @Min(1)
    quantity: number;
}
