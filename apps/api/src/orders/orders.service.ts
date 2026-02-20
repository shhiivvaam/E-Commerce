import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, data: any) {
        // In a real scenario, this would compute totals from Cart items, apply coupons, and calculate tax
        return this.prisma.order.create({
            data: {
                userId,
                status: OrderStatus.PENDING,
                totalAmount: data.totalAmount,
                taxAmount: data.taxAmount || 0,
                shippingAmount: data.shippingAmount || 0,
                addressId: data.addressId,
                items: {
                    create: data.items.map(item => ({
                        productId: item.productId,
                        variantId: item.variantId,
                        quantity: item.quantity,
                        price: item.price
                    }))
                }
            }
        });
    }

    async findAllByUser(userId: string) {
        return this.prisma.order.findMany({
            where: { userId },
            include: { items: { include: { product: true } } },
            orderBy: { createdAt: 'desc' }
        });
    }

    async findOne(id: string, userId: string) {
        const order = await this.prisma.order.findFirst({
            where: { id, userId },
            include: { items: { include: { product: true } }, address: true, payment: true }
        });
        if (!order) throw new NotFoundException('Order not found');
        return order;
    }

    async updateStatus(id: string, status: OrderStatus) {
        return this.prisma.order.update({
            where: { id },
            data: { status }
        });
    }
}
