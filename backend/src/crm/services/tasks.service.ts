import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { AuditAction, TaskStatus } from '@prisma/client';
import { CreateTaskDto, UpdateTaskDto, QueryTaskDto } from '../dto/task.dto';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async findAll(params: QueryTaskDto & { orgId: string }) {
    const branchWhere = params.branchId ? { branchId: params.branchId } : {};
    const statusWhere = params.status ? { status: params.status } : {};
    const priorityWhere = params.priority ? { priority: params.priority } : {};
    const assigneeWhere = params.assigneeId ? { assigneeId: params.assigneeId } : {};
    const leadWhere = params.leadId ? { leadId: params.leadId } : {};
    const customerWhere = params.customerId ? { customerId: params.customerId } : {};

    return this.prisma.task.findMany({
      where: {
        organizationId: params.orgId,
        deletedAt: null,
        ...branchWhere,
        ...statusWhere,
        ...priorityWhere,
        ...assigneeWhere,
        ...leadWhere,
        ...customerWhere,
      },
      include: {
        assignee: { select: { id: true, firstName: true, lastName: true, role: true } },
        lead: { select: { id: true, fullName: true, phone: true } },
        customer: { select: { id: true, firstName: true, lastName: true, phone: true } },
      },
      orderBy: [{ status: 'asc' }, { dueDate: 'asc' }],
    });
  }

  async findOne(id: string, orgId: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, organizationId: orgId, deletedAt: null },
      include: {
        assignee: { select: { id: true, firstName: true, lastName: true, phone: true, role: true } },
        lead: true,
        customer: true,
        branch: true,
      },
    });
    if (!task) throw new NotFoundException('Vazifa topilmadi');
    return task;
  }

  async create(data: CreateTaskDto, orgId: string, userId?: string) {
    if (data.branchId) {
      const branch = await this.prisma.branch.findFirst({
        where: { id: data.branchId, organizationId: orgId, deletedAt: null },
      });
      if (!branch) throw new BadRequestException('Filial topilmadi yoki ushbu tashkilotga tegishli emas');
    }

    if (data.leadId) {
      const lead = await this.prisma.lead.findFirst({
        where: { id: data.leadId, organizationId: orgId, deletedAt: null },
      });
      if (!lead) throw new BadRequestException('Lid topilmadi yoki ushbu tashkilotga tegishli emas');
    }

    if (data.customerId) {
      const customer = await this.prisma.customer.findFirst({
        where: { id: data.customerId, organizationId: orgId, deletedAt: null },
      });
      if (!customer) throw new BadRequestException('Mijoz topilmadi yoki ushbu tashkilotga tegishli emas');
    }

    if (data.assigneeId) {
      const assignee = await this.prisma.user.findFirst({
        where: { id: data.assigneeId, organizationId: orgId, deletedAt: null },
      });
      if (!assignee) throw new BadRequestException('Mas\'ul xodim topilmadi yoki ushbu tashkilotga tegishli emas');
    }

    const task = await this.prisma.task.create({
      data: {
        organizationId: orgId,
        branchId: data.branchId || null,
        leadId: data.leadId || null,
        customerId: data.customerId || null,
        assigneeId: data.assigneeId || userId || null,
        title: data.title,
        description: data.description || null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        status: data.status || TaskStatus.PENDING,
        priority: data.priority,
      },
      include: {
        assignee: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: data.branchId,
      userId,
      action: AuditAction.CREATE,
      entityType: 'Task',
      entityId: task.id,
      after: task,
    });

    return task;
  }

  async update(id: string, data: UpdateTaskDto, orgId: string, userId?: string) {
    const existing = await this.prisma.task.findFirst({ where: { id, organizationId: orgId } });
    if (!existing) throw new NotFoundException('Vazifa topilmadi');

    if (data.assigneeId && data.assigneeId !== existing.assigneeId) {
      const assignee = await this.prisma.user.findFirst({
        where: { id: data.assigneeId, organizationId: orgId, deletedAt: null },
      });
      if (!assignee) throw new BadRequestException('Mas\'ul xodim topilmadi yoki ushbu tashkilotga tegishli emas');
    }

    const updated = await this.prisma.task.update({
      where: { id },
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        completedAt: data.status === TaskStatus.COMPLETED ? new Date() : undefined,
      },
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: existing.branchId || undefined,
      userId,
      action: AuditAction.UPDATE,
      entityType: 'Task',
      entityId: id,
      before: existing,
      after: updated,
    });

    return updated;
  }

  async complete(id: string, orgId: string, userId?: string) {
    return this.update(id, { status: TaskStatus.COMPLETED }, orgId, userId);
  }

  async remove(id: string, orgId: string, userId?: string) {
    const existing = await this.prisma.task.findFirst({ where: { id, organizationId: orgId, deletedAt: null } });
    if (!existing) throw new NotFoundException('Vazifa topilmadi');

    const deleted = await this.prisma.task.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: existing.branchId || undefined,
      userId,
      action: AuditAction.DELETE,
      entityType: 'Task',
      entityId: id,
      before: existing,
      after: deleted,
    });

    return deleted;
  }

  async restore(id: string, orgId: string, userId?: string) {
    const existing = await this.prisma.task.findFirst({ where: { id, organizationId: orgId } });
    if (!existing) throw new NotFoundException('Vazifa topilmadi');

    const restored = await this.prisma.task.update({
      where: { id },
      data: { deletedAt: null },
    });

    await this.auditService.log({
      organizationId: orgId,
      branchId: existing.branchId || undefined,
      userId,
      action: AuditAction.RESTORE,
      entityType: 'Task',
      entityId: id,
      before: existing,
      after: restored,
    });

    return restored;
  }
}
