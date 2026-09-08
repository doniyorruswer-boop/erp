import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { GroupStatus, LessonDays, AuditAction } from '@prisma/client';
import { BranchContext, buildBranchWhere, assertBranchAccess } from '../auth/branch-access';

@Injectable()
export class GroupsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async findAll(
    query: { courseId?: string; teacherId?: string; branchId?: string; search?: string; orgId: string },
    branchCtx?: BranchContext,
  ) {
    const branchFilter = branchCtx
      ? buildBranchWhere(branchCtx, query.branchId)
      : (query.branchId ? { branchId: query.branchId } : {});

    return this.prisma.group.findMany({
      where: {
        organizationId: query.orgId,
        deletedAt: null,
        courseId: query.courseId,
        teacherId: query.teacherId,
        name: query.search ? { contains: query.search, mode: 'insensitive' } : undefined,
        ...branchFilter,
      },
      include: {
        organization: { select: { id: true, name: true, slug: true, businessType: true } },
        course: true,
        teacher: { select: { id: true, firstName: true, lastName: true, phone: true } },
        room: true,
        enrollments: {
          where: { isActive: true },
          include: {
            student: {
              select: { id: true, firstName: true, lastName: true, phone: true, balance: true, status: true },
            },
          },
        },
        _count: {
          select: { enrollments: true, lessons: true, exams: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, orgId: string, branchCtx?: BranchContext) {
    const branchFilter = branchCtx ? buildBranchWhere(branchCtx) : {};
    const group = await this.prisma.group.findFirst({
      where: { id, organizationId: orgId, deletedAt: null, ...branchFilter },
      include: {
        organization: true,
        course: true,
        teacher: { select: { id: true, firstName: true, lastName: true, phone: true } },
        room: true,
        lessons: {
          where: { deletedAt: null },
          orderBy: { date: 'desc' },
          take: 10,
        },
        exams: {
          where: { deletedAt: null },
          orderBy: { date: 'desc' },
        },
        enrollments: {
          where: { isActive: true },
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
                balance: true,
                status: true,
              },
            },
          },
        },
        _count: {
          select: { enrollments: true, lessons: true, exams: true },
        },
      },
    });
    if (!group) throw new NotFoundException('Guruh topilmadi yoki ushbu filialga kirish huquqi yo\'q');
    return group;
  }

  async create(data: {
    name: string;
    courseId: string;
    branchId?: string;
    teacherId?: string;
    roomId?: string;
    days?: LessonDays;
    startTime: string;
    endTime: string;
    startDate?: string;
    endDate?: string;
  }, orgId: string, userId?: string, branchCtx?: BranchContext) {
    let targetBranchId = data.branchId;
    if (branchCtx) {
      targetBranchId = assertBranchAccess(branchCtx, data.branchId);
      data.branchId = targetBranchId;
    }

    // Cross-tenant verification: Course must belong to orgId
    const course = await this.prisma.course.findFirst({
      where: { id: data.courseId, organizationId: orgId, deletedAt: null },
    });
    if (!course) throw new BadRequestException('Kurs topilmadi yoki ushbu tashkilotga tegishli emas');

    // Cross-tenant verification: Branch must belong to orgId
    if (data.branchId) {
      const branch = await this.prisma.branch.findFirst({
        where: { id: data.branchId, organizationId: orgId, deletedAt: null },
      });
      if (!branch) throw new BadRequestException('Filial topilmadi yoki ushbu tashkilotga tegishli emas');
    }

    // Cross-tenant verification: Teacher must belong to orgId
    if (data.teacherId) {
      const teacher = await this.prisma.user.findFirst({
        where: { id: data.teacherId, organizationId: orgId, deletedAt: null },
      });
      if (!teacher) throw new BadRequestException('O\'qituvchi topilmadi yoki ushbu tashkilotga tegishli emas');
    }

    // Cross-tenant & cross-branch verification: Room must belong to orgId and the same branch
    if (data.roomId) {
      const room = await this.prisma.room.findFirst({
        where: { id: data.roomId, organizationId: orgId, deletedAt: null },
      });
      if (!room) throw new BadRequestException('Xona topilmadi yoki ushbu tashkilotga tegishli emas');
      if (targetBranchId && room.branchId && targetBranchId !== room.branchId) {
        throw new BadRequestException("Tanlangan xona guruhning filialiga tegishli emas");
      }
    }

    const group = await this.prisma.group.create({
      data: {
        name: data.name,
        courseId: data.courseId,
        organizationId: orgId,
        branchId: data.branchId || null,
        teacherId: data.teacherId || null,
        roomId: data.roomId || null,
        days: data.days || LessonDays.ODD_DAYS,
        startTime: data.startTime,
        endTime: data.endTime,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        status: GroupStatus.PLANNING,
      },
      include: {
        course: true,
        teacher: true,
        room: true,
        organization: true,
      },
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: data.branchId,
      userId,
      action: AuditAction.CREATE,
      entityType: 'Group',
      entityId: group.id,
      after: group,
    });

    return group;
  }

  async update(id: string, data: any, orgId: string, userId?: string, branchCtx?: BranchContext) {
    const branchFilter = branchCtx ? buildBranchWhere(branchCtx) : {};
    const group = await this.prisma.group.findFirst({
      where: { id, organizationId: orgId, deletedAt: null, ...branchFilter },
    });
    if (!group) throw new NotFoundException('Guruh topilmadi yoki ushbu filialga kirish huquqi yo\'q');

    let targetBranchId = group.branchId;
    if (data.branchId && branchCtx) {
      targetBranchId = assertBranchAccess(branchCtx, data.branchId);
      data.branchId = targetBranchId;
    }

    // Cross-tenant check if relation IDs changed
    if (data.courseId && data.courseId !== group.courseId) {
      const course = await this.prisma.course.findFirst({
        where: { id: data.courseId, organizationId: orgId, deletedAt: null },
      });
      if (!course) throw new BadRequestException('Kurs topilmadi yoki ushbu tashkilotga tegishli emas');
    }

    if (data.teacherId && data.teacherId !== group.teacherId) {
      const teacher = await this.prisma.user.findFirst({
        where: { id: data.teacherId, organizationId: orgId, deletedAt: null },
      });
      if (!teacher) throw new BadRequestException('O\'qituvchi topilmadi yoki ushbu tashkilotga tegishli emas');
    }

    // Cross-branch check: Room must belong to group's branch
    if (data.roomId) {
      const room = await this.prisma.room.findFirst({
        where: { id: data.roomId, organizationId: orgId, deletedAt: null },
      });
      if (!room) throw new BadRequestException('Xona topilmadi yoki ushbu tashkilotga tegishli emas');
      if (targetBranchId && room.branchId && targetBranchId !== room.branchId) {
        throw new BadRequestException("Tanlangan xona guruhning filialiga tegishli emas");
      }
    }

    const { organizationId: _ignoredOrgId, ...updateFields } = data;

    const updated = await this.prisma.group.update({
      where: { id },
      data: {
        ...updateFields,
        startDate: updateFields.startDate ? new Date(updateFields.startDate) : undefined,
        endDate: updateFields.endDate ? new Date(updateFields.endDate) : undefined,
      },
    });

    // When group transitions to ACTIVE for the first time, auto-generate lessons
    if (updateFields.status === GroupStatus.ACTIVE && group.status !== GroupStatus.ACTIVE) {
      try {
        await this.generateLessonsForGroup(id, orgId, userId, branchCtx);
      } catch (err) {
        // Safe fail: do not interrupt status update
      }
    }

    await this.auditService.log({
      organizationId: orgId,
      branchId: group.branchId || undefined,
      userId,
      action: AuditAction.UPDATE,
      entityType: 'Group',
      entityId: id,
      before: group,
      after: updated,
    });

    return updated;
  }

  async remove(id: string, orgId: string, userId?: string, branchCtx?: BranchContext) {
    const branchFilter = branchCtx ? buildBranchWhere(branchCtx) : {};
    const group = await this.prisma.group.findFirst({
      where: { id, organizationId: orgId, deletedAt: null, ...branchFilter },
    });
    if (!group) throw new NotFoundException('Guruh topilmadi yoki ushbu filialga kirish huquqi yo\'q');

    const deleted = await this.prisma.group.update({
      where: { id },
      data: { deletedAt: new Date(), status: GroupStatus.COMPLETED },
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: group.branchId || undefined,
      userId,
      action: AuditAction.DELETE,
      entityType: 'Group',
      entityId: id,
      before: group,
      after: deleted,
    });

    return deleted;
  }

  async restore(id: string, orgId: string, userId?: string, branchCtx?: BranchContext) {
    const branchFilter = branchCtx ? buildBranchWhere(branchCtx) : {};
    const group = await this.prisma.group.findFirst({ where: { id, organizationId: orgId, ...branchFilter } });
    if (!group) throw new NotFoundException('Guruh topilmadi yoki ushbu filialga kirish huquqi yo\'q');

    const restored = await this.prisma.group.update({
      where: { id },
      data: { deletedAt: null, status: GroupStatus.PLANNING },
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: group.branchId || undefined,
      userId,
      action: AuditAction.RESTORE,
      entityType: 'Group',
      entityId: id,
      before: group,
      after: restored,
    });

    return restored;
  }

  async addStudent(groupId: string, studentId: string, orgId: string, userId?: string, reason?: string, branchCtx?: BranchContext) {
    const branchFilter = branchCtx ? buildBranchWhere(branchCtx) : {};
    const group = await this.prisma.group.findFirst({
      where: { id: groupId, organizationId: orgId, deletedAt: null, ...branchFilter },
    });
    if (!group) throw new NotFoundException('Guruh topilmadi yoki ushbu filialga kirish huquqi yo\'q');

    // Cross-tenant verification: verify student belongs to orgId
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, organizationId: orgId, deletedAt: null },
    });
    if (!student) throw new NotFoundException('O\'quvchi topilmadi yoki ushbu tashkilotga tegishli emas');

    // Cross-branch relation protection: Group and Student must belong to the same branch
    if (group.branchId && student.branchId && group.branchId !== student.branchId) {
      throw new BadRequestException("O'quvchi boshqa filialga tegishli. Guruh va o'quvchi bir xil filialga tegishli bo'lishi shart");
    }

    // Capacity validation: if room has limited capacity, verify active enrollments
    if (group.roomId) {
      const room = await this.prisma.room.findUnique({ where: { id: group.roomId } });
      if (room && room.capacity > 0) {
        const currentActiveCount = await this.prisma.groupEnrollment.count({
          where: { groupId, isActive: true, studentId: { not: studentId } },
        });
        if (currentActiveCount >= room.capacity) {
          throw new BadRequestException(`Guruh xonasi sig'imi (${room.capacity} nafar) to'lgan. Yangi o'quvchi qo'shib bo'lmaydi`);
        }
      }
    }

    const enrollment = await this.prisma.groupEnrollment.upsert({
      where: {
        groupId_studentId: {
          groupId,
          studentId,
        },
      },
      update: { isActive: true },
      create: {
        groupId,
        studentId,
      },
      include: {
        student: true,
      },
    });

    // Record Enrollment History
    await this.prisma.enrollmentHistory.create({
      data: {
        studentId,
        groupId,
        action: 'ENROLLED',
        reason: reason || 'Guruhga qabul qilindi',
      },
    });

    return enrollment;
  }

  async removeStudent(groupId: string, studentId: string, orgId: string, userId?: string, reason?: string, branchCtx?: BranchContext) {
    const branchFilter = branchCtx ? buildBranchWhere(branchCtx) : {};
    const group = await this.prisma.group.findFirst({
      where: { id: groupId, organizationId: orgId, deletedAt: null, ...branchFilter },
    });
    if (!group) throw new NotFoundException('Guruh topilmadi yoki ushbu filialga kirish huquqi yo\'q');

    // Cross-tenant verification: verify student belongs to orgId
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, organizationId: orgId, deletedAt: null },
    });
    if (!student) throw new NotFoundException('O\'quvchi topilmadi yoki ushbu tashkilotga tegishli emas');

    const deleted = await this.prisma.groupEnrollment.delete({
      where: {
        groupId_studentId: {
          groupId,
          studentId,
        },
      },
    });

    // Record Enrollment History
    await this.prisma.enrollmentHistory.create({
      data: {
        studentId,
        groupId,
        action: 'DROPPED',
        reason: reason || 'Guruhdan chiqarildi',
      },
    });

    return deleted;
  }

  async getEnrollmentHistory(query: { studentId?: string; groupId?: string; orgId: string }) {
    return this.prisma.enrollmentHistory.findMany({
      where: {
        studentId: query.studentId,
        groupId: query.groupId,
        student: { organizationId: query.orgId },
      },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, phone: true } },
        group: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
    });
  }

  async transferStudent(
    sourceGroupId: string,
    targetGroupId: string,
    studentId: string,
    orgId: string,
    reason?: string,
    userId?: string,
    branchCtx?: BranchContext,
  ) {
    const branchFilter = branchCtx ? buildBranchWhere(branchCtx) : {};
    const sourceGroup = await this.prisma.group.findFirst({
      where: { id: sourceGroupId, organizationId: orgId, deletedAt: null, ...branchFilter },
    });
    if (!sourceGroup) throw new NotFoundException('Manba guruhi topilmadi yoki ushbu filialga kirish huquqi yo\'q');

    const targetGroup = await this.prisma.group.findFirst({
      where: { id: targetGroupId, organizationId: orgId, deletedAt: null, ...branchFilter },
    });
    if (!targetGroup) throw new NotFoundException('Maqsad guruhi topilmadi yoki ushbu filialga kirish huquqi yo\'q');

    const student = await this.prisma.student.findFirst({
      where: { id: studentId, organizationId: orgId, deletedAt: null },
    });
    if (!student) throw new NotFoundException('O\'quvchi topilmadi yoki ushbu tashkilotga tegishli emas');

    // Cross-branch relation protection: Target group and Student must belong to the same branch
    if (targetGroup.branchId && student.branchId && targetGroup.branchId !== student.branchId) {
      throw new BadRequestException("Maqsad guruhi boshqa filialga tegishli. O'quvchini boshqa filialdagi guruhga ko'chirish taqiqlanadi");
    }

    // Capacity validation on target group
    if (targetGroup.roomId) {
      const room = await this.prisma.room.findUnique({ where: { id: targetGroup.roomId } });
      if (room && room.capacity > 0) {
        const currentActiveCount = await this.prisma.groupEnrollment.count({
          where: { groupId: targetGroupId, isActive: true, studentId: { not: studentId } },
        });
        if (currentActiveCount >= room.capacity) {
          throw new BadRequestException(`Maqsad guruhi xonasi sig'imi (${room.capacity} nafar) to'lgan. O'quvchini ko'chirib bo'lmaydi`);
        }
      }
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Remove/deactivate from source group
      await tx.groupEnrollment.deleteMany({
        where: { groupId: sourceGroupId, studentId },
      });

      // 2. Add to target group
      const newEnrollment = await tx.groupEnrollment.upsert({
        where: {
          groupId_studentId: {
            groupId: targetGroupId,
            studentId,
          },
        },
        update: { isActive: true },
        create: {
          groupId: targetGroupId,
          studentId,
        },
        include: { student: true },
      });

      // 3. Record EnrollmentHistory for both source and target
      await tx.enrollmentHistory.create({
        data: {
          studentId,
          groupId: sourceGroupId,
          action: 'TRANSFERRED',
          reason: reason || `${targetGroup.name}ga ko'chirildi`,
        },
      });

      await tx.enrollmentHistory.create({
        data: {
          studentId,
          groupId: targetGroupId,
          action: 'TRANSFERRED',
          reason: reason || `${sourceGroup.name}dan ko'chirib kelindi`,
        },
      });

      return newEnrollment;
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: targetGroup.branchId || undefined,
      userId,
      action: AuditAction.UPDATE,
      entityType: 'GroupEnrollment',
      entityId: `${studentId}_${targetGroupId}`,
      after: { sourceGroupId, targetGroupId, studentId, reason },
    });

    return result;
  }

  async getTeacherWorkload(teacherId: string | undefined, orgId: string) {
    const teachers = await this.prisma.user.findMany({
      where: {
        organizationId: orgId,
        id: teacherId || undefined,
        ...(teacherId ? {} : { OR: [{ role: 'TEACHER' }, { taughtGroups: { some: { deletedAt: null } } }] }),
        deletedAt: null,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
        taughtGroups: {
          where: { deletedAt: null, organizationId: orgId },
          include: {
            course: true,
            room: true,
            _count: { select: { enrollments: true } },
          },
        },
      },
    });

    return teachers.map((teacher) => {
      const activeGroups = teacher.taughtGroups;
      const totalStudents = activeGroups.reduce((acc, g) => acc + g._count.enrollments, 0);
      const totalWeeklyLessons = activeGroups.length * 3; // Approx 3 lessons/week
      const totalWeeklyHours = totalWeeklyLessons * 1.5; // Approx 1.5 hours/lesson

      return {
        teacher: {
          id: teacher.id,
          fullName: `${teacher.firstName} ${teacher.lastName}`,
          phone: teacher.phone,
          email: teacher.email,
        },
        workload: {
          activeGroupsCount: activeGroups.length,
          totalActiveStudents: totalStudents,
          estimatedWeeklyLessons: totalWeeklyLessons,
          estimatedWeeklyHours: totalWeeklyHours,
        },
        groups: activeGroups.map((g) => ({
          id: g.id,
          name: g.name,
          courseName: g.course.name,
          roomName: g.room?.name || 'Xona belgilanmagan',
          studentsCount: g._count.enrollments,
          days: g.days,
          time: `${g.startTime} - ${g.endTime}`,
        })),
      };
    });
  }

  async generateLessonsForGroup(
    groupId: string,
    orgId: string,
    userId?: string,
    branchCtx?: BranchContext,
    options?: { startDate?: string; endDate?: string; count?: number },
  ) {
    const branchFilter = branchCtx ? buildBranchWhere(branchCtx) : {};
    const group = await this.prisma.group.findFirst({
      where: { id: groupId, organizationId: orgId, deletedAt: null, ...branchFilter },
      include: {
        course: true,
        room: true,
        lessons: {
          where: { deletedAt: null },
          select: { id: true, date: true, title: true },
          orderBy: { date: 'asc' },
        },
      },
    });

    if (!group) {
      throw new NotFoundException("Guruh topilmadi yoki ushbu filialga kirish huquqi yo'q");
    }

    // Determine target days of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    let targetDays: number[] = [];
    switch (group.days) {
      case LessonDays.ODD_DAYS:
        // Dushanba, Chorshanba, Juma
        targetDays = [1, 3, 5];
        break;
      case LessonDays.EVEN_DAYS:
        // Seshanba, Payshanba, Shanba
        targetDays = [2, 4, 6];
        break;
      case LessonDays.EVERYDAY:
        // Dushanba - Shanba
        targetDays = [1, 2, 3, 4, 5, 6];
        break;
      case LessonDays.WEEKEND:
        // Shanba, Yakshanba
        targetDays = [6, 0];
        break;
      case LessonDays.CUSTOM:
      default:
        targetDays = [1, 3, 5];
        break;
    }

    // Helper for timezone-independent date parsing
    const parseDateOnly = (val: string | Date): Date => {
      if (typeof val === 'string') {
        const match = val.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (match) {
          return new Date(parseInt(match[1], 10), parseInt(match[2], 10) - 1, parseInt(match[3], 10), 0, 0, 0, 0);
        }
        return new Date(val);
      }
      if (val instanceof Date) {
        const iso = val.toISOString();
        const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (match) {
          return new Date(parseInt(match[1], 10), parseInt(match[2], 10) - 1, parseInt(match[3], 10), 0, 0, 0, 0);
        }
        return new Date(val.getFullYear(), val.getMonth(), val.getDate(), 0, 0, 0, 0);
      }
      return new Date();
    };

    // Start date resolution
    const rawStartDate = options?.startDate || group.startDate || group.createdAt || new Date();
    const startDate = parseDateOnly(rawStartDate);
    startDate.setHours(0, 0, 0, 0);

    // End date resolution
    const rawEndDate = options?.endDate || group.endDate;
    let endDate: Date | null = null;
    if (rawEndDate) {
      endDate = parseDateOnly(rawEndDate);
      endDate.setHours(23, 59, 59, 999);
    }

    // Maximum lesson count (if endDate is not provided)
    const targetLessonCount = options?.count && options.count > 0
      ? options.count
      : (group.course?.lessonCount && group.course.lessonCount > 0
          ? group.course.lessonCount
          : (group.course?.duration && group.course.duration > 0 ? group.course.duration * 12 : 12));

    // Parse start time (HH:mm)
    let startHours = 9;
    let startMinutes = 0;
    if (group.startTime) {
      const parts = group.startTime.split(':');
      if (parts.length >= 2) {
        startHours = parseInt(parts[0], 10) || 0;
        startMinutes = parseInt(parts[1], 10) || 0;
      }
    }

    // Existing lessons for idempotency check (keyed by YYYY-MM-DD)
    const existingDateKeys = new Set(
      group.lessons.map((l) => {
        const d = new Date(l.date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      }),
    );

    const candidateDates: Date[] = [];
    const currentDate = new Date(startDate);
    let dayCount = 0;
    const maxDays = 366; // Prevent infinite loop safety ceiling

    while (dayCount < maxDays) {
      if (endDate && currentDate > endDate) {
        break;
      }
      if (!endDate && (candidateDates.length + group.lessons.length) >= targetLessonCount) {
        break;
      }

      const dayOfWeek = currentDate.getDay();
      if (targetDays.includes(dayOfWeek)) {
        const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
        
        // Idempotent: only add if no lesson exists for this day
        if (!existingDateKeys.has(dateKey)) {
          const lessonDate = new Date(currentDate);
          lessonDate.setHours(startHours, startMinutes, 0, 0);
          candidateDates.push(lessonDate);
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
      dayCount++;
    }

    if (candidateDates.length === 0) {
      return {
        message: 'Yangi generatsiya qilinadigan darslar mavjud emas (barcha darslar allaqachon yaratilgan)',
        createdCount: 0,
        totalLessons: group.lessons.length,
        lessons: [],
      };
    }

    let lessonNum = group.lessons.length + 1;
    const lessonsData = candidateDates.map((date) => ({
      groupId: group.id,
      title: `${lessonNum++}-dars`,
      date,
      resourceId: group.roomId || null,
    }));

    const createdLessons = await this.prisma.$transaction(
      lessonsData.map((data) =>
        this.prisma.lesson.create({
          data,
          include: {
            group: { select: { id: true, name: true } },
          },
        }),
      ),
    );

    await this.auditService.log({
      organizationId: orgId,
      branchId: group.branchId || undefined,
      userId,
      action: AuditAction.CREATE,
      entityType: 'Lesson',
      entityId: group.id,
      after: {
        groupId: group.id,
        createdCount: createdLessons.length,
        totalLessons: group.lessons.length + createdLessons.length,
      },
    });

    return {
      message: `${createdLessons.length} ta dars muvaffaqiyatli generatsiya qilindi`,
      createdCount: createdLessons.length,
      totalLessons: group.lessons.length + createdLessons.length,
      lessons: createdLessons,
    };
  }
}

