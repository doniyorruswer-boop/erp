import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { AuditAction, CustomFieldType } from '@prisma/client';
import { CreateFieldDefinitionDto, UpdateFieldDefinitionDto, QueryFieldDefinitionDto } from './dto/custom-field.dto';

@Injectable()
export class CustomFieldsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async findAll(params: QueryFieldDefinitionDto & { orgId: string }) {
    const entityWhere = params.entityType ? { entityType: params.entityType.toUpperCase() } : {};
    const groupWhere = params.fieldGroup ? { fieldGroup: params.fieldGroup } : {};

    return this.prisma.fieldDefinition.findMany({
      where: {
        organizationId: params.orgId,
        deletedAt: null,
        isActive: true,
        ...entityWhere,
        ...groupWhere,
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async findOne(id: string, orgId: string) {
    const field = await this.prisma.fieldDefinition.findFirst({
      where: { id, organizationId: orgId, deletedAt: null },
    });
    if (!field) throw new NotFoundException('Maydon ta\'rifi topilmadi');
    return field;
  }

  async create(data: CreateFieldDefinitionDto, orgId: string, userId?: string) {
    const entityType = data.entityType.toUpperCase();
    const key = data.key.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_');

    // Check duplicate key for entityType in organization
    const existing = await this.prisma.fieldDefinition.findFirst({
      where: {
        organizationId: orgId,
        entityType,
        key,
        deletedAt: null,
      },
    });
    if (existing) {
      throw new BadRequestException(`"${key}" kaliti ushbu obyekt uchun allaqachon mavjud`);
    }

    const field = await this.prisma.fieldDefinition.create({
      data: {
        organizationId: orgId,
        entityType,
        key,
        label: data.label,
        fieldType: data.fieldType,
        options: data.options ? JSON.parse(JSON.stringify(data.options)) : undefined,
        placeholder: data.placeholder || null,
        defaultValue: data.defaultValue || null,
        isRequired: data.isRequired || false,
        sortOrder: data.sortOrder || 0,
        fieldGroup: data.fieldGroup || 'Asosiy',
        isActive: true,
      },
    });

    await this.auditService.log({
      organizationId: orgId,
      userId,
      action: AuditAction.CREATE,
      entityType: 'FieldDefinition',
      entityId: field.id,
      after: field,
    });

    return field;
  }

  async update(id: string, data: UpdateFieldDefinitionDto, orgId: string, userId?: string) {
    const existing = await this.prisma.fieldDefinition.findFirst({ where: { id, organizationId: orgId } });
    if (!existing) throw new NotFoundException('Maydon ta\'rifi topilmadi');

    const updated = await this.prisma.fieldDefinition.update({
      where: { id },
      data: {
        ...data,
        options: data.options ? JSON.parse(JSON.stringify(data.options)) : undefined,
      },
    });

    await this.auditService.log({
      organizationId: orgId,
      userId,
      action: AuditAction.UPDATE,
      entityType: 'FieldDefinition',
      entityId: id,
      before: existing,
      after: updated,
    });

    return updated;
  }

  async remove(id: string, orgId: string, userId?: string) {
    const existing = await this.prisma.fieldDefinition.findFirst({ where: { id, organizationId: orgId, deletedAt: null } });
    if (!existing) throw new NotFoundException('Maydon ta\'rifi topilmadi');

    const deleted = await this.prisma.fieldDefinition.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });

    await this.auditService.log({
      organizationId: orgId,
      userId,
      action: AuditAction.DELETE,
      entityType: 'FieldDefinition',
      entityId: id,
      before: existing,
      after: deleted,
    });

    return deleted;
  }

  async restore(id: string, orgId: string, userId?: string) {
    const existing = await this.prisma.fieldDefinition.findFirst({ where: { id, organizationId: orgId } });
    if (!existing) throw new NotFoundException('Maydon ta\'rifi topilmadi');

    const restored = await this.prisma.fieldDefinition.update({
      where: { id },
      data: { deletedAt: null, isActive: true },
    });

    await this.auditService.log({
      organizationId: orgId,
      userId,
      action: AuditAction.RESTORE,
      entityType: 'FieldDefinition',
      entityId: id,
      before: existing,
      after: restored,
    });

    return restored;
  }

  async validateCustomFieldValues(entityType: string, values: Record<string, any>, orgId: string) {
    const definitions = await this.findAll({ entityType, orgId });
    const errors: string[] = [];
    const sanitized: Record<string, any> = {};

    for (const def of definitions) {
      const val = values ? values[def.key] : undefined;

      // Required check
      if (def.isRequired && (val === undefined || val === null || val === '')) {
        errors.push(`"${def.label}" maydoni to'ldirilishi shart`);
        continue;
      }

      if (val !== undefined && val !== null && val !== '') {
        // Type validations
        switch (def.fieldType) {
          case CustomFieldType.NUMBER:
            if (isNaN(Number(val))) {
              errors.push(`"${def.label}" raqam bo'lishi kerak`);
            } else {
              sanitized[def.key] = Number(val);
            }
            break;

          case CustomFieldType.BOOLEAN:
            sanitized[def.key] = Boolean(val);
            break;

          case CustomFieldType.EMAIL:
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (typeof val !== 'string' || !emailRegex.test(val)) {
              errors.push(`"${def.label}" to'g'ri email manzil bo'lishi kerak`);
            } else {
              sanitized[def.key] = val.trim();
            }
            break;

          case CustomFieldType.SELECT:
            if (Array.isArray(def.options) && !def.options.includes(val)) {
              errors.push(`"${def.label}" uchun tanlangan qiymat variantlar ro'yxatida yo'q`);
            } else {
              sanitized[def.key] = val;
            }
            break;

          case CustomFieldType.MULTI_SELECT:
            if (!Array.isArray(val)) {
              errors.push(`"${def.label}" massiv (array) bo'lishi kerak`);
            } else {
              sanitized[def.key] = val;
            }
            break;

          default:
            sanitized[def.key] = val;
            break;
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValues: sanitized,
    };
  }
}
