import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { QueryMembersDto } from './dto/query-members.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

@Injectable()
export class MembersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryMembersDto) {
    const { search, status, page = 1, limit = 20 } = query;

    // where: { deletedAt: null } مطبّق دائماً وبشكل إلزامي - لا يمكن تجاوزه من الـ query params
    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      role: 'MEMBER',
      ...(status && { status }),
      ...(search && {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { fullName: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        select: this.publicSelect(),
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const member = await this.prisma.user.findFirst({
      where: { id, role: 'MEMBER', deletedAt: null },
      select: this.publicSelect(),
    });

    if (!member) {
      throw new NotFoundException('العضو غير موجود');
    }

    return member;
  }

  async update(id: string, dto: UpdateMemberDto) {
    // نتأكد أولاً أن العضو موجود وغير محذوف قبل محاولة التعديل
    await this.findOne(id);

    if (dto.email) {
      const emailTaken = await this.prisma.user.findFirst({
        where: { email: dto.email, id: { not: id } },
      });
      if (emailTaken) {
        throw new ConflictException('البريد الإلكتروني مستخدم من قبل حساب آخر');
      }
    }

    // Prisma يتوقع Date لحقل DateTime، بينما الـ DTO يستقبل نص ISO من الواجهة
    const { birthDate, ...rest } = dto;

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        ...rest,
        ...(birthDate && { birthDate: new Date(birthDate) }),
      },
      select: this.publicSelect(),
    });

    return updated;
  }

  // حقل موحّد لضمان عدم تسريب passwordHash في أي استجابة من هذا الـ Service
  private publicSelect() {
    return {
      id: true,
      email: true,
      role: true,
      status: true,
      fullName: true,
      phoneNumber: true,
      birthDate: true,
      gender: true,
      createdAt: true,
      updatedAt: true,
    } satisfies Prisma.UserSelect;
  }
}
