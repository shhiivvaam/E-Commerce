import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

@Injectable()
export class CategoriesService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.category.findMany({
            where: { deletedAt: null },
            orderBy: { name: 'asc' },
            include: { _count: { select: { products: true } } },
        });
    }

    async findOne(id: string) {
        const category = await this.prisma.category.findFirst({
            where: { id, deletedAt: null },
            include: { products: { where: { deletedAt: null }, take: 20 } },
        });
        if (!category) throw new NotFoundException('Category not found');
        return category;
    }

    async create(data: CreateCategoryDto) {
        const slug = slugify(data.name);
        const existing = await this.prisma.category.findUnique({ where: { slug } });
        if (existing)
            throw new ConflictException('A category with this name already exists');

        return this.prisma.category.create({
            data: {
                name: data.name,
                slug,
                description: data.description,
            },
        });
    }

    async update(id: string, data: UpdateCategoryDto) {
        await this.findOne(id);
        const updateData: Record<string, unknown> = {};

        if (data.name) {
            updateData.name = data.name;
            updateData.slug = slugify(data.name);
        }
        if (data.description !== undefined) {
            updateData.description = data.description;
        }

        return this.prisma.category.update({ where: { id }, data: updateData });
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.category.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
}
