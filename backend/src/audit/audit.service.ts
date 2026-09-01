import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditAction } from '@prisma/client';
import { BranchContext, buildBranchWhere } from '../auth/branch-access';

export interface CreateAuditLogParams {
  organizationId?: string;
  branchId?: string;
  userId?: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  before?: any;
  after?: any;
  ip?: string;
  userAgent?: string;
}

function sanitizeAuditPayload(data: any): any {
  if (!data || typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(sanitizeAuditPayload);

  const sensitiveKeys = new Set([
    'password',
    'passwordhash',
    'password_hash',
    'token',
    'accesstoken',
    'refreshtoken',
    'secret',
    'jwtsecret',
    'apikey',
    'clientsecret',
    'privatekey',
    'cardnumber',
    'cvv',
  ]);

  const sanitized: any = {};
  for (const [key, value] of Object.entries(data)) {
    if (sensitiveKeys.has(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeAuditPayload(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(params: CreateAuditLogParams) {
    try {
      return await this.prisma.auditLog.create({
        data: {
          organizationId: params.organizationId || null,
          branchId: params.branchId || null,
          userId: params.userId || null,
          action: params.action,
          entityType: params.entityType,
          entityId: params.entityId,
          before: params.before ? sanitizeAuditPayload(JSON.parse(JSON.stringify(params.before))) : undefined,
          after: params.after ? sanitizeAuditPayload(JSON.parse(JSON.stringify(params.after))) : undefined,
          ip: params.ip,
          userAgent: params.userAgent,
        },
      });
    } catch (err) {
      console.warn('AuditLog yozishda xatolik:', err.message);
      return null;
    }
  }

  async findAll(
    params: {
      organizationId?: string;
      branchId?: string;
      userId?: string;
      entityType?: string;
      entityId?: string;
      action?: AuditAction;
      page?: number;
      limit?: number;
    },
    branchCtx?: BranchContext,
  ) {
    const { organizationId, branchId, userId, entityType, entityId, action, page = 1, limit = 50 } = params;
    const skip = (page - 1) * limit;

    const branchFilter = branchCtx ? buildBranchWhere(branchCtx, branchId) : (branchId ? { branchId } : {});

    const where: any = {
      ...branchFilter,
    };
    if (organizationId) where.organizationId = organizationId;
    if (userId) where.userId = userId;
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;
    if (action) where.action = action;

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, role: true, phone: true },
          },
          branch: {
            select: { id: true, name: true, code: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
