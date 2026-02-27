import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { WishlistsService } from './wishlists.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

type AuthRequest = { user: { id: string } };

@ApiTags('Wishlist')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wishlist')
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @Get()
  @ApiOperation({ summary: 'Get my wishlist' })
  getWishlist(@Request() req: AuthRequest) {
    return this.wishlistsService.getWishlist(req.user.id);
  }

  @Post(':productId')
  @ApiOperation({ summary: 'Add a product to wishlist' })
  @ApiParam({ name: 'productId', type: String })
  addToWishlist(
    @Request() req: AuthRequest,
    @Param('productId') productId: string,
  ) {
    return this.wishlistsService.addToWishlist(req.user.id, productId);
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Remove a product from wishlist' })
  @ApiParam({ name: 'productId', type: String })
  removeFromWishlist(
    @Request() req: AuthRequest,
    @Param('productId') productId: string,
  ) {
    return this.wishlistsService.removeFromWishlist(req.user.id, productId);
  }

  @Get(':productId/check')
  @ApiOperation({ summary: 'Check if a product is in wishlist' })
  @ApiParam({ name: 'productId', type: String })
  async checkWishlist(
    @Request() req: AuthRequest,
    @Param('productId') productId: string,
  ) {
    const inWishlist = await this.wishlistsService.isInWishlist(
      req.user.id,
      productId,
    );
    return { inWishlist };
  }
}
