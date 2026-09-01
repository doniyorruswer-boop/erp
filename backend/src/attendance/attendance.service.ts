import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { AttendanceStatus, AuditAction } from '@prisma/client';
import { BranchContext, buildBranchWhere } from '../auth/branch-access';
import { MarkAttendanceDto, SingleAttendanceDto, QueryStudentAttendanceDto } from './dto/attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async getGroupAttendance(groupId: string, dateStr: string, orgId: string, branchCtx?: BranchContext) {
    const branchWhere = branchCtx ? buildBranchWhere(branchCtx) : {};
    const date = new Date(dateStr);
    date.setUTCHours(0, 0, 0, 0);

    const group = await this.prisma.group.findFirst({
      where: { id: groupId, organizationId: orgId, deletedAt: null, ...branchWhere },
      include: {
        enrollments: {
          where: { isActive: true },
          include: { student: true },
        },
      },
    });
    if (!group) throw new NotFoundException('Guruh topilmadi yoki ushbu filialga kirish huquqi yo\'q');

    const attendances = await this.prisma.attendance.findMany({
      where: {
        groupId,
        date,
      },
    });

    const attendanceMap = new Map();
    attendances.forEach((att) => {
      attendanceMap.set(att.studentId, att);
    });

    const list = group.enrollments.map((enrollment) => {
      const existing = attendanceMap.get(enrollment.studentId);
      return {
        student: enrollment.student,
        status: existing ? existing.status : AttendanceStatus.PRESENT,
        comment: existing ? existing.comment : null,
      };
    });

    return {
      group,
      date: dateStr,
      students: list || [],
    };
  }

  async getMonthlyAttendance(groupId: string, monthStr: string, orgId: string, branchCtx?: BranchContext) {
    const [year, month] = monthStr.split('-').map(Number);
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
    const branchWhere = branchCtx ? buildBranchWhere(branchCtx) : {};

    const group = await this.prisma.group.findFirst({
      where: { id: groupId, organizationId: orgId, deletedAt: null, ...branchWhere },
      include: {
        enrollments: {
          where: { isActive: true },
          include: { student: true },
        },
      },
    });
    if (!group) throw new NotFoundException('Guruh topilmadi yoki ushbu filialga kirish huquqi yo\'q');

    const attendances = await this.prisma.attendance.findMany({
      where: {
        groupId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const matrix: Record<string, Record<number, { status: string; comment?: string }>> = {};

    attendances.forEach((att) => {
      const day = new Date(att.date).getUTCDate();
      if (!matrix[att.studentId]) {
        matrix[att.studentId] = {};
      }
      matrix[att.studentId][day] = {
        status: att.status,
        comment: att.comment || undefined,
      };
    });

    const students = group.enrollments.map((e) => ({
      student: e.student,
      days: matrix[e.studentId] || {},
    }));

    return {
      groupId,
      month: monthStr,
      students,
    };
  }

  async markAttendance(data: MarkAttendanceDto, orgId: string, userId?: string, branchCtx?: BranchContext) {
    const branchWhere = branchCtx ? buildBranchWhere(branchCtx) : {};
    const group = await this.prisma.group.findFirst({
      where: { id: data.groupId, organizationId: orgId, deletedAt: null, ...branchWhere },
    });
    if (!group) throw new NotFoundException('Guruh topilmadi yoki ushbu filialga kirish huquqi yo\'q');

    const targetDate = new Date(data.date);
    targetDate.setUTCHours(0, 0, 0, 0);

    // Verify lesson belongs to group and org if provided
    if (data.lessonId) {
      const lesson = await this.prisma.lesson.findFirst({
        where: { id: data.lessonId, groupId: data.groupId, group: { organizationId: orgId }, deletedAt: null },
      });
      if (!lesson) {
        throw new BadRequestException('Dars topilmadi yoki ushbu guruhga tegishli emas');
      }
    }

    // Verify all students belong to org
    const studentIds = data.records.map(r => r.studentId);
    const validStudents = await this.prisma.student.findMany({
      where: { id: { in: studentIds }, organizationId: orgId, deletedAt: null },
      select: { id: true },
    });
    if (validStudents.length !== studentIds.length) {
      throw new BadRequestException('Ayrim o\'quvchilar ushbu tashkilotga tegishli emas');
    }

    const operations = data.records.map((rec) =>
      this.prisma.attendance.upsert({
        where: {
          groupId_studentId_date: {
            groupId: data.groupId,
            studentId: rec.studentId,
            date: targetDate,
          },
        },
        update: {
          lessonId: data.lessonId || null,
          status: rec.status,
          comment: rec.comment,
        },
        create: {
          groupId: data.groupId,
          studentId: rec.studentId,
          lessonId: data.lessonId || null,
          date: targetDate,
          status: rec.status,
          comment: rec.comment,
        },
      }),
    );

    const results = await this.prisma.$transaction(operations);

    await this.auditService.log({
      organizationId: orgId,
      branchId: group.branchId || undefined,
      userId,
      action: AuditAction.UPDATE,
      entityType: 'AttendanceBatch',
      entityId: `${data.groupId}_${data.date}`,
      after: { count: results.length, date: data.date },
    });

    return { success: true, count: results.length, records: results };
  }

  async markSingleAttendance(data: SingleAttendanceDto, orgId: string, userId?: string, branchCtx?: BranchContext) {
    const branchWhere = branchCtx ? buildBranchWhere(branchCtx) : {};
    const group = await this.prisma.group.findFirst({
      where: { id: data.groupId, organizationId: orgId, deletedAt: null, ...branchWhere },
    });
    if (!group) throw new NotFoundException('Guruh topilmadi');

    const student = await this.prisma.student.findFirst({
      where: { id: data.studentId, organizationId: orgId, deletedAt: null },
    });
    if (!student) {
      throw new BadRequestException('O\'quvchi topilmadi yoki ushbu tashkilotga tegishli emas');
    }

    if (data.lessonId) {
      const lesson = await this.prisma.lesson.findFirst({
        where: { id: data.lessonId, groupId: data.groupId, group: { organizationId: orgId }, deletedAt: null },
      });
      if (!lesson) {
        throw new BadRequestException('Dars topilmadi yoki ushbu guruhga tegishli emas');
      }
    }

    const targetDate = new Date(data.date);
    targetDate.setUTCHours(0, 0, 0, 0);

    const record = await this.prisma.attendance.upsert({
      where: {
        groupId_studentId_date: {
          groupId: data.groupId,
          studentId: data.studentId,
          date: targetDate,
        },
      },
      update: {
        lessonId: data.lessonId || null,
        status: data.status,
        comment: data.comment,
      },
      create: {
        groupId: data.groupId,
        studentId: data.studentId,
        lessonId: data.lessonId || null,
        date: targetDate,
        status: data.status,
        comment: data.comment,
      },
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: group.branchId || undefined,
      userId,
      action: AuditAction.UPDATE,
      entityType: 'Attendance',
      entityId: record.id,
      after: record,
    });

    return record;
  }

  async getStudentAttendance(studentId: string, query: QueryStudentAttendanceDto, orgId: string) {
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, organizationId: orgId, deletedAt: null },
    });
    if (!student) throw new NotFoundException('O\'quvchi topilmadi');

    const page = Number(query.page) || 1;
    const limit = Math.min(Number(query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const where: any = {
      studentId,
      groupId: query.groupId,
      status: query.status,
      date: {
        gte: query.dateFrom ? new Date(query.dateFrom) : undefined,
        lte: query.dateTo ? new Date(query.dateTo) : undefined,
      },
    };

    const [attendances, total] = await Promise.all([
      this.prisma.attendance.findMany({
        where,
        skip,
        take: limit,
        include: {
          group: { select: { id: true, name: true } },
          lesson: true,
        },
        orderBy: { date: 'desc' },
      }),
      this.prisma.attendance.count({ where }),
    ]);

    return {
      items: attendances,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
