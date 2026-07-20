import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { MembersModule } from './members/members.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // يُفعّل نظام الـ Cron في كامل التطبيق - مطلوب مرة واحدة فقط هنا
    // ليعمل @Cron() داخل SubscriptionsTasks (ولأي مهام مجدولة مستقبلية)
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    MembersModule,
    SubscriptionsModule,
  ],
})
export class AppModule {}
