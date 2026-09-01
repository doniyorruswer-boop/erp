import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCrmNoteDto, UpdateCrmNoteDto } from '../dto/crm-note.dto';

@Injectable()
export class CrmNotesService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: { leadId?: string; customerId?: string; orgId: string }) {
    const leadWhere = params.leadId ? { leadId: params.leadId } : {};
    const customerWhere = params.customerId ? { customerId: params.customerId } : {};

    return this.prisma.crmNote.findMany({
      where: {
        organizationId: params.orgId,
        deletedAt: null,
        ...leadWhere,
        ...customerWhere,
      },
      include: {
        author: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: CreateCrmNoteDto, orgId: string, authorId?: string) {
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

    return this.prisma.crmNote.create({
      data: {
        organizationId: orgId,
        authorId: authorId || null,
        leadId: data.leadId || null,
        customerId: data.customerId || null,
        content: data.content,
      },
      include: {
        author: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async update(id: string, data: UpdateCrmNoteDto, orgId: string) {
    const existing = await this.prisma.crmNote.findFirst({ where: { id, organizationId: orgId } });
    if (!existing) throw new NotFoundException('Izoh topilmadi');

    return this.prisma.crmNote.update({
      where: { id },
      data: { content: data.content },
    });
  }

  async remove(id: string, orgId: string) {
    const existing = await this.prisma.crmNote.findFirst({ where: { id, organizationId: orgId, deletedAt: null } });
    if (!existing) throw new NotFoundException('Izoh topilmadi');

    return this.prisma.crmNote.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
