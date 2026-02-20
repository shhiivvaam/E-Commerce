import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CheckoutItemDto {
    @ApiProperty({ example: 'clx_product_id_123', description: 'Product ID' })
    productId: string;

    @ApiProperty({ example: 'Wireless Headphones', description: 'Product name' })
    name: string;

    @ApiProperty({ example: 99.99, description: 'Product price' })
    price: number;

    @ApiProperty({ example: 2, description: 'Quantity' })
    quantity: number;
}

export class CreateCheckoutSessionDto {
    @ApiProperty({
        example: 'clx_order_id_123',
        description: 'The order ID to create a checkout session for',
    })
    orderId: string;

    @ApiProperty({
        type: [CheckoutItemDto],
        description: 'Items to include in the checkout session',
    })
    items: CheckoutItemDto[];

    @ApiProperty({
        example: 'https://yourstore.com/success',
        description: 'URL to redirect to after successful payment',
    })
    successUrl: string;

    @ApiProperty({
        example: 'https://yourstore.com/cancel',
        description: 'URL to redirect to if payment is cancelled',
    })
    cancelUrl: string;
}

export class CheckoutSessionResponseDto {
    @ApiProperty({
        example: 'https://checkout.stripe.com/pay/cs_test_...',
        description: 'Stripe checkout session URL',
    })
    url: string;

    @ApiProperty({ example: 'cs_test_a1B2c3D4e5F6g7H8...' })
    sessionId: string;
}
