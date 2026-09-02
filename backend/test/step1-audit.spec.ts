import { PrismaClient } from '@prisma/client';
import { ParentsService } from '../src/students/parents.service';
import { ContractsService } from '../src/students/contracts.service';
import { CoursesService } from '../src/courses/courses.service';
import { AuditService } from '../src/audit/audit.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('Audit Suite Step 1 (Isolation & Audit) [Jest]', () => {
  let prisma: PrismaClient;
  let auditService: AuditService;
  let parentsService: ParentsService;
  let contractsService: ContractsService;
  let coursesService: CoursesService;

  let orgA: any;
  let orgB: any;
  let studentA: any;
  let studentB: any;
  let parentA: any;
  let parentB: any;
  let contractA: any;
  let courseA: any;
  let courseB: any;

  const ts = Date.now();
  const phoneStudentA = `+99891${String(ts).slice(-7)}`;
  const phoneStudentB = `+99892${String(ts).slice(-7)}`;
  const phoneParentA = `+99893${String(ts).slice(-7)}`;

  beforeAll(async () => {
    prisma = new PrismaClient();
    auditService = new AuditService(prisma as any);
    parentsService = new ParentsService(prisma as any, auditService);
    contractsService = new ContractsService(prisma as any, auditService);
    coursesService = new CoursesService(prisma as any, auditService);

    orgA = await prisma.organization.create({
      data: { name: `Audit Academy A ${ts}`, slug: `audit-step1-a-${ts}`, businessType: 'COURSE_CENTER' },
    });

    orgB = await prisma.organization.create({
      data: { name: `Audit Academy B ${ts}`, slug: `audit-step1-b-${ts}`, businessType: 'COURSE_CENTER' },
    });

    studentA = await prisma.student.create({
      data: {
        organizationId: orgA.id,
        firstName: 'Farrux',
        lastName: 'Xolmatov',
        phone: phoneStudentA,
        balance: 0,
      },
    });

    studentB = await prisma.student.create({
      data: {
        organizationId: orgB.id,
        firstName: 'Sanjar',
        lastName: 'Karimov',
        phone: phoneStudentB,
        balance: 0,
      },
    });
  }, 30000);

  afterAll(async () => {
    if (orgA && orgB) {
      await prisma.auditLog.deleteMany({ where: { organizationId: { in: [orgA.id, orgB.id] } } });
      if (courseA || courseB) {
        await prisma.course.deleteMany({ where: { organizationId: { in: [orgA.id, orgB.id] } } });
      }
      if (contractA) {
        await prisma.contract.deleteMany({ where: { id: contractA.id } });
      }
      await prisma.studentParent.deleteMany({ where: { studentId: { in: [studentA.id, studentB.id] } } });
      if (parentA || parentB) {
        await prisma.parent.deleteMany({ where: { organizationId: { in: [orgA.id, orgB.id] } } });
      }
      await prisma.student.deleteMany({ where: { id: { in: [studentA.id, studentB.id] } } });
      await prisma.organization.deleteMany({ where: { id: { in: [orgA.id, orgB.id] } } });
    }
    await prisma.$disconnect();
  }, 30000);

  it('1. Parent creation belongs strictly to Org A', async () => {
    parentA = await parentsService.create(
      {
        fullName: 'Ziyoda Xolmatova',
        phone: phoneParentA,
        relationship: 'MOTHER',
      },
      orgA.id,
    );
    expect(parentA.organizationId).toBe(orgA.id);
  });

  it('2. Duplicate Parent phone in SAME org rejected with ConflictException', async () => {
    await expect(
      parentsService.create(
        {
          fullName: 'Boshqa Ota-ona',
          phone: phoneParentA,
        },
        orgA.id,
      ),
    ).rejects.toThrow(ConflictException);
  });

  it('3. Same Parent phone in DIFFERENT org is ALLOWED', async () => {
    parentB = await parentsService.create(
      {
        fullName: 'Karim Ota',
        phone: phoneParentA,
        relationship: 'FATHER',
      },
      orgB.id,
    );
    expect(parentB.organizationId).toBe(orgB.id);
  });

  it('4. Cross-Tenant Link: Org A parent linking Org B student REJECTED', async () => {
    await expect(
      parentsService.linkStudent(
        {
          studentId: studentB.id,
          parentId: parentA.id,
          relationship: 'MOTHER',
        },
        orgA.id,
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it('5. Valid StudentParent M:N link created', async () => {
    const validLink = await parentsService.linkStudent(
      {
        studentId: studentA.id,
        parentId: parentA.id,
        relationship: 'MOTHER',
        isPrimary: true,
      },
      orgA.id,
    );
    expect(validLink.studentId).toBe(studentA.id);
    expect(validLink.parentId).toBe(parentA.id);
  });

  it('6. Cross-Tenant Contract: Org A creating contract for Org B student REJECTED', async () => {
    await expect(
      contractsService.create(
        {
          studentId: studentB.id,
          totalAmount: 2500000.0,
        },
        orgA.id,
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it('7. Contract totalAmount stored with Decimal precision', async () => {
    contractA = await contractsService.create(
      {
        studentId: studentA.id,
        contractNumber: `SH-STEP1-${Date.now()}`,
        totalAmount: 3600000.0,
        discountAmount: 200000.0,
        notes: 'Yillik shartnoma',
      },
      orgA.id,
    );
    expect(Number(contractA.totalAmount)).toBe(3600000.0);
  });

  it('8. Cross-Tenant Contract Read: Org B reading Org A contract REJECTED', async () => {
    await expect(contractsService.findOne(contractA.id, orgB.id)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('9. Courses Cross-Tenant & Restore Tenant Safety', async () => {
    courseA = await coursesService.create(
      { name: `Math Mastery ${ts}`, price: 950000.0, duration: 6, lessonCount: 72 },
      orgA.id,
    );
    courseB = await coursesService.create(
      { name: `Physics Mastery ${ts}`, price: 950000.0, duration: 6, lessonCount: 72 },
      orgB.id,
    );

    // Cross-tenant update
    await expect(coursesService.update(courseA.id, { name: 'Hacked Math' }, orgB.id)).rejects.toThrow(
      NotFoundException,
    );

    // Soft delete
    await coursesService.remove(courseA.id, orgA.id);
    const deletedCourseInQuery = await prisma.course.findFirst({
      where: { id: courseA.id, organizationId: orgA.id, deletedAt: null },
    });
    expect(deletedCourseInQuery).toBeNull();

    // Cross-tenant restore rejected
    await expect(coursesService.restore(courseA.id, orgB.id)).rejects.toThrow(NotFoundException);

    // Valid restore
    const restoredCourse = await coursesService.restore(courseA.id, orgA.id);
    expect(restoredCourse.deletedAt).toBeNull();
  });

  it('10. Audit Trail: Mutations logged to central AuditLog table', async () => {
    const auditLogs = await prisma.auditLog.findMany({
      where: { organizationId: orgA.id },
    });
    expect(auditLogs.length).toBeGreaterThanOrEqual(4);
  });
});
