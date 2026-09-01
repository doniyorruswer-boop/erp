import { PrismaClient, Role, LessonDays, GroupStatus, StudentStatus, PaymentMethod, PaymentCategory, BusinessType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Boshlang\'ich ma\'lumotlar bazaga kiritilmoqda...');

  const passwordHash = await bcrypt.hash('admin123', 10);

  // 1. Tashkilotlar (Organizations)
  const orgSchool = await prisma.organization.upsert({
    where: { slug: 'profi-maktab' },
    update: {},
    create: {
      id: 'cd67f6eb-9492-4921-8757-e8b43581e757',
      name: 'Profi Xususiy Maktabi',
      slug: 'profi-maktab',
      businessType: BusinessType.SCHOOL,
      phone: '+998712003040',
      address: 'Toshkent sh., Chilonzor t.',
      primaryColor: '#059669',
      currency: 'UZS',
    },
  });

  const orgKindergarten = await prisma.organization.upsert({
    where: { slug: 'yulduzcha-bogcha' },
    update: {},
    create: {
      id: '33bbf4b2-376c-4895-b5bf-271b587db639',
      name: 'Yulduzcha Bog\'chasi',
      slug: 'yulduzcha-bogcha',
      businessType: BusinessType.KINDERGARTEN,
      phone: '+998935556677',
      address: 'Toshkent sh., Mirzo Ulugbek t.',
      primaryColor: '#d97706',
      currency: 'UZS',
    },
  });

  // 2. Foydalanuvchilar (Admin & O'qituvchilar)
  await prisma.user.upsert({
    where: { phone: '+998901234567' },
    update: {},
    create: {
      firstName: 'Alisher',
      lastName: 'Navoiy',
      phone: '+998901234567',
      email: 'admin@educrm.uz',
      password: passwordHash,
      role: Role.SUPER_ADMIN,
    },
  });

  const teacher1 = await prisma.user.upsert({
    where: { phone: '+998909876543' },
    update: {},
    create: {
      firstName: 'Matluba',
      lastName: 'Rahimova',
      phone: '+998909876543',
      email: 'matluba@educrm.uz',
      password: passwordHash,
      role: Role.TEACHER,
    },
  });

  const teacher2 = await prisma.user.upsert({
    where: { phone: '+998901112233' },
    update: {},
    create: {
      firstName: 'Gulbahor',
      lastName: 'Saidova',
      phone: '+998901112233',
      email: 'gulbahor@educrm.uz',
      password: passwordHash,
      role: Role.TEACHER,
    },
  });

  const teacher3 = await prisma.user.upsert({
    where: { phone: '+998903334455' },
    update: {},
    create: {
      firstName: 'Dilshod',
      lastName: 'Ergashev',
      phone: '+998903334455',
      email: 'dilshod.e@educrm.uz',
      password: passwordHash,
      role: Role.TEACHER,
    },
  });

  const teacher4 = await prisma.user.upsert({
    where: { phone: '+998905556677' },
    update: {},
    create: {
      firstName: 'Nilufar',
      lastName: 'Azimova',
      phone: '+998905556677',
      email: 'nilufar@educrm.uz',
      password: passwordHash,
      role: Role.TEACHER,
    },
  });

  // 3. Kurslar / Dasturlar (Courses)
  const courseSchool = await prisma.course.upsert({
    where: { id: 'course-school-gen' },
    update: {},
    create: {
      id: 'course-school-gen',
      organizationId: orgSchool.id,
      name: 'Umumiy Maktab Ta\'limi',
      description: '1-11 sinflar uchun davlat va chuqurlashtirilgan ta\'lim dasturi',
      price: 3200000,
      duration: 12,
      lessonCount: 24,
    },
  });

  const courseKindergarten = await prisma.course.upsert({
    where: { id: 'course-kinder-gen' },
    update: {},
    create: {
      id: 'course-kinder-gen',
      organizationId: orgKindergarten.id,
      name: 'Bog\'cha Kengaytirilgan Ta\'limi',
      description: 'Kunlik 4 mahal taomlanish va tarbiya dasturi',
      price: 1800000,
      duration: 12,
      lessonCount: 24,
    },
  });

  // 4. Xonalar (Rooms)
  const room1 = await prisma.room.upsert({
    where: { id: 'room-1-a' },
    update: {},
    create: { id: 'room-1-a', organizationId: orgSchool.id, name: '101-xona (1-A)', capacity: 20 },
  });

  const room2 = await prisma.room.upsert({
    where: { id: 'room-2-a' },
    update: {},
    create: { id: 'room-2-a', organizationId: orgSchool.id, name: '102-xona (2-A)', capacity: 20 },
  });

  const room3 = await prisma.room.upsert({
    where: { id: 'room-3-b' },
    update: {},
    create: { id: 'room-3-b', organizationId: orgSchool.id, name: '103-xona (3-B)', capacity: 20 },
  });

  const room4 = await prisma.room.upsert({
    where: { id: 'room-5-a' },
    update: {},
    create: { id: 'room-5-a', organizationId: orgSchool.id, name: '201-xona (5-A)', capacity: 20 },
  });

  // 5. Sinflar / Guruhlar (Groups)
  const group1A = await prisma.group.upsert({
    where: { id: 'class-1-a' },
    update: {},
    create: {
      id: 'class-1-a',
      organizationId: orgSchool.id,
      name: '1-A',
      courseId: courseSchool.id,
      teacherId: teacher1.id,
      roomId: room1.id,
      startTime: '08:30',
      endTime: '16:00',
      status: GroupStatus.ACTIVE,
    },
  });

  const group2A = await prisma.group.upsert({
    where: { id: 'class-2-a' },
    update: {},
    create: {
      id: 'class-2-a',
      organizationId: orgSchool.id,
      name: '2-A',
      courseId: courseSchool.id,
      teacherId: teacher2.id,
      roomId: room2.id,
      startTime: '08:30',
      endTime: '16:00',
      status: GroupStatus.ACTIVE,
    },
  });

  const group3B = await prisma.group.upsert({
    where: { id: 'class-3-b' },
    update: {},
    create: {
      id: 'class-3-b',
      organizationId: orgSchool.id,
      name: '3-B',
      courseId: courseSchool.id,
      teacherId: teacher3.id,
      roomId: room3.id,
      startTime: '08:30',
      endTime: '16:00',
      status: GroupStatus.ACTIVE,
    },
  });

  const group5A = await prisma.group.upsert({
    where: { id: 'class-5-a' },
    update: {},
    create: {
      id: 'class-5-a',
      organizationId: orgSchool.id,
      name: '5-A',
      courseId: courseSchool.id,
      teacherId: teacher4.id,
      roomId: room4.id,
      startTime: '08:30',
      endTime: '16:00',
      status: GroupStatus.ACTIVE,
    },
  });

  // Bog'cha guruhlari
  const groupKichik = await prisma.group.upsert({
    where: { id: 'group-kichkintoylar' },
    update: {},
    create: {
      id: 'group-kichkintoylar',
      organizationId: orgKindergarten.id,
      name: 'Kichkintoylar',
      courseId: courseKindergarten.id,
      teacherId: teacher1.id,
      startTime: '08:00',
      endTime: '18:00',
      status: GroupStatus.ACTIVE,
    },
  });

  const groupMitti = await prisma.group.upsert({
    where: { id: 'group-mittivoylar' },
    update: {},
    create: {
      id: 'group-mittivoylar',
      organizationId: orgKindergarten.id,
      name: 'Mittivoylar',
      courseId: courseKindergarten.id,
      teacherId: teacher2.id,
      startTime: '08:00',
      endTime: '18:00',
      status: GroupStatus.ACTIVE,
    },
  });

  // 6. O'quvchilar (Students) & Shartnomalar (Contracts)
  const studentsData = [
    { id: 'st-01', firstName: 'Jasur', lastName: 'Bekmurodov', phone: '+998901112201', gender: 'MALE', groupId: group1A.id, balance: 0 },
    { id: 'st-02', firstName: 'Madina', lastName: 'Aliyeva', phone: '+998901112202', gender: 'FEMALE', groupId: group1A.id, balance: -3200000 },
    { id: 'st-03', firstName: 'Sardor', lastName: 'Yusupov', phone: '+998901112203', gender: 'MALE', groupId: group1A.id, balance: 0 },
    { id: 'st-04', firstName: 'Laylo', lastName: 'Sharipova', phone: '+998901112204', gender: 'FEMALE', groupId: group2A.id, balance: -6400000 },
    { id: 'st-05', firstName: 'Bobur', lastName: 'Mirzayev', phone: '+998901112205', gender: 'MALE', groupId: group2A.id, balance: 0 },
    { id: 'st-06', firstName: 'Nilufar', lastName: 'Vohidova', phone: '+998901112206', gender: 'FEMALE', groupId: group3B.id, balance: -3200000 },
    { id: 'st-07', firstName: 'Davron', lastName: 'Qobilov', phone: '+998901112207', gender: 'MALE', groupId: group3B.id, balance: 0 },
    { id: 'st-08', firstName: 'Zilola', lastName: 'Toshmatova', phone: '+998901112208', gender: 'FEMALE', groupId: group5A.id, balance: -9600000 },
    { id: 'st-09', firstName: 'Anvar', lastName: 'Karimov', phone: '+998901112209', gender: 'MALE', groupId: group5A.id, balance: 0 },
    { id: 'st-10', firstName: 'Otabek', lastName: 'Burxonov', phone: '+998901112210', gender: 'MALE', groupId: groupKichik.id, balance: -1800000 },
    { id: 'st-11', firstName: 'Shahnoza', lastName: 'Sharipova', phone: '+998901112211', gender: 'FEMALE', groupId: groupMitti.id, balance: 0 },
  ];

  for (const s of studentsData) {
    const student = await prisma.student.upsert({
      where: { organizationId_phone: { organizationId: orgSchool.id, phone: s.phone } },
      update: {},
      create: {
        id: s.id,
        organizationId: orgSchool.id,
        firstName: s.firstName,
        lastName: s.lastName,
        phone: s.phone,
        gender: s.gender,
        balance: s.balance,
        status: StudentStatus.ACTIVE,
      },
    });

    // Group enrollment
    await prisma.groupEnrollment.upsert({
      where: { groupId_studentId: { groupId: s.groupId, studentId: student.id } },
      update: {},
      create: { groupId: s.groupId, studentId: student.id },
    });

    // Shartnoma (Contract)
    const contract = await prisma.contract.upsert({
      where: { contractNumber: 'SH-2026/' + s.id },
      update: {},
      create: {
        id: 'contract-' + s.id,
        organizationId: orgSchool.id,
        contractNumber: 'SH-2026/' + s.id,
        studentId: student.id,
        totalAmount: 32000000,
        discountAmount: 1000000,
        status: 'ACTIVE',
      },
    });

    // To'lov (Payment) if not heavily indebted
    if (s.balance >= 0) {
      await prisma.payment.upsert({
        where: { receiptNumber: 'REC-2026-' + s.id },
        update: {},
        create: {
          organizationId: orgSchool.id,
          studentId: student.id,
          contractId: contract.id,
          category: PaymentCategory.TUITION,
          amount: 3200000,
          method: PaymentMethod.CLICK,
          receiptNumber: 'REC-2026-' + s.id,
          notes: '2025-2026 o\'quv yili oylik to\'lovi',
        },
      });
    }
  }

  console.log('✅ Real Database ma\'lumotlari (Maktab, Bog\'cha, Sinflar, Shartnomalar, To\'lovlar) to\'liq saqlandi!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });