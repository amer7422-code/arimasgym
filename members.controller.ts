import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { MembersService } from './members.service';
import { QueryMembersDto } from './dto/query-members.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

// كل المسارات هنا تتطلب مصادقة + دور ADMIN أو TRAINER
// JwtAuthGuard يتحقق أولاً من التوكن وأن المستخدم الحالي (الطاقم نفسه) غير محذوف منطقياً
// RolesGuard يتحقق بعدها أن دوره ضمن الأدوار المسموحة
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.TRAINER)
@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  // GET /members?search=...&status=ACTIVE&page=1&limit=20
  @Get()
  findAll(@Query() query: QueryMembersDto) {
    return this.membersService.findAll(query);
  }

  // GET /members/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.membersService.findOne(id);
  }

  // PATCH /members/:id — تعديل مقتصر على الطاقم فقط (مفروض عبر @Roles أعلاه)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMemberDto) {
    return this.membersService.update(id, dto);
  }
}
