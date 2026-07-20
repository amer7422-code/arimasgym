import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PlanType } from '@prisma/client';

export class CreateSubscriptionDto {
  // معرّف العضو الذي سيُنشأ له الاشتراك - الطاقم هو من يحدده، وليس التوكن الحالي
  @IsUUID()
  userId: string;

  @IsEnum(PlanType)
  planType: PlanType;

  // اختياري: إن لم يُحدَّد، يُستخدم الوقت الحالي (تُحسب في الـ Service)
  @IsOptional()
  @IsDateString()
  startDate?: string;
}
