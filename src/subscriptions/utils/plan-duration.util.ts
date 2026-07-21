import { PlanType } from '@prisma/client';

// مدة كل نوع خطة بالأيام - مصدر واحد للحقيقة (Single Source of Truth)
// أي تعديل مستقبلي على مدد الخطط يتم هنا فقط
const PLAN_DURATION_DAYS: Record<PlanType, number> = {
  DAY_PASS: 1,
  MONTHLY: 30,
  QUARTERLY: 90,
  YEARLY: 365,
};

export function calculateEndDate(startDate: Date, planType: PlanType): Date {
  const durationDays = PLAN_DURATION_DAYS[planType];
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + durationDays);
  return endDate;
}
