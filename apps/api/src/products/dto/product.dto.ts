import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
    @ApiProperty({ example: 'Wireless Headphones', description: 'Product name' })
    name: string;

    @ApiProperty({
        example: 'High-quality wireless headphones with noise cancellation',
        description: 'Product description',
    })
    description: string;

    @ApiProperty({ example: 99.99, description: 'Product price in USD' })
    price: number;

    @ApiPropertyOptional({ example: 150, description: 'Number of items in stock' })
    stock?: number;

    @ApiPropertyOptional({
        example: 'https://cdn.example.com/product.jpg',
        description: 'Main product image URL',
    })
    imageUrl?: string;

    @ApiPropertyOptional({
        example: 'clx_category_id_123',
        description: 'Category ID this product belongs to',
    })
    categoryId?: string;
}

export class UpdateProductDto {
    @ApiPropertyOptional({ example: 'Updated Product Name' })
    name?: string;

    @ApiPropertyOptional({ example: 'Updated description' })
    description?: string;

    @ApiPropertyOptional({ example: 79.99 })
    price?: number;

    @ApiPropertyOptional({ example: 200 })
    stock?: number;

    @ApiPropertyOptional({ example: 'https://cdn.example.com/new-image.jpg' })
    imageUrl?: string;

    @ApiPropertyOptional({ example: 'clx_category_id_456' })
    categoryId?: string;
}

export class ProductQueryDto {
    @ApiPropertyOptional({ example: 'headphones', description: 'Search by name' })
    search?: string;

    @ApiPropertyOptional({ example: 'clx_category_id_123', description: 'Filter by category ID' })
    categoryId?: string;

    @ApiPropertyOptional({ example: 1, description: 'Page number' })
    page?: number;

    @ApiPropertyOptional({ example: 10, description: 'Items per page' })
    limit?: number;

    @ApiPropertyOptional({ example: 'price', description: 'Sort field', enum: ['price', 'name', 'createdAt'] })
    sortBy?: string;

    @ApiPropertyOptional({ example: 'asc', description: 'Sort direction', enum: ['asc', 'desc'] })
    sortOrder?: string;
}

export class ProductResponseDto {
    @ApiProperty({ example: 'clx_product_id_123' })
    id: string;

    @ApiProperty({ example: 'Wireless Headphones' })
    name: string;

    @ApiProperty({ example: 'High-quality wireless headphones' })
    description: string;

    @ApiProperty({ example: 99.99 })
    price: number;

    @ApiProperty({ example: 150 })
    stock: number;

    @ApiProperty({ example: 'https://cdn.example.com/product.jpg' })
    imageUrl: string;

    @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
    createdAt: string;

    @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
    updatedAt: string;
}
