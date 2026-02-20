import { Controller, Get, Post, Body, Param, Patch, UseGuards, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrderStatus } from '@prisma/client';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Post()
    create(@Request() req: any, @Body() createOrderDto: any) {
        return this.ordersService.create(req.user.userId || req.user.id, createOrderDto);
    }

    @Get()
    findAll(@Request() req: any) {
        return this.ordersService.findAllByUser(req.user.userId || req.user.id);
    }

    @Get(':id')
    findOne(@Request() req: any, @Param('id') id: string) {
        return this.ordersService.findOne(id, req.user.userId || req.user.id);
    }

    @Patch(':id/status')
    updateStatus(@Param('id') id: string, @Body('status') status: OrderStatus) {
        // Ideally restricted to Admin roles
        return this.ordersService.updateStatus(id, status);
    }
}
