import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { QuerySubscriptionsDto } from './dto/query-subscriptions.dto';
import { calculateEndDate } from './utils/plan-duration.util';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSubscriptionDto) {
    // نتأكد أن العضو موجود، دوره MEMBER فعلاً، وغير محذوف منطقياً
    const member = await this.prisma.user.findFirst({
      where: { id: dto.userId, role: 'MEMBER', deletedAt: null },
    });

    if (!member) {
      throw new NotFoundException('العضو غير موجود أو غير صالح لإنشاء اشتراك له');
    }

    const startDate = dto.startDate ? new Date(dto.startDate) : new Date();
    const endDate = calculateEndDate(startDate, dto.planType);

    // قاعدة عمل: عضو واحد لا يملك أكثر من اشتراك ACTIVE في نفس الوقت
    // ننفّذ الفحص + الإنشاء ضمن Transaction واحدة لتفادي Race Condition
    return this.prisma.$transaction(async (tx) => {
      await tx.membership.updateMany({
        where: { userId: dto.userId, status: 'ACTIVE' },
        data: { status: 'CANCELLED' },
      });

      return tx.membership.create({
        data: {
          userId: dto.userId,
          planType: dto.planType,
          startDate,
          endDate,
          status: 'ACTIVE',
        },
      });
    });
  }

  async findAll(query: QuerySubscriptionsDto) {
    const { userId, status, planType, page = 1, limit = 20 } = query;

    const where: Prisma.MembershipWhereInput = {
      ...(userId && { userId }),
      ...(status && { status }),
      ...(planType && { planType }),
      // نستبعد اشتراكات الأعضاء المحذوفين منطقياً من النتائج
      user: { deletedAt: null },
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.membership.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, email: true, fullName: true } } },
      }),
      this.prisma.membership.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // يُستخدم من مسار /subscriptions/me الخاص بالعضو نفسه
  async findMine(userId: string) {
    return this.prisma.membership.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const subscription = await this.prisma.membership.findUnique({
      where: { id },
      include: { user: { select: { id: true, email: true, fullName: true } } },
    });

    if (!subscription) {
      throw new NotFoundException('الاشتراك غير موجود');
    }

    return subscription;
  }

  async update(id: string, dto: UpdateSubscriptionDto) {
    await this.findOne(id);

    if (dto.endDate && dto.status === 'CANCELLED') {
      throw new BadRequestException('لا يمكن تمديد تاريخ اشتراك مُلغى في نفس الطلب');
    }

    return this.prisma.membership.update({
      where: { id },
      data: {
        ...(dto.status && { status: dto.status }),
        ...(dto.endDate && { endDate: new Date(dto.endDate) }),
      },
    });
  }

  // يُستدعى من مهمة مجدولة (Cron) لاحقاً لتحديث الاشتراكات المنتهية تلقائياً
  // يُعاد كعدد السجلات المحدَّثة، مفيد للـ Logging
  async expireOutdatedSubscriptions() {
    const result = await this.prisma.membership.updateMany({
      where: { status: 'ACTIVE', endDate: { lt: new Date() } },
      data: { status: 'EXPIRED' },
    });

    return result.count;
  }
}
