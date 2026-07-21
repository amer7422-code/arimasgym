import { Module } from '@nestjs/common';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsTasks } from './subscriptions.tasks';

@Module({
  controllers: [SubscriptionsController],
  // SubscriptionsTasks مسجّلة هنا كـ Provider عادي - @nestjs/schedule يكتشف الـ @Cron()
  // تلقائياً بمجرد أن يكون الـ Provider جزءاً من شجرة الموديولات، بشرط استيراد
  // ScheduleModule.forRoot() مرة واحدة في AppModule (انظر ملاحظة README)
  providers: [SubscriptionsService, SubscriptionsTasks],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
