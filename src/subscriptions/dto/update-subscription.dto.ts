import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { MembershipStatus } from '@prisma/client';

export class UpdateSubscriptionDto {
  @IsOptional()
  @IsEnum(MembershipStatus)
  status?: MembershipStatus;

  // تمديد يدوي لتاريخ الانتهاء (حالة استثنائية، مثال: تعويض أيام إغلاق الفرع)
  @IsOptional()
  @IsDateString()
  endDate?: string;

  // لا نسمح بتعديل userId أو planType بعد الإنشاء
  // لتغيير الخطة، الممارسة الصحيحة هي إلغاء الاشتراك الحالي وإنشاء اشتراك جديد
  // (يحافظ هذا على سجل تاريخي دقيق مفيد للفوترة والتحليلات لاحقاً)
}
