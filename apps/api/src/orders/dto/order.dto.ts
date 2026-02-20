import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrderItemDto {
    @ApiProperty({ example: 'clx_product_id_123', description: 'Product ID' })
    productId: string;

    @ApiProperty({ example: 2, description: 'Quantity to order' })
    quantity: number;
}

export class CreateOrderDto {
    @ApiProperty({
        type: [OrderItemDto],
        description: 'Array of items in the order',
    })
    items: OrderItemDto[];

    @ApiPropertyOptional({
        example: '123 Main St, Springfield, IL 62701',
        description: 'Shipping address',
    })
    shippingAddress?: string;
}

export class UpdateOrderStatusDto {
    @ApiProperty({
        example: 'SHIPPED',
        description: 'New order status',
        enum: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
    })
    status: string;
}

export class OrderResponseDto {
    @ApiProperty({ example: 'clx_order_id_123' })
    id: string;

    @ApiProperty({ example: 'clx_user_id_456' })
    userId: string;

    @ApiProperty({ example: 'PENDING', enum: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] })
    status: string;

    @ApiProperty({ example: 199.98 })
    total: number;

    @ApiProperty({ type: [OrderItemDto] })
    items: OrderItemDto[];

    @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
    createdAt: string;
}
