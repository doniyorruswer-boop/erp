import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
  Optional,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { WorkflowService } from "../workflow/workflow.service";
import { LeadStatus, AuditAction, ActivityType } from "@prisma/client";
import { ConvertLeadDto } from "../crm/dto/convert-lead.dto";
import { UpdateLeadDto } from "./dto/lead.dto";
import { BranchContext, buildBranchWhere, assertBranchAccess } from "../auth/branch-access";

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    @Optional() private workflowService?: WorkflowService
  ) {}

  async ensureDefaultPipeline(orgId: string) {
    let pipeline = await this.prisma.pipeline.findFirst({
      where: { organizationId: orgId, deletedAt: null },
      include: { stages: { where: { deletedAt: null }, orderBy: { order: "asc" } } },
    });

    if (!pipeline) {
      pipeline = await this.prisma.pipeline.create({
        data: {
          organizationId: orgId,
          name: "Asosiy Savdo Voronkasi",
          code: "MAIN",
          isDefault: true,
          stages: {
            create: [
              { name: "Yangi lid", code: "NEW", color: "#3B82F6", order: 1, winProbability: 10 },
              {
                name: "Bog'lanildi",
                code: "CONTACTED",
                color: "#F59E0B",
                order: 2,
                winProbability: 30,
              },
              {
                name: "Sinov darsi / Uchrashuv",
                code: "TRIAL",
                color: "#8B5CF6",
                order: 3,
                winProbability: 60,
              },
              {
                name: "Qatnashdi / O'ylamoqda",
                code: "ATTENDED",
                color: "#EC4899",
                order: 4,
                winProbability: 80,
              },
              {
                name: "Qabul qilindi (Yutildi)",
                code: "WON",
                color: "#10B981",
                order: 5,
                winProbability: 100,
                isWon: true,
              },
              {
                name: "Rad etdi (Yo'qotildi)",
                code: "LOST",
                color: "#EF4444",
                order: 6,
                winProbability: 0,
                isLost: true,
              },
            ],
          },
        },
        include: { stages: { orderBy: { order: "asc" } } },
      });
    }

    return pipeline;
  }

  async findAll(
    query: {
      status?: LeadStatus;
      search?: string;
      branchId?: string;
      pipelineId?: string;
      stageId?: string;
      managerId?: string;
      orgId: string;
    },
    branchCtx?: BranchContext
  ) {
    const branchFilter = branchCtx
      ? buildBranchWhere(branchCtx, query.branchId)
      : query.branchId
        ? { branchId: query.branchId }
        : {};

    return this.prisma.lead.findMany({
      where: {
        organizationId: query.orgId,
        deletedAt: null,
        status: query.status,
        pipelineId: query.pipelineId,
        stageId: query.stageId,
        managerId: query.managerId,
        ...branchFilter,
        OR: query.search
          ? [
              { fullName: { contains: query.search, mode: "insensitive" } },
              { phone: { contains: query.search } },
            ]
          : undefined,
      },
      include: {
        course: true,
        pipeline: true,
        stage: true,
        customer: true,
        manager: { select: { id: true, firstName: true, lastName: true } },
        _count: {
          select: {
            tasks: { where: { deletedAt: null } },
            activities: true,
            crmNotes: { where: { deletedAt: null } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getKanbanBoard(
    pipelineId: string | undefined,
    orgId: string,
    branchId?: string,
    branchCtx?: BranchContext
  ) {
    let targetPipelineId = pipelineId;

    if (!targetPipelineId) {
      const defaultPipeline = await this.ensureDefaultPipeline(orgId);
      targetPipelineId = defaultPipeline.id;
    }

    const stages = await this.prisma.pipelineStage.findMany({
      where: {
        pipelineId: targetPipelineId,
        deletedAt: null,
      },
      orderBy: { order: "asc" },
    });

    const branchFilter = branchCtx
      ? buildBranchWhere(branchCtx, branchId)
      : branchId
        ? { branchId }
        : {};

    const leads = await this.prisma.lead.findMany({
      where: {
        organizationId: orgId,
        pipelineId: targetPipelineId,
        deletedAt: null,
        ...branchFilter,
      },
      include: {
        course: true,
        manager: { select: { id: true, firstName: true, lastName: true } },
        customer: true,
        _count: {
          select: {
            tasks: { where: { deletedAt: null } },
            activities: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return stages.map((stage) => {
      const stageLeads = leads.filter((l) => l.stageId === stage.id);
      const totalAmount = stageLeads.reduce((sum, l) => sum + (Number(l.amount) || 0), 0);

      return {
        ...stage,
        leads: stageLeads,
        totalLeads: stageLeads.length,
        totalAmount,
      };
    });
  }

  async findOne(id: string, orgId: string, branchCtx?: BranchContext) {
    const branchFilter = branchCtx ? buildBranchWhere(branchCtx) : {};
    const lead = await this.prisma.lead.findFirst({
      where: { id, organizationId: orgId, deletedAt: null, ...branchFilter },
      include: {
        course: true,
        organization: true,
        pipeline: true,
        stage: true,
        customer: true,
        manager: { select: { id: true, firstName: true, lastName: true, phone: true } },
        tasks: {
          where: { deletedAt: null },
          include: { assignee: { select: { id: true, firstName: true, lastName: true } } },
          orderBy: { dueDate: "asc" },
        },
        activities: {
          include: { user: { select: { id: true, firstName: true, lastName: true } } },
          orderBy: { createdAt: "desc" },
        },
        crmNotes: {
          where: { deletedAt: null },
          include: { author: { select: { id: true, firstName: true, lastName: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    if (!lead) throw new NotFoundException("Lid topilmadi");
    return lead;
  }

  async create(
    data: {
      fullName: string;
      phone: string;
      courseId?: string;
      pipelineId?: string;
      stageId?: string;
      branchId?: string;
      source?: string;
      status?: LeadStatus;
      managerId?: string;
      notes?: string;
      amount?: number;
      tags?: string[];
    },
    orgId: string,
    userId?: string,
    branchCtx?: BranchContext
  ) {
    if (branchCtx) {
      data.branchId = assertBranchAccess(branchCtx, data.branchId);
    }

    // Cross-tenant verification for Course
    if (data.courseId) {
      const course = await this.prisma.course.findFirst({
        where: { id: data.courseId, organizationId: orgId, deletedAt: null },
      });
      if (!course)
        throw new BadRequestException("Kurs topilmadi yoki ushbu tashkilotga tegishli emas");
    }

    // Cross-tenant verification for Branch
    if (data.branchId) {
      const branch = await this.prisma.branch.findFirst({
        where: { id: data.branchId, organizationId: orgId, deletedAt: null },
      });
      if (!branch)
        throw new BadRequestException("Filial topilmadi yoki ushbu tashkilotga tegishli emas");
    }

    let pipelineId = data.pipelineId;
    let stageId = data.stageId;

    if (!pipelineId) {
      const defaultPipeline = await this.ensureDefaultPipeline(orgId);
      pipelineId = defaultPipeline.id;
      if (!stageId && defaultPipeline.stages?.length > 0) {
        stageId = defaultPipeline.stages[0].id;
      }
    }

    const lead = await this.prisma.lead.create({
      data: {
        organizationId: orgId,
        branchId: data.branchId || null,
        fullName: data.fullName,
        phone: data.phone,
        courseId: data.courseId || null,
        pipelineId,
        stageId,
        source: data.source || "Manual",
        status: data.status || LeadStatus.NEW,
        managerId: data.managerId || null,
        notes: data.notes || null,
        amount: data.amount ? Number(data.amount) : 0,
        tags: data.tags || [],
      },
      include: {
        course: true,
        pipeline: true,
        stage: true,
        manager: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    await this.prisma.activity.create({
      data: {
        organizationId: orgId,
        userId: userId || null,
        leadId: lead.id,
        type: ActivityType.SYSTEM,
        title: "Lid yaratildi",
        description: `"${lead.fullName}" tizimga yangi lid sifatida qo'shildi`,
      },
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: data.branchId,
      userId,
      action: AuditAction.CREATE,
      entityType: "Lead",
      entityId: lead.id,
      after: lead,
    });

    if (this.workflowService) {
      try {
        await this.workflowService.processEvent(
          "lead.created",
          {
            id: lead.id,
            name: lead.fullName,
            fullName: lead.fullName,
            phone: lead.phone,
            source: lead.source,
            status: lead.status,
            amount: lead.amount,
            branchId: lead.branchId,
            courseId: lead.courseId,
          },
          orgId
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.warn(`Workflow execution failed for lead.created: ${msg}`);
      }
    }

    return lead;
  }

  async update(
    id: string,
    data: UpdateLeadDto,
    orgId: string,
    userId?: string,
    branchCtx?: BranchContext
  ) {
    const branchFilter = branchCtx ? buildBranchWhere(branchCtx) : {};
    const oldLead = await this.prisma.lead.findFirst({
      where: { id, organizationId: orgId, ...branchFilter },
    });
    if (!oldLead)
      throw new NotFoundException("Lid topilmadi yoki ushbu filialga kirish huquqi yo'q");

    if (data.branchId && branchCtx) {
      assertBranchAccess(branchCtx, data.branchId);
    }

    if (data.courseId && data.courseId !== oldLead.courseId) {
      const course = await this.prisma.course.findFirst({
        where: { id: data.courseId, organizationId: orgId, deletedAt: null },
      });
      if (!course)
        throw new BadRequestException("Kurs topilmadi yoki ushbu tashkilotga tegishli emas");
    }

    const updatedLead = await this.prisma.lead.update({
      where: { id },
      data,
      include: {
        course: true,
        pipeline: true,
        stage: true,
        manager: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: oldLead.branchId || undefined,
      userId,
      action: AuditAction.UPDATE,
      entityType: "Lead",
      entityId: id,
      before: oldLead,
      after: updatedLead,
    });

    return updatedLead;
  }

  async moveToStage(
    id: string,
    stageId: string,
    orgId: string,
    userId?: string,
    branchCtx?: BranchContext
  ) {
    const lead = await this.findOne(id, orgId, branchCtx);
    const targetStage = await this.prisma.pipelineStage.findUnique({ where: { id: stageId } });
    if (!targetStage) throw new NotFoundException("Target stage not found");

    const updated = await this.prisma.lead.update({
      where: { id },
      data: {
        stageId,
        status: targetStage.isWon
          ? LeadStatus.ENROLLED
          : targetStage.isLost
            ? LeadStatus.LOST
            : lead.status,
      },
      include: { stage: true, pipeline: true },
    });

    await this.prisma.activity.create({
      data: {
        organizationId: lead.organizationId,
        userId: userId || null,
        leadId: id,
        type: ActivityType.SYSTEM,
        title: "Bosqich o'zgartirildi",
        description: `Lid "${targetStage.name}" bosqichiga o'tkazildi`,
      },
    });

    await this.auditService.log({
      organizationId: lead.organizationId,
      branchId: lead.branchId || undefined,
      userId,
      action: AuditAction.UPDATE,
      entityType: "Lead",
      entityId: id,
      before: { stageId: lead.stageId, status: lead.status },
      after: { stageId: updated.stageId, status: updated.status },
    });

    return updated;
  }

  async convert(
    id: string,
    dto: ConvertLeadDto,
    orgId: string,
    userId?: string,
    branchCtx?: BranchContext
  ) {
    const lead = await this.findOne(id, orgId, branchCtx);
    const nameParts = (lead.fullName || "").trim().split(" ");
    const firstName = nameParts[0] || "Mijoz";
    const lastName = nameParts.slice(1).join(" ") || "Foydalanuvchi";

    let customer = null;
    let student = null;

    // 1. Create Core Customer if requested
    if (dto.createCustomer !== false) {
      customer = await this.prisma.customer.create({
        data: {
          organizationId: lead.organizationId,
          branchId: lead.branchId,
          firstName,
          lastName,
          phone: lead.phone,
          status: "ACTIVE",
        },
      });
    }

    // 2. Create Education Student if requested
    if (dto.createStudent !== false) {
      student = await this.prisma.student.create({
        data: {
          organizationId: lead.organizationId || orgId,
          branchId: lead.branchId,
          firstName,
          lastName,
          phone: lead.phone,
          status: "ACTIVE",
        },
      });

      // If groupId provided, verify and enroll student
      if (dto.groupId) {
        const group = await this.prisma.group.findFirst({
          where: { id: dto.groupId, organizationId: orgId, deletedAt: null },
        });
        if (!group)
          throw new BadRequestException("Guruh topilmadi yoki ushbu tashkilotga tegishli emas");

        // CROSS-BRANCH CHECK: group branch must match lead branch
        if (lead.branchId && group.branchId && lead.branchId !== group.branchId) {
          throw new BadRequestException("Tanlangan guruh lid filiali bilan mos kelmadi");
        }

        await this.prisma.groupEnrollment.create({
          data: {
            groupId: dto.groupId,
            studentId: student.id,
          },
        });

        await this.prisma.enrollmentHistory.create({
          data: {
            studentId: student.id,
            groupId: dto.groupId,
            action: "ENROLLED",
            reason: "Liddan konvertatsiya qilindi",
          },
        });
      }
    }

    // 3. Mark Lead as WON/ENROLLED
    const wonStage = lead.pipelineId
      ? await this.prisma.pipelineStage.findFirst({
          where: { pipelineId: lead.pipelineId, isWon: true, deletedAt: null },
        })
      : null;

    const updatedLead = await this.prisma.lead.update({
      where: { id },
      data: {
        status: LeadStatus.ENROLLED,
        stageId: wonStage ? wonStage.id : lead.stageId,
        customerId: customer?.id || null,
      },
    });

    await this.prisma.activity.create({
      data: {
        organizationId: lead.organizationId,
        userId: userId || null,
        leadId: id,
        customerId: customer?.id || null,
        type: ActivityType.SYSTEM,
        title: "Lid konvertatsiya qilindi",
        description: `Muvaffaqiyatli ${student ? "o'quvchi va " : ""}mijozga aylantirildi`,
      },
    });

    await this.auditService.log({
      organizationId: lead.organizationId,
      branchId: lead.branchId || undefined,
      userId,
      action: AuditAction.UPDATE,
      entityType: "Lead",
      entityId: id,
      before: { status: lead.status },
      after: { status: updatedLead.status, customerId: customer?.id, studentId: student?.id },
    });

    return {
      lead: updatedLead,
      customer,
      student,
    };
  }

  async remove(id: string, orgId: string, userId?: string, branchCtx?: BranchContext) {
    const branchFilter = branchCtx ? buildBranchWhere(branchCtx) : {};
    const oldLead = await this.prisma.lead.findFirst({
      where: { id, organizationId: orgId, deletedAt: null, ...branchFilter },
    });
    if (!oldLead)
      throw new NotFoundException("Lid topilmadi yoki ushbu filialga kirish huquqi yo'q");

    const deleted = await this.prisma.lead.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: oldLead.branchId || undefined,
      userId,
      action: AuditAction.DELETE,
      entityType: "Lead",
      entityId: id,
      before: oldLead,
      after: deleted,
    });

    return deleted;
  }

  async restore(id: string, orgId: string, userId?: string, branchCtx?: BranchContext) {
    const branchFilter = branchCtx ? buildBranchWhere(branchCtx) : {};
    const oldLead = await this.prisma.lead.findFirst({
      where: { id, organizationId: orgId, ...branchFilter },
    });
    if (!oldLead)
      throw new NotFoundException("Lid topilmadi yoki ushbu filialga kirish huquqi yo'q");

    const restored = await this.prisma.lead.update({
      where: { id },
      data: { deletedAt: null },
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: oldLead.branchId || undefined,
      userId,
      action: AuditAction.RESTORE,
      entityType: "Lead",
      entityId: id,
      before: oldLead,
      after: restored,
    });

    return restored;
  }
}
