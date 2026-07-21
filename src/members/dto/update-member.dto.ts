import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsIn,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
} from 'class-validator';
import { UserStatus } from '@prisma/client';

export class UpdateMemberDto {
  @IsOptional()
  @IsEmail({}, { message: 'يجب إدخال بريد إلكتروني صالح' })
  email?: string;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  fullName?: string;

  // بدون تحديد دولة افتراضية (null) لدعم أرقام دولية متعددة الجنسيات
  @IsOptional()
  @IsPhoneNumber(undefined, { message: 'رقم هاتف غير صالح' })
  phoneNumber?: string;

  // نستقبل التاريخ كنص ISO من الواجهة الأمامية (مثال: "1995-08-20")
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  // نص حر مقصود بدل Enum لإتاحة المرونة (Male/Female/Other/تفضيل عدم الذكر...)
  // يمكن تحويله إلى Enum لاحقاً إذا رغبت الإدارة بتوحيد القيم
  @IsOptional()
  @IsString()
  @IsIn(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'])
  gender?: string;

  // لا نسمح بتعديل role أو password من هذا الـ Endpoint عمداً:
  // تغيير الدور يجب أن يمر عبر مسار إداري منفصل ومُدقَّق (Audit)،
  // وتغيير كلمة المرور له مساره الخاص في Auth Module (لا يُعاد استخدام bcrypt هنا).
}
