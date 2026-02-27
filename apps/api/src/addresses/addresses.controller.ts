import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Addresses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new saved address' })
  create(
    @Request() req: { user: { id: string; sub?: string } },
    @Body() createAddressDto: CreateAddressDto,
  ) {
    return this.addressesService.create(
      (req.user.id || req.user.sub) as string,
      createAddressDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all saved addresses for the current user' })
  findAll(@Request() req: { user: { id: string; sub?: string } }) {
    return this.addressesService.findAll(
      (req.user.id || req.user.sub) as string,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific saved address' })
  findOne(
    @Request() req: { user: { id: string; sub?: string } },
    @Param('id') id: string,
  ) {
    return this.addressesService.findOne(
      id,
      (req.user.id || req.user.sub) as string,
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a specific saved address' })
  update(
    @Request() req: { user: { id: string; sub?: string } },
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    return this.addressesService.update(
      id,
      (req.user.id || req.user.sub) as string,
      updateAddressDto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a specific saved address' })
  remove(
    @Request() req: { user: { id: string; sub?: string } },
    @Param('id') id: string,
  ) {
    return this.addressesService.remove(
      id,
      (req.user.id || req.user.sub) as string,
    );
  }
}
