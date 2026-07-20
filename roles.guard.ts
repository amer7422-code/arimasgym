import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

// ملاحظة مهمة: هذا الـ Guard يفترض أن JwtAuthGuard تم تنفيذه قبله
// وأن request.user موجود بالفعل (تحقق منه الـ JwtStrategy، بما في ذلك فحص deletedAt)
// الاستخدام الصحيح دائماً: @UseGuards(JwtAuthGuard, RolesGuard)
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // إذا لم يُحدَّد @Roles() على الـ Route، فهو مفتوح لأي مستخدم مصادَق عليه
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('غير مصرح بالوصول');
    }

    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      throw new ForbiddenException('ليس لديك الصلاحية الكافية لهذا الإجراء');
    }

    return true;
  }
}
