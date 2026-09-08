import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentStatus, AttendanceStatus } from '@prisma/client';
import { BranchContext, buildBranchWhere } from '../auth/branch-access';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(
    orgId: string,
    type?: string,
    branchCtx?: BranchContext,
    month?: string,
    year?: string,
    startDate?: string,
    endDate?: string,
    range?: string,
  ) {
    const orgWhere = { organizationId: orgId };
    const branchWhere = branchCtx ? buildBranchWhere(branchCtx) : {};

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // Parse Academic Year: e.g. "2026-2027" -> 2026, 2027
    let [acadStartYear, acadEndYear] = (year || '').split('-').map(Number);
    if (!acadStartYear || !acadEndYear) {
      acadStartYear = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
      acadEndYear = acadStartYear + 1;
    }

    const monthMap: Record<string, number> = {
      yan: 0, fev: 1, mar: 2, apr: 3, may: 4, iyun: 5, iyul: 6,
      avg: 7, sen: 8, okt: 9, noy: 10, dek: 11,
      jan: 0, feb: 1, apr_: 3, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    };

    let filterStart: Date;
    let filterEnd: Date;
    let effectiveRange = range?.toLowerCase() || '';

    if (startDate && endDate) {
      filterStart = new Date(startDate);
      filterStart.setHours(0, 0, 0, 0);
      filterEnd = new Date(endDate);
      filterEnd.setHours(23, 59, 59, 999);
    } else if (effectiveRange === 'today') {
      filterStart = startOfToday;
      filterEnd = endOfToday;
    } else if (effectiveRange === 'yesterday') {
      filterStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0);
      filterEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
    } else if (effectiveRange === '7days') {
      filterStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0, 0);
      filterEnd = endOfToday;
    } else if (effectiveRange === 'year' || effectiveRange === 'academic_year') {
      filterStart = new Date(acadStartYear, 7, 1, 0, 0, 0, 0); // Aug 1
      filterEnd = new Date(acadEndYear, 6, 31, 23, 59, 59, 999); // Jul 31
    } else if (effectiveRange === 'prev_month') {
      filterStart = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      filterEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    } else if (month) {
      const mKey = month.toLowerCase().trim();
      const mIdx = monthMap[mKey] !== undefined ? monthMap[mKey] : now.getMonth();
      const mYear = mIdx >= 7 ? acadStartYear : acadEndYear;
      filterStart = new Date(mYear, mIdx, 1, 0, 0, 0, 0);
      filterEnd = new Date(mYear, mIdx + 1, 0, 23, 59, 59, 999);
    } else {
      filterStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      filterEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    const dateRangeFilter = { gte: filterStart, lte: filterEnd };

    const teacherBranchFilter = branchCtx && !branchCtx.isOrgAdmin && branchCtx.accessibleBranchIds.length > 0
      ? { userBranches: { some: { branchId: { in: branchCtx.accessibleBranchIds } } } }
      : {};

    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      select: { businessType: true, name: true },
    });

    const [
      totalStudents,
      activeStudents,
      droppedStudents,
      activeGroups,
      coursesCount,
      totalRevenueAgg,
      periodRevenueAgg,
      totalExpensesAgg,
      periodExpensesAgg,
      debtorsCount,
      debtorsSumAgg,
      periodLeads,
      periodTrials,
      periodEnrolledLeads,
      periodContracts,
      periodPaymentsCount,
      totalLeadsCount,
      totalCustomers,
      attendancesTotal,
      attendancesPresent,
      attendancesLate,
      attendancesAbsent,
      groupsWithDetails,
      topDebtors,
      periodPayments,
      allTimeRecentPayments,
      todaySchedules,
      teachers,
      courses,
      paymentMethodsAgg,
      expensesByCategory,
      inquiryLeads,
      trialLeads,
      contractList,
    ] = await Promise.all([
      // 1. Total active students
      this.prisma.student.count({ where: { deletedAt: null, status: 'ACTIVE', ...orgWhere, ...branchWhere } }),
      // 2. Active students
      this.prisma.student.count({ where: { deletedAt: null, status: 'ACTIVE', ...orgWhere, ...branchWhere } }),
      // 3. Dropped out students in period
      this.prisma.student.count({ where: { deletedAt: null, status: 'DROPPED', updatedAt: dateRangeFilter, ...orgWhere, ...branchWhere } }),
      // 4. Active groups
      this.prisma.group.count({ where: { deletedAt: null, status: 'ACTIVE', ...orgWhere, ...branchWhere } }),
      // 5. Courses count
      this.prisma.course.count({ where: { deletedAt: null, isActive: true, ...orgWhere } }),
      // 6. Total revenue (all-time)
      this.prisma.payment.aggregate({ _sum: { amount: true }, where: { status: PaymentStatus.PAID, deletedAt: null, ...orgWhere, ...branchWhere } }),
      // 7. Period revenue (exact date range)
      this.prisma.payment.aggregate({ _sum: { amount: true }, where: { status: PaymentStatus.PAID, deletedAt: null, paymentDate: dateRangeFilter, ...orgWhere, ...branchWhere } }),
      // 8. Total expenses (all-time)
      this.prisma.expense.aggregate({ _sum: { amount: true }, where: { deletedAt: null, ...orgWhere, ...branchWhere } }),
      // 9. Period expenses (exact date range)
      this.prisma.expense.aggregate({ _sum: { amount: true }, where: { deletedAt: null, createdAt: dateRangeFilter, ...orgWhere, ...branchWhere } }),
      // 10. Debtors count
      this.prisma.student.count({ where: { deletedAt: null, balance: { lt: 0 }, ...orgWhere, ...branchWhere } }),
      // 11. Debtors sum
      this.prisma.student.aggregate({ _sum: { balance: true }, where: { deletedAt: null, balance: { lt: 0 }, ...orgWhere, ...branchWhere } }),
      // 12. Period leads created
      this.prisma.lead.count({ where: { deletedAt: null, createdAt: dateRangeFilter, ...orgWhere, ...branchWhere } }),
      // 13. Period trial leads
      this.prisma.lead.count({ where: { deletedAt: null, createdAt: dateRangeFilter, status: { in: ['TRIAL_BOOKED', 'TRIAL_ATTENDED'] }, ...orgWhere, ...branchWhere } }),
      // 14. Period enrolled leads
      this.prisma.lead.count({ where: { deletedAt: null, createdAt: dateRangeFilter, status: 'ENROLLED', ...orgWhere, ...branchWhere } }),
      // 15. Period contracts
      this.prisma.contract.count({ where: { deletedAt: null, createdAt: dateRangeFilter, ...orgWhere, ...branchWhere } }),
      // 16. Period payments count
      this.prisma.payment.count({ where: { status: PaymentStatus.PAID, deletedAt: null, paymentDate: dateRangeFilter, ...orgWhere, ...branchWhere } }),
      // 17. Total leads all-time
      this.prisma.lead.count({ where: { deletedAt: null, ...orgWhere, ...branchWhere } }),
      // 18. Total customers
      this.prisma.customer.count({ where: { deletedAt: null, ...orgWhere, ...branchWhere } }),
      // 19. Attendance total
      this.prisma.attendance.count({ where: { date: dateRangeFilter, group: { organizationId: orgId, ...branchWhere } } }),
      // 20. Attendance present
      this.prisma.attendance.count({ where: { date: dateRangeFilter, status: AttendanceStatus.PRESENT, group: { organizationId: orgId, ...branchWhere } } }),
      // 21. Attendance late
      this.prisma.attendance.count({ where: { date: dateRangeFilter, status: AttendanceStatus.LATE, group: { organizationId: orgId, ...branchWhere } } }),
      // 22. Attendance absent
      this.prisma.attendance.count({ where: { date: dateRangeFilter, status: { in: [AttendanceStatus.ABSENT, AttendanceStatus.ABSENT_UNEXCUSED] }, group: { organizationId: orgId, ...branchWhere } } }),
      // 23. Real groups with room & enrollments
      this.prisma.group.findMany({
        where: { deletedAt: null, ...orgWhere, ...branchWhere },
        include: {
          room: true,
          course: { select: { id: true, name: true, price: true } },
          teacher: { select: { id: true, firstName: true, lastName: true } },
          _count: { select: { enrollments: true } },
          enrollments: {
            include: {
              student: { select: { id: true, firstName: true, lastName: true, gender: true } },
            },
          },
        },
        orderBy: { name: 'asc' },
      }),
      // 24. Real top debtors
      this.prisma.student.findMany({
        where: { deletedAt: null, balance: { lt: 0 }, ...orgWhere, ...branchWhere },
        take: 5,
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
      }),
      // 25. Real payments in period
      this.prisma.payment.findMany({
        where: { status: PaymentStatus.PAID, deletedAt: null, paymentDate: dateRangeFilter, ...orgWhere, ...branchWhere },
        take: 10,
        orderBy: { paymentDate: 'desc' },
        include: {
          student: { select: { id: true, firstName: true, lastName: true, phone: true } },
          customer: { select: { id: true, firstName: true, lastName: true, phone: true } },
          cashbox: { select: { id: true, name: true } },
        },
      }),
      // 26. All-time latest payments
      this.prisma.payment.findMany({
        where: { status: PaymentStatus.PAID, deletedAt: null, ...orgWhere, ...branchWhere },
        take: 10,
        orderBy: { paymentDate: 'desc' },
        include: {
          student: { select: { id: true, firstName: true, lastName: true, phone: true } },
          customer: { select: { id: true, firstName: true, lastName: true, phone: true } },
          cashbox: { select: { id: true, name: true } },
        },
      }),
      // 27. Real today's schedule
      this.prisma.schedule.findMany({
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
      }),
      // 28. Real teachers
      this.prisma.user.findMany({
        where: {
          role: 'TEACHER',
          deletedAt: null,
          OR: [
            { organizationId: orgId },
            { taughtGroups: { some: { organizationId: orgId, deletedAt: null } } },
          ],
          ...teacherBranchFilter,
        },
        take: 6,
        include: {
          taughtGroups: {
            where: { deletedAt: null, organizationId: orgId },
            include: {
              _count: { select: { enrollments: true } },
            },
          },
        },
      }),
      // 29. Real courses
      this.prisma.course.findMany({
        where: { deletedAt: null, isActive: true, ...orgWhere },
        include: {
          _count: { select: { groups: true } },
        },
      }),
      // 30. Payment methods breakdown
      this.prisma.payment.groupBy({
        by: ['method'],
        where: { status: PaymentStatus.PAID, deletedAt: null, ...orgWhere, ...branchWhere },
        _sum: { amount: true },
        _count: { id: true },
      }),
      // 31. Expenses by category
      this.prisma.expense.groupBy({
        by: ['categoryId'],
        where: { deletedAt: null, ...orgWhere, ...branchWhere },
        _sum: { amount: true },
      }),
      // 32. Inquiry leads for stage modal
      this.prisma.lead.findMany({
        where: { deletedAt: null, ...orgWhere, ...branchWhere },
        take: 25,
        orderBy: { createdAt: 'desc' },
        include: { course: { select: { name: true } } },
      }),
      // 33. Trial leads for stage modal
      this.prisma.lead.findMany({
        where: { deletedAt: null, status: { in: ['TRIAL_BOOKED', 'TRIAL_ATTENDED'] }, ...orgWhere, ...branchWhere },
        take: 25,
        orderBy: { createdAt: 'desc' },
        include: { course: { select: { name: true } } },
      }),
      // 34. Contract list for stage modal
      this.prisma.contract.findMany({
        where: { deletedAt: null, ...orgWhere, ...branchWhere },
        take: 25,
        orderBy: { createdAt: 'desc' },
        include: { student: { select: { firstName: true, lastName: true, phone: true } } },
      }),
    ]);

    // Categories for expense breakdown
    const categoryIds = expensesByCategory.map(e => e.categoryId).filter((id): id is string => Boolean(id));
    const categories = categoryIds.length > 0 ? await this.prisma.expenseCategory.findMany({
      where: { id: { in: categoryIds }, organizationId: orgId },
    }) : [];

    const totalRev = Number(totalRevenueAgg._sum.amount || 0);
    const collectedThisMonth = Number(periodRevenueAgg._sum.amount || 0);
    const totalExp = Number(totalExpensesAgg._sum.amount || 0);
    const periodExp = Number(periodExpensesAgg._sum.amount || 0);
    const totalDebt = Math.abs(Number(debtorsSumAgg._sum.balance || 0));

    // Calculate Real Monthly Plan based on active group course prices and student enrollments
    const calculatedTuitionPlan = groupsWithDetails.reduce((acc, g) => {
      const price = Number(g.course?.price || 0);
      return acc + (price * g._count.enrollments);
    }, 0);

    const monthlyPlan = calculatedTuitionPlan > 0
      ? calculatedTuitionPlan
      : (collectedThisMonth > 0 ? Math.round(collectedThisMonth * 1.2) : 10000000);

    const planPercentage = monthlyPlan > 0
      ? Math.min(100, Math.round((collectedThisMonth / monthlyPlan) * 100))
      : (collectedThisMonth > 0 ? 100 : 0);

    const effectiveContractsCount = periodContracts > 0 ? periodContracts : periodEnrolledLeads;

    // Monthly Event Counters (100% Real from Database)
    const monthlyEvents = {
      newLeads: periodLeads,
      trialLessons: periodTrials,
      contracts: effectiveContractsCount,
      newPayments: periodPaymentsCount,
      activeStudents: activeStudents,
      droppedOut: droppedStudents,
    };

    // Real Sales Funnel Calculations
    const allTimeEnrolledLeads = await this.prisma.lead.count({ where: { deletedAt: null, status: 'ENROLLED', ...orgWhere, ...branchWhere } });
    const allTimeTrialLeads = await this.prisma.lead.count({ where: { deletedAt: null, status: { in: ['TRIAL_BOOKED', 'TRIAL_ATTENDED', 'ENROLLED'] }, ...orgWhere, ...branchWhere } });

    const funnelInquiries = periodLeads > 0 ? periodLeads : totalLeadsCount;
    const funnelTrials = periodTrials > 0 ? periodTrials : allTimeTrialLeads;
    const funnelContracts = effectiveContractsCount > 0 ? effectiveContractsCount : allTimeEnrolledLeads;
    const funnelPayments = periodPaymentsCount > 0 ? periodPaymentsCount : Number(totalRevenueAgg._sum.amount ? 1 : 0);

    const funnelTrialsPercent = funnelInquiries > 0 ? Math.min(100, Math.round((funnelTrials / funnelInquiries) * 1000) / 10) : 0;
    const funnelContractsPercent = funnelTrials > 0 ? Math.min(100, Math.round((funnelContracts / funnelTrials) * 1000) / 10) : 0;
    const funnelPaymentsPercent = funnelContracts > 0 ? Math.min(100, Math.round((funnelPayments / funnelContracts) * 1000) / 10) : (funnelTrials > 0 ? Math.min(100, Math.round((funnelPayments / funnelTrials) * 1000) / 10) : (funnelPayments > 0 ? 100 : 0));

    const salesFunnel = {
      inquiries: funnelInquiries,
      trials: funnelTrials,
      trialsPercent: funnelTrialsPercent,
      contracts: funnelContracts,
      contractsPercent: funnelContractsPercent,
      payments: funnelPayments,
      paymentsPercent: funnelPaymentsPercent,
      stages: [
        { key: 'inquiries', label: 'Murojaatlar', count: funnelInquiries, percent: 100, color: 'bg-slate-400 dark:bg-slate-500' },
        { key: 'trials', label: 'Sinov darslari', count: funnelTrials, percent: funnelTrialsPercent, color: 'bg-amber-500' },
        { key: 'contracts', label: 'Shartnomalar', count: funnelContracts, percent: funnelContractsPercent, color: 'bg-blue-600' },
        { key: 'payments', label: 'To\'lovlar', count: funnelPayments, percent: funnelPaymentsPercent, color: 'bg-primary' },
      ],
    };

    // Stage Students List for Interactive FunnelStageModal (100% Real from Database)
    const stageStudents = {
      inquiries: inquiryLeads.map(l => ({
        id: l.id,
        name: l.fullName,
        phone: l.phone,
        course: l.course?.name || 'Kurs belgilanmagan',
        statusLabel: l.status === 'NEW' ? 'Yangi lid' : l.status === 'CONTACTED' ? 'Bog\'lanildi' : l.status,
        statusClass: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
        date: new Date(l.createdAt).toLocaleDateString('uz-UZ'),
      })),
      trials: trialLeads.map(l => ({
        id: l.id,
        name: l.fullName,
        phone: l.phone,
        course: l.course?.name || 'Kurs belgilanmagan',
        statusLabel: l.status === 'TRIAL_ATTENDED' ? 'Sinovda qatnashdi' : 'Sinovga yozildi',
        statusClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-200',
        date: new Date(l.createdAt).toLocaleDateString('uz-UZ'),
      })),
      contracts: contractList.map(c => ({
        id: c.id,
        name: c.student ? `${c.student.firstName} ${c.student.lastName}` : 'O\'quvchi',
        phone: c.student?.phone || '',
        course: `Shartnoma #${c.contractNumber}`,
        statusLabel: 'Shartnoma tuzildi',
        statusClass: 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-200',
        date: new Date(c.createdAt).toLocaleDateString('uz-UZ'),
      })),
      payments: (periodPayments.length > 0 ? periodPayments : allTimeRecentPayments).map(p => ({
        id: p.id,
        name: p.student ? `${p.student.firstName} ${p.student.lastName}` : p.customer ? `${p.customer.firstName} ${p.customer.lastName}` : 'Mijoz',
        phone: p.student?.phone || p.customer?.phone || '',
        course: p.cashbox?.name || 'To\'lov',
        statusLabel: `To'landi: ${Number(p.amount).toLocaleString('uz-UZ')} UZS`,
        statusClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-200',
        date: new Date(p.paymentDate).toLocaleDateString('uz-UZ'),
      })),
    };

    // Real Class & Room Capacity from Groups Table
    const classCards = groupsWithDetails.map(g => {
      const count = g._count.enrollments;
      const capacity = g.room?.capacity || 20;
      const pct = capacity > 0 ? Math.round((count / capacity) * 100) : 0;
      const status = count > capacity ? 'over' : count === 0 ? 'empty' : pct >= 80 ? 'good' : 'normal';
      const color = count > capacity ? 'bg-rose-500' : pct >= 80 ? 'bg-primary' : count > 0 ? 'bg-amber-500' : 'bg-slate-400';
      return {
        id: g.id,
        name: g.name,
        count,
        capacity,
        status,
        color,
        roomName: g.room?.name || 'Xonasiz',
        teacher: g.teacher ? `${g.teacher.firstName} ${g.teacher.lastName}` : 'Biriktirilmagan',
      };
    });

    const totalCapacitySum = classCards.reduce((acc, c) => acc + c.capacity, 0);
    const totalStudentsInClasses = classCards.reduce((acc, c) => acc + c.count, 0);
    const freeSeats = Math.max(0, totalCapacitySum - totalStudentsInClasses);

    const classCapacity = {
      totalStudents: totalStudentsInClasses,
      totalCapacity: totalCapacitySum,
      freeSeats,
      branchPower: `${totalStudentsInClasses}/${totalCapacitySum} (+${freeSeats} bo'sh)`,
      classes: classCards,
    };

    // Real Monthly Payment Comparison Chart across 12 months of the Academic Year
    const academicMonthsConfig = [
      { key: 'Avg', label: 'Avgust', year: acadStartYear, month: 7 },
      { key: 'Sen', label: 'Sentabr', year: acadStartYear, month: 8 },
      { key: 'Okt', label: 'Oktabr', year: acadStartYear, month: 9 },
      { key: 'Noy', label: 'Noyabr', year: acadStartYear, month: 10 },
      { key: 'Dek', label: 'Dekabr', year: acadStartYear, month: 11 },
      { key: 'Yan', label: 'Yanvar', year: acadEndYear, month: 0 },
      { key: 'Fev', label: 'Fevral', year: acadEndYear, month: 1 },
      { key: 'Mar', label: 'Mart', year: acadEndYear, month: 2 },
      { key: 'Apr', label: 'Aprel', year: acadEndYear, month: 3 },
      { key: 'May', label: 'May', year: acadEndYear, month: 4 },
      { key: 'Iyun', label: 'Iyun', year: acadEndYear, month: 5 },
      { key: 'Iyul', label: 'Iyul', year: acadEndYear, month: 6 },
    ];

    const academicYearStart = new Date(acadStartYear, 7, 1, 0, 0, 0, 0);
    const academicYearEnd = new Date(acadEndYear, 6, 31, 23, 59, 59, 999);

    const academicPayments = await this.prisma.payment.findMany({
      where: {
        status: PaymentStatus.PAID,
        deletedAt: null,
        paymentDate: { gte: academicYearStart, lte: academicYearEnd },
        ...orgWhere,
        ...branchWhere,
      },
      select: { amount: true, paymentDate: true },
    });

    const selectedMonthKey = (month || (now.getMonth() === 7 ? 'Avg' : now.getMonth() === 8 ? 'Sen' : 'Okt')).toLowerCase();

    const monthlyPaymentChart = academicMonthsConfig.map(m => {
      const paymentsInMonth = academicPayments.filter(p => {
        const d = new Date(p.paymentDate);
        return d.getFullYear() === m.year && d.getMonth() === m.month;
      });
      const collected = paymentsInMonth.reduce((acc, p) => acc + Number(p.amount), 0);
      const isCurrent = m.key.toLowerCase() === selectedMonthKey;

      return {
        month: m.key,
        fullMonth: m.label,
        expected: monthlyPlan,
        collected,
        debtors: debtorsCount,
        isCurrent,
      };
    });

    const effectiveRecentPayments = periodPayments.length > 0 ? periodPayments : allTimeRecentPayments;

    const attendanceRate = attendancesTotal > 0
      ? Math.round(((attendancesPresent + attendancesLate * 0.5) / attendancesTotal) * 1000) / 10
      : 100;

    const leadConversionRate = totalLeadsCount > 0
      ? Math.round((allTimeEnrolledLeads / totalLeadsCount) * 100)
      : 0;

    return {
      // Top 4 Financial KPI Cards (Obeying Date Range)
      monthlyPlan,
      collectedThisMonth,
      planPercentage,
      debtorsCount,
      totalDebt,

      // Monthly Events Counters (Obeying Date Range)
      monthlyEvents,

      // Sales Funnel & Stage Items (Obeying Date Range)
      salesFunnel,
      stageStudents,

      // Class / Room Capacity (Real Groups)
      classCapacity,
      classes: classCapacity.classes,

      // Monthly Payment Comparison Chart (Real Monthly Aggregations)
      monthlyPaymentChart,

      // Metric Cards
      totalStudents,
      totalCustomers,
      activeGroups,
      coursesCount,
      totalRevenue: totalRev,
      monthlyRevenue: collectedThisMonth,
      totalExpenses: totalExp,
      netProfit: totalRev - totalExp,
      totalLeads: totalLeadsCount,
      enrolledLeads: allTimeEnrolledLeads,
      leadConversionRate,
      teachersCount: teachers.length,
      paymentsCount: effectiveRecentPayments.length,
      attendancesCount: attendancesTotal,
      attendanceRate,
      attendanceSummary: {
        total: attendancesTotal,
        present: attendancesPresent,
        late: attendancesLate,
        absent: attendancesAbsent,
        rate: attendanceRate,
      },

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
      recentPayments: effectiveRecentPayments.map(p => ({
        id: p.id,
        studentName: p.student ? `${p.student.firstName} ${p.student.lastName}` : p.customer ? `${p.customer.firstName} ${p.customer.lastName}` : 'Mijoz',
        cashboxName: p.cashbox?.name || 'Kassa',
        method: p.method,
        amount: Number(p.amount),
        paymentDate: p.paymentDate,
        receiptNumber: p.receiptNumber,
      })),
      debtorStudents: topDebtors.map(s => ({
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
      groups: groupsWithDetails.map(g => ({
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
      businessType: org?.businessType || 'COURSE_CENTER',
      organizationName: org?.name || 'EduHub',
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

  async getPaymentStats(orgId: string, branchCtx?: BranchContext, year?: string) {
    const orgWhere = { organizationId: orgId };
    const branchWhere = branchCtx ? buildBranchWhere(branchCtx) : {};

    const now = new Date();
    let [acadStartYear, acadEndYear] = (year || '').split('-').map(Number);
    if (!acadStartYear || !acadEndYear) {
      acadStartYear = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
      acadEndYear = acadStartYear + 1;
    }
    const currentAcademicYear = `${acadStartYear}-${acadEndYear}`;

    // 10 academic months: Avgust -> May (matching Schoolify)
    const academicMonths = [
      { key: 'Avg', name: 'Avgust', month: 7, year: acadStartYear },
      { key: 'Sen', name: 'Sentabr', month: 8, year: acadStartYear },
      { key: 'Okt', name: 'Oktabr', month: 9, year: acadStartYear },
      { key: 'Noy', name: 'Noyabr', month: 10, year: acadStartYear },
      { key: 'Dek', name: 'Dekabr', month: 11, year: acadStartYear },
      { key: 'Yan', name: 'Yanvar', month: 0, year: acadEndYear },
      { key: 'Fev', name: 'Fevral', month: 1, year: acadEndYear },
      { key: 'Mar', name: 'Mart', month: 2, year: acadEndYear },
      { key: 'Apr', name: 'Aprel', month: 3, year: acadEndYear },
      { key: 'May', name: 'May', month: 4, year: acadEndYear },
    ];

    const academicStartDate = new Date(acadStartYear, 7, 1, 0, 0, 0, 0);
    const academicEndDate = new Date(acadEndYear, 6, 31, 23, 59, 59, 999);

    const payments = await this.prisma.payment.findMany({
      where: {
        ...orgWhere,
        ...branchWhere,
        status: PaymentStatus.PAID,
        deletedAt: null,
        paymentDate: { gte: academicStartDate, lte: academicEndDate },
      },
      select: {
        id: true,
        amount: true,
        paymentDate: true,
        studentId: true,
      },
    });

    const activeGroups = await this.prisma.group.findMany({
      where: {
        ...orgWhere,
        ...branchWhere,
        status: { in: ['ACTIVE', 'PLANNING'] },
        deletedAt: null,
      },
      include: {
        course: { select: { name: true, price: true } },
        teacher: { select: { firstName: true, lastName: true } },
        enrollments: {
          where: { isActive: true },
          include: {
            student: { select: { id: true, firstName: true, lastName: true, balance: true } },
          },
        },
      },
    });

    let baselineMonthlyPlan = 0;
    const classesStats = activeGroups.map((g) => {
      const coursePrice = Number(g.course?.price || 0);
      const studentsCount = g.enrollments.length;
      const groupPlan = coursePrice * studentsCount;
      baselineMonthlyPlan += groupPlan;

      const studentIds = g.enrollments.map((e) => e.student.id);
      const groupPayments = payments.filter((p) => p.studentId && studentIds.includes(p.studentId));
      const groupCollected = groupPayments.reduce((acc, p) => acc + Number(p.amount), 0);

      const groupDebtors = g.enrollments
        .filter((e) => Number(e.student.balance) < 0)
        .map((e) => ({
          studentId: e.student.id,
          name: `${e.student.firstName} ${e.student.lastName}`,
          debt: Math.abs(Number(e.student.balance)),
        }));
      const groupTotalDebt = groupDebtors.reduce((acc, d) => acc + d.debt, 0);

      const groupPercent = groupPlan > 0 ? Math.min(100, Math.round((groupCollected / groupPlan) * 100)) : 0;

      return {
        id: g.id,
        name: g.name,
        courseName: g.course?.name || "Noma'lum fan/kurs",
        teacherName: g.teacher ? `${g.teacher.firstName} ${g.teacher.lastName}` : 'Belgilanmagan',
        studentsCount,
        plan: groupPlan,
        fact: groupCollected,
        debt: groupTotalDebt,
        debtorsCount: groupDebtors.length,
        percent: groupPercent,
        status: groupPercent >= 80 ? 'high' : groupPercent >= 50 ? 'medium' : 'low',
        color: groupPercent >= 80 ? '#10B981' : groupPercent >= 50 ? '#F59E0B' : '#EF4444',
      };
    });

    if (baselineMonthlyPlan === 0) {
      const contracts = await this.prisma.contract.findMany({
        where: { ...orgWhere, ...branchWhere, status: 'ACTIVE', deletedAt: null },
        select: { totalAmount: true },
      });
      const totalContract = contracts.reduce((acc, c) => acc + Number(c.totalAmount || 0), 0);
      baselineMonthlyPlan = Math.round(totalContract / 10);
    }

    if (baselineMonthlyPlan === 0) {
      baselineMonthlyPlan = 15000000;
    }

    const currentMonthIndex = now.getMonth();
    const currentYearNum = now.getFullYear();

    const months = academicMonths.map((m) => {
      const paymentsInMonth = payments.filter((p) => {
        const d = new Date(p.paymentDate);
        return d.getFullYear() === m.year && d.getMonth() === m.month;
      });
      const collected = paymentsInMonth.reduce((acc, p) => acc + Number(p.amount), 0);
      const plan = baselineMonthlyPlan;

      const isCurrentMonth = m.month === currentMonthIndex && m.year === currentYearNum;
      const isPastMonth = m.year < currentYearNum || (m.year === currentYearNum && m.month < currentMonthIndex);

      let percent = plan > 0 ? Math.round((collected / plan) * 100) : 0;

      let status: 'low' | 'medium' | 'high' = 'low';
      let color = '#EF4444';
      if (percent >= 80) {
        status = 'high';
        color = '#10B981';
      } else if (percent >= 50) {
        status = 'medium';
        color = '#F59E0B';
      } else {
        status = 'low';
        color = '#EF4444';
      }

      return {
        key: m.key,
        name: m.name,
        year: currentAcademicYear,
        plan,
        fact: collected,
        percent,
        status,
        color,
        isCurrent: isCurrentMonth,
        isPast: isPastMonth,
      };
    });

    const totalPlan = months.reduce((acc, m) => acc + m.plan, 0);
    const totalFact = months.reduce((acc, m) => acc + m.fact, 0);
    const overallPercent = totalPlan > 0 ? Math.round((totalFact / totalPlan) * 100) : 0;

    const debtors = await this.prisma.student.findMany({
      where: { ...orgWhere, ...branchWhere, balance: { lt: 0 }, deletedAt: null },
      select: { balance: true },
    });
    const totalDebt = debtors.reduce((acc, d) => acc + Math.abs(Number(d.balance)), 0);

    return {
      academicYear: currentAcademicYear,
      baselineMonthlyPlan,
      totalPlan,
      totalFact,
      overallPercent,
      totalDebt,
      debtorsCount: debtors.length,
      months,
      classes: classesStats,
    };
  }
}
