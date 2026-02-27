import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiBearerAuth,
    ApiParam,
    ApiResponse,
    ApiNotFoundResponse,
    ApiConflictResponse,
} from '@nestjs/swagger';
import { VariantsService } from './variants.service';
import { CreateVariantDto, UpdateVariantDto } from './dto/variant.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleType } from '@prisma/client';

@ApiTags('Variants')
@Controller('products/:productId/variants')
export class VariantsController {
    constructor(private readonly variantsService: VariantsService) { }

    @Get()
    @ApiOperation({ summary: 'List all variants for a product' })
    @ApiParam({ name: 'productId', description: 'Product ID' })
    @ApiResponse({ status: 200, description: 'Variants retrieved successfully' })
    @ApiNotFoundResponse({ description: 'Product not found' })
    findAll(@Param('productId') productId: string) {
        return this.variantsService.findAll(productId);
    }

    @Get(':variantId')
    @ApiOperation({ summary: 'Get a single variant' })
    @ApiParam({ name: 'productId', description: 'Product ID' })
    @ApiParam({ name: 'variantId', description: 'Variant ID' })
    @ApiNotFoundResponse({ description: 'Variant or product not found' })
    findOne(
        @Param('productId') productId: string,
        @Param('variantId') variantId: string,
    ) {
        return this.variantsService.findOne(productId, variantId);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleType.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Add a variant to a product (admin)' })
    @ApiParam({ name: 'productId', description: 'Product ID' })
    @ApiNotFoundResponse({ description: 'Product not found' })
    @ApiConflictResponse({ description: 'SKU already in use' })
    create(
        @Param('productId') productId: string,
        @Body() dto: CreateVariantDto,
    ) {
        return this.variantsService.create(productId, dto);
    }

    @Patch(':variantId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleType.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a variant (admin)' })
    @ApiParam({ name: 'productId', description: 'Product ID' })
    @ApiParam({ name: 'variantId', description: 'Variant ID' })
    @ApiConflictResponse({ description: 'SKU already in use' })
    update(
        @Param('productId') productId: string,
        @Param('variantId') variantId: string,
        @Body() dto: UpdateVariantDto,
    ) {
        return this.variantsService.update(productId, variantId, dto);
    }

    @Delete(':variantId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleType.ADMIN)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Delete a variant (admin)' })
    @ApiParam({ name: 'productId', description: 'Product ID' })
    @ApiParam({ name: 'variantId', description: 'Variant ID' })
    remove(
        @Param('productId') productId: string,
        @Param('variantId') variantId: string,
    ) {
        return this.variantsService.remove(productId, variantId);
    }
}
