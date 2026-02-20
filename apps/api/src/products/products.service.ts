import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class ProductsService {
    constructor(
        private prisma: PrismaService,
        private settings: SettingsService
    ) { }

    async create(data: any) {
        return this.prisma.product.create({ data });
    }

    async findAll(query: any = {}) {
        const isSingle = await this.settings.isSingleProductMode();
        const singleId = await this.settings.getSingleProductId();

        if (isSingle && singleId) {
            return this.prisma.product.findMany({
                where: { id: singleId },
                include: { variants: true, category: true }
            });
        }

        // Default multi-product fetching with pagination and search
        const { search, category, page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (category) {
            where.categoryId = category;
        }

        const [products, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                skip: Number(skip),
                take: Number(limit),
                include: { variants: true, category: true }
            }),
            this.prisma.product.count({ where })
        ]);

        return { products, total, page: Number(page), limit: Number(limit) };
    }

    async findOne(id: string) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: { variants: true, category: true, reviews: true }
        });
        if (!product) throw new NotFoundException('Product not found');

        // Safety check if in single mode
        const isSingle = await this.settings.isSingleProductMode();
        const singleId = await this.settings.getSingleProductId();
        if (isSingle && singleId && singleId !== id) {
            throw new NotFoundException('Store is currently restricted to a single product');
        }

        return product;
    }

    async update(id: string, data: any) {
        return this.prisma.product.update({ where: { id }, data });
    }

    async remove(id: string) {
        return this.prisma.product.delete({ where: { id } });
    }
}
