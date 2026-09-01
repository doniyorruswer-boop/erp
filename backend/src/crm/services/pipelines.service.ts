import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { AuditAction } from '@prisma/client';
import {
  CreatePipelineDto,
  UpdatePipelineDto,
  CreatePipelineStageDto,
  UpdatePipelineStageDto,
} from '../dto/pipeline.dto';

@Injectable()
export class PipelinesService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async ensureDefaultPipeline(orgId: string) {
    const existing = await this.prisma.pipeline.findFirst({
      where: { organizationId: orgId, deletedAt: null },
    });
    if (existing) return existing;

    const pipeline = await this.prisma.pipeline.create({
      data: {
        organizationId: orgId,
        name: 'Asosiy savdo voronkasi',
        code: 'DEFAULT_PIPELINE',
        isDefault: true,
        stages: {
          create: [
            { name: 'Yangi lid', code: 'NEW', color: '#3B82F6', order: 1, winProbability: 10 },
            { name: 'Bog\'lanildi / Maslahat', code: 'CONTACTED', color: '#F59E0B', order: 2, winProbability: 30 },
            { name: 'Sinov darsi / Uchrashuv', code: 'TRIAL', color: '#8B5CF6', order: 3, winProbability: 60 },
            { name: 'Qatnashdi / O\'ylamoqda', code: 'ATTENDED', color: '#EC4899', order: 4, winProbability: 80 },
            { name: 'Qabul qilindi (Yutildi)', code: 'WON', color: '#10B981', order: 5, winProbability: 100, isWon: true },
            { name: 'Rad etdi (Yo\'qotildi)', code: 'LOST', color: '#EF4444', order: 6, winProbability: 0, isLost: true },
          ],
        },
      },
      include: { stages: { orderBy: { order: 'asc' } } },
    });

    return pipeline;
  }

  async findAll(orgId: string) {
    let pipelines = await this.prisma.pipeline.findMany({
      where: {
        organizationId: orgId,
        deletedAt: null,
        isActive: true,
      },
      include: {
        stages: {
          where: { deletedAt: null },
          orderBy: { order: 'asc' },
          include: {
            _count: {
              select: {
                leads: {
                  where: { deletedAt: null },
                },
              },
            },
          },
        },
        _count: {
          select: {
            leads: { where: { deletedAt: null } },
          },
        },
      },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });

    if (pipelines.length === 0) {
      await this.ensureDefaultPipeline(orgId);
      pipelines = await this.findAll(orgId);
    }

    return pipelines;
  }

  async findOne(id: string, orgId: string) {
    const pipeline = await this.prisma.pipeline.findFirst({
      where: { id, organizationId: orgId, deletedAt: null },
      include: {
        stages: {
          where: { deletedAt: null },
          orderBy: { order: 'asc' },
        },
        leads: {
          where: { deletedAt: null },
          include: {
            manager: { select: { id: true, firstName: true, lastName: true } },
            course: true,
            stage: true,
          },
        },
      },
    });
    if (!pipeline) throw new NotFoundException('Voronka (Pipeline) topilmadi');
    return pipeline;
  }

  async create(data: CreatePipelineDto, orgId: string, userId?: string) {
    if (data.isDefault) {
      await this.prisma.pipeline.updateMany({
        where: { organizationId: orgId },
        data: { isDefault: false },
      });
    }

    const stagesData = data.stages && data.stages.length > 0
      ? data.stages.map((s, idx) => ({
          name: s.name,
          code: s.code,
          color: s.color || '#3B82F6',
          order: s.order !== undefined ? s.order : idx + 1,
          winProbability: s.winProbability || 0,
          isWon: s.isWon || false,
          isLost: s.isLost || false,
        }))
      : [
          { name: 'Yangi lid', color: '#3B82F6', order: 1, winProbability: 10 },
          { name: 'Jarayonda', color: '#F59E0B', order: 2, winProbability: 50 },
          { name: 'Yutildi', color: '#10B981', order: 3, winProbability: 100, isWon: true },
          { name: 'Yo\'qotildi', color: '#EF4444', order: 4, winProbability: 0, isLost: true },
        ];

    const pipeline = await this.prisma.pipeline.create({
      data: {
        organizationId: orgId,
        name: data.name,
        code: data.code,
        isDefault: data.isDefault || false,
        stages: {
          create: stagesData,
        },
      },
      include: {
        stages: { orderBy: { order: 'asc' } },
      },
    });

    await this.auditService.log({
      organizationId: orgId,
      userId,
      action: AuditAction.CREATE,
      entityType: 'Pipeline',
      entityId: pipeline.id,
      after: pipeline,
    });

    return pipeline;
  }

  async update(id: string, data: UpdatePipelineDto, orgId: string, userId?: string) {
    const existing = await this.prisma.pipeline.findFirst({ where: { id, organizationId: orgId } });
    if (!existing) throw new NotFoundException('Voronka topilmadi');

    if (data.isDefault) {
      await this.prisma.pipeline.updateMany({
        where: { organizationId: orgId },
        data: { isDefault: false },
      });
    }

    const updated = await this.prisma.pipeline.update({
      where: { id },
      data,
      include: { stages: { where: { deletedAt: null }, orderBy: { order: 'asc' } } },
    });

    await this.auditService.log({
      organizationId: orgId,
      userId,
      action: AuditAction.UPDATE,
      entityType: 'Pipeline',
      entityId: id,
      before: existing,
      after: updated,
    });

    return updated;
  }

  async remove(id: string, orgId: string, userId?: string) {
    const existing = await this.prisma.pipeline.findFirst({ where: { id, organizationId: orgId, deletedAt: null } });
    if (!existing) throw new NotFoundException('Voronka topilmadi');

    const deleted = await this.prisma.pipeline.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.auditService.log({
      organizationId: orgId,
      userId,
      action: AuditAction.DELETE,
      entityType: 'Pipeline',
      entityId: id,
      before: existing,
      after: deleted,
    });

    return deleted;
  }

  async addStage(pipelineId: string, data: CreatePipelineStageDto, orgId: string, userId?: string) {
    const pipeline = await this.findOne(pipelineId, orgId);
    const count = await this.prisma.pipelineStage.count({ where: { pipelineId, deletedAt: null } });

    const stage = await this.prisma.pipelineStage.create({
      data: {
        pipelineId,
        name: data.name,
        code: data.code,
        color: data.color || '#3B82F6',
        order: data.order !== undefined ? data.order : count + 1,
        winProbability: data.winProbability || 0,
        isWon: data.isWon || false,
        isLost: data.isLost || false,
      },
    });

    await this.auditService.log({
      organizationId: orgId,
      userId,
      action: AuditAction.CREATE,
      entityType: 'PipelineStage',
      entityId: stage.id,
      after: stage,
    });

    return stage;
  }

  async updateStage(stageId: string, data: UpdatePipelineStageDto, orgId: string, userId?: string) {
    const existing = await this.prisma.pipelineStage.findUnique({
      where: { id: stageId },
      include: { pipeline: true },
    });
    if (!existing || existing.pipeline.organizationId !== orgId) {
      throw new NotFoundException('Bosqich (Stage) topilmadi');
    }

    const updated = await this.prisma.pipelineStage.update({
      where: { id: stageId },
      data,
    });

    await this.auditService.log({
      organizationId: orgId,
      userId,
      action: AuditAction.UPDATE,
      entityType: 'PipelineStage',
      entityId: stageId,
      before: existing,
      after: updated,
    });

    return updated;
  }

  async removeStage(stageId: string, orgId: string, userId?: string) {
    const existing = await this.prisma.pipelineStage.findUnique({
      where: { id: stageId },
      include: { pipeline: true },
    });
    if (!existing || existing.pipeline.organizationId !== orgId) {
      throw new NotFoundException('Bosqich topilmadi');
    }

    const deleted = await this.prisma.pipelineStage.update({
      where: { id: stageId },
      data: { deletedAt: new Date() },
    });

    await this.auditService.log({
      organizationId: orgId,
      userId,
      action: AuditAction.DELETE,
      entityType: 'PipelineStage',
      entityId: stageId,
      before: existing,
      after: deleted,
    });

    return deleted;
  }

  async reorderStages(pipelineId: string, stageIds: string[], orgId: string) {
    await this.findOne(pipelineId, orgId);

    // Verify all stages belong to pipeline
    const stages = await this.prisma.pipelineStage.findMany({
      where: { id: { in: stageIds }, pipelineId },
    });
    if (stages.length !== stageIds.length) {
      throw new BadRequestException('Ayrim bosqichlar ushbu voronkaga tegishli emas');
    }
    
    await Promise.all(
      stageIds.map((id, index) =>
        this.prisma.pipelineStage.update({
          where: { id },
          data: { order: index + 1 },
        })
      )
    );

    return this.findOne(pipelineId, orgId);
  }
}
