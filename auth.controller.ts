import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshJwtGuard } from './guards/refresh-jwt.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { GetUser } from './decorators/get-user.decorator';
import { Role } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // يستقبل refreshToken في الـ body، ويتحقق منه عبر RefreshTokenStrategy
  @UseGuards(RefreshJwtGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@GetUser() user: { id: string; email: string; role: string }) {
    return this.authService.refreshTokens(user.id, user.email, user.role);
  }

  // مثال على مسار محمي بالدور: فقط ADMIN و TRAINER يمكنهم الوصول
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.TRAINER)
  @Get('staff-only')
  staffOnlyRoute(@GetUser() user: { id: string; email: string; role: string }) {
    return { message: 'مرحباً بك في المنطقة المخصصة للطاقم', user };
  }

  // مثال على مسار محمي بدون قيود دور (أي مستخدم مسجّل دخول)
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@GetUser() user: { id: string; email: string; role: string }) {
    return user;
  }
}
