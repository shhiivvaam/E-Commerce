import {
  Controller,
  Post,
  Get,
  Patch,
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
  ApiBody,
} from '@nestjs/swagger';
import { RefundsService } from './refunds.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleType } from '@prisma/client';
import { IsOptional, IsString, IsIn } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

class RequestRefundDto {
  @ApiPropertyOptional({ example: 'Item arrived damaged' })
  @IsString()
  @IsOptional()
  reason?: string;
}

class UpdateRefundStatusDto {
  @ApiProperty({ enum: ['APPROVED', 'REJECTED', 'COMPLETED'] })
  @IsString()
  @IsIn(['APPROVED', 'REJECTED', 'COMPLETED'])
  status: 'APPROVED' | 'REJECTED' | 'COMPLETED';
}

type AuthRequest = { user: { id: string } };

@ApiTags('Refunds')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class RefundsController {
  constructor(private readonly refundsService: RefundsService) {}

  @Post(':orderId/refund')
  @ApiOperation({ summary: 'Request a refund for an order' })
  @ApiParam({ name: 'orderId', type: String })
  requestRefund(
    @Request() req: AuthRequest,
    @Param('orderId') orderId: string,
    @Body() dto: RequestRefundDto,
  ) {
    return this.refundsService.requestRefund(req.user.id, orderId, dto.reason);
  }

  @Get(':orderId/refund')
  @ApiOperation({ summary: 'Get refund status for an order' })
  @ApiParam({ name: 'orderId', type: String })
  getRefund(@Request() req: AuthRequest, @Param('orderId') orderId: string) {
    return this.refundsService.getRefundForOrder(req.user.id, orderId);
  }

  @Get('refunds/all')
  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'List all refund requests (admin)' })
  findAll() {
    return this.refundsService.findAll();
  }

  @Patch('refunds/:refundId/status')
  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Update refund status (admin)' })
  @ApiParam({ name: 'refundId', type: String })
  updateStatus(
    @Param('refundId') refundId: string,
    @Body() dto: UpdateRefundStatusDto,
  ) {
    return this.refundsService.updateRefundStatus(refundId, dto.status);
  }
}
