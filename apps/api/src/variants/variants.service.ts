import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVariantDto, UpdateVariantDto } from './dto/variant.dto';

@Injectable()
export class VariantsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(productId: string) {
    // Validate product exists
    await this.ensureProductExists(productId);

    return this.prisma.variant.findMany({
      where: { productId },
      orderBy: [{ size: 'asc' }, { color: 'asc' }],
    });
  }

  async findOne(productId: string, variantId: string) {
    const variant = await this.prisma.variant.findFirst({
      where: { id: variantId, productId },
    });
    if (!variant) {
      throw new NotFoundException(
        `Variant ${variantId} not found for this product`,
      );
    }
    return variant;
  }

  async create(productId: string, dto: CreateVariantDto) {
    await this.ensureProductExists(productId);

    // Ensure SKU uniqueness if provided
    if (dto.sku) {
      const existing = await this.prisma.variant.findUnique({
        where: { sku: dto.sku },
      });
      if (existing) {
        throw new ConflictException(`SKU "${dto.sku}" is already in use`);
      }
    }

    return this.prisma.variant.create({
      data: {
        productId,
        size: dto.size,
        color: dto.color,
        sku: dto.sku,
        stock: dto.stock,
        priceDiff: dto.priceDiff ?? 0,
      },
    });
  }

  async update(productId: string, variantId: string, dto: UpdateVariantDto) {
    await this.findOne(productId, variantId); // Validates existence

    // Check SKU uniqueness if being changed
    if (dto.sku) {
      const conflict = await this.prisma.variant.findFirst({
        where: { sku: dto.sku, NOT: { id: variantId } },
      });
      if (conflict) {
        throw new ConflictException(`SKU "${dto.sku}" is already in use`);
      }
    }

    return this.prisma.variant.update({
      where: { id: variantId },
      data: {
        ...(dto.size !== undefined && { size: dto.size }),
        ...(dto.color !== undefined && { color: dto.color }),
        ...(dto.sku !== undefined && { sku: dto.sku }),
        ...(dto.stock !== undefined && { stock: dto.stock }),
        ...(dto.priceDiff !== undefined && { priceDiff: dto.priceDiff }),
      },
    });
  }

  async remove(productId: string, variantId: string) {
    await this.findOne(productId, variantId); // Validates existence
    await this.prisma.variant.delete({ where: { id: variantId } });
    return { message: 'Variant deleted successfully' };
  }

  private async ensureProductExists(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException(`Product ${productId} not found`);
    }
    return product;
  }
}
