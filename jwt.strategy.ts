import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

export interface JwtPayload {
  sub: string; // userId
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_ACCESS_SECRET'),
    });
  }

  // يُستدعى تلقائياً بعد فك تشفير التوكن بنجاح
  // هنا نتحقق من قاعدة البيانات أن المستخدم ما زال موجوداً وفعالاً (ليس Soft-Deleted)
  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('المستخدم غير موجود');
    }

    // فحص Soft Delete - القاعدة الذهبية المطلوبة
    if (user.deletedAt) {
      throw new UnauthorizedException('هذا الحساب تم حذفه');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('الحساب غير مفعّل حالياً');
    }

    // القيمة المُرجعة هنا تُحقن تلقائياً في request.user
    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
}
