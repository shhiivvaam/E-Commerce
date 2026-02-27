import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@Request() req: { user: { id: string; sub?: string } }) {
    // sub is mapped to id in the payload
    return this.usersService.findOne((req.user.id || req.user.sub) as string);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  updateProfile(
    @Request() req: { user: { id: string; sub?: string } },
    @Body() updateData: UpdateUserDto,
  ) {
    return this.usersService.update(
      (req.user.id || req.user.sub) as string,
      updateData,
    );
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete current user profile' })
  deleteProfile(@Request() req: { user: { id: string; sub?: string } }) {
    return this.usersService.remove((req.user.id || req.user.sub) as string);
  }
}
