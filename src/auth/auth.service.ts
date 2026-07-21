import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const BCRYPT_SALT_ROUNDS = 12;

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService
  ) {}

  async register(dto: RegisterDto) {
    // التحقق من عدم وجود بريد مكرر (بما في ذلك الحسابات المحذوفة منطقياً لمنع إعادة التسجيل الملتبس)
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('البريد الإلكتروني مستخدم بالفعل');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        // لا نسمح بتمرير role=ADMIN من الـ DTO مباشرة (تحقق أمني إضافي على مستوى الـ Service)
        role: dto.role === 'ADMIN' ? 'MEMBER' : (dto.role ?? 'MEMBER'),
      },
    });

    const tokens = await this.issueTokens(user.id, user.email, user.role);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // رسالة خطأ موحّدة لمنع تسريب معلومة "هل البريد موجود؟" (User Enumeration)
    if (!user) {
      throw new UnauthorizedException('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }

    if (user.deletedAt) {
      throw new ForbiddenException('هذا الحساب لم يعد فعالاً');
    }

    if (user.status !== 'ACTIVE') {
      throw new ForbiddenException('الحساب موقوف حالياً، تواصل مع الإدارة');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }

    const tokens = await this.issueTokens(user.id, user.email, user.role);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async refreshTokens(userId: string, email: string, role: string) {
    // إعادة التحقق من حالة المستخدم عند كل تجديد توكن (دفاع إضافي)
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.deletedAt || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('جلسة غير صالحة');
    }

    return this.issueTokens(userId, email, role);
  }

  private async issueTokens(userId: string, email: string, role: string): Promise<Tokens> {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
      }),
      this.jwt.signAsync(payload, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  // لا نُرجع password_hash أبداً في أي استجابة API
  private sanitizeUser(user: { id: string; email: string; role: string; status: string }) {
    return { id: user.id, email: user.email, role: user.role, status: user.status };
  }
}
