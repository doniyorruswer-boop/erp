import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { AuditAction } from "@prisma/client";
import { UpdateCourseDto } from "./dto/course.dto";

@Injectable()
export class CoursesService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService
  ) {}

  async findAll(query: { search?: string; orgId: string }) {
    return this.prisma.course.findMany({
      where: {
        organizationId: query.orgId,
        deletedAt: null,
        isActive: true,
        OR: query.search
          ? [
              { name: { contains: query.search, mode: "insensitive" } },
              { description: { contains: query.search, mode: "insensitive" } },
            ]
          : undefined,
      },
      include: {
        organization: {
          select: { id: true, name: true, slug: true, businessType: true },
        },
        _count: {
          select: { groups: true, leads: true },
        },
      },
      orderBy: { name: "asc" },
    });
  }

  async findOne(id: string, orgId: string) {
    const course = await this.prisma.course.findFirst({
      where: { id, organizationId: orgId, deletedAt: null },
      include: {
        organization: true,
        groups: {
          where: { deletedAt: null },
          include: {
            teacher: true,
            _count: { select: { enrollments: true } },
          },
        },
      },
    });
    if (!course) throw new NotFoundException("Kurs topilmadi");
    return course;
  }

  async create(
    data: {
      name: string;
      description?: string;
      price: number;
      duration: number;
      lessonCount?: number;
    },
    orgId: string,
    userId?: string
  ) {
    const course = await this.prisma.course.create({
      data: {
        name: data.name,
        description: data.description,
        price: Number(data.price),
        duration: Number(data.duration),
        lessonCount: Number(data.lessonCount) || Number(data.duration) * 12 || 12,
        organizationId: orgId,
      },
      include: { organization: true },
    });

    await this.auditService.log({
      organizationId: orgId,
      userId,
      action: AuditAction.CREATE,
      entityType: "Course",
      entityId: course.id,
      after: course,
    });

    return course;
  }

  async update(id: string, data: UpdateCourseDto, orgId: string, userId?: string) {
    const course = await this.prisma.course.findFirst({ where: { id, organizationId: orgId } });
    if (!course) throw new NotFoundException("Kurs topilmadi");

    const updated = await this.prisma.course.update({
      where: { id },
      data: {
        ...data,
        price: data.price !== undefined ? Number(data.price) : undefined,
        duration: data.duration !== undefined ? Number(data.duration) : undefined,
        lessonCount: data.lessonCount !== undefined ? Number(data.lessonCount) : undefined,
      },
    });

    await this.auditService.log({
      organizationId: orgId,
      userId,
      action: AuditAction.UPDATE,
      entityType: "Course",
      entityId: id,
      before: course,
      after: updated,
    });

    return updated;
  }

  async remove(id: string, orgId: string, userId?: string) {
    const course = await this.prisma.course.findFirst({
      where: { id, organizationId: orgId, deletedAt: null },
    });
    if (!course) throw new NotFoundException("Kurs topilmadi");

    const deleted = await this.prisma.course.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.auditService.log({
      organizationId: orgId,
      userId,
      action: AuditAction.DELETE,
      entityType: "Course",
      entityId: id,
      before: course,
      after: deleted,
    });

    return deleted;
  }

  async restore(id: string, orgId: string, userId?: string) {
    const course = await this.prisma.course.findFirst({ where: { id, organizationId: orgId } });
    if (!course) throw new NotFoundException("Kurs topilmadi");

    const restored = await this.prisma.course.update({
      where: { id },
      data: { deletedAt: null },
    });

    await this.auditService.log({
      organizationId: orgId,
      userId,
      action: AuditAction.RESTORE,
      entityType: "Course",
      entityId: id,
      before: course,
      after: restored,
    });

    return restored;
  }
}
