import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
  @IsEmail({}, { message: 'يجب إدخال بريد إلكتروني صالح' })
  email: string;

  // الحد الأدنى 8 أحرف - يُفضّل إضافة regex لاحقاً لفرض تعقيد أعلى (حرف كبير/رقم/رمز)
  @IsString()
  @MinLength(8, { message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' })
  password: string;

  // الدور اختياري عند التسجيل، يُفرض MEMBER افتراضياً في الـ Service
  // لا نسمح للمستخدم بتمرير ADMIN مباشرة من الـ API لأسباب أمنية
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
