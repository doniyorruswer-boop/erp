import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '@prisma/client';
import { CreateParentDto, UpdateParentDto, QueryParentDto, LinkStudentParentDto } from './dto/parent.dto';

@Injectable()
export class ParentsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async findAll(query: QueryParentDto, orgId: string) {
    const page = Number(query.page) || 1;
    const limit = Math.min(Number(query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const where: any = {
      organizationId: orgId,
      deletedAt: null,
      OR: query.search
        ? [
            { fullName: { contains: query.search, mode: 'insensitive' } },
            { phone: { contains: query.search } },
          ]
        : undefined,
    };

    const [parents, total] = await Promise.all([
      this.prisma.parent.findMany({
        where,
        skip,
        take: limit,
        include: {
          students: {
            include: {
              student: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  phone: true,
                  status: true,
                  branchId: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.parent.count({ where }),
    ]);

    return {
      items: parents,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, orgId: string) {
    const parent = await this.prisma.parent.findFirst({
      where: { id, organizationId: orgId, deletedAt: null },
      include: {
        students: {
          include: {
            student: {
              include: {
                enrollments: {
                  where: { isActive: true },
                  include: { group: true },
                },
              },
            },
          },
        },
      },
    });

    if (!parent) {
      throw new NotFoundException('Ota-ona topilmadi yoki ushbu tashkilotga tegishli emas');
    }

    return parent;
  }

  async create(dto: CreateParentDto, orgId: string, userId?: string) {
    // Check if phone unique within organization
    const existing = await this.prisma.parent.findFirst({
      where: { organizationId: orgId, phone: dto.phone, deletedAt: null },
    });

    if (existing) {
      throw new ConflictException('Ushbu telefon raqamli ota-ona ushbu tashkilotda allaqachon mavjud');
    }

    const parent = await this.prisma.parent.create({
      data: {
        organizationId: orgId,
        fullName: dto.fullName,
        phone: dto.phone,
        relationship: dto.relationship,
        isPrimary: dto.isPrimary ?? true,
      },
    });

    await this.auditService.log({
      organizationId: orgId,
      userId,
      action: AuditAction.CREATE,
      entityType: 'Parent',
      entityId: parent.id,
      after: parent,
    });

    return parent;
  }

  async update(id: string, dto: UpdateParentDto, orgId: string, userId?: string) {
    const parent = await this.findOne(id, orgId);

    if (dto.phone && dto.phone !== parent.phone) {
      const conflict = await this.prisma.parent.findFirst({
        where: { organizationId: orgId, phone: dto.phone, deletedAt: null, id: { not: id } },
      });
      if (conflict) {
        throw new ConflictException('Ushbu telefon raqami boshqa ota-onaga biriktirilgan');
      }
    }

    const updated = await this.prisma.parent.update({
      where: { id },
      data: {
        fullName: dto.fullName,
        phone: dto.phone,
        relationship: dto.relationship,
        isPrimary: dto.isPrimary,
      },
    });

    await this.auditService.log({
      organizationId: orgId,
      userId,
      action: AuditAction.UPDATE,
      entityType: 'Parent',
      entityId: id,
      before: parent,
      after: updated,
    });

    return updated;
  }

  async remove(id: string, orgId: string, userId?: string) {
    const parent = await this.findOne(id, orgId);

    const softDeleted = await this.prisma.parent.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.auditService.log({
      organizationId: orgId,
      userId,
      action: AuditAction.DELETE,
      entityType: 'Parent',
      entityId: id,
      before: parent,
    });

    return { success: true, message: 'Ota-ona muvaffaqiyatli o\'chirildi', id: softDeleted.id };
  }

  async linkStudent(dto: LinkStudentParentDto, orgId: string, userId?: string) {
    // 1. Verify Student belongs to org
    const student = await this.prisma.student.findFirst({
      where: { id: dto.studentId, organizationId: orgId, deletedAt: null },
    });
    if (!student) {
      throw new NotFoundException('O\'quvchi topilmadi yoki ushbu tashkilotga tegishli emas');
    }

    // 2. Verify Parent belongs to org
    const parent = await this.prisma.parent.findFirst({
      where: { id: dto.parentId, organizationId: orgId, deletedAt: null },
    });
    if (!parent) {
      throw new NotFoundException('Ota-ona topilmadi yoki ushbu tashkilotga tegishli emas');
    }

    // 3. Upsert / Create StudentParent junction link
    const link = await this.prisma.studentParent.upsert({
      where: {
        studentId_parentId: {
          studentId: dto.studentId,
          parentId: dto.parentId,
        },
      },
      update: {
        relationship: dto.relationship || parent.relationship,
        isPrimary: dto.isPrimary ?? false,
      },
      create: {
        studentId: dto.studentId,
        parentId: dto.parentId,
        relationship: dto.relationship || parent.relationship,
        isPrimary: dto.isPrimary ?? false,
      },
      include: {
        student: { select: { id: true, firstName: true, lastName: true } },
        parent: { select: { id: true, fullName: true, phone: true } },
      },
    });

    await this.auditService.log({
      organizationId: orgId,
      userId,
      action: AuditAction.UPDATE,
      entityType: 'StudentParent',
      entityId: link.id,
      after: { studentId: dto.studentId, parentId: dto.parentId, relationship: link.relationship },
    });

    return link;
  }

  async unlinkStudent(studentId: string, parentId: string, orgId: string, userId?: string) {
    // Verify tenant ownership
    const link = await this.prisma.studentParent.findFirst({
      where: {
        studentId,
        parentId,
        student: { organizationId: orgId },
        parent: { organizationId: orgId },
      },
    });

    if (!link) {
      throw new NotFoundException('Bog\'lanish topilmadi yoki ushbu tashkilotga tegishli emas');
    }

    await this.prisma.studentParent.delete({
      where: { id: link.id },
    });

    await this.auditService.log({
      organizationId: orgId,
      userId,
      action: AuditAction.DELETE,
      entityType: 'StudentParent',
      entityId: link.id,
      before: link,
    });

    return { success: true, message: 'Talaba va ota-ona bog\'lanishi uzildi' };
  }
}
