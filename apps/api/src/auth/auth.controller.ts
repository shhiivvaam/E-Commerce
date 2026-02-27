import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import {
  LoginDto,
  RegisterDto,
  AuthResponseDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/auth.dto';
import { ThrottlerGuard } from '@nestjs/throttler';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 60000, limit: 5 } }) // 5 attempts per minute
  @ApiOperation({
    summary: 'Login a user',
    description:
      'Authenticate with email and password and receive a JWT token. Limited to 5 attempts per minute.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: AuthResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Invalid email or password' })
  @ApiTooManyRequestsResponse({ description: 'Too many login attempts. Please wait.' })
  async login(@Body() body: LoginDto) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Post('register')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 60000, limit: 10 } }) // 10 registrations per minute
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Create a new customer account. Returns a JWT token on success. Limited to 10 registrations per minute.',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Registration successful',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Email already in use or invalid data',
  })
  @ApiTooManyRequestsResponse({ description: 'Too many registration attempts.' })
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Post('forgot-password')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 3600000, limit: 3 } }) // 3 resets per hour — protect against email flooding
  @ApiOperation({
    summary: 'Request password reset email',
    description:
      'Send a password reset link to the user email. Limited to 3 requests per hour to prevent abuse.',
  })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Reset email sent',
  })
  @ApiTooManyRequestsResponse({ description: 'Too many reset requests. Try again in an hour.' })
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.forgotPassword(body);
  }

  @Post('reset-password')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 60000, limit: 5 } }) // 5 attempts per minute
  @ApiOperation({
    summary: 'Reset user password',
    description: 'Reset password using the token sent to the email.',
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password reset successful',
  })
  @ApiBadRequestResponse({ description: 'Invalid or expired token' })
  @ApiTooManyRequestsResponse({ description: 'Too many reset attempts.' })
  async resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body);
  }
}
