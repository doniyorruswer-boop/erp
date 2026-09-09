import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditService } from "../../audit/audit.service";
import {
  AuditAction,
  RecurrenceType,
  Schedule,
  ScheduleKind,
  ScheduleStatus,
} from "@prisma/client";
import {
  CreateScheduleDto,
  UpdateScheduleDto,
  QueryScheduleDto,
  CheckConflictDto,
  CancelScheduleDto,
  RescheduleDto,
} from "../dto/schedule.dto";
import { BranchContext, buildBranchWhere, assertBranchAccess } from "../../auth/branch-access";

@Injectable()
export class ScheduleService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService
  ) {}

  async detectConflicts(params: CheckConflictDto & { orgId: string }, branchCtx?: BranchContext) {
    const startAt = new Date(params.startAt);
    const endAt = new Date(params.endAt);
    const excludeWhere = params.excludeScheduleId ? { id: { not: params.excludeScheduleId } } : {};
    const branchWhere = branchCtx ? buildBranchWhere(branchCtx) : {};
    const activeStatusWhere = {
      status: { not: ScheduleStatus.CANCELLED },
    };

    const conflicts: Array<{
      type: "RESOURCE" | "INSTRUCTOR" | "WORKING_HOURS";
      message: string;
      existingSchedule?: Schedule | null;
    }> = [];

    // 1. Check Resource overlap
    if (params.resourceId) {
      const resourceConflict = await this.prisma.schedule.findFirst({
        where: {
          organizationId: params.orgId,
          deletedAt: null,
          resourceId: params.resourceId,
          startAt: { lt: endAt },
          endAt: { gt: startAt },
          ...activeStatusWhere,
          ...excludeWhere,
          ...branchWhere,
        },
        include: {
          resource: { select: { id: true, name: true, type: true } },
          instructor: { select: { id: true, firstName: true, lastName: true } },
          group: { select: { id: true, name: true } },
        },
      });

      if (resourceConflict) {
        conflicts.push({
          type: "RESOURCE",
          message: `Resurs "${resourceConflict.resource?.name}" ushbu vaqt oralig'ida (${resourceConflict.startAt.toLocaleTimeString()} - ${resourceConflict.endAt.toLocaleTimeString()}) band: "${resourceConflict.title}"`,
          existingSchedule: resourceConflict,
        });
      }
    }

    // 2. Check Instructor/Teacher overlap
    if (params.instructorId) {
      const instructorConflict = await this.prisma.schedule.findFirst({
        where: {
          organizationId: params.orgId,
          deletedAt: null,
          instructorId: params.instructorId,
          startAt: { lt: endAt },
          endAt: { gt: startAt },
          ...activeStatusWhere,
          ...excludeWhere,
          ...branchWhere,
        },
        include: {
          instructor: { select: { id: true, firstName: true, lastName: true } },
          resource: { select: { id: true, name: true } },
          group: { select: { id: true, name: true } },
        },
      });

      if (instructorConflict) {
        conflicts.push({
          type: "INSTRUCTOR",
          message: `Mutaxassis "${instructorConflict.instructor?.firstName} ${instructorConflict.instructor?.lastName}" ushbu vaqt oralig'ida band: "${instructorConflict.title}"`,
          existingSchedule: instructorConflict,
        });
      }

      // 3. Check Instructor Working Hours (policy validation)
      const instructor = await this.prisma.user.findFirst({
        where: { id: params.instructorId, organizationId: params.orgId, deletedAt: null },
        select: { id: true, firstName: true, lastName: true, customFields: true },
      });

      if (instructor && instructor.customFields && typeof instructor.customFields === "object") {
        const cf = instructor.customFields as Record<string, unknown>;
        const wh = cf.workingHours as { start?: string; end?: string; days?: number[] } | undefined;
        if (wh && wh.start && wh.end) {
          const dayOfWeek = startAt.getDay();
          if (Array.isArray(wh.days) && wh.days.length > 0 && !wh.days.includes(dayOfWeek)) {
            conflicts.push({
              type: "WORKING_HOURS",
              message: `Mutaxassis "${instructor.firstName} ${instructor.lastName}" ushbu kunda ishlamaydi`,
              existingSchedule: null,
            });
          } else {
            const [sh, sm] = wh.start.split(":").map(Number);
            const [eh, em] = wh.end.split(":").map(Number);
            const startMinutes = startAt.getHours() * 60 + startAt.getMinutes();
            const endMinutes = endAt.getHours() * 60 + endAt.getMinutes();
            const whStartMin = sh * 60 + sm;
            const whEndMin = eh * 60 + em;

            if (startMinutes < whStartMin || endMinutes > whEndMin) {
              conflicts.push({
                type: "WORKING_HOURS",
                message: `Mutaxassis "${instructor.firstName} ${instructor.lastName}" ish vaqtidan tashqarida (${wh.start} - ${wh.end})`,
                existingSchedule: null,
              });
            }
          }
        }
      }
    }

    return {
      hasConflict: conflicts.length > 0,
      conflicts,
    };
  }

  async findAll(params: QueryScheduleDto & { orgId: string }, branchCtx?: BranchContext) {
    const branchWhere = branchCtx
      ? buildBranchWhere(branchCtx, params.branchId)
      : params.branchId
        ? { branchId: params.branchId }
        : {};
    const resourceWhere = params.resourceId ? { resourceId: params.resourceId } : {};
    const instructorWhere = params.instructorId ? { instructorId: params.instructorId } : {};
    const groupWhere = params.groupId ? { groupId: params.groupId } : {};
    const studentWhere = params.studentId ? { studentId: params.studentId } : {};
    const kindWhere = params.kind ? { kind: params.kind } : {};
    const statusWhere = params.status ? { status: params.status } : {};

    const dateWhere: { endAt?: { gte: Date }; startAt?: { lte: Date } } = {};
    if (params.startDate) {
      dateWhere.endAt = { gte: new Date(params.startDate) };
    }
    if (params.endDate) {
      dateWhere.startAt = { lte: new Date(params.endDate) };
    }

    return this.prisma.schedule.findMany({
      where: {
        organizationId: params.orgId,
        deletedAt: null,
        ...branchWhere,
        ...resourceWhere,
        ...instructorWhere,
        ...groupWhere,
        ...studentWhere,
        ...kindWhere,
        ...statusWhere,
        ...dateWhere,
      },
      include: {
        resource: true,
        instructor: {
          select: { id: true, firstName: true, lastName: true, phone: true, role: true },
        },
        group: {
          include: { course: true },
        },
        student: {
          select: { id: true, firstName: true, lastName: true, phone: true },
        },
        branch: {
          select: { id: true, name: true, code: true },
        },
      },
      orderBy: { startAt: "asc" },
    });
  }

  async findOne(id: string, orgId: string, branchCtx?: BranchContext) {
    const branchWhere = branchCtx ? buildBranchWhere(branchCtx) : {};
    const schedule = await this.prisma.schedule.findFirst({
      where: { id, organizationId: orgId, deletedAt: null, ...branchWhere },
      include: {
        resource: true,
        instructor: {
          select: { id: true, firstName: true, lastName: true, phone: true, email: true },
        },
        group: {
          include: {
            course: true,
            enrollments: {
              where: { isActive: true },
              include: { student: true },
            },
          },
        },
        student: true,
        branch: true,
      },
    });
    if (!schedule) throw new NotFoundException("Jadval yozuvi topilmadi");
    return schedule;
  }

  async create(data: CreateScheduleDto, orgId: string, userId?: string, branchCtx?: BranchContext) {
    const startAt = new Date(data.startAt);
    const endAt = new Date(data.endAt);

    if (endAt <= startAt) {
      throw new ConflictException("Tugash vaqti boshlanish vaqtidan keyin bo'lishi kerak");
    }

    let resource = null;
    let instructor = null;
    let group = null;
    let student = null;

    // Cross-tenant checks
    if (data.resourceId) {
      resource = await this.prisma.resource.findFirst({
        where: { id: data.resourceId, organizationId: orgId, deletedAt: null },
      });
      if (!resource)
        throw new BadRequestException("Resurs topilmadi yoki ushbu tashkilotga tegishli emas");
    }

    if (data.instructorId) {
      instructor = await this.prisma.user.findFirst({
        where: { id: data.instructorId, organizationId: orgId, deletedAt: null },
      });
      if (!instructor)
        throw new BadRequestException("O'qituvchi topilmadi yoki ushbu tashkilotga tegishli emas");
    }

    if (data.groupId) {
      group = await this.prisma.group.findFirst({
        where: { id: data.groupId, organizationId: orgId, deletedAt: null },
      });
      if (!group)
        throw new BadRequestException("Guruh topilmadi yoki ushbu tashkilotga tegishli emas");
    }

    if (data.studentId) {
      student = await this.prisma.student.findFirst({
        where: { id: data.studentId, organizationId: orgId, deletedAt: null },
      });
      if (!student)
        throw new BadRequestException("O'quvchi topilmadi yoki ushbu tashkilotga tegishli emas");
    }

    // Resolve and assert branch access
    let targetBranchId =
      data.branchId || group?.branchId || resource?.branchId || student?.branchId || undefined;
    if (branchCtx) {
      targetBranchId = assertBranchAccess(branchCtx, targetBranchId);
      data.branchId = targetBranchId;
    }

    // Cross-branch relation protection
    if (resource && resource.branchId && targetBranchId && resource.branchId !== targetBranchId) {
      throw new BadRequestException("Tanlangan resurs jadval filialiga tegishli emas");
    }
    if (group && group.branchId && targetBranchId && group.branchId !== targetBranchId) {
      throw new BadRequestException("Tanlangan guruh jadval filialiga tegishli emas");
    }
    if (student && student.branchId && targetBranchId && student.branchId !== targetBranchId) {
      throw new BadRequestException("Tanlangan o'quvchi jadval filialiga tegishli emas");
    }

    // Conflict Check
    if (!data.force) {
      const conflictCheck = await this.detectConflicts(
        {
          startAt: data.startAt,
          endAt: data.endAt,
          resourceId: data.resourceId,
          instructorId: data.instructorId,
          orgId,
        },
        branchCtx
      );

      if (conflictCheck.hasConflict) {
        const errorMessages = conflictCheck.conflicts.map((c) => c.message).join(" | ");
        throw new ConflictException({
          message: `Jadvalda to'qnashuv (Conflict) aniqlandi: ${errorMessages}`,
          conflicts: conflictCheck.conflicts,
        });
      }
    }

    const resolvedKind =
      data.kind ||
      (data.groupId
        ? ScheduleKind.GROUP_CLASS
        : data.studentId
          ? ScheduleKind.APPOINTMENT
          : ScheduleKind.GROUP_CLASS);
    const resolvedStatus = data.status || ScheduleStatus.SCHEDULED;

    const schedule = await this.prisma.schedule.create({
      data: {
        organizationId: orgId,
        branchId: data.branchId || null,
        title: data.title,
        description: data.description || null,
        startAt,
        endAt,
        resourceId: data.resourceId || null,
        instructorId: data.instructorId || null,
        groupId: data.groupId || null,
        studentId: data.studentId || null,
        recurrence: data.recurrence || RecurrenceType.NONE,
        recurrenceRule: data.recurrenceRule
          ? JSON.parse(JSON.stringify(data.recurrenceRule))
          : undefined,
        kind: resolvedKind,
        status: resolvedStatus,
        cancelReason: data.cancelReason || null,
        customFields: data.customFields ? JSON.parse(JSON.stringify(data.customFields)) : undefined,
      },
      include: {
        resource: true,
        instructor: { select: { id: true, firstName: true, lastName: true } },
        group: true,
        student: true,
      },
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: data.branchId,
      userId,
      action: AuditAction.CREATE,
      entityType: "Schedule",
      entityId: schedule.id,
      after: schedule,
    });

    return schedule;
  }

  async update(
    id: string,
    data: UpdateScheduleDto,
    orgId: string,
    userId?: string,
    branchCtx?: BranchContext
  ) {
    const branchWhere = branchCtx ? buildBranchWhere(branchCtx) : {};
    const existing = await this.prisma.schedule.findFirst({
      where: { id, organizationId: orgId, deletedAt: null, ...branchWhere },
    });
    if (!existing)
      throw new NotFoundException("Jadval topilmadi yoki ushbu filialga kirish huquqi yo'q");

    if (data.branchId && branchCtx) {
      assertBranchAccess(branchCtx, data.branchId);
    }

    const startAt = data.startAt ? new Date(data.startAt) : existing.startAt;
    const endAt = data.endAt ? new Date(data.endAt) : existing.endAt;

    if (endAt <= startAt) {
      throw new ConflictException("Tugash vaqti boshlanish vaqtidan keyin bo'lishi kerak");
    }

    if (!data.force) {
      const conflictCheck = await this.detectConflicts(
        {
          startAt: startAt.toISOString(),
          endAt: endAt.toISOString(),
          resourceId:
            data.resourceId !== undefined ? data.resourceId : existing.resourceId || undefined,
          instructorId:
            data.instructorId !== undefined
              ? data.instructorId
              : existing.instructorId || undefined,
          excludeScheduleId: id,
          orgId,
        },
        branchCtx
      );

      if (conflictCheck.hasConflict) {
        const errorMessages = conflictCheck.conflicts.map((c) => c.message).join(" | ");
        throw new ConflictException({
          message: `Jadvalda to'qnashuv aniqlandi: ${errorMessages}`,
          conflicts: conflictCheck.conflicts,
        });
      }
    }

    const updated = await this.prisma.schedule.update({
      where: { id },
      data: {
        ...data,
        startAt,
        endAt,
        recurrenceRule: data.recurrenceRule
          ? JSON.parse(JSON.stringify(data.recurrenceRule))
          : undefined,
        customFields: data.customFields ? JSON.parse(JSON.stringify(data.customFields)) : undefined,
      },
      include: {
        resource: true,
        instructor: { select: { id: true, firstName: true, lastName: true } },
        group: true,
      },
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: existing.branchId || undefined,
      userId,
      action: AuditAction.UPDATE,
      entityType: "Schedule",
      entityId: id,
      before: existing,
      after: updated,
    });

    return updated;
  }

  async remove(id: string, orgId: string, userId?: string, branchCtx?: BranchContext) {
    const branchWhere = branchCtx ? buildBranchWhere(branchCtx) : {};
    const existing = await this.prisma.schedule.findFirst({
      where: { id, organizationId: orgId, deletedAt: null, ...branchWhere },
    });
    if (!existing)
      throw new NotFoundException("Jadval topilmadi yoki ushbu filialga kirish huquqi yo'q");

    const deleted = await this.prisma.schedule.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: existing.branchId || undefined,
      userId,
      action: AuditAction.DELETE,
      entityType: "Schedule",
      entityId: id,
      before: existing,
      after: deleted,
    });

    return deleted;
  }

  async restore(id: string, orgId: string, userId?: string, branchCtx?: BranchContext) {
    const branchWhere = branchCtx ? buildBranchWhere(branchCtx) : {};
    const existing = await this.prisma.schedule.findFirst({
      where: { id, organizationId: orgId, ...branchWhere },
    });
    if (!existing)
      throw new NotFoundException("Jadval topilmadi yoki ushbu filialga kirish huquqi yo'q");

    const restored = await this.prisma.schedule.update({
      where: { id },
      data: { deletedAt: null },
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: existing.branchId || undefined,
      userId,
      action: AuditAction.RESTORE,
      entityType: "Schedule",
      entityId: id,
      before: existing,
      after: restored,
    });

    return restored;
  }

  async cancel(
    id: string,
    dto: CancelScheduleDto,
    orgId: string,
    userId?: string,
    branchCtx?: BranchContext
  ) {
    const branchWhere = branchCtx ? buildBranchWhere(branchCtx) : {};
    const existing = await this.prisma.schedule.findFirst({
      where: { id, organizationId: orgId, deletedAt: null, ...branchWhere },
    });
    if (!existing)
      throw new NotFoundException("Jadval topilmadi yoki ushbu filialga kirish huquqi yo'q");
    if (existing.status === ScheduleStatus.CANCELLED) {
      throw new BadRequestException("Ushbu jadval allaqachon bekor qilingan");
    }

    const cancelled = await this.prisma.schedule.update({
      where: { id },
      data: { status: ScheduleStatus.CANCELLED, cancelReason: dto.cancelReason },
      include: {
        resource: true,
        instructor: { select: { id: true, firstName: true, lastName: true } },
        group: true,
        student: true,
      },
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: existing.branchId || undefined,
      userId,
      action: AuditAction.UPDATE,
      entityType: "Schedule",
      entityId: id,
      before: existing,
      after: cancelled,
    });
    return cancelled;
  }

  async reschedule(
    id: string,
    dto: RescheduleDto,
    orgId: string,
    userId?: string,
    branchCtx?: BranchContext
  ) {
    const branchWhere = branchCtx ? buildBranchWhere(branchCtx) : {};
    const existing = await this.prisma.schedule.findFirst({
      where: { id, organizationId: orgId, deletedAt: null, ...branchWhere },
    });
    if (!existing)
      throw new NotFoundException("Jadval topilmadi yoki ushbu filialga kirish huquqi yo'q");

    const startAt = new Date(dto.startAt);
    const endAt = new Date(dto.endAt);
    if (endAt <= startAt)
      throw new BadRequestException("Tugash vaqti boshlanish vaqtidan keyin bo'lishi kerak");

    if (!dto.force) {
      const conflictCheck = await this.detectConflicts(
        {
          startAt: startAt.toISOString(),
          endAt: endAt.toISOString(),
          resourceId: existing.resourceId || undefined,
          instructorId: existing.instructorId || undefined,
          excludeScheduleId: id,
          orgId,
        },
        branchCtx
      );

      if (conflictCheck.hasConflict) {
        const errorMsgs = conflictCheck.conflicts.map((c) => c.message).join(" | ");
        throw new ConflictException({
          message: `Qayta rejalashtirishda to'qnashuv: ${errorMsgs}`,
          conflicts: conflictCheck.conflicts,
        });
      }
    }

    const rescheduled = await this.prisma.schedule.update({
      where: { id },
      data: { startAt, endAt, status: ScheduleStatus.SCHEDULED, cancelReason: null },
      include: {
        resource: true,
        instructor: { select: { id: true, firstName: true, lastName: true } },
        group: true,
        student: true,
      },
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: existing.branchId || undefined,
      userId,
      action: AuditAction.UPDATE,
      entityType: "Schedule",
      entityId: id,
      before: existing,
      after: rescheduled,
    });
    return rescheduled;
  }
}
