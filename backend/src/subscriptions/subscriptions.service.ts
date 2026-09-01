import { Injectable, OnModuleInit, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionStatus, BillingPeriod } from '@prisma/client';
import { SubscribeDto } from './dto/subscription.dto';

@Injectable()
export class SubscriptionsService implements OnModuleInit {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedDefaultPlans();
  }

  private async seedDefaultPlans() {
    const count = await this.prisma.plan.count();
    if (count > 0) return;

    this.logger.log('Seeding default SaaS subscription plans (FREE, BASIC, PRO, ENTERPRISE)...');

    const defaultPlans = [
      {
        code: 'FREE',
        name: 'Boshlang\'ich (Free)',
        description: 'Kichik o\'quv markazlari va shaxsiy repetitorlar uchun bepul tarif',
        monthlyPrice: 0,
        annualPrice: 0,
        limits: [
          { limitCode: 'MAX_USERS', value: 2 },
          { limitCode: 'MAX_STUDENTS_CUSTOMERS', value: 50 },
          { limitCode: 'MAX_BRANCHES', value: 1 },
          { limitCode: 'MAX_STORAGE_MB', value: 500 },
          { limitCode: 'MAX_NOTIFICATIONS_MONTH', value: 100 },
        ],
        features: [
          { featureCode: 'CORE_CRM', isEnabled: true },
          { featureCode: 'EDUCATION_CORE', isEnabled: true },
          { featureCode: 'CUSTOM_FIELDS', isEnabled: false },
          { featureCode: 'AUTOMATION', isEnabled: false },
          { featureCode: 'TELEGRAM_BOT', isEnabled: false },
        ],
      },
      {
        code: 'BASIC',
        name: 'Standart (Basic)',
        description: 'O\'sayotgan o\'quv markazlari va xizmat ko\'rsatish biznesi uchun',
        monthlyPrice: 350000,
        annualPrice: 3500000,
        limits: [
          { limitCode: 'MAX_USERS', value: 5 },
          { limitCode: 'MAX_STUDENTS_CUSTOMERS', value: 300 },
          { limitCode: 'MAX_BRANCHES', value: 2 },
          { limitCode: 'MAX_STORAGE_MB', value: 2048 },
          { limitCode: 'MAX_NOTIFICATIONS_MONTH', value: 1000 },
        ],
        features: [
          { featureCode: 'CORE_CRM', isEnabled: true },
          { featureCode: 'EDUCATION_CORE', isEnabled: true },
          { featureCode: 'FINANCE_CORE', isEnabled: true },
          { featureCode: 'CUSTOM_FIELDS', isEnabled: true },
          { featureCode: 'TELEGRAM_BOT', isEnabled: true },
          { featureCode: 'AUTOMATION', isEnabled: false },
        ],
      },
      {
        code: 'PRO',
        name: 'Professional (Pro)',
        description: 'Katta o\'quv markazlari, xususiy maktablar va filiallarga ega korxonalar uchun',
        monthlyPrice: 750000,
        annualPrice: 7500000,
        limits: [
          { limitCode: 'MAX_USERS', value: 20 },
          { limitCode: 'MAX_STUDENTS_CUSTOMERS', value: 2000 },
          { limitCode: 'MAX_BRANCHES', value: 5 },
          { limitCode: 'MAX_STORAGE_MB', value: 10240 },
          { limitCode: 'MAX_NOTIFICATIONS_MONTH', value: 5000 },
        ],
        features: [
          { featureCode: 'CORE_CRM', isEnabled: true },
          { featureCode: 'EDUCATION_CORE', isEnabled: true },
          { featureCode: 'FINANCE_CORE', isEnabled: true },
          { featureCode: 'CUSTOM_FIELDS', isEnabled: true },
          { featureCode: 'TELEGRAM_BOT', isEnabled: true },
          { featureCode: 'AUTOMATION', isEnabled: true },
          { featureCode: 'BACKGROUND_JOBS', isEnabled: true },
        ],
      },
      {
        code: 'ENTERPRISE',
        name: 'Korporativ (Enterprise)',
        description: 'Cheklovlarsiz to\'liq imkoniyatlar va maxsus server integratsiyasi',
        monthlyPrice: 1500000,
        annualPrice: 15000000,
        limits: [
          { limitCode: 'MAX_USERS', value: -1 },
          { limitCode: 'MAX_STUDENTS_CUSTOMERS', value: -1 },
          { limitCode: 'MAX_BRANCHES', value: -1 },
          { limitCode: 'MAX_STORAGE_MB', value: -1 },
          { limitCode: 'MAX_NOTIFICATIONS_MONTH', value: -1 },
        ],
        features: [
          { featureCode: 'CORE_CRM', isEnabled: true },
          { featureCode: 'EDUCATION_CORE', isEnabled: true },
          { featureCode: 'FINANCE_CORE', isEnabled: true },
          { featureCode: 'CUSTOM_FIELDS', isEnabled: true },
          { featureCode: 'TELEGRAM_BOT', isEnabled: true },
          { featureCode: 'AUTOMATION', isEnabled: true },
          { featureCode: 'BACKGROUND_JOBS', isEnabled: true },
          { featureCode: 'CUSTOM_DOMAIN', isEnabled: true },
          { featureCode: 'DEDICATED_SUPPORT', isEnabled: true },
        ],
      },
    ];

    for (const planData of defaultPlans) {
      const plan = await this.prisma.plan.create({
        data: {
          code: planData.code,
          name: planData.name,
          description: planData.description,
          monthlyPrice: planData.monthlyPrice,
          annualPrice: planData.annualPrice,
        },
      });

      for (const limit of planData.limits) {
        await this.prisma.planLimit.create({
          data: {
            planId: plan.id,
            limitCode: limit.limitCode,
            value: limit.value,
          },
        });
      }

      for (const feature of planData.features) {
        await this.prisma.planFeature.create({
          data: {
            planId: plan.id,
            featureCode: feature.featureCode,
            isEnabled: feature.isEnabled,
          },
        });
      }
    }
  }

  async getPlans() {
    return this.prisma.plan.findMany({
      where: { isPublic: true },
      include: {
        features: true,
        limits: true,
      },
      orderBy: { monthlyPrice: 'asc' },
    });
  }

  async getCurrentSubscription(orgId: string) {
    let sub = await this.prisma.subscription.findFirst({
      where: { organizationId: orgId, status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING] } },
      include: {
        plan: {
          include: {
            features: true,
            limits: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!sub) {
      // Auto-assign PRO or FREE plan default
      const defaultPlan = (await this.prisma.plan.findUnique({ where: { code: 'PRO' } })) || (await this.prisma.plan.findFirst());
      if (defaultPlan) {
        sub = await this.prisma.subscription.create({
          data: {
            organizationId: orgId,
            planId: defaultPlan.id,
            status: SubscriptionStatus.ACTIVE,
            billingPeriod: BillingPeriod.MONTHLY,
          },
          include: {
            plan: {
              include: {
                features: true,
                limits: true,
              },
            },
          },
        });
      }
    }

    // Compute live usages strictly for this orgId
    const [usersCount, studentsCount, customersCount, branchesCount] = await Promise.all([
      this.prisma.user.count({ where: { organizationId: orgId, deletedAt: null } }),
      this.prisma.student.count({ where: { organizationId: orgId, deletedAt: null } }),
      this.prisma.customer.count({ where: { organizationId: orgId, deletedAt: null } }),
      this.prisma.branch.count({ where: { organizationId: orgId, deletedAt: null } }),
    ]);

    const liveUsage: Record<string, { current: number; limit: number; unlimited: boolean }> = {};
    const limits = sub?.plan?.limits || [];

    const getLimitVal = (code: string) => limits.find(l => l.limitCode === code)?.value ?? -1;

    liveUsage['MAX_USERS'] = {
      current: usersCount,
      limit: getLimitVal('MAX_USERS'),
      unlimited: getLimitVal('MAX_USERS') === -1,
    };
    liveUsage['MAX_STUDENTS_CUSTOMERS'] = {
      current: studentsCount + customersCount,
      limit: getLimitVal('MAX_STUDENTS_CUSTOMERS'),
      unlimited: getLimitVal('MAX_STUDENTS_CUSTOMERS') === -1,
    };
    liveUsage['MAX_BRANCHES'] = {
      current: branchesCount,
      limit: getLimitVal('MAX_BRANCHES'),
      unlimited: getLimitVal('MAX_BRANCHES') === -1,
    };

    return {
      subscription: sub,
      plan: sub?.plan,
      usage: liveUsage,
    };
  }

  async subscribe(data: SubscribeDto, orgId: string) {
    const plan = await this.prisma.plan.findUnique({
      where: { code: data.planCode.toUpperCase() },
      include: { features: true, limits: true },
    });
    if (!plan) throw new NotFoundException(`Tarif rejasi topilmadi: ${data.planCode}`);

    // Deactivate previous active subscriptions
    await this.prisma.subscription.updateMany({
      where: { organizationId: orgId, status: SubscriptionStatus.ACTIVE },
      data: { status: SubscriptionStatus.CANCELED, canceledAt: new Date() },
    });

    const newSub = await this.prisma.subscription.create({
      data: {
        organizationId: orgId,
        planId: plan.id,
        status: SubscriptionStatus.ACTIVE,
        billingPeriod: data.billingPeriod || BillingPeriod.MONTHLY,
      },
      include: {
        plan: {
          include: { features: true, limits: true },
        },
      },
    });

    return newSub;
  }

  async cancelSubscription(orgId: string) {
    return this.prisma.subscription.updateMany({
      where: { organizationId: orgId, status: SubscriptionStatus.ACTIVE },
      data: { status: SubscriptionStatus.CANCELED, canceledAt: new Date() },
    });
  }

  async checkFeature(featureCode: string, orgId: string): Promise<boolean> {
    const subInfo = await this.getCurrentSubscription(orgId);
    const features = subInfo?.plan?.features || [];
    const feature = features.find(f => f.featureCode === featureCode);
    return feature ? feature.isEnabled : true; // Default true if not restricted
  }

  async checkLimit(limitCode: string, incrementBy: number = 1, orgId: string) {
    const subInfo = await this.getCurrentSubscription(orgId);
    const usage = subInfo.usage[limitCode];

    if (usage && !usage.unlimited) {
      if (usage.current + incrementBy > usage.limit) {
        throw new ForbiddenException(
          `Sizning joriy tarifingiz bo'yicha '${limitCode}' cheklovi yetdi (${usage.current}/${usage.limit}). Iltimos, tarifingizni yangilang.`,
        );
      }
    }

    return { allowed: true, current: usage?.current, limit: usage?.limit };
  }
}
