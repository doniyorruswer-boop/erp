import {
  PrismaClient,
  Role,
  LessonDays,
  GroupStatus,
  StudentStatus,
  PaymentMethod,
  PaymentCategory,
  BusinessType,
  LeadStatus,
  AttendanceStatus,
} from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const APPROVED_SLUGS = ["educrm-markaziy", "profi-maktab", "yulduzcha-bogcha", "universal-servis"];

async function cleanupTestOrganizations() {
  console.log("🧹 Test va begona tashkilotlar tozalanmoqda...");
  const allOrgs = await prisma.organization.findMany({
    select: { id: true, slug: true, name: true },
  });

  for (const org of allOrgs) {
    if (!APPROVED_SLUGS.includes(org.slug)) {
      console.log(`  ❌ O'chirilmoqda: ${org.name} (${org.slug})`);
      try {
        await prisma.organization.delete({ where: { id: org.id } });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn(`    Xatolik o'chirishda (${org.slug}):`, message);
      }
    }
  }
}

async function main() {
  console.log("🌱 Rasmiy 4 ta ta'lim muassasasi uchun real ma'lumotlar to'ldirilmoqda...");

  // 1. Delete any unapproved test orgs
  await cleanupTestOrganizations();

  // 2. Clean previous data for approved orgs to guarantee 100% clean isolation & zero duplicates
  console.log(
    "🧹 Tasdiqlangan tashkilotlar ichidagi eski ma'lumotlar toza holatga keltirilmoqda..."
  );
  for (const slug of APPROVED_SLUGS) {
    const org = await prisma.organization.findUnique({ where: { slug } });
    if (org) {
      await prisma.payment.deleteMany({ where: { organizationId: org.id } });
      await prisma.attendance.deleteMany({ where: { group: { organizationId: org.id } } });
      await prisma.contract.deleteMany({ where: { organizationId: org.id } });
      await prisma.groupEnrollment.deleteMany({ where: { group: { organizationId: org.id } } });
      await prisma.group.deleteMany({ where: { organizationId: org.id } });
      await prisma.student.deleteMany({ where: { organizationId: org.id } });
      await prisma.lead.deleteMany({ where: { organizationId: org.id } });
      await prisma.expense.deleteMany({ where: { organizationId: org.id } });
      await prisma.course.deleteMany({ where: { organizationId: org.id } });
      await prisma.room.deleteMany({ where: { organizationId: org.id } });
    }
  }

  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || "admin123";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  // 3. Super Admin User
  const superAdmin = await prisma.user.upsert({
    where: { phone: "+998901234567" },
    update: {
      email: "admin@eduhub.uz",
      password: passwordHash,
      failedLoginAttempts: 0,
      lockedUntil: null,
      isActive: true,
      role: Role.SUPER_ADMIN,
    },
    create: {
      firstName: "Alisher",
      lastName: "Navoiy",
      phone: "+998901234567",
      email: "admin@eduhub.uz",
      password: passwordHash,
      role: Role.SUPER_ADMIN,
    },
  });

  // =========================================================================
  // 1. EDUCRM MARKAZIY O'QUV MARKAZI (Course Center)
  // =========================================================================
  console.log("\n📘 1. EduCRM Markaziy O'quv Markazi ma'lumotlari yaratilmoqda...");
  const orgEdu = await prisma.organization.upsert({
    where: { slug: "educrm-markaziy" },
    update: {
      name: "EduCRM Markaziy O'quv Markazi",
      businessType: BusinessType.COURSE_CENTER,
      primaryColor: "#4F46E5",
      phone: "+998712009090",
      address: "Toshkent sh., Yunusobod t., Amir Temur ko'chasi 108",
      currency: "UZS",
      isSetupCompleted: true,
    },
    create: {
      id: "468c6978-c28f-488d-a56a-66131e38162c",
      name: "EduCRM Markaziy O'quv Markazi",
      slug: "educrm-markaziy",
      businessType: BusinessType.COURSE_CENTER,
      phone: "+998712009090",
      address: "Toshkent sh., Yunusobod t., Amir Temur ko'chasi 108",
      primaryColor: "#4F46E5",
      currency: "UZS",
      isSetupCompleted: true,
    },
  });

  await prisma.user.update({
    where: { id: superAdmin.id },
    data: { organizationId: orgEdu.id },
  });

  await prisma.systemConfig.upsert({
    where: { organizationId: orgEdu.id },
    update: {
      businessType: BusinessType.COURSE_CENTER,
      enabledModules: [
        "LEADS",
        "STUDENTS",
        "GROUPS",
        "COURSES",
        "ATTENDANCE",
        "FINANCE",
        "SMS",
        "PAYMENTS",
        "CONTRACTS",
      ],
      features: { contracts: true, trialLessons: true, gradingSystem: false },
      terminology: {
        groupLabel: "Guruh",
        courseLabel: "Kurs",
        studentLabel: "O'quvchi",
        teacherLabel: "Mentor",
      },
    },
    create: {
      organizationId: orgEdu.id,
      businessType: BusinessType.COURSE_CENTER,
      enabledModules: [
        "LEADS",
        "STUDENTS",
        "GROUPS",
        "COURSES",
        "ATTENDANCE",
        "FINANCE",
        "SMS",
        "PAYMENTS",
        "CONTRACTS",
      ],
      features: { contracts: true, trialLessons: true, gradingSystem: false },
      terminology: {
        groupLabel: "Guruh",
        courseLabel: "Kurs",
        studentLabel: "O'quvchi",
        teacherLabel: "Mentor",
      },
      integrations: {},
    },
  });

  const branchEdu = await prisma.branch.upsert({
    where: { organizationId_name: { organizationId: orgEdu.id, name: "Bosh Filial (Yunusobod)" } },
    update: {},
    create: {
      organizationId: orgEdu.id,
      name: "Bosh Filial (Yunusobod)",
      code: "YUN-01",
      address: "Yunusobod 4-mavze",
      phone: "+998712009090",
    },
  });

  let cashboxEdu = await prisma.cashbox.findFirst({ where: { organizationId: orgEdu.id } });
  if (!cashboxEdu) {
    cashboxEdu = await prisma.cashbox.create({
      data: {
        organizationId: orgEdu.id,
        branchId: branchEdu.id,
        name: "Asosiy Kassa",
        currency: "UZS",
        balance: 18500000,
      },
    });
  }

  const mentorJavohir = await prisma.user.upsert({
    where: { phone: "+998901110001" },
    update: { organizationId: orgEdu.id },
    create: {
      organizationId: orgEdu.id,
      firstName: "Javohir",
      lastName: "Qodirov",
      phone: "+998901110001",
      email: "javohir.q@educrm.uz",
      password: passwordHash,
      role: Role.TEACHER,
    },
  });

  const mentorMalika = await prisma.user.upsert({
    where: { phone: "+998901110002" },
    update: { organizationId: orgEdu.id },
    create: {
      organizationId: orgEdu.id,
      firstName: "Malika",
      lastName: "Karimova",
      phone: "+998901110002",
      email: "malika.k@educrm.uz",
      password: passwordHash,
      role: Role.TEACHER,
    },
  });

  const mentorAdxam = await prisma.user.upsert({
    where: { phone: "+998901110003" },
    update: { organizationId: orgEdu.id },
    create: {
      organizationId: orgEdu.id,
      firstName: "Adxam",
      lastName: "Rustamov",
      phone: "+998901110003",
      email: "adxam.r@educrm.uz",
      password: passwordHash,
      role: Role.TEACHER,
    },
  });

  const roomEdu101 = await prisma.room.create({
    data: { organizationId: orgEdu.id, branchId: branchEdu.id, name: "101 - IT Lab", capacity: 18 },
  });
  const roomEdu102 = await prisma.room.create({
    data: {
      organizationId: orgEdu.id,
      branchId: branchEdu.id,
      name: "102 - Speaking Club",
      capacity: 16,
    },
  });
  const roomEdu201 = await prisma.room.create({
    data: {
      organizationId: orgEdu.id,
      branchId: branchEdu.id,
      name: "201 - Intensive Room",
      capacity: 20,
    },
  });

  const cIelts = await prisma.course.create({
    data: {
      organizationId: orgEdu.id,
      name: "IELTS Intensive 7.5+",
      description: "Akademik IELTS 7.5+ tayyorgarlik kursi",
      price: 900000,
      duration: 3,
      lessonCount: 36,
    },
  });

  const cFrontend = await prisma.course.create({
    data: {
      organizationId: orgEdu.id,
      name: "Frontend React & Vue Bootcamp",
      description: "Zamonaviy veb dasturlash kursi",
      price: 1300000,
      duration: 6,
      lessonCount: 72,
    },
  });

  const cPython = await prisma.course.create({
    data: {
      organizationId: orgEdu.id,
      name: "Python & Django Backend",
      description: "Backend arxitekturasi va REST API",
      price: 1300000,
      duration: 5,
      lessonCount: 60,
    },
  });

  const cSat = await prisma.course.create({
    data: {
      organizationId: orgEdu.id,
      name: "SAT Matematika va Mantiq",
      description: "AQSh oliygohlariga tayyorlov",
      price: 850000,
      duration: 4,
      lessonCount: 48,
    },
  });

  const grpIelts = await prisma.group.create({
    data: {
      organizationId: orgEdu.id,
      branchId: branchEdu.id,
      name: "IELTS-201",
      courseId: cIelts.id,
      teacherId: mentorMalika.id,
      roomId: roomEdu201.id,
      days: LessonDays.ODD_DAYS,
      startTime: "09:00",
      endTime: "11:00",
      status: GroupStatus.ACTIVE,
    },
  });

  const grpFrontend = await prisma.group.create({
    data: {
      organizationId: orgEdu.id,
      branchId: branchEdu.id,
      name: "FE-Bootcamp-04",
      courseId: cFrontend.id,
      teacherId: mentorJavohir.id,
      roomId: roomEdu101.id,
      days: LessonDays.EVEN_DAYS,
      startTime: "14:00",
      endTime: "16:00",
      status: GroupStatus.ACTIVE,
    },
  });

  const grpPython = await prisma.group.create({
    data: {
      organizationId: orgEdu.id,
      branchId: branchEdu.id,
      name: "Python-PRO-02",
      courseId: cPython.id,
      teacherId: mentorJavohir.id,
      roomId: roomEdu101.id,
      days: LessonDays.ODD_DAYS,
      startTime: "16:30",
      endTime: "18:30",
      status: GroupStatus.ACTIVE,
    },
  });

  const grpSat = await prisma.group.create({
    data: {
      organizationId: orgEdu.id,
      branchId: branchEdu.id,
      name: "SAT-Math-10",
      courseId: cSat.id,
      teacherId: mentorAdxam.id,
      roomId: roomEdu102.id,
      days: LessonDays.EVEN_DAYS,
      startTime: "10:00",
      endTime: "12:00",
      status: GroupStatus.ACTIVE,
    },
  });

  const eduStudentsData = [
    {
      firstName: "Shoxrux",
      lastName: "Xalilov",
      phone: "+998901111001",
      grp: grpIelts.id,
      balance: 0,
      paid: 900000,
      fee: 900000,
    },
    {
      firstName: "Diyorbek",
      lastName: "Aliyev",
      phone: "+998901111002",
      grp: grpIelts.id,
      balance: -900000,
      paid: 0,
      fee: 900000,
    },
    {
      firstName: "Kamila",
      lastName: "Umarova",
      phone: "+998901111003",
      grp: grpIelts.id,
      balance: 0,
      paid: 900000,
      fee: 900000,
    },
    {
      firstName: "Farrux",
      lastName: "Toshpulatov",
      phone: "+998901111004",
      grp: grpFrontend.id,
      balance: 0,
      paid: 1300000,
      fee: 1300000,
    },
    {
      firstName: "Sevara",
      lastName: "Mahmudova",
      phone: "+998901111005",
      grp: grpFrontend.id,
      balance: -1300000,
      paid: 0,
      fee: 1300000,
    },
    {
      firstName: "Bobur",
      lastName: "Zokirov",
      phone: "+998901111006",
      grp: grpFrontend.id,
      balance: 0,
      paid: 1300000,
      fee: 1300000,
    },
    {
      firstName: "Azizbek",
      lastName: "Nurmatov",
      phone: "+998901111007",
      grp: grpFrontend.id,
      balance: 0,
      paid: 1300000,
      fee: 1300000,
    },
    {
      firstName: "Nilufar",
      lastName: "Qosimova",
      phone: "+998901111008",
      grp: grpPython.id,
      balance: 0,
      paid: 1300000,
      fee: 1300000,
    },
    {
      firstName: "Rustam",
      lastName: "Ibragimov",
      phone: "+998901111009",
      grp: grpPython.id,
      balance: -650000,
      paid: 650000,
      fee: 1300000,
    },
    {
      firstName: "Laylo",
      lastName: "Ergasheva",
      phone: "+998901111010",
      grp: grpPython.id,
      balance: 0,
      paid: 1300000,
      fee: 1300000,
    },
    {
      firstName: "Timur",
      lastName: "Ahmedov",
      phone: "+998901111011",
      grp: grpSat.id,
      balance: 0,
      paid: 850000,
      fee: 850000,
    },
    {
      firstName: "Shahzoda",
      lastName: "Yusupova",
      phone: "+998901111012",
      grp: grpSat.id,
      balance: -850000,
      paid: 0,
      fee: 850000,
    },
    {
      firstName: "Javohir",
      lastName: "Nematov",
      phone: "+998901111013",
      grp: grpSat.id,
      balance: 0,
      paid: 850000,
      fee: 850000,
    },
    {
      firstName: "Madina",
      lastName: "Karimova",
      phone: "+998901111014",
      grp: grpIelts.id,
      balance: 0,
      paid: 900000,
      fee: 900000,
    },
    {
      firstName: "Asadbek",
      lastName: "Mirzayev",
      phone: "+998901111015",
      grp: grpFrontend.id,
      balance: -1300000,
      paid: 0,
      fee: 1300000,
    },
  ];

  for (let i = 0; i < eduStudentsData.length; i++) {
    const s = eduStudentsData[i];
    const st = await prisma.student.create({
      data: {
        organizationId: orgEdu.id,
        branchId: branchEdu.id,
        firstName: s.firstName,
        lastName: s.lastName,
        phone: s.phone,
        balance: s.balance,
        status: StudentStatus.ACTIVE,
      },
    });

    await prisma.groupEnrollment.create({
      data: { groupId: s.grp, studentId: st.id },
    });

    const cnt = await prisma.contract.create({
      data: {
        organizationId: orgEdu.id,
        branchId: branchEdu.id,
        studentId: st.id,
        contractNumber: `EDU-2026/0${i + 1}`,
        totalAmount: s.fee * 6,
        status: "ACTIVE",
      },
    });

    if (s.paid > 0) {
      await prisma.payment.create({
        data: {
          organizationId: orgEdu.id,
          branchId: branchEdu.id,
          cashboxId: cashboxEdu.id,
          studentId: st.id,
          contractId: cnt.id,
          category: PaymentCategory.TUITION,
          amount: s.paid,
          method: i % 2 === 0 ? PaymentMethod.CLICK : PaymentMethod.PAYME,
          receiptNumber: `REC-EDU-${100 + i}`,
          notes: "Sentabr oyi to'lovi",
          paymentDate: new Date(),
        },
      });
    }

    await prisma.attendance.create({
      data: {
        groupId: s.grp,
        studentId: st.id,
        date: new Date("2026-09-05"),
        status: AttendanceStatus.PRESENT,
      },
    });
  }

  const eduLeads = [
    { name: "Otabek Rahimov", phone: "+998909001001", status: LeadStatus.NEW, source: "Instagram" },
    { name: "Zilola Saidova", phone: "+998909001002", status: LeadStatus.NEW, source: "Telegram" },
    {
      name: "Bekzod Qodirov",
      phone: "+998909001003",
      status: LeadStatus.CONTACTED,
      source: "Tavsiya",
    },
    {
      name: "Nodira Aliyeva",
      phone: "+998909001004",
      status: LeadStatus.CONTACTED,
      source: "Instagram",
    },
    {
      name: "Sardor Karimov",
      phone: "+998909001005",
      status: LeadStatus.TRIAL_BOOKED,
      source: "Banner",
    },
    {
      name: "Maftuna Vohidova",
      phone: "+998909001006",
      status: LeadStatus.TRIAL_BOOKED,
      source: "Instagram",
    },
    {
      name: "Jasur Mirzayev",
      phone: "+998909001007",
      status: LeadStatus.TRIAL_ATTENDED,
      source: "Telegram",
    },
    {
      name: "Guli Sharipova",
      phone: "+998909001008",
      status: LeadStatus.TRIAL_ATTENDED,
      source: "Tavsiya",
    },
    {
      name: "Anvar Ergashev",
      phone: "+998909001009",
      status: LeadStatus.ENROLLED,
      source: "Instagram",
    },
    {
      name: "Sabina Yunusova",
      phone: "+998909001010",
      status: LeadStatus.LOST,
      source: "Banner",
      notes: "Boshqa vaqt so'radi",
    },
  ];
  for (const ld of eduLeads) {
    await prisma.lead.create({
      data: {
        organizationId: orgEdu.id,
        branchId: branchEdu.id,
        fullName: ld.name,
        phone: ld.phone,
        status: ld.status,
        source: ld.source,
        notes: ld.notes || "Kurs bo'yicha murojaat",
      },
    });
  }

  const eduExpenses = [
    { title: "Ofis oylik ijarasi", amount: 14000000, payee: "Business Center Plaza" },
    { title: "Internet va IT serverlar", amount: 1200000, payee: "Uztelecom" },
    { title: "Target reklama (Instagram / FB)", amount: 3500000, payee: "Meta Ads" },
    { title: "Kantselyariya va kofe-breyk", amount: 650000, payee: "Korzinka" },
  ];
  for (const exp of eduExpenses) {
    await prisma.expense.create({
      data: {
        organizationId: orgEdu.id,
        branchId: branchEdu.id,
        cashboxId: cashboxEdu.id,
        title: exp.title,
        amount: exp.amount,
        payee: exp.payee,
        date: new Date(),
      },
    });
  }

  // =========================================================================
  // 2. PROFI XUSUSIY MAKTABI (School)
  // =========================================================================
  console.log("\n📗 2. Profi Xususiy Maktabi ma'lumotlari yaratilmoqda...");
  const orgSchool = await prisma.organization.upsert({
    where: { slug: "profi-maktab" },
    update: {
      name: "Profi Xususiy Maktabi",
      businessType: BusinessType.SCHOOL,
      primaryColor: "#059669",
      phone: "+998712003040",
      address: "Toshkent sh., Chilonzor t., Lutfiy ko'chasi 45",
      currency: "UZS",
      isSetupCompleted: true,
    },
    create: {
      id: "cd67f6eb-9492-4921-8757-e8b43581e757",
      name: "Profi Xususiy Maktabi",
      slug: "profi-maktab",
      businessType: BusinessType.SCHOOL,
      phone: "+998712003040",
      address: "Toshkent sh., Chilonzor t., Lutfiy ko'chasi 45",
      primaryColor: "#059669",
      currency: "UZS",
      isSetupCompleted: true,
    },
  });

  await prisma.systemConfig.upsert({
    where: { organizationId: orgSchool.id },
    update: {
      businessType: BusinessType.SCHOOL,
      enabledModules: [
        "STUDENTS",
        "CLASSES",
        "CONTRACTS",
        "ATTENDANCE",
        "FINANCE",
        "SERVICES",
        "SMS",
      ],
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
    create: {
      organizationId: orgSchool.id,
      businessType: BusinessType.SCHOOL,
      enabledModules: [
        "STUDENTS",
        "CLASSES",
        "CONTRACTS",
        "ATTENDANCE",
        "FINANCE",
        "SERVICES",
        "SMS",
      ],
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
      integrations: {},
    },
  });

  const branchSchool = await prisma.branch.upsert({
    where: { organizationId_name: { organizationId: orgSchool.id, name: "Chilonzor Kampusi" } },
    update: {},
    create: {
      organizationId: orgSchool.id,
      name: "Chilonzor Kampusi",
      code: "PROFI-CHIL",
      address: "Chilonzor t., Lutfiy 45",
      phone: "+998712003040",
    },
  });

  let cashboxSchool = await prisma.cashbox.findFirst({ where: { organizationId: orgSchool.id } });
  if (!cashboxSchool) {
    cashboxSchool = await prisma.cashbox.create({
      data: {
        organizationId: orgSchool.id,
        branchId: branchSchool.id,
        name: "Maktab Hisob Raqami & Kassa",
        currency: "UZS",
        balance: 48000000,
      },
    });
  }

  const teacherMatluba = await prisma.user.upsert({
    where: { phone: "+998902220001" },
    update: { organizationId: orgSchool.id },
    create: {
      organizationId: orgSchool.id,
      firstName: "Matluba",
      lastName: "Rahimova",
      phone: "+998902220001",
      email: "matluba@profi.uz",
      password: passwordHash,
      role: Role.TEACHER,
    },
  });

  const teacherGulbahor = await prisma.user.upsert({
    where: { phone: "+998902220002" },
    update: { organizationId: orgSchool.id },
    create: {
      organizationId: orgSchool.id,
      firstName: "Gulbahor",
      lastName: "Saidova",
      phone: "+998902220002",
      email: "gulbahor@profi.uz",
      password: passwordHash,
      role: Role.TEACHER,
    },
  });

  const teacherDilshod = await prisma.user.upsert({
    where: { phone: "+998902220003" },
    update: { organizationId: orgSchool.id },
    create: {
      organizationId: orgSchool.id,
      firstName: "Dilshod",
      lastName: "Ergashev",
      phone: "+998902220003",
      email: "dilshod@profi.uz",
      password: passwordHash,
      role: Role.TEACHER,
    },
  });

  const rSch101 = await prisma.room.create({
    data: {
      organizationId: orgSchool.id,
      branchId: branchSchool.id,
      name: "101 - 1-A Boshlang'ich",
      capacity: 22,
    },
  });
  const rSch102 = await prisma.room.create({
    data: {
      organizationId: orgSchool.id,
      branchId: branchSchool.id,
      name: "102 - 2-A Boshlang'ich",
      capacity: 22,
    },
  });
  const rSch201 = await prisma.room.create({
    data: {
      organizationId: orgSchool.id,
      branchId: branchSchool.id,
      name: "201 - 5-B Matematika",
      capacity: 24,
    },
  });
  const rSch202 = await prisma.room.create({
    data: {
      organizationId: orgSchool.id,
      branchId: branchSchool.id,
      name: "202 - 9-A Fizika Laboratoriya",
      capacity: 24,
    },
  });

  const cSchoolPrimary = await prisma.course.create({
    data: {
      organizationId: orgSchool.id,
      name: "Boshlang'ich Ta'lim Dasturi (1-4 sinf)",
      description: "Davlat standarti va chuqurlashtirilgan chet tillari",
      price: 3200000,
      duration: 10,
      lessonCount: 200,
    },
  });

  const cSchoolMiddle = await prisma.course.create({
    data: {
      organizationId: orgSchool.id,
      name: "Aniq va Tabiiy Fanlar Dasturi (5-9 sinf)",
      description: "Matematika, Fizika, STEAM dasturi",
      price: 3600000,
      duration: 10,
      lessonCount: 200,
    },
  });

  const class1A = await prisma.group.create({
    data: {
      organizationId: orgSchool.id,
      branchId: branchSchool.id,
      name: "1-A Sinf",
      courseId: cSchoolPrimary.id,
      teacherId: teacherMatluba.id,
      roomId: rSch101.id,
      days: LessonDays.EVERYDAY,
      startTime: "08:30",
      endTime: "16:00",
      status: GroupStatus.ACTIVE,
    },
  });

  const class2A = await prisma.group.create({
    data: {
      organizationId: orgSchool.id,
      branchId: branchSchool.id,
      name: "2-A Sinf",
      courseId: cSchoolPrimary.id,
      teacherId: teacherMatluba.id,
      roomId: rSch102.id,
      days: LessonDays.EVERYDAY,
      startTime: "08:30",
      endTime: "16:00",
      status: GroupStatus.ACTIVE,
    },
  });

  const class5B = await prisma.group.create({
    data: {
      organizationId: orgSchool.id,
      branchId: branchSchool.id,
      name: "5-B Sinf",
      courseId: cSchoolMiddle.id,
      teacherId: teacherGulbahor.id,
      roomId: rSch201.id,
      days: LessonDays.EVERYDAY,
      startTime: "08:30",
      endTime: "16:00",
      status: GroupStatus.ACTIVE,
    },
  });

  const class9A = await prisma.group.create({
    data: {
      organizationId: orgSchool.id,
      branchId: branchSchool.id,
      name: "9-A Sinf",
      courseId: cSchoolMiddle.id,
      teacherId: teacherDilshod.id,
      roomId: rSch202.id,
      days: LessonDays.EVERYDAY,
      startTime: "08:30",
      endTime: "16:00",
      status: GroupStatus.ACTIVE,
    },
  });

  const schoolStudentsData = [
    {
      firstName: "Jasur",
      lastName: "Bekmurodov",
      phone: "+998902221001",
      grp: class1A.id,
      balance: 0,
      fee: 3200000,
      paid: 3200000,
    },
    {
      firstName: "Madina",
      lastName: "Aliyeva",
      phone: "+998902221002",
      grp: class1A.id,
      balance: -3200000,
      fee: 3200000,
      paid: 0,
    },
    {
      firstName: "Sardor",
      lastName: "Yusupov",
      phone: "+998902221003",
      grp: class1A.id,
      balance: 0,
      fee: 3200000,
      paid: 3200000,
    },
    {
      firstName: "Laylo",
      lastName: "Sharipova",
      phone: "+998902221004",
      grp: class2A.id,
      balance: -6400000,
      fee: 3200000,
      paid: 0,
    },
    {
      firstName: "Bobur",
      lastName: "Mirzayev",
      phone: "+998902221005",
      grp: class2A.id,
      balance: 0,
      fee: 3200000,
      paid: 3200000,
    },
    {
      firstName: "Nilufar",
      lastName: "Vohidova",
      phone: "+998902221006",
      grp: class5B.id,
      balance: -3600000,
      fee: 3600000,
      paid: 0,
    },
    {
      firstName: "Davron",
      lastName: "Qobilov",
      phone: "+998902221007",
      grp: class5B.id,
      balance: 0,
      fee: 3600000,
      paid: 3600000,
    },
    {
      firstName: "Zilola",
      lastName: "Toshmatova",
      phone: "+998902221008",
      grp: class5B.id,
      balance: -7200000,
      fee: 3600000,
      paid: 0,
    },
    {
      firstName: "Anvar",
      lastName: "Karimov",
      phone: "+998902221009",
      grp: class9A.id,
      balance: 0,
      fee: 3600000,
      paid: 3600000,
    },
    {
      firstName: "Sarvar",
      lastName: "To'rayev",
      phone: "+998902221010",
      grp: class9A.id,
      balance: 0,
      fee: 3600000,
      paid: 3600000,
    },
    {
      firstName: "Gulnoza",
      lastName: "Rahimova",
      phone: "+998902221011",
      grp: class9A.id,
      balance: -3600000,
      fee: 3600000,
      paid: 0,
    },
    {
      firstName: "Akmal",
      lastName: "Fayzullayev",
      phone: "+998902221012",
      grp: class1A.id,
      balance: 0,
      fee: 3200000,
      paid: 3200000,
    },
  ];

  for (let i = 0; i < schoolStudentsData.length; i++) {
    const s = schoolStudentsData[i];
    const st = await prisma.student.create({
      data: {
        organizationId: orgSchool.id,
        branchId: branchSchool.id,
        firstName: s.firstName,
        lastName: s.lastName,
        phone: s.phone,
        balance: s.balance,
        status: StudentStatus.ACTIVE,
      },
    });

    await prisma.groupEnrollment.create({
      data: { groupId: s.grp, studentId: st.id },
    });

    const cnt = await prisma.contract.create({
      data: {
        organizationId: orgSchool.id,
        branchId: branchSchool.id,
        studentId: st.id,
        contractNumber: `MSH-2026/0${i + 1}`,
        totalAmount: s.fee * 10,
        status: "ACTIVE",
      },
    });

    if (s.paid > 0) {
      await prisma.payment.create({
        data: {
          organizationId: orgSchool.id,
          branchId: branchSchool.id,
          cashboxId: cashboxSchool.id,
          studentId: st.id,
          contractId: cnt.id,
          category: PaymentCategory.TUITION,
          amount: s.paid,
          method: PaymentMethod.BANK_TRANSFER,
          receiptNumber: `REC-SCH-${200 + i}`,
          notes: "Maktab oylik shartnoma to'lovi",
          paymentDate: new Date(),
        },
      });
    }

    await prisma.attendance.create({
      data: {
        groupId: s.grp,
        studentId: st.id,
        date: new Date("2026-09-05"),
        status: AttendanceStatus.PRESENT,
      },
    });
  }

  // School Leads
  const schoolLeads = [
    {
      name: "Otabek Mirzayev (Farzandi 1-sinfga)",
      phone: "+998902222001",
      status: LeadStatus.NEW,
      source: "Tavsiya",
    },
    {
      name: "Nigora Rasulova (Farzandi 5-sinfga)",
      phone: "+998902222002",
      status: LeadStatus.CONTACTED,
      source: "Instagram",
    },
    {
      name: "Sanjar Saidov (Farzandi 1-sinfga)",
      phone: "+998902222003",
      status: LeadStatus.TRIAL_BOOKED,
      source: "Banner",
    },
    {
      name: "Munira Qosimova (Farzandi 9-sinfga)",
      phone: "+998902222004",
      status: LeadStatus.TRIAL_ATTENDED,
      source: "Telegram",
    },
    {
      name: "Farxod Alimov (Farzandi 2-sinfga)",
      phone: "+998902222005",
      status: LeadStatus.ENROLLED,
      source: "Tavsiya",
    },
    {
      name: "Zebo Normurodova",
      phone: "+998902222006",
      status: LeadStatus.LOST,
      source: "Banner",
      notes: "Maktab uzoqlik qildi",
    },
  ];
  for (const ld of schoolLeads) {
    await prisma.lead.create({
      data: {
        organizationId: orgSchool.id,
        branchId: branchSchool.id,
        fullName: ld.name,
        phone: ld.phone,
        status: ld.status,
        source: ld.source,
        notes: ld.notes || "Maktab qabuli bo'yicha ariza",
      },
    });
  }

  const schExpenses = [
    {
      title: "Maktab binosi saqlash va ta'mirlash",
      amount: 25000000,
      payee: "Toshkent Qurilish Servis",
    },
    { title: "Maktab oshxonasi oziq-ovqatlari", amount: 8500000, payee: "Agro Ta'minot MCHJ" },
    { title: "Maktab avtobusi yoqilg'i va servis", amount: 3200000, payee: "O'zbekneftgaz" },
    { title: "Darsliklar va laboratoriya vositalari", amount: 2100000, payee: "Sharq Nashriyoti" },
  ];
  for (const exp of schExpenses) {
    await prisma.expense.create({
      data: {
        organizationId: orgSchool.id,
        branchId: branchSchool.id,
        cashboxId: cashboxSchool.id,
        title: exp.title,
        amount: exp.amount,
        payee: exp.payee,
        date: new Date(),
      },
    });
  }

  // =========================================================================
  // 3. YULDUZCHA XUSUSIY BOG'CHASI (Kindergarten)
  // =========================================================================
  console.log("\n📙 3. Yulduzcha Xususiy Bog'chasi ma'lumotlari yaratilmoqda...");
  const orgKinder = await prisma.organization.upsert({
    where: { slug: "yulduzcha-bogcha" },
    update: {
      name: "Yulduzcha Bog'chasi",
      businessType: BusinessType.KINDERGARTEN,
      primaryColor: "#D97706",
      phone: "+998935556677",
      address: "Toshkent sh., Mirzo Ulug'bek t., Ziyolilar ko'chasi 14",
      currency: "UZS",
      isSetupCompleted: true,
    },
    create: {
      id: "33bbf4b2-376c-4895-b5bf-271b587db639",
      name: "Yulduzcha Bog'chasi",
      slug: "yulduzcha-bogcha",
      businessType: BusinessType.KINDERGARTEN,
      phone: "+998935556677",
      address: "Toshkent sh., Mirzo Ulug'bek t., Ziyolilar ko'chasi 14",
      primaryColor: "#D97706",
      currency: "UZS",
      isSetupCompleted: true,
    },
  });

  await prisma.systemConfig.upsert({
    where: { organizationId: orgKinder.id },
    update: {
      businessType: BusinessType.KINDERGARTEN,
      enabledModules: ["STUDENTS", "GROUPS", "ATTENDANCE", "FINANCE", "SERVICES", "SMS"],
      features: { contracts: true, canteenService: true, transportService: false },
      terminology: {
        groupLabel: "Guruh",
        courseLabel: "Mashg'ulot",
        studentLabel: "Tarbiyalanuvchi",
        teacherLabel: "Tarbiyachi",
      },
    },
    create: {
      organizationId: orgKinder.id,
      businessType: BusinessType.KINDERGARTEN,
      enabledModules: ["STUDENTS", "GROUPS", "ATTENDANCE", "FINANCE", "SERVICES", "SMS"],
      features: { contracts: true, canteenService: true, transportService: false },
      terminology: {
        groupLabel: "Guruh",
        courseLabel: "Mashg'ulot",
        studentLabel: "Tarbiyalanuvchi",
        teacherLabel: "Tarbiyachi",
      },
      integrations: {},
    },
  });

  const branchKinder = await prisma.branch.upsert({
    where: {
      organizationId_name: { organizationId: orgKinder.id, name: "Mirzo Ulug'bek Bosh Bog'cha" },
    },
    update: {},
    create: {
      organizationId: orgKinder.id,
      name: "Mirzo Ulug'bek Bosh Bog'cha",
      code: "YULD-01",
      address: "Mirzo Ulug'bek t., Ziyolilar 14",
      phone: "+998935556677",
    },
  });

  let cashboxKinder = await prisma.cashbox.findFirst({ where: { organizationId: orgKinder.id } });
  if (!cashboxKinder) {
    cashboxKinder = await prisma.cashbox.create({
      data: {
        organizationId: orgKinder.id,
        branchId: branchKinder.id,
        name: "Bog'cha Kassasi",
        currency: "UZS",
        balance: 14200000,
      },
    });
  }

  const educatorShahnoza = await prisma.user.upsert({
    where: { phone: "+998903330001" },
    update: { organizationId: orgKinder.id },
    create: {
      organizationId: orgKinder.id,
      firstName: "Shahnoza",
      lastName: "Karimova",
      phone: "+998903330001",
      email: "shahnoza@bogcha.uz",
      password: passwordHash,
      role: Role.TEACHER,
    },
  });

  const educatorMunira = await prisma.user.upsert({
    where: { phone: "+998903330002" },
    update: { organizationId: orgKinder.id },
    create: {
      organizationId: orgKinder.id,
      firstName: "Munira",
      lastName: "Ahmedova",
      phone: "+998903330002",
      email: "munira@bogcha.uz",
      password: passwordHash,
      role: Role.TEACHER,
    },
  });

  const rKnd1 = await prisma.room.create({
    data: {
      organizationId: orgKinder.id,
      branchId: branchKinder.id,
      name: "Quyoshcha xonasi (Kichik)",
      capacity: 16,
    },
  });
  const rKnd2 = await prisma.room.create({
    data: {
      organizationId: orgKinder.id,
      branchId: branchKinder.id,
      name: "Mittivoylar xonasi (O'rta)",
      capacity: 18,
    },
  });

  const cKinderAllDay = await prisma.course.create({
    data: {
      organizationId: orgKinder.id,
      name: "To'liq Kunlik Bog'cha Dasturi (4 mahal taom)",
      description: "Erta rivojlantirish, tarbiya va sog'lom ovqatlanish",
      price: 1900000,
      duration: 12,
      lessonCount: 240,
    },
  });

  const grpKichik = await prisma.group.create({
    data: {
      organizationId: orgKinder.id,
      branchId: branchKinder.id,
      name: "Kichkintoylar Guruhi (2-3 yosh)",
      courseId: cKinderAllDay.id,
      teacherId: educatorMunira.id,
      roomId: rKnd1.id,
      days: LessonDays.EVERYDAY,
      startTime: "08:00",
      endTime: "18:00",
      status: GroupStatus.ACTIVE,
    },
  });

  const grpMitti = await prisma.group.create({
    data: {
      organizationId: orgKinder.id,
      branchId: branchKinder.id,
      name: "Mittivoylar Guruhi (3-4 yosh)",
      courseId: cKinderAllDay.id,
      teacherId: educatorShahnoza.id,
      roomId: rKnd2.id,
      days: LessonDays.EVERYDAY,
      startTime: "08:00",
      endTime: "18:00",
      status: GroupStatus.ACTIVE,
    },
  });

  const kinderStudentsData = [
    {
      firstName: "Umarbek",
      lastName: "Sharipov",
      phone: "+998903331001",
      grp: grpKichik.id,
      balance: 0,
      fee: 1900000,
      paid: 1900000,
    },
    {
      firstName: "Muslima",
      lastName: "Alimova",
      phone: "+998903331002",
      grp: grpKichik.id,
      balance: -1900000,
      fee: 1900000,
      paid: 0,
    },
    {
      firstName: "Imronbek",
      lastName: "Rasulov",
      phone: "+998903331003",
      grp: grpKichik.id,
      balance: 0,
      fee: 1900000,
      paid: 1900000,
    },
    {
      firstName: "Rayyona",
      lastName: "Sobirova",
      phone: "+998903331004",
      grp: grpMitti.id,
      balance: 0,
      fee: 1900000,
      paid: 1900000,
    },
    {
      firstName: "Muhammad Ali",
      lastName: "Toirov",
      phone: "+998903331005",
      grp: grpMitti.id,
      balance: -1900000,
      fee: 1900000,
      paid: 0,
    },
    {
      firstName: "Fotima",
      lastName: "Zokirova",
      phone: "+998903331006",
      grp: grpMitti.id,
      balance: 0,
      fee: 1900000,
      paid: 1900000,
    },
    {
      firstName: "Zuhra",
      lastName: "Zokirova",
      phone: "+998903331007",
      grp: grpMitti.id,
      balance: 0,
      fee: 1900000,
      paid: 1900000,
    },
    {
      firstName: "Amirbek",
      lastName: "Qodirov",
      phone: "+998903331008",
      grp: grpKichik.id,
      balance: -950000,
      fee: 1900000,
      paid: 950000,
    },
    {
      firstName: "Soliha",
      lastName: "Xoliqova",
      phone: "+998903331009",
      grp: grpMitti.id,
      balance: 0,
      fee: 1900000,
      paid: 1900000,
    },
    {
      firstName: "Yahyobek",
      lastName: "Normatov",
      phone: "+998903331010",
      grp: grpKichik.id,
      balance: 0,
      fee: 1900000,
      paid: 1900000,
    },
  ];

  for (let i = 0; i < kinderStudentsData.length; i++) {
    const s = kinderStudentsData[i];
    const st = await prisma.student.create({
      data: {
        organizationId: orgKinder.id,
        branchId: branchKinder.id,
        firstName: s.firstName,
        lastName: s.lastName,
        phone: s.phone,
        balance: s.balance,
        status: StudentStatus.ACTIVE,
      },
    });

    await prisma.groupEnrollment.create({
      data: { groupId: s.grp, studentId: st.id },
    });

    const cnt = await prisma.contract.create({
      data: {
        organizationId: orgKinder.id,
        branchId: branchKinder.id,
        studentId: st.id,
        contractNumber: `BG-2026/0${i + 1}`,
        totalAmount: s.fee * 12,
        status: "ACTIVE",
      },
    });

    if (s.paid > 0) {
      await prisma.payment.create({
        data: {
          organizationId: orgKinder.id,
          branchId: branchKinder.id,
          cashboxId: cashboxKinder.id,
          studentId: st.id,
          contractId: cnt.id,
          category: PaymentCategory.TUITION,
          amount: s.paid,
          method: PaymentMethod.PAYME,
          receiptNumber: `REC-BG-${300 + i}`,
          notes: "Bog'cha oylik to'lovi",
          paymentDate: new Date(),
        },
      });
    }

    await prisma.attendance.create({
      data: {
        groupId: s.grp,
        studentId: st.id,
        date: new Date("2026-09-05"),
        status: AttendanceStatus.PRESENT,
      },
    });
  }

  // Bog'cha Leads
  const kinderLeads = [
    {
      name: "Shahlo Karimova (Farzandi 2 yosh)",
      phone: "+998903332001",
      status: LeadStatus.NEW,
      source: "Instagram",
    },
    {
      name: "Nodir Ergashev (Farzandi 3 yosh)",
      phone: "+998903332002",
      status: LeadStatus.CONTACTED,
      source: "Tavsiya",
    },
    {
      name: "Gulzoda Aliyeva (Farzandi 4 yosh)",
      phone: "+998903332003",
      status: LeadStatus.TRIAL_BOOKED,
      source: "Banner",
    },
    {
      name: "Akbar Vohidov (Farzandi 3 yosh)",
      phone: "+998903332004",
      status: LeadStatus.TRIAL_ATTENDED,
      source: "Instagram",
    },
    {
      name: "Malika Rustamova",
      phone: "+998903332005",
      status: LeadStatus.ENROLLED,
      source: "Telegram",
    },
  ];
  for (const ld of kinderLeads) {
    await prisma.lead.create({
      data: {
        organizationId: orgKinder.id,
        branchId: branchKinder.id,
        fullName: ld.name,
        phone: ld.phone,
        status: ld.status,
        source: ld.source,
        notes: "Bog'cha qabuli bo'yicha ariza",
      },
    });
  }

  const kndExpenses = [
    {
      title: "4 mahal bolalar taomlari oziq-ovqati",
      amount: 9500000,
      payee: "Sanoat Ta'minot Food",
    },
    { title: "Bog'cha binosi saqlash xarajatlari", amount: 6000000, payee: "Ziyolilar UKK" },
    { title: "O'yinchoqlar va gigiyena vositalari", amount: 1800000, payee: "Mega Toys & Clean" },
  ];
  for (const exp of kndExpenses) {
    await prisma.expense.create({
      data: {
        organizationId: orgKinder.id,
        branchId: branchKinder.id,
        cashboxId: cashboxKinder.id,
        title: exp.title,
        amount: exp.amount,
        payee: exp.payee,
        date: new Date(),
      },
    });
  }

  // =========================================================================
  // 4. UNIVERSAL TA'LIM SERVIS (Course / Service Center)
  // =========================================================================
  console.log("\n🔷 4. Universal Ta'lim Servis ma'lumotlari yaratilmoqda...");
  const orgServis = await prisma.organization.upsert({
    where: { slug: "universal-servis" },
    update: {
      name: "Universal Ta'lim Servis",
      businessType: BusinessType.COURSE_CENTER,
      primaryColor: "#2563EB",
      phone: "+998907778899",
      address: "Toshkent sh., Mirobod t., Nukus ko'chasi 21",
      currency: "UZS",
      isSetupCompleted: true,
    },
    create: {
      name: "Universal Ta'lim Servis",
      slug: "universal-servis",
      businessType: BusinessType.COURSE_CENTER,
      phone: "+998907778899",
      address: "Toshkent sh., Mirobod t., Nukus ko'chasi 21",
      primaryColor: "#2563EB",
      currency: "UZS",
      isSetupCompleted: true,
    },
  });

  await prisma.systemConfig.upsert({
    where: { organizationId: orgServis.id },
    update: {
      businessType: BusinessType.COURSE_CENTER,
      enabledModules: [
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
    create: {
      organizationId: orgServis.id,
      businessType: BusinessType.COURSE_CENTER,
      enabledModules: [
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
      integrations: {},
    },
  });

  const branchServis = await prisma.branch.upsert({
    where: {
      organizationId_name: { organizationId: orgServis.id, name: "Mirobod Servis Markazi" },
    },
    update: {},
    create: {
      organizationId: orgServis.id,
      name: "Mirobod Servis Markazi",
      code: "UNIV-01",
      address: "Mirobod t., Nukus 21",
      phone: "+998907778899",
    },
  });

  let cashboxServis = await prisma.cashbox.findFirst({ where: { organizationId: orgServis.id } });
  if (!cashboxServis) {
    cashboxServis = await prisma.cashbox.create({
      data: {
        organizationId: orgServis.id,
        branchId: branchServis.id,
        name: "Servis Markaz Kassasi",
        currency: "UZS",
        balance: 11000000,
      },
    });
  }

  const teacherSherzod = await prisma.user.upsert({
    where: { phone: "+998904440001" },
    update: { organizationId: orgServis.id },
    create: {
      organizationId: orgServis.id,
      firstName: "Sherzod",
      lastName: "Rahimov",
      phone: "+998904440001",
      email: "sherzod@servis.uz",
      password: passwordHash,
      role: Role.TEACHER,
    },
  });

  const teacherBarno = await prisma.user.upsert({
    where: { phone: "+998904440002" },
    update: { organizationId: orgServis.id },
    create: {
      organizationId: orgServis.id,
      firstName: "Barno",
      lastName: "Karimova",
      phone: "+998904440002",
      email: "barno@servis.uz",
      password: passwordHash,
      role: Role.TEACHER,
    },
  });

  const rSrv101 = await prisma.room.create({
    data: {
      organizationId: orgServis.id,
      branchId: branchServis.id,
      name: "101 - 1C Kompyuter zali",
      capacity: 20,
    },
  });
  const rSrv102 = await prisma.room.create({
    data: {
      organizationId: orgServis.id,
      branchId: branchServis.id,
      name: "102 - SMM Studiyasi",
      capacity: 18,
    },
  });

  const c1C = await prisma.course.create({
    data: {
      organizationId: orgServis.id,
      name: "1C Buxgalteriya 8.3 va Soliqlar",
      description: "Amaliy buxgalteriya va soliq hisoboti kursi",
      price: 1100000,
      duration: 3,
      lessonCount: 36,
    },
  });

  const cSmm = await prisma.course.create({
    data: {
      organizationId: orgServis.id,
      name: "SMM va Raqamli Marketing",
      description: "Ijtimoiy tarmoqlar marketingi va target reklama",
      price: 950000,
      duration: 2,
      lessonCount: 24,
    },
  });

  const grp1C = await prisma.group.create({
    data: {
      organizationId: orgServis.id,
      branchId: branchServis.id,
      name: "1C-Buxgalter-12",
      courseId: c1C.id,
      teacherId: teacherSherzod.id,
      roomId: rSrv101.id,
      days: LessonDays.ODD_DAYS,
      startTime: "18:30",
      endTime: "20:30",
      status: GroupStatus.ACTIVE,
    },
  });

  const grpSmm = await prisma.group.create({
    data: {
      organizationId: orgServis.id,
      branchId: branchServis.id,
      name: "SMM-Pro-05",
      courseId: cSmm.id,
      teacherId: teacherBarno.id,
      roomId: rSrv102.id,
      days: LessonDays.EVEN_DAYS,
      startTime: "15:00",
      endTime: "17:00",
      status: GroupStatus.ACTIVE,
    },
  });

  const servisStudentsData = [
    {
      firstName: "Sardorbek",
      lastName: "Valiyev",
      phone: "+998904441001",
      grp: grp1C.id,
      balance: 0,
      fee: 1100000,
      paid: 1100000,
    },
    {
      firstName: "Mohira",
      lastName: "Umarova",
      phone: "+998904441002",
      grp: grp1C.id,
      balance: -1100000,
      fee: 1100000,
      paid: 0,
    },
    {
      firstName: "Eldor",
      lastName: "Nurmatov",
      phone: "+998904441003",
      grp: grp1C.id,
      balance: 0,
      fee: 1100000,
      paid: 1100000,
    },
    {
      firstName: "Shahlo",
      lastName: "Rustamova",
      phone: "+998904441004",
      grp: grp1C.id,
      balance: 0,
      fee: 1100000,
      paid: 1100000,
    },
    {
      firstName: "Sanjar",
      lastName: "Bekchanov",
      phone: "+998904441005",
      grp: grp1C.id,
      balance: -1100000,
      fee: 1100000,
      paid: 0,
    },
    {
      firstName: "Nargiza",
      lastName: "Tojiboyeva",
      phone: "+998904441006",
      grp: grpSmm.id,
      balance: 0,
      fee: 950000,
      paid: 950000,
    },
    {
      firstName: "Nodirbek",
      lastName: "Usmonov",
      phone: "+998904441007",
      grp: grpSmm.id,
      balance: -950000,
      fee: 950000,
      paid: 0,
    },
    {
      firstName: "Malika",
      lastName: "Shokirova",
      phone: "+998904441008",
      grp: grpSmm.id,
      balance: 0,
      fee: 950000,
      paid: 950000,
    },
  ];

  for (let i = 0; i < servisStudentsData.length; i++) {
    const s = servisStudentsData[i];
    const st = await prisma.student.create({
      data: {
        organizationId: orgServis.id,
        branchId: branchServis.id,
        firstName: s.firstName,
        lastName: s.lastName,
        phone: s.phone,
        balance: s.balance,
        status: StudentStatus.ACTIVE,
      },
    });

    await prisma.groupEnrollment.create({
      data: { groupId: s.grp, studentId: st.id },
    });

    const cnt = await prisma.contract.create({
      data: {
        organizationId: orgServis.id,
        branchId: branchServis.id,
        studentId: st.id,
        contractNumber: `SER-2026/0${i + 1}`,
        totalAmount: s.fee * 3,
        status: "ACTIVE",
      },
    });

    if (s.paid > 0) {
      await prisma.payment.create({
        data: {
          organizationId: orgServis.id,
          branchId: branchServis.id,
          cashboxId: cashboxServis.id,
          studentId: st.id,
          contractId: cnt.id,
          category: PaymentCategory.TUITION,
          amount: s.paid,
          method: PaymentMethod.CASH,
          receiptNumber: `REC-SRV-${400 + i}`,
          notes: "Kurs to'lovi",
          paymentDate: new Date(),
        },
      });
    }

    await prisma.attendance.create({
      data: {
        groupId: s.grp,
        studentId: st.id,
        date: new Date("2026-09-05"),
        status: AttendanceStatus.PRESENT,
      },
    });
  }

  // Leads for Servis
  const srvLeads = [
    {
      name: "Jamshid Ismoilov",
      phone: "+998904442001",
      status: LeadStatus.NEW,
      source: "Instagram",
    },
    {
      name: "Shahlo Qosimova",
      phone: "+998904442002",
      status: LeadStatus.CONTACTED,
      source: "Telegram",
    },
    {
      name: "Oybek Vohidov",
      phone: "+998904442003",
      status: LeadStatus.TRIAL_BOOKED,
      source: "Tavsiya",
    },
    {
      name: "Dilrabo Karimova",
      phone: "+998904442004",
      status: LeadStatus.TRIAL_ATTENDED,
      source: "Instagram",
    },
    {
      name: "Ulugbek Rahmonov",
      phone: "+998904442005",
      status: LeadStatus.ENROLLED,
      source: "Banner",
    },
    {
      name: "Nargiza Aliyeva",
      phone: "+998904442006",
      status: LeadStatus.LOST,
      source: "Instagram",
    },
  ];
  for (const ld of srvLeads) {
    await prisma.lead.create({
      data: {
        organizationId: orgServis.id,
        branchId: branchServis.id,
        fullName: ld.name,
        phone: ld.phone,
        status: ld.status,
        source: ld.source,
        notes: "Kasbiy kurslar bo'yicha murojaat",
      },
    });
  }

  const srvExpenses = [
    { title: "O'quv binosi oylik ijarasi", amount: 8000000, payee: "Mirobod Plaza" },
    { title: "1C va dasturiy litsenziyalar", amount: 1600000, payee: "1C Uzbekistan" },
    { title: "Target va SMM reklama xarajatlari", amount: 2400000, payee: "Meta Advertising" },
  ];
  for (const exp of srvExpenses) {
    await prisma.expense.create({
      data: {
        organizationId: orgServis.id,
        branchId: branchServis.id,
        cashboxId: cashboxServis.id,
        title: exp.title,
        amount: exp.amount,
        payee: exp.payee,
        date: new Date(),
      },
    });
  }

  console.log(
    "\n✅ Barcha 4 ta ta'lim muassasasi uchun real ma'lumotlar 100% to'liq, ajratilgan va xavfsiz saqlandi!"
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
