import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SubscriptionsService } from './subscriptions.service';

@Injectable()
export class SubscriptionsTasks {
  private readonly logger = new Logger(SubscriptionsTasks.name);

  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  // '1 0 * * *' = كل يوم الساعة 00:01 صباحاً (بتوقيت خادم التشغيل)
  // لا توجد قيمة جاهزة في CronExpression لهذا التوقيت بالضبط، لذا استخدمت نص Cron صريح
  @Cron('1 0 * * *', { name: 'expire-outdated-subscriptions' })
  async handleExpireSubscriptions() {
    this.logger.log('بدء تنفيذ مهمة تحديث الاشتراكات المنتهية...');

    try {
      const updatedCount = await this.subscriptionsService.expireOutdatedSubscriptions();

      if (updatedCount > 0) {
        this.logger.log(`تم تحديث ${updatedCount} اشتراك(ات) من ACTIVE إلى EXPIRED.`);
      } else {
        this.logger.log('لا توجد اشتراكات منتهية تحتاج تحديثاً اليوم.');
      }
    } catch (error) {
      // لا نسمح لفشل هذه المهمة بإيقاف تشغيل الخادم - فقط نسجّل الخطأ لمراجعته
      this.logger.error('فشلت مهمة تحديث الاشتراكات المنتهية', error instanceof Error ? error.stack : error);
    }
  }
}
