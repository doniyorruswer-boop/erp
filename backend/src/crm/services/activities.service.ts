import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateActivityDto, QueryActivityDto } from '../dto/activity.dto';

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: QueryActivityDto & { orgId: string }) {
    const leadWhere = params.leadId ? { leadId: params.leadId } : {};
    const customerWhere = params.customerId ? { customerId: params.customerId } : {};
    const userWhere = params.userId ? { userId: params.userId } : {};
    const typeWhere = params.type ? { type: params.type } : {};

    return this.prisma.activity.findMany({
      where: {
        organizationId: params.orgId,
        ...leadWhere,
        ...customerWhere,
        ...userWhere,
        ...typeWhere,
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: CreateActivityDto, orgId: string, userId?: string) {
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

    return this.prisma.activity.create({
      data: {
        organizationId: orgId,
        userId: userId || null,
        leadId: data.leadId || null,
        customerId: data.customerId || null,
        type: data.type,
        title: data.title,
        description: data.description || null,
        metadata: data.metadata ? JSON.parse(JSON.stringify(data.metadata)) : undefined,
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }
}
