import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
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
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/review.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

type AuthRequest = { user: { id: string; sub?: string } };

@ApiTags('Reviews')
@Controller()
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) { }

    @Get('products/:productId/reviews')
    @ApiOperation({ summary: 'Get all reviews for a product' })
    @ApiParam({ name: 'productId', type: String })
    getProductReviews(@Param('productId') productId: string) {
        return this.reviewsService.getProductReviews(productId);
    }

    @Post('products/:productId/reviews')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Add a review for a product' })
    @ApiParam({ name: 'productId', type: String })
    createReview(
        @Request() req: AuthRequest,
        @Param('productId') productId: string,
        @Body() dto: CreateReviewDto,
    ) {
        const userId = (req.user.id || req.user.sub) as string;
        return this.reviewsService.createReview(userId, productId, dto);
    }

    @Patch('reviews/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update your review' })
    @ApiParam({ name: 'id', type: String })
    updateReview(
        @Request() req: AuthRequest,
        @Param('id') id: string,
        @Body() dto: CreateReviewDto,
    ) {
        const userId = (req.user.id || req.user.sub) as string;
        return this.reviewsService.updateReview(userId, id, dto);
    }

    @Delete('reviews/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete your review' })
    @ApiParam({ name: 'id', type: String })
    deleteReview(@Request() req: AuthRequest, @Param('id') id: string) {
        const userId = (req.user.id || req.user.sub) as string;
        return this.reviewsService.deleteReview(userId, id);
    }
}
