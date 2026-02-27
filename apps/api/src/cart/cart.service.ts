import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddCartItemDto, UpdateCartItemDto } from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true, variant: true },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: { items: { include: { product: true, variant: true } } },
      });
    }

    return cart;
  }

  private async calculateTotal(cartId: string) {
    const items = await this.prisma.cartItem.findMany({
      where: { cartId },
      include: { product: true, variant: true },
    });

    const total = items.reduce((sum, item) => {
      let price = item.product.discounted ?? item.product.price;
      if (item.variant) {
        price += item.variant.priceDiff;
      }
      return sum + price * item.quantity;
    }, 0);

    return this.prisma.cart.update({
      where: { id: cartId },
      data: { total },
      include: { items: { include: { product: true, variant: true } } },
    });
  }

  async addItem(userId: string, data: AddCartItemDto) {
    const cart = await this.getCart(userId);
    const product = await this.prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) throw new NotFoundException('Product not found');

    // Check if item already exists in cart with same variance
    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: data.productId,
        variantId: data.variantId || null,
      },
    });

    if (existingItem) {
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + data.quantity },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: data.productId,
          variantId: data.variantId || null,
          quantity: data.quantity,
        },
      });
    }

    return this.calculateTotal(cart.id);
  }

  async updateItem(userId: string, itemId: string, data: UpdateCartItemDto) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw new NotFoundException('Cart not found');

    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });
    if (!item) throw new NotFoundException('Cart item not found');

    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: data.quantity },
    });

    return this.calculateTotal(cart.id);
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw new NotFoundException('Cart not found');

    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });
    if (!item) throw new NotFoundException('Cart item not found');

    await this.prisma.cartItem.delete({ where: { id: itemId } });

    return this.calculateTotal(cart.id);
  }

  async clearCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) return null;

    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return this.calculateTotal(cart.id);
  }
}
