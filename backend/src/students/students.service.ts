import { Injectable, NotFoundException, BadRequestException, ForbiddenException, ConflictException, Logger, Optional } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { WorkflowService } from '../workflow/workflow.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { StudentStatus, AuditAction, AttendanceStatus } from '@prisma/client';
import { BranchContext, buildBranchWhere, assertBranchAccess } from '../auth/branch-access';

@Injectable()
export class StudentsService {
  private readonly logger = new Logger(StudentsService.name);

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    @Optional() private workflowService?: WorkflowService,
    @Optional() private subscriptionsService?: SubscriptionsService,
  ) {}

  async findAll(
    query: { search?: string; status?: StudentStatus; groupId?: string; orgId: string; branchId?: string; page?: number; limit?: number },
    branchCtx?: BranchContext,
  ) {
    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Math.min(Number(query.limit), 100) : 50;
    const skip = (page - 1) * limit;

    const branchFilter = branchCtx
      ? buildBranchWhere(branchCtx, query.branchId)
      : (query.branchId ? { branchId: query.branchId } : {});

    const where: any = {
      organizationId: query.orgId,
      deletedAt: null,
      status: query.status,
      ...branchFilter,
      enrollments: query.groupId ? { some: { groupId: query.groupId, isActive: true } } : undefined,
      OR: query.search
        ? [
            { firstName: { contains: query.search, mode: 'insensitive' } },
            { lastName: { contains: query.search, mode: 'insensitive' } },
            { phone: { contains: query.search } },
          ]
        : undefined,
    };

    const [students, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        skip,
        take: limit,
        include: {
          organization: {
            select: { id: true, name: true, slug: true, businessType: true },
          },
          enrollments: {
            where: { isActive: true },
            include: {
              group: {
                include: { course: true, teacher: true },
              },
            },
          },
          parents: {
            include: { parent: true },
          },
          payments: {
            orderBy: { paymentDate: 'desc' },
            take: 5,
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.student.count({ where }),
    ]);

    return {
      items: students,
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
    const student = await this.prisma.student.findFirst({
      where: { id, organizationId: orgId, deletedAt: null, ...branchFilter },
      include: {
        organization: true,
        parents: {
          include: { parent: true },
        },
        enrollments: {
          include: {
            group: {
              include: { course: true, teacher: true, room: true },
            },
          },
        },
        enrollmentHistories: {
          orderBy: { date: 'desc' },
        },
        payments: {
          orderBy: { paymentDate: 'desc' },
        },
        attendances: {
          orderBy: { date: 'desc' },
          take: 20,
        },
        grades: {
          orderBy: { date: 'desc' },
          include: { exam: true, lesson: true },
        },
      },
    });
    if (!student) throw new NotFoundException("O'quvchi topilmadi yoki ushbu filialga kirish huquqi yo'q");
    return student;
  }

  async create(data: any, orgId: string, userId?: string, branchCtx?: BranchContext) {
    if (this.subscriptionsService) {
      await this.subscriptionsService.checkLimit('MAX_STUDENTS_CUSTOMERS', 1, orgId);
    }

    let targetBranchId = data.branchId;
    if (branchCtx) {
      targetBranchId = assertBranchAccess(branchCtx, data.branchId);
      data.branchId = targetBranchId;
    }

    // Cross-tenant & cross-branch check: if initialGroupId is passed, verify group belongs to this tenant and branch
    if (data.initialGroupId) {
      const group = await this.prisma.group.findFirst({
        where: { id: data.initialGroupId, organizationId: orgId, deletedAt: null },
      });
      if (!group) throw new BadRequestException('Guruh topilmadi yoki ushbu tashkilotga tegishli emas');
      if (targetBranchId && group.branchId && targetBranchId !== group.branchId) {
        throw new BadRequestException("O'quvchining filiali tanlangan guruh filiali bilan mos kelmadi");
      }
    }

    // Check if a student with this phone already exists in this organization
    const existing = await this.prisma.student.findFirst({
      where: {
        phone: data.phone,
        organizationId: orgId,
      },
    });

    if (existing && existing.deletedAt === null) {
      throw new ConflictException('Ushbu telefon raqamli o\'quvchi tashkilotda allaqachon mavjud');
    }

    if (existing && existing.deletedAt !== null) {
      const updated = await this.prisma.student.update({
        where: { id: existing.id },
        data: {
          firstName: data.firstName || existing.firstName,
          lastName: data.lastName || existing.lastName,
          email: data.email || existing.email,
          passportNumber: data.passportNumber || existing.passportNumber,
          pinfl: data.pinfl || existing.pinfl,
          gender: data.gender || existing.gender,
          birthDate: data.birthDate ? new Date(data.birthDate) : existing.birthDate,
          level: data.level || existing.level,
          studyDays: data.studyDays || existing.studyDays,
          studyLanguages: data.studyLanguages || existing.studyLanguages,
          contactTime: data.contactTime || existing.contactTime,
          contractNumber: data.contractNumber || existing.contractNumber,
          region: data.region || existing.region,
          city: data.city || existing.city,
          address: data.address || existing.address,
          workplace: data.workplace || existing.workplace,
          source: data.source || existing.source,
          parentName: data.parentName || existing.parentName,
          parentPhone: data.parentPhone || existing.parentPhone,
          parentEmail: data.parentEmail || existing.parentEmail,
          notes: data.notes || existing.notes,
          status: data.status || StudentStatus.ACTIVE,
          customFields: data.customFields !== undefined ? data.customFields : existing.customFields,
          deletedAt: null,
        },
      });

      if (data.initialGroupId) {
        await this.prisma.groupEnrollment.upsert({
          where: {
            groupId_studentId: {
              groupId: data.initialGroupId,
              studentId: existing.id,
            },
          },
          update: { isActive: true },
          create: {
            groupId: data.initialGroupId,
            studentId: existing.id,
          },
        });

        await this.prisma.enrollmentHistory.create({
          data: {
            studentId: existing.id,
            groupId: data.initialGroupId,
            action: 'ENROLLED',
            reason: 'Tizimga qayta tiklandi va guruhga yozildi',
          },
        });
      }

      await this.auditService.log({
        organizationId: orgId,
        userId,
        action: AuditAction.UPDATE,
        entityType: 'Student',
        entityId: existing.id,
        before: existing,
        after: updated,
      });

      return updated;
    }

    const { initialGroupId, parents, organizationId: _ignoredOrgId, ...studentData } = data;

    const student = await this.prisma.$transaction(async (tx) => {
      const createdStudent = await tx.student.create({
        data: {
          ...studentData,
          organizationId: orgId,
          birthDate: studentData.birthDate ? new Date(studentData.birthDate) : undefined,
          enrolledDate: studentData.enrolledDate ? new Date(studentData.enrolledDate) : undefined,
          status: studentData.status || StudentStatus.ACTIVE,
        },
      });

      if (Array.isArray(parents) && parents.length > 0) {
        for (const parent of parents) {
          if (!parent.phone && !parent.fullName) continue;
          const parentRecord = await tx.parent.upsert({
            where: {
              organizationId_phone: {
                organizationId: orgId,
                phone: parent.phone || `p-${createdStudent.id}`,
              },
            },
            update: { fullName: parent.fullName },
            create: {
              organizationId: orgId,
              fullName: parent.fullName,
              phone: parent.phone || `p-${createdStudent.id}`,
              relationship: parent.relationship || null,
              isPrimary: parent.isPrimary !== undefined ? parent.isPrimary : true,
            },
          });

          await tx.studentParent.upsert({
            where: {
              studentId_parentId: {
                studentId: createdStudent.id,
                parentId: parentRecord.id,
              },
            },
            update: {
              relationship: parent.relationship || null,
              isPrimary: parent.isPrimary !== undefined ? parent.isPrimary : true,
            },
            create: {
              studentId: createdStudent.id,
              parentId: parentRecord.id,
              relationship: parent.relationship || null,
              isPrimary: parent.isPrimary !== undefined ? parent.isPrimary : true,
            },
          });
        }
      } else if (studentData.parentName || studentData.parentPhone) {
        const parentPhone = studentData.parentPhone || `p-${createdStudent.id}`;
        const parentRecord = await tx.parent.upsert({
          where: {
            organizationId_phone: {
              organizationId: orgId,
              phone: parentPhone,
            },
          },
          update: { fullName: studentData.parentName || 'Ota-onasi' },
          create: {
            organizationId: orgId,
            fullName: studentData.parentName || 'Ota-onasi',
            phone: parentPhone,
            isPrimary: true,
          },
        });

        await tx.studentParent.upsert({
          where: {
            studentId_parentId: {
              studentId: createdStudent.id,
              parentId: parentRecord.id,
            },
          },
          update: { isPrimary: true },
          create: {
            studentId: createdStudent.id,
            parentId: parentRecord.id,
            isPrimary: true,
          },
        });
      }

      if (initialGroupId) {
        await tx.groupEnrollment.create({
          data: {
            groupId: initialGroupId,
            studentId: createdStudent.id,
          },
        });

        await tx.enrollmentHistory.create({
          data: {
            studentId: createdStudent.id,
            groupId: initialGroupId,
            action: 'ENROLLED',
            reason: 'Yangi talaba guruhga qabul qilindi',
          },
        });
      }

      return createdStudent;
    });

    await this.auditService.log({
      organizationId: orgId,
      userId,
      action: AuditAction.CREATE,
      entityType: 'Student',
      entityId: student.id,
      after: student,
    });

    if (this.workflowService) {
      try {
        await this.workflowService.processEvent(
          'student.created',
          {
            id: student.id,
            firstName: student.firstName,
            lastName: student.lastName,
            phone: student.phone,
            branchId: student.branchId,
            status: student.status,
          },
          orgId,
        );
      } catch (err: any) {
        this.logger.warn(`Workflow execution failed for student.created: ${err.message}`);
      }
    }

    return student;
  }

  async update(id: string, data: any, orgId: string, userId?: string, branchCtx?: BranchContext) {
    const branchFilter = branchCtx ? buildBranchWhere(branchCtx) : {};
    const existing = await this.prisma.student.findFirst({
      where: { id, organizationId: orgId, deletedAt: null, ...branchFilter },
    });
    if (!existing) throw new NotFoundException("O'quvchi topilmadi yoki ushbu filialga kirish huquqi yo'q");

    let targetBranchId = existing.branchId;
    if (data.branchId && branchCtx) {
      targetBranchId = assertBranchAccess(branchCtx, data.branchId);
      data.branchId = targetBranchId;
    }

    if (data.initialGroupId) {
      const group = await this.prisma.group.findFirst({
        where: { id: data.initialGroupId, organizationId: orgId, deletedAt: null },
      });
      if (!group) throw new BadRequestException('Guruh topilmadi yoki ushbu tashkilotga tegishli emas');
      if (targetBranchId && group.branchId && targetBranchId !== group.branchId) {
        throw new BadRequestException("O'quvchining filiali tanlangan guruh filiali bilan mos kelmadi");
      }
    }

    const { initialGroupId, parents, ...studentData } = data;
    const student = await this.prisma.student.update({
      where: { id },
      data: {
        ...studentData,
        birthDate: studentData.birthDate ? new Date(studentData.birthDate) : undefined,
        enrolledDate: studentData.enrolledDate ? new Date(studentData.enrolledDate) : undefined,
      },
    });

    if (initialGroupId) {
      await this.prisma.groupEnrollment.upsert({
        where: {
          groupId_studentId: {
            groupId: initialGroupId,
            studentId: id,
          },
        },
        update: { isActive: true },
        create: {
          groupId: initialGroupId,
          studentId: id,
        },
      });
    }

    await this.auditService.log({
      organizationId: orgId,
      branchId: existing.branchId || undefined,
      userId,
      action: AuditAction.UPDATE,
      entityType: 'Student',
      entityId: id,
      before: existing,
      after: student,
    });

    return student;
  }

  async freeze(id: string, reason: string | undefined, returnDate: string | undefined, userId: string | undefined, orgId: string, branchCtx?: BranchContext) {
    const branchFilter = branchCtx ? buildBranchWhere(branchCtx) : {};
    const student = await this.prisma.student.findFirst({
      where: { id, organizationId: orgId, deletedAt: null, ...branchFilter },
      include: { enrollments: true },
    });
    if (!student) throw new NotFoundException("Talaba topilmadi yoki ushbu filialga kirish huquqi yo'q");

    const updated = await this.prisma.student.update({
      where: { id },
      data: {
        status: StudentStatus.FROZEN,
        notes: reason ? `${student.notes ? student.notes + '\n' : ''}[Muzlatildi: ${reason}${returnDate ? ' Qaytish: ' + returnDate : ''}]` : student.notes,
      },
    });

    for (const enrollment of student.enrollments) {
      await this.prisma.enrollmentHistory.create({
        data: {
          studentId: id,
          groupId: enrollment.groupId,
          action: 'FROZEN',
          reason: reason || "O'qish vaqtincha muzlatildi",
        },
      });
    }

    await this.auditService.log({
      organizationId: orgId,
      branchId: student.branchId || undefined,
      userId,
      action: AuditAction.UPDATE,
      entityType: 'Student',
      entityId: id,
      before: student,
      after: updated,
    });

    return updated;
  }

  async unfreeze(id: string, userId: string | undefined, orgId: string, branchCtx?: BranchContext) {
    const branchFilter = branchCtx ? buildBranchWhere(branchCtx) : {};
    const student = await this.prisma.student.findFirst({
      where: { id, organizationId: orgId, deletedAt: null, ...branchFilter },
      include: { enrollments: true },
    });
    if (!student) throw new NotFoundException("Talaba topilmadi yoki ushbu filialga kirish huquqi yo'q");

    const updated = await this.prisma.student.update({
      where: { id },
      data: {
        status: StudentStatus.ACTIVE,
      },
    });

    for (const enrollment of student.enrollments) {
      await this.prisma.enrollmentHistory.create({
        data: {
          studentId: id,
          groupId: enrollment.groupId,
          action: 'UNFROZEN',
          reason: "O'qish qayta faollashtirildi",
        },
      });
    }

    await this.auditService.log({
      organizationId: orgId,
      branchId: student.branchId || undefined,
      userId,
      action: AuditAction.UPDATE,
      entityType: 'Student',
      entityId: id,
      before: student,
      after: updated,
    });

    return updated;
  }

  async graduate(id: string, data: { groupId?: string; certificateNumber?: string; score?: number }, userId: string | undefined, orgId: string, branchCtx?: BranchContext) {
    const branchFilter = branchCtx ? buildBranchWhere(branchCtx) : {};
    const student = await this.prisma.student.findFirst({
      where: { id, organizationId: orgId, deletedAt: null, ...branchFilter },
      include: { enrollments: true },
    });
    if (!student) throw new NotFoundException("Talaba topilmadi yoki ushbu filialga kirish huquqi yo'q");

    const updated = await this.prisma.student.update({
      where: { id },
      data: {
        status: StudentStatus.GRADUATED,
        notes: data.certificateNumber ? `${student.notes ? student.notes + '\n' : ''}[Sertifikat: ${data.certificateNumber}${data.score ? ' Ball: ' + data.score : ''}]` : student.notes,
      },
    });

    const targetGroupIds = data.groupId ? [data.groupId] : student.enrollments.map(e => e.groupId);
    for (const gId of targetGroupIds) {
      await this.prisma.enrollmentHistory.create({
        data: {
          studentId: id,
          groupId: gId,
          action: 'GRADUATED',
          reason: data.certificateNumber ? `Bitirdi (Sertifikat: ${data.certificateNumber})` : 'Kursni muvaffaqiyatli yakunladi',
        },
      });
    }

    await this.auditService.log({
      organizationId: orgId,
      branchId: student.branchId || undefined,
      userId,
      action: AuditAction.UPDATE,
      entityType: 'Student',
      entityId: id,
      before: student,
      after: updated,
    });

    return updated;
  }

  async getProgress(id: string, orgId: string, branchCtx?: BranchContext) {
    const branchFilter = branchCtx ? buildBranchWhere(branchCtx) : {};
    const student = await this.prisma.student.findFirst({
      where: { id, organizationId: orgId, deletedAt: null, ...branchFilter },
      include: {
        enrollments: {
          include: {
            group: {
              include: { course: true, teacher: true },
            },
          },
        },
        attendances: true,
        grades: {
          include: { exam: true, lesson: true },
          orderBy: { date: 'desc' },
        },
        invoices: true,
        payments: true,
      },
    });

    if (!student) throw new NotFoundException("Talaba topilmadi");

    const totalAttendances = student.attendances.length;
    const presentCount = student.attendances.filter(a => a.status === AttendanceStatus.PRESENT).length;
    const lateCount = student.attendances.filter(a => a.status === AttendanceStatus.LATE).length;
    const absentCount = student.attendances.filter(a => a.status === AttendanceStatus.ABSENT || a.status === AttendanceStatus.ABSENT_UNEXCUSED).length;
    const attendanceRate = totalAttendances > 0 ? Math.round(((presentCount + lateCount * 0.5) / totalAttendances) * 100) : 100;

    const totalGrades = student.grades.length;
    const avgScore = totalGrades > 0 ? Math.round((student.grades.reduce((sum, g) => sum + Number(g.score), 0) / totalGrades) * 10) / 10 : 0;

    const totalInvoiced = student.invoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);
    const totalPaid = student.payments.reduce((sum, p) => sum + Number(p.amount), 0);

    return {
      student: {
        id: student.id,
        fullName: `${student.firstName} ${student.lastName}`,
        phone: student.phone,
        status: student.status,
        balance: student.balance,
      },
      academicProgress: {
        totalLessons: totalAttendances,
        presentCount,
        lateCount,
        absentCount,
        attendanceRate,
        totalExamsTaken: totalGrades,
        averageScore: avgScore,
        recentGrades: student.grades.slice(0, 5),
      },
      financialSummary: {
        totalInvoiced,
        totalPaid,
        currentBalance: student.balance,
      },
      activeGroups: student.enrollments.filter(e => e.isActive).map(e => ({
        groupId: e.groupId,
        groupName: e.group.name,
        courseName: e.group.course.name,
        teacherName: e.group.teacher ? `${e.group.teacher.firstName} ${e.group.teacher.lastName}` : null,
      })),
    };
  }

  async remove(id: string, orgId: string, userId?: string, branchCtx?: BranchContext) {
    const branchFilter = branchCtx ? buildBranchWhere(branchCtx) : {};
    const existing = await this.prisma.student.findFirst({
      where: { id, organizationId: orgId, deletedAt: null, ...branchFilter },
    });
    if (!existing) throw new NotFoundException("O'quvchi topilmadi yoki ushbu filialga kirish huquqi yo'q");

    const deleted = await this.prisma.student.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: existing.branchId || undefined,
      userId,
      action: AuditAction.DELETE,
      entityType: 'Student',
      entityId: id,
      before: existing,
      after: deleted,
    });

    return deleted;
  }

  async restore(id: string, orgId: string, userId?: string, branchCtx?: BranchContext) {
    const branchFilter = branchCtx ? buildBranchWhere(branchCtx) : {};
    const existing = await this.prisma.student.findFirst({
      where: { id, organizationId: orgId, ...branchFilter },
    });
    if (!existing) throw new NotFoundException("O'quvchi topilmadi yoki ushbu filialga kirish huquqi yo'q");

    const restored = await this.prisma.student.update({
      where: { id },
      data: { deletedAt: null },
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: existing.branchId || undefined,
      userId,
      action: AuditAction.RESTORE,
      entityType: 'Student',
      entityId: id,
      before: existing,
      after: restored,
    });

    return restored;
  }
}
