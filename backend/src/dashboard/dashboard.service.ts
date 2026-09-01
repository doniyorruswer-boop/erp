import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentStatus, AttendanceStatus } from '@prisma/client';
import { BranchContext, buildBranchWhere } from '../auth/branch-access';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(orgId: string, type?: string, branchCtx?: BranchContext) {
    const orgWhere = { organizationId: orgId };
    const branchWhere = branchCtx ? buildBranchWhere(branchCtx) : {};

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const teacherBranchFilter = branchCtx && !branchCtx.isOrgAdmin && branchCtx.accessibleBranchIds.length > 0
      ? { userBranches: { some: { branchId: { in: branchCtx.accessibleBranchIds } } } }
      : {};

    const [
      totalStudents,
      activeGroups,
      coursesCount,
      totalRevenueAgg,
      monthlyRevenueAgg,
      totalExpensesAgg,
      debtorsCount,
      debtorsSumAgg,
      totalLeads,
      enrolledLeads,
      teachersCount,
      totalCustomers,
      attendancesTotal,
      attendancesPresent,
      attendancesLate,
      attendancesAbsent,
    ] = await Promise.all([
      this.prisma.student.count({ where: { deletedAt: null, status: 'ACTIVE', ...orgWhere, ...branchWhere } }),
      this.prisma.group.count({ where: { deletedAt: null, status: 'ACTIVE', ...orgWhere, ...branchWhere } }),
      this.prisma.course.count({ where: { deletedAt: null, isActive: true, ...orgWhere } }),
      this.prisma.payment.aggregate({ _sum: { amount: true }, where: { status: PaymentStatus.PAID, deletedAt: null, ...orgWhere, ...branchWhere } }),
      this.prisma.payment.aggregate({ _sum: { amount: true }, where: { status: PaymentStatus.PAID, deletedAt: null, paymentDate: { gte: startOfMonth }, ...orgWhere, ...branchWhere } }),
      this.prisma.expense.aggregate({ _sum: { amount: true }, where: { deletedAt: null, ...orgWhere, ...branchWhere } }),
      this.prisma.student.count({ where: { deletedAt: null, balance: { lt: 0 }, ...orgWhere, ...branchWhere } }),
      this.prisma.student.aggregate({ _sum: { balance: true }, where: { deletedAt: null, balance: { lt: 0 }, ...orgWhere, ...branchWhere } }),
      this.prisma.lead.count({ where: { deletedAt: null, ...orgWhere, ...branchWhere } }),
      this.prisma.lead.count({ where: { deletedAt: null, status: 'ENROLLED', ...orgWhere, ...branchWhere } }),
      this.prisma.user.count({ where: { role: 'TEACHER', deletedAt: null, organizationId: orgId, ...teacherBranchFilter } }),
      this.prisma.customer.count({ where: { deletedAt: null, ...orgWhere, ...branchWhere } }),
      this.prisma.attendance.count({ where: { group: { organizationId: orgId, ...branchWhere } } }),
      this.prisma.attendance.count({ where: { status: AttendanceStatus.PRESENT, group: { organizationId: orgId, ...branchWhere } } }),
      this.prisma.attendance.count({ where: { status: AttendanceStatus.LATE, group: { organizationId: orgId, ...branchWhere } } }),
      this.prisma.attendance.count({ where: { status: { in: [AttendanceStatus.ABSENT, AttendanceStatus.ABSENT_UNEXCUSED] }, group: { organizationId: orgId, ...branchWhere } } }),
    ]);

    // Real recent payments
    const recentPayments = await this.prisma.payment.findMany({
      where: { status: PaymentStatus.PAID, deletedAt: null, ...orgWhere, ...branchWhere },
      take: 10,
      orderBy: { paymentDate: 'desc' },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, phone: true } },
        customer: { select: { id: true, firstName: true, lastName: true, phone: true } },
        cashbox: { select: { id: true, name: true } },
      },
    });

    // Real debtors list
    const debtorStudents = await this.prisma.student.findMany({
      where: { deletedAt: null, balance: { lt: 0 }, ...orgWhere, ...branchWhere },
      take: 10,
      orderBy: { balance: 'asc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        balance: true,
        enrollments: {
          take: 1,
          include: { group: { select: { name: true } } },
        },
      },
    });

    // Real today's schedule
    const todaySchedules = await this.prisma.schedule.findMany({
      where: {
        deletedAt: null,
        startAt: { gte: startOfToday, lte: endOfToday },
        ...orgWhere,
        ...branchWhere,
      },
      include: {
        resource: { select: { id: true, name: true } },
        instructor: { select: { id: true, firstName: true, lastName: true } },
        group: { select: { id: true, name: true } },
      },
      orderBy: { startAt: 'asc' },
    });

    // Real groups list
    const groups = await this.prisma.group.findMany({
      where: { deletedAt: null, status: 'ACTIVE', ...orgWhere, ...branchWhere },
      include: {
        teacher: { select: { id: true, firstName: true, lastName: true } },
        room: true,
        course: true,
        _count: { select: { enrollments: true } },
        enrollments: {
          include: {
            student: { select: { id: true, firstName: true, lastName: true, gender: true } },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Real teachers list
    const teachers = await this.prisma.user.findMany({
      where: { role: 'TEACHER', deletedAt: null, organizationId: orgId },
      take: 6,
      include: {
        taughtGroups: {
          where: { deletedAt: null, organizationId: orgId },
          include: {
            _count: { select: { enrollments: true } },
          },
        },
      },
    });

    // Real course distribution
    const courses = await this.prisma.course.findMany({
      where: { deletedAt: null, isActive: true, ...orgWhere },
      include: {
        _count: { select: { groups: true } },
      },
    });

    // Real payment methods breakdown
    const paymentMethodsAgg = await this.prisma.payment.groupBy({
      by: ['method'],
      where: { status: PaymentStatus.PAID, deletedAt: null, ...orgWhere, ...branchWhere },
      _sum: { amount: true },
      _count: { id: true },
    });

    // Real expenses by category
    const expensesByCategory = await this.prisma.expense.groupBy({
      by: ['categoryId'],
      where: { deletedAt: null, ...orgWhere, ...branchWhere },
      _sum: { amount: true },
    });

    const categoryIds = expensesByCategory.map(e => e.categoryId).filter((id): id is string => Boolean(id));
    const categories = categoryIds.length > 0 ? await this.prisma.expenseCategory.findMany({
      where: { id: { in: categoryIds }, organizationId: orgId },
    }) : [];

    const totalRev = Number(totalRevenueAgg._sum.amount || 0);
    const monthlyRev = Number(monthlyRevenueAgg._sum.amount || 0);
    const totalExp = Number(totalExpensesAgg._sum.amount || 0);
    const totalDebt = Math.abs(Number(debtorsSumAgg._sum.balance || 0));

    const attendanceRate = attendancesTotal > 0
      ? Math.round(((attendancesPresent + attendancesLate * 0.5) / attendancesTotal) * 1000) / 10
      : 100;

    const leadConversionRate = totalLeads > 0
      ? Math.round((enrolledLeads / totalLeads) * 100)
      : 0;

    return {
      // Metric Cards
      totalStudents,
      totalCustomers,
      activeGroups,
      coursesCount,
      totalRevenue: totalRev,
      monthlyRevenue: monthlyRev,
      totalExpenses: totalExp,
      netProfit: totalRev - totalExp,
      debtorsCount,
      totalDebt,
      totalLeads,
      enrolledLeads,
      leadConversionRate,
      teachersCount,
      paymentsCount: recentPayments.length,
      attendancesCount: attendancesTotal,
      attendanceRate,

      // Breakdown datasets
      paymentMethods: {
        labels: paymentMethodsAgg.map(p => p.method),
        series: paymentMethodsAgg.map(p => Number(p._sum.amount || 0)),
        counts: paymentMethodsAgg.map(p => p._count.id),
      },
      expenseCategories: {
        labels: expensesByCategory.map(e => {
          const cat = categories.find(c => c.id === e.categoryId);
          return cat ? cat.name : 'Boshqa';
        }),
        series: expensesByCategory.map(e => Number(e._sum.amount || 0)),
      },
      courseDistribution: {
        labels: courses.map(c => c.name),
        series: courses.map(c => c._count.groups),
      },
      topTeachers: teachers.map((t) => ({
        id: t.id,
        name: `${t.firstName} ${t.lastName}`,
        groupsCount: t.taughtGroups.length,
        studentsCount: t.taughtGroups.reduce((acc, g) => acc + g._count.enrollments, 0),
        status: 'Active',
      })),
      recentPayments: recentPayments.map(p => ({
        id: p.id,
        studentName: p.student ? `${p.student.firstName} ${p.student.lastName}` : p.customer ? `${p.customer.firstName} ${p.customer.lastName}` : "Mijoz",
        cashboxName: p.cashbox?.name || 'Kassa',
        method: p.method,
        amount: Number(p.amount),
        paymentDate: p.paymentDate,
        receiptNumber: p.receiptNumber,
      })),
      debtorStudents: debtorStudents.map(s => ({
        id: s.id,
        name: `${s.lastName} ${s.firstName}`,
        className: s.enrollments && s.enrollments[0] ? s.enrollments[0].group.name : 'Guruhsiz',
        debtAmount: Math.abs(Number(s.balance)),
        phone: s.phone,
      })),
      todaySchedules: todaySchedules.map(s => ({
        id: s.id,
        title: s.title,
        groupName: s.group?.name || 'Guruh',
        instructorName: s.instructor ? `${s.instructor.firstName} ${s.instructor.lastName}` : 'O\'qituvchi',
        resourceName: s.resource?.name || 'Xona',
        startAt: s.startAt,
        endAt: s.endAt,
      })),
      groups: groups.map(g => ({
        id: g.id,
        name: g.name,
        courseName: g.course?.name || 'Kurs',
        teacher: g.teacher ? `${g.teacher.firstName} ${g.teacher.lastName}` : 'Belgilanmagan',
        roomName: g.room?.name || 'Belgilanmagan',
        studentsCount: g._count.enrollments,
        status: g.status,
        days: g.days,
        time: `${g.startTime} - ${g.endTime}`,
        boysCount: g.enrollments.filter(e => e.student && e.student.gender === 'MALE').length,
        girlsCount: g.enrollments.filter(e => e.student && e.student.gender === 'FEMALE').length,
      })),
    };
  }

  async getWidgets(role: string | undefined, orgId: string, branchCtx?: BranchContext) {
    const stats = await this.getStats(orgId, undefined, branchCtx);

    const standardWidgets = [
      {
        id: 'revenue',
        title: 'Umumiy Tushum',
        type: 'FINANCE',
        data: {
          totalRevenue: stats.totalRevenue,
          monthlyRevenue: stats.monthlyRevenue,
          netProfit: stats.netProfit,
        },
      },
      {
        id: 'expenses',
        title: 'Xarajatlar Tahlili',
        type: 'FINANCE',
        data: {
          totalExpenses: stats.totalExpenses,
          categories: stats.expenseCategories,
        },
      },
      {
        id: 'students_customers',
        title: 'O\'quvchilar va Mijozlar',
        type: 'AUDIENCE',
        data: {
          totalStudents: stats.totalStudents,
          totalCustomers: stats.totalCustomers,
          activeGroups: stats.activeGroups,
          coursesCount: stats.coursesCount,
        },
      },
      {
        id: 'leads',
        title: 'Lidlar va CRM Konversiyasi',
        type: 'CRM',
        data: {
          totalLeads: stats.totalLeads,
          enrolledLeads: stats.enrolledLeads,
          conversionRate: stats.leadConversionRate,
        },
      },
      {
        id: 'attendance',
        title: 'Davomat Tahlili',
        type: 'ACADEMIC',
        data: {
          attendanceRate: stats.attendanceRate,
          attendancesCount: stats.attendancesCount,
        },
      },
      {
        id: 'debt',
        title: 'Qarzdorliklar',
        type: 'FINANCE',
        data: {
          debtorsCount: stats.debtorsCount,
          totalDebt: stats.totalDebt,
          debtors: stats.debtorStudents,
        },
      },
      {
        id: 'schedule',
        title: 'Bugungi Dars va Jadval',
        type: 'SCHEDULE',
        data: {
          todaySchedules: stats.todaySchedules,
        },
      },
      {
        id: 'payments',
        title: 'Oxirgi To\'lovlar',
        type: 'FINANCE',
        data: {
          recentPayments: stats.recentPayments,
        },
      },
    ];

    if (role === 'TEACHER') {
      return standardWidgets.filter(w => ['students_customers', 'attendance', 'schedule'].includes(w.id));
    }
    if (role === 'CASHIER') {
      return standardWidgets.filter(w => ['revenue', 'expenses', 'debt', 'payments'].includes(w.id));
    }

    return standardWidgets;
  }
}
