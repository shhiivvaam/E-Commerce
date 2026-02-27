import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WishlistsService {
    constructor(private prisma: PrismaService) { }

    async getWishlist(userId: string) {
        const items = await this.prisma.wishlist.findMany({
            where: { userId },
            include: {
                product: {
                    include: { category: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return items;
    }

    async addToWishlist(userId: string, productId: string) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) throw new NotFoundException('Product not found');

        const existing = await this.prisma.wishlist.findUnique({
            where: { userId_productId: { userId, productId } },
        });
        if (existing) throw new ConflictException('Product already in wishlist');

        return this.prisma.wishlist.create({
            data: { userId, productId },
            include: { product: { include: { category: true } } },
        });
    }

    async removeFromWishlist(userId: string, productId: string) {
        const item = await this.prisma.wishlist.findUnique({
            where: { userId_productId: { userId, productId } },
        });
        if (!item) throw new NotFoundException('Item not found in wishlist');

        return this.prisma.wishlist.delete({
            where: { userId_productId: { userId, productId } },
        });
    }

    async isInWishlist(userId: string, productId: string): Promise<boolean> {
        const item = await this.prisma.wishlist.findUnique({
            where: { userId_productId: { userId, productId } },
        });
        return !!item;
    }
}
