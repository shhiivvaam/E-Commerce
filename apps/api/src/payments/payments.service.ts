import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
    constructor(private prisma: PrismaService) { }

    async createPaymentIntent(orderId: string, amount: number) {
        // Mock Stripe Intention
        return {
            clientSecret: `pi_mock_secret_${orderId}_${Date.now()}`,
            amount
        };
    }

    async verifyPayment(orderId: string, transactionId: string, method: PaymentMethod = PaymentMethod.STRIPE) {
        const order = await this.prisma.order.findUnique({ where: { id: orderId } });
        if (!order) throw new BadRequestException('Order not found');

        const payment = await this.prisma.payment.create({
            data: {
                orderId,
                amount: order.totalAmount,
                method,
                status: PaymentStatus.COMPLETED,
                transactionId
            }
        });

        await this.prisma.order.update({
            where: { id: orderId },
            data: { status: 'PROCESSING' }
        });

        return payment;
    }
}
