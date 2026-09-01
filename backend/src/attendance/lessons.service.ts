import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '@prisma/client';
import { CreateLessonDto, UpdateLessonDto, QueryLessonDto } from './dto/lesson.dto';
import { BranchContext, buildBranchWhere } from '../auth/branch-access';

@Injectable()
export class LessonsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async findAll(query: QueryLessonDto, orgId: string, branchCtx?: BranchContext) {
    const page = Number(query.page) || 1;
    const limit = Math.min(Number(query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const branchFilter = branchCtx ? buildBranchWhere(branchCtx) : {};

    const where: any = {
      group: {
        organizationId: orgId,
        deletedAt: null,
        ...branchFilter,
      },
      groupId: query.groupId,
      deletedAt: null,
      date: {
        gte: query.dateFrom ? new Date(query.dateFrom) : undefined,
        lte: query.dateTo ? new Date(query.dateTo) : undefined,
      },
      title: query.search ? { contains: query.search, mode: 'insensitive' } : undefined,
    };

    const [lessons, total] = await Promise.all([
      this.prisma.lesson.findMany({
        where,
        skip,
        take: limit,
        include: {
          group: {
            select: {
              id: true,
              name: true,
              course: { select: { id: true, name: true } },
              teacher: { select: { id: true, firstName: true, lastName: true } },
              room: { select: { id: true, name: true } },
            },
          },
          homework: true,
          _count: { select: { attendances: true, grades: true } },
        },
        orderBy: { date: 'asc' },
      }),
      this.prisma.lesson.count({ where }),
    ]);

    return {
      items: lessons,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, orgId: string, branchCtx?: BranchContext) {
    const branchFilter = branchCtx ? buildBranchWhere(branchCtx) : {};

    const lesson = await this.prisma.lesson.findFirst({
      where: {
        id,
        group: { organizationId: orgId, deletedAt: null, ...branchFilter },
        deletedAt: null,
      },
      include: {
        group: {
          include: {
            course: true,
            teacher: true,
            room: true,
            enrollments: {
              where: { isActive: true },
              include: { student: true },
            },
          },
        },
        homework: true,
        attendances: {
          include: {
            student: { select: { id: true, firstName: true, lastName: true, phone: true } },
          },
        },
        grades: {
          include: {
            student: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Dars topilmadi yoki ushbu tashkilot/filialga tegishli emas');
    }

    return lesson;
  }

  async create(dto: CreateLessonDto, orgId: string, userId?: string, branchCtx?: BranchContext) {
    const branchFilter = branchCtx ? buildBranchWhere(branchCtx) : {};

    const group = await this.prisma.group.findFirst({
      where: { id: dto.groupId, organizationId: orgId, deletedAt: null, ...branchFilter },
    });

    if (!group) {
      throw new NotFoundException('Guruh topilmadi yoki ushbu tashkilot/filialga tegishli emas');
    }

    if (dto.startTime && dto.endTime && dto.startTime >= dto.endTime) {
      throw new BadRequestException("Dars boshlanish vaqti tugash vaqtidan oldin bo'lishi shart (start < end)");
    }

    const lesson = await this.prisma.lesson.create({
      data: {
        groupId: dto.groupId,
        title: dto.title,
        date: new Date(dto.date),
        homework: dto.homework
          ? {
              create: {
                title: dto.homework,
                description: dto.topic,
              },
            }
          : undefined,
      },
      include: {
        group: { select: { id: true, name: true } },
        homework: true,
      },
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: group.branchId || undefined,
      userId,
      action: AuditAction.CREATE,
      entityType: 'Lesson',
      entityId: lesson.id,
      after: lesson,
    });

    return lesson;
  }

  async update(id: string, dto: UpdateLessonDto, orgId: string, userId?: string, branchCtx?: BranchContext) {
    const lesson = await this.findOne(id, orgId, branchCtx);

    if (dto.startTime && dto.endTime && dto.startTime >= dto.endTime) {
      throw new BadRequestException("Dars boshlanish vaqti tugash vaqtidan oldin bo'lishi shart (start < end)");
    }

    const updated = await this.prisma.lesson.update({
      where: { id },
      data: {
        title: dto.title,
        date: dto.date ? new Date(dto.date) : undefined,
        homework: dto.homework
          ? {
              upsert: {
                create: { title: dto.homework, description: dto.topic },
                update: { title: dto.homework, description: dto.topic },
              },
            }
          : undefined,
      },
      include: {
        homework: true,
      },
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: lesson.group?.branchId || undefined,
      userId,
      action: AuditAction.UPDATE,
      entityType: 'Lesson',
      entityId: id,
      before: lesson,
      after: updated,
    });

    return updated;
  }

  async remove(id: string, orgId: string, userId?: string, branchCtx?: BranchContext) {
    const lesson = await this.findOne(id, orgId, branchCtx);

    const deleted = await this.prisma.lesson.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: lesson.group?.branchId || undefined,
      userId,
      action: AuditAction.DELETE,
      entityType: 'Lesson',
      entityId: id,
      before: lesson,
    });

    return { success: true, message: 'Dars muvaffaqiyatli o\'chirildi', id: deleted.id };
  }
}
