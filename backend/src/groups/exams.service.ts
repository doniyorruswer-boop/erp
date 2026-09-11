import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { AuditAction, Prisma } from "@prisma/client";
import {
  CreateExamDto,
  UpdateExamDto,
  QueryExamDto,
  RecordGradesDto,
  CreateGradeDto,
  UpdateGradeDto,
} from "./dto/exam.dto";
import { BranchContext, buildBranchWhere } from "../auth/branch-access";

@Injectable()
export class ExamsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService
  ) {}

  async findAll(query: QueryExamDto, orgId: string, branchCtx?: BranchContext) {
    const page = Number(query.page) || 1;
    const limit = Math.min(Number(query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const branchFilter = branchCtx ? buildBranchWhere(branchCtx) : {};

    const where: Prisma.ExamWhereInput = {
      group: {
        organizationId: orgId,
        deletedAt: null,
        ...branchFilter,
      },
      groupId: query.groupId,
      deletedAt: null,
      title: query.search ? { contains: query.search, mode: "insensitive" } : undefined,
    };

    const [exams, total] = await Promise.all([
      this.prisma.exam.findMany({
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
            },
          },
          _count: { select: { grades: true } },
        },
        orderBy: { date: "desc" },
      }),
      this.prisma.exam.count({ where }),
    ]);

    return {
      items: exams,
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

    const exam = await this.prisma.exam.findFirst({
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
            enrollments: {
              where: { isActive: true },
              include: { student: true },
            },
          },
        },
        grades: {
          include: {
            student: {
              select: { id: true, firstName: true, lastName: true, phone: true },
            },
          },
          orderBy: { score: "desc" },
        },
      },
    });

    if (!exam) {
      throw new NotFoundException("Imtihon topilmadi yoki ushbu tashkilotga tegishli emas");
    }

    return exam;
  }

  async create(dto: CreateExamDto, orgId: string, userId?: string, branchCtx?: BranchContext) {
    const branchFilter = branchCtx ? buildBranchWhere(branchCtx) : {};

    // 1. Verify group belongs to organization and branch
    const group = await this.prisma.group.findFirst({
      where: { id: dto.groupId, organizationId: orgId, deletedAt: null, ...branchFilter },
    });

    if (!group) {
      throw new NotFoundException("Guruh topilmadi yoki ushbu tashkilotga tegishli emas");
    }

    const exam = await this.prisma.exam.create({
      data: {
        groupId: dto.groupId,
        title: dto.title,
        date: dto.date ? new Date(dto.date) : new Date(),
        maxScore: dto.maxScore ?? 100,
      },
      include: {
        group: { select: { id: true, name: true } },
      },
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: group.branchId || undefined,
      userId,
      action: AuditAction.CREATE,
      entityType: "Exam",
      entityId: exam.id,
      after: exam,
    });

    return exam;
  }

  async update(
    id: string,
    dto: UpdateExamDto,
    orgId: string,
    userId?: string,
    branchCtx?: BranchContext
  ) {
    const exam = await this.findOne(id, orgId, branchCtx);

    const updated = await this.prisma.exam.update({
      where: { id },
      data: {
        title: dto.title,
        date: dto.date ? new Date(dto.date) : undefined,
        maxScore: dto.maxScore,
      },
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: exam.group?.branchId || undefined,
      userId,
      action: AuditAction.UPDATE,
      entityType: "Exam",
      entityId: id,
      before: exam,
      after: updated,
    });

    return updated;
  }

  async remove(id: string, orgId: string, userId?: string, branchCtx?: BranchContext) {
    const exam = await this.findOne(id, orgId, branchCtx);

    const deleted = await this.prisma.exam.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: exam.group?.branchId || undefined,
      userId,
      action: AuditAction.DELETE,
      entityType: "Exam",
      entityId: id,
      before: exam,
    });

    return { success: true, message: "Imtihon muvaffaqiyatli o'chirildi", id: deleted.id };
  }

  async recordGrades(dto: RecordGradesDto, orgId: string, userId?: string) {
    let maxScore = 100;
    let branchId: string | undefined;

    // 1. If examId provided, verify exam and its maxScore
    if (dto.examId) {
      const exam = await this.prisma.exam.findFirst({
        where: { id: dto.examId, group: { organizationId: orgId }, deletedAt: null },
        include: { group: true },
      });
      if (!exam) {
        throw new NotFoundException("Imtihon topilmadi yoki ushbu tashkilotga tegishli emas");
      }
      maxScore = Number(exam.maxScore);
      branchId = exam.group.branchId || undefined;
    }

    // 2. Validate all student grades and score boundaries
    const studentIds = dto.grades.map((g) => g.studentId);
    const validStudents = await this.prisma.student.findMany({
      where: { id: { in: studentIds }, organizationId: orgId, deletedAt: null },
      select: { id: true },
    });

    if (validStudents.length !== studentIds.length) {
      throw new BadRequestException("Ayrim o'quvchilar ushbu tashkilotga tegishli emas");
    }

    for (const item of dto.grades) {
      if (item.score < 0) {
        throw new BadRequestException(`Baho manfiy bo'lishi mumkin emas: ${item.score}`);
      }
      if (item.score > maxScore) {
        throw new BadRequestException(
          `Baho belgilangan maksimal balldan (${maxScore}) oshib ketdi: ${item.score}`
        );
      }
    }

    // 3. Save all grades atomically in transaction with duplicate exam grade handling
    const date = dto.date ? new Date(dto.date) : new Date();

    const createdGrades = await this.prisma.$transaction(async (tx) => {
      const results = [];
      for (const item of dto.grades) {
        if (dto.examId) {
          const existing = await tx.grade.findFirst({
            where: { studentId: item.studentId, examId: dto.examId },
          });
          if (existing) {
            const updated = await tx.grade.update({
              where: { id: existing.id },
              data: { score: item.score, feedback: item.feedback, date },
            });
            results.push(updated);
            continue;
          }
        }
        const created = await tx.grade.create({
          data: {
            studentId: item.studentId,
            examId: dto.examId || null,
            lessonId: dto.lessonId || null,
            score: item.score,
            feedback: item.feedback,
            date,
          },
        });
        results.push(created);
      }
      return results;
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId,
      userId,
      action: AuditAction.CREATE,
      entityType: "GradeBatch",
      entityId: dto.examId || "batch",
      after: { examId: dto.examId, count: createdGrades.length },
    });

    return {
      success: true,
      message: `${createdGrades.length} ta o'quvchi bahosi muvaffaqiyatli saqlandi`,
      count: createdGrades.length,
    };
  }

  async getStudentGrades(studentId: string, orgId: string) {
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, organizationId: orgId, deletedAt: null },
    });
    if (!student) {
      throw new NotFoundException("O'quvchi topilmadi");
    }

    return this.prisma.grade.findMany({
      where: { studentId },
      include: {
        exam: {
          include: { group: { select: { id: true, name: true } } },
        },
        lesson: true,
      },
      orderBy: { date: "desc" },
    });
  }
}
