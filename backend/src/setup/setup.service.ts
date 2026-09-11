import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { AuditService } from "../audit/audit.service";
import { BusinessType, Role, AuditAction, Prisma } from "@prisma/client";
import { InitializeSetupDto, UpdateConfigDto } from "./dto/setup.dto";
import * as bcrypt from "bcryptjs";

@Injectable()
export class SetupService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly auditService: AuditService
  ) {}

  async getStatus() {
    let org = await this.prisma.organization.findFirst({
      include: { config: true },
      orderBy: { createdAt: "asc" },
    });

    if (!org) {
      // Seed default multi-tenant organizations if empty
      await this.seedDemoOrganizations();
      org = await this.prisma.organization.findFirst({
        include: { config: true },
        orderBy: { createdAt: "asc" },
      });
    }

    if (!org || !org.isSetupCompleted) {
      return {
        isSetupCompleted: false,
        businessType: BusinessType.COURSE_CENTER,
        organization: null,
        enabledModules: [],
        features: {},
        terminology: {},
        integrations: {},
      };
    }

    return {
      isSetupCompleted: true,
      businessType: org.businessType,
      organization: {
        id: org.id,
        name: org.name,
        slug: org.slug,
        businessType: org.businessType,
        logo: org.logo,
        phone: org.phone,
        address: org.address,
        primaryColor: org.primaryColor,
        currency: org.currency,
        plan: org.plan,
      },
      enabledModules: org.config?.enabledModules || [],
      features: org.config?.features || {},
      terminology: org.config?.terminology || {},
      integrations: org.config?.integrations || {},
    };
  }

  async getOrganizations() {
    const approvedSlugs = [
      "educrm-markaziy",
      "profi-maktab",
      "yulduzcha-bogcha",
      "universal-servis",
    ];

    let orgs = await this.prisma.organization.findMany({
      where: {
        slug: { in: approvedSlugs },
      },
      include: { config: true },
      orderBy: { createdAt: "asc" },
    });

    if (orgs.length < approvedSlugs.length) {
      await this.seedDemoOrganizations();
      orgs = await this.prisma.organization.findMany({
        where: {
          slug: { in: approvedSlugs },
        },
        include: { config: true },
        orderBy: { createdAt: "asc" },
      });
    }

    return orgs.map((o) => ({
      id: o.id,
      name: o.name,
      slug: o.slug,
      businessType: o.businessType,
      phone: o.phone,
      address: o.address,
      primaryColor: o.primaryColor || "#4F46E5",
      currency: o.currency || "UZS",
      enabledModules: o.config?.enabledModules || [],
      features: o.config?.features || {},
      terminology: o.config?.terminology || {},
    }));
  }

  async switchOrganization(id: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id },
      include: { config: true },
    });

    if (!org) {
      throw new BadRequestException("Tashkilot topilmadi");
    }

    return {
      isSetupCompleted: true,
      businessType: org.businessType,
      organization: {
        id: org.id,
        name: org.name,
        slug: org.slug,
        businessType: org.businessType,
        logo: org.logo,
        phone: org.phone,
        address: org.address,
        primaryColor: org.primaryColor,
        currency: org.currency,
        plan: org.plan,
      },
      enabledModules: org.config?.enabledModules || [],
      features: org.config?.features || {},
      terminology: org.config?.terminology || {},
      integrations: org.config?.integrations || {},
    };
  }

  async seedDemoOrganizations() {
    const demoData = [
      {
        name: "EduCRM Markaziy O'quv Markazi",
        slug: "educrm-markaziy",
        businessType: BusinessType.COURSE_CENTER,
        phone: "+998901234567",
        address: "Toshkent sh., Yunusobod t.",
        primaryColor: "#4F46E5",
        modules: [
          "LEADS",
          "STUDENTS",
          "GROUPS",
          "COURSES",
          "ATTENDANCE",
          "FINANCE",
          "SMS",
          "PAYMENTS",
        ],
        features: { contracts: true, trialLessons: true, gradingSystem: false },
        terminology: {
          groupLabel: "Guruh",
          courseLabel: "Kurs",
          studentLabel: "O'quvchi",
          teacherLabel: "Mentor",
        },
      },
      {
        name: "Profi Xususiy Maktabi",
        slug: "profi-maktab",
        businessType: BusinessType.SCHOOL,
        phone: "+998712003040",
        address: "Toshkent sh., Chilonzor t.",
        primaryColor: "#059669",
        modules: ["STUDENTS", "CLASSES", "CONTRACTS", "ATTENDANCE", "FINANCE", "SERVICES", "SMS"],
        features: {
          contracts: true,
          gradingSystem: true,
          canteenService: true,
          transportService: true,
        },
        terminology: {
          groupLabel: "Sinf",
          courseLabel: "Fan",
          studentLabel: "O'quvchi",
          teacherLabel: "O'qituvchi",
        },
      },
      {
        name: "Yulduzcha Bog'chasi",
        slug: "yulduzcha-bogcha",
        businessType: BusinessType.KINDERGARTEN,
        phone: "+998935556677",
        address: "Toshkent sh., Mirzo Ulugbek t.",
        primaryColor: "#d97706",
        modules: ["STUDENTS", "GROUPS", "ATTENDANCE", "FINANCE", "SERVICES", "SMS"],
        features: { contracts: true, canteenService: true, transportService: false },
        terminology: {
          groupLabel: "Guruh",
          courseLabel: "Mashg'ulot",
          studentLabel: "Tarbiyalanuvchi",
          teacherLabel: "Tarbiyachi",
        },
      },
      {
        name: "Universal Ta'lim Servis",
        slug: "universal-servis",
        businessType: BusinessType.COURSE_CENTER,
        phone: "+998907778899",
        address: "Toshkent sh., Mirobod t.",
        primaryColor: "#2563EB",
        modules: [
          "LEADS",
          "STUDENTS",
          "GROUPS",
          "COURSES",
          "ATTENDANCE",
          "FINANCE",
          "SMS",
          "PAYMENTS",
        ],
        features: { contracts: true, trialLessons: true, gradingSystem: false },
        terminology: {
          groupLabel: "Guruh",
          courseLabel: "Yo'nalish",
          studentLabel: "Tinglovchi",
          teacherLabel: "Instruktor",
        },
      },
    ];

    for (const item of demoData) {
      const existing = await this.prisma.organization.findFirst({
        where: { slug: item.slug },
      });

      if (!existing) {
        const org = await this.prisma.organization.create({
          data: {
            name: item.name,
            slug: item.slug,
            businessType: item.businessType,
            phone: item.phone,
            address: item.address,
            primaryColor: item.primaryColor,
            currency: "UZS",
            isSetupCompleted: true,
          },
        });

        await this.prisma.systemConfig.create({
          data: {
            organizationId: org.id,
            businessType: item.businessType,
            enabledModules: item.modules,
            features: item.features,
            terminology: item.terminology,
            integrations: {},
          },
        });
      }
    }
  }

  async initialize(data: InitializeSetupDto) {
    const slug =
      data.slug ||
      data.organizationName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "") ||
      "org-" + Date.now();

    let org = await this.prisma.organization.findFirst({ where: { slug } });
    if (org) {
      org = await this.prisma.organization.update({
        where: { id: org.id },
        data: {
          name: data.organizationName,
          slug,
          businessType: data.businessType,
          phone: data.phone,
          address: data.address,
          primaryColor: data.primaryColor || "#4F46E5",
          currency: data.currency || "UZS",
          isSetupCompleted: true,
        },
      });
    } else {
      org = await this.prisma.organization.create({
        data: {
          name: data.organizationName,
          slug,
          businessType: data.businessType,
          phone: data.phone,
          address: data.address,
          primaryColor: data.primaryColor || "#4F46E5",
          currency: data.currency || "UZS",
          isSetupCompleted: true,
        },
      });
    }

    const defaultConfig = {
      features: (data.features || {
        gradingSystem: data.businessType === BusinessType.SCHOOL,
        canteenService: data.businessType === BusinessType.SCHOOL,
        transportService: data.businessType === BusinessType.SCHOOL,
        contracts: true,
        trialLessons: true,
      }) as unknown as Prisma.InputJsonValue,
      terminology: (data.terminology || {
        studentLabel: "O'quvchi",
        teacherLabel:
          data.businessType === BusinessType.SCHOOL ? "O'qituvchi" : "Mentor / O'qituvchi",
        groupLabel: data.businessType === BusinessType.SCHOOL ? "Sinf" : "Guruh",
        courseLabel: data.businessType === BusinessType.SCHOOL ? "Fan / Dars" : "Kurs",
      }) as unknown as Prisma.InputJsonValue,
      integrations: (data.integrations || {}) as unknown as Prisma.InputJsonValue,
    };

    await this.prisma.systemConfig.upsert({
      where: { organizationId: org.id },
      create: {
        organizationId: org.id,
        businessType: data.businessType,
        enabledModules: data.enabledModules || [
          "LEADS",
          "STUDENTS",
          "GROUPS",
          "COURSES",
          "ATTENDANCE",
          "FINANCE",
          "SMS",
          "PAYMENTS",
        ],
        features: defaultConfig.features,
        terminology: defaultConfig.terminology,
        integrations: defaultConfig.integrations,
      },
      update: {
        businessType: data.businessType,
        enabledModules: data.enabledModules || [
          "LEADS",
          "STUDENTS",
          "GROUPS",
          "COURSES",
          "ATTENDANCE",
          "FINANCE",
          "SMS",
          "PAYMENTS",
        ],
        features: defaultConfig.features,
        terminology: defaultConfig.terminology,
        integrations: defaultConfig.integrations,
      },
    });

    if (!data.adminPassword && process.env.NODE_ENV === "production") {
      throw new BadRequestException("Administrator paroli ko'rsatilishi shart!");
    }
    const rawAdminPassword = data.adminPassword || "admin123";
    const hashedPassword = await bcrypt.hash(rawAdminPassword, 10);
    const adminPhone = data.adminPhone || "+998901234567";
    const adminFirstName = data.adminFirstName || "Admin";
    const adminLastName = data.adminLastName || "Superuser";
    const adminEmail = data.adminEmail || `admin@${process.env.APP_DOMAIN || "eduhub.uz"}`;

    const adminUser = await this.prisma.user.upsert({
      where: { phone: adminPhone },
      create: {
        organizationId: org.id,
        firstName: adminFirstName,
        lastName: adminLastName,
        phone: adminPhone,
        email: adminEmail,
        password: hashedPassword,
        role: Role.SUPER_ADMIN,
        isActive: true,
      },
      update: {
        organizationId: org.id,
        firstName: adminFirstName,
        lastName: adminLastName,
        email: adminEmail,
        password: hashedPassword,
        role: Role.SUPER_ADMIN,
        isActive: true,
      },
    });

    const payload = {
      sub: adminUser.id,
      phone: adminUser.phone,
      role: adminUser.role,
      firstName: adminUser.firstName,
      lastName: adminUser.lastName,
      organizationId: org.id,
    };

    return {
      success: true,
      message: "EduCRM muvaffaqiyatli sozlandi va ishga tushirildi!",
      accessToken: this.jwtService.sign(payload),
      organization: {
        id: org.id,
        name: org.name,
        businessType: org.businessType,
        slug: org.slug,
      },
      user: {
        id: adminUser.id,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        phone: adminUser.phone,
        role: adminUser.role,
      },
    };
  }

  async getConfig() {
    return this.getStatus();
  }

  async updateConfig(data: UpdateConfigDto & { organizationName?: string; primaryColor?: string }) {
    const org = await this.prisma.organization.findFirst({
      include: { config: true },
    });
    if (!org) {
      throw new BadRequestException("Tashkilot topilmadi. Avval setup o'tkazing!");
    }

    if (data.organizationName || data.primaryColor) {
      await this.prisma.organization.update({
        where: { id: org.id },
        data: {
          name: data.organizationName || org.name,
          primaryColor: data.primaryColor || org.primaryColor,
        },
      });
    }

    const config = await this.prisma.systemConfig.upsert({
      where: { organizationId: org.id },
      create: {
        organizationId: org.id,
        businessType: org.businessType,
        enabledModules: data.enabledModules || [
          "LEADS",
          "STUDENTS",
          "GROUPS",
          "COURSES",
          "ATTENDANCE",
          "FINANCE",
          "SMS",
          "PAYMENTS",
        ],
        features: (data.features || {}) as unknown as Prisma.InputJsonValue,
        terminology: (data.terminology || {}) as unknown as Prisma.InputJsonValue,
        integrations: (data.integrations || {}) as unknown as Prisma.InputJsonValue,
      },
      update: {
        enabledModules: data.enabledModules,
        features: data.features ? (data.features as unknown as Prisma.InputJsonValue) : undefined,
        terminology: data.terminology
          ? (data.terminology as unknown as Prisma.InputJsonValue)
          : undefined,
        integrations: data.integrations
          ? (data.integrations as unknown as Prisma.InputJsonValue)
          : undefined,
      },
    });

    await this.auditService.log({
      organizationId: org.id,
      action: AuditAction.UPDATE,
      entityType: "SystemConfig",
      entityId: config.id,
      before: org.config || undefined,
      after: config,
    });

    return {
      success: true,
      message: "Sozlamalar saqlandi",
      config,
    };
  }

  async getModules(orgId?: string) {
    const allModules = [
      {
        id: "STUDENTS",
        name: "O'quvchilar va Mijozlar",
        description: "O'quvchilar bazasi, shartnomalar, balans va ota-onalar",
        category: "CORE",
      },
      {
        id: "GROUPS",
        name: "Sinflar va Guruhlar",
        description: "O'quv guruhlari, xonalar, dars jadvali",
        category: "CORE",
      },
      {
        id: "COURSES",
        name: "Kurslar va Fanlar",
        description: "O'quv dasturlari va narxlar",
        category: "CORE",
      },
      {
        id: "ATTENDANCE",
        name: "Davomat va Baholash",
        description: "Dars davomati va imtihon jurnali",
        category: "ACADEMIC",
      },
      {
        id: "FINANCE",
        name: "Moliya va Xarajatlar",
        description: "Kassalar, xarajatlar, hisob-fakturalar",
        category: "FINANCE",
      },
      {
        id: "PAYMENTS",
        name: "To'lovlar va Kvitansiyalar",
        description: "To'lov qabuli, qaytarishlar, kassa operatsiyalari",
        category: "FINANCE",
      },
      {
        id: "LEADS",
        name: "Lidlar va CRM Voronka",
        description: "Yangi arizalar, kanban voronka, konversiya",
        category: "CRM",
      },
      {
        id: "SMS",
        name: "SMS va Bildirishnomalar",
        description: "Telegram, SMS, email xabarnomalar",
        category: "COMMUNICATION",
      },
      {
        id: "SCHEDULING",
        name: "Xonalar va Resurslar Taqsimoti",
        description: "Xonalar, proyektorlar, avto taqvim",
        category: "OPERATIONS",
      },
      {
        id: "WORKFLOW",
        name: "Workflow va Avtomatlashtirish",
        description: "Triggler va avtomatik qoidalar",
        category: "AUTOMATION",
      },
    ];

    let enabledList = [
      "LEADS",
      "STUDENTS",
      "GROUPS",
      "COURSES",
      "ATTENDANCE",
      "FINANCE",
      "SMS",
      "PAYMENTS",
    ];

    if (orgId) {
      const config = await this.prisma.systemConfig.findUnique({
        where: { organizationId: orgId },
        select: { enabledModules: true },
      });
      if (config?.enabledModules) {
        enabledList = config.enabledModules.map((m) => m.toUpperCase());
      }
    }

    return allModules.map((m) => ({
      ...m,
      isEnabled: enabledList.includes(m.id) || enabledList.includes("ALL"),
    }));
  }
}
