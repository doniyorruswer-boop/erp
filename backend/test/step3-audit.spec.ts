import { PrismaClient, StudentStatus } from '@prisma/client';
import { StudentsService } from '../src/students/students.service';
import { AuditService } from '../src/audit/audit.service';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';

describe('Audit Suite Step 3 (Students & Lifecycle) [Jest]', () => {
  let prisma: PrismaClient;
  let auditService: AuditService;
  let studentsService: StudentsService;

  let orgA: any;
  let orgB: any;
  let branchA1: any;
  let branchA2: any;
  let student1: any;
  let studentWithParentAndGroup: any;
  let studentInOrgB: any;
  let courseA: any;
  let groupA: any;

  const ts = Date.now();
  const testPhone = `+99896${String(ts).slice(-7)}`;
  const parentPhone = `+99897${String(ts).slice(-7)}`;

  beforeAll(async () => {
    prisma = new PrismaClient();
    auditService = new AuditService(prisma as any);
    studentsService = new StudentsService(prisma as any, auditService as any);

    orgA = await prisma.organization.create({
      data: { name: `Step 3 University A ${ts}`, slug: `step3-org-a-${ts}`, businessType: 'COURSE_CENTER' },
    });

    orgB = await prisma.organization.create({
      data: { name: `Step 3 University B ${ts}`, slug: `step3-org-b-${ts}`, businessType: 'COURSE_CENTER' },
    });

    branchA1 = await prisma.branch.create({
      data: { name: `Step 3 Chilonzor Branch ${ts}`, organizationId: orgA.id },
    });

    branchA2 = await prisma.branch.create({
      data: { name: `Step 3 Yunusobod Branch ${ts}`, organizationId: orgA.id },
    });
  }, 30000);

  afterAll(async () => {
    if (orgA && orgB) {
      await prisma.auditLog.deleteMany({ where: { organizationId: { in: [orgA.id, orgB.id] } } });
      if (groupA) {
        await prisma.groupEnrollment.deleteMany({ where: { groupId: groupA.id } });
        await prisma.group.deleteMany({ where: { id: groupA.id } });
      }
      if (courseA) {
        await prisma.course.deleteMany({ where: { id: courseA.id } });
      }
      await prisma.studentParent.deleteMany({ where: { student: { organizationId: { in: [orgA.id, orgB.id] } } } });
      await prisma.parent.deleteMany({ where: { organizationId: { in: [orgA.id, orgB.id] } } });
      await prisma.student.deleteMany({ where: { organizationId: { in: [orgA.id, orgB.id] } } });
      await prisma.branch.deleteMany({ where: { id: { in: [branchA1.id, branchA2.id] } } });
      await prisma.organization.deleteMany({ where: { id: { in: [orgA.id, orgB.id] } } });
    }
    await prisma.$disconnect();
  }, 30000);

  it('1. Student strictly created in Org A', async () => {
    student1 = await studentsService.create(
      {
        firstName: 'Jasur',
        lastName: 'Aliyev',
        phone: testPhone,
        branchId: branchA1.id,
      },
      orgA.id,
    );
    expect(student1.organizationId).toBe(orgA.id);
  });

  it('2. Cross-Tenant Read: Org B reading Org A student REJECTED', async () => {
    await expect(studentsService.findOne(student1.id, orgB.id)).rejects.toThrow(NotFoundException);
  });

  it('3. Cross-Tenant Update: Org B updating Org A student REJECTED', async () => {
    await expect(studentsService.update(student1.id, { firstName: 'Hacked' }, orgB.id)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('4. Branch Isolation: User with Branch A2 cannot access Branch A1 student', async () => {
    const branchCtxUserA2 = {
      organizationId: orgA.id,
      accessibleBranchIds: [branchA2.id],
      isSuperAdmin: false,
      isOrgAdmin: false,
      userBranchIds: [branchA2.id],
      headerBranchId: undefined,
    };
    await expect(
      studentsService.findOne(student1.id, orgA.id, branchCtxUserA2 as any),
    ).rejects.toThrow(NotFoundException);
  });

  it('5. Unique Phone: Duplicate student phone in same Org REJECTED', async () => {
    await expect(
      studentsService.create(
        {
          firstName: 'Jasur Duplicate',
          lastName: 'Aliyev',
          phone: testPhone,
          branchId: branchA1.id,
        },
        orgA.id,
      ),
    ).rejects.toThrow(ConflictException);
  });

  it('6. Unique Phone: Same phone in different Org is ALLOWED', async () => {
    studentInOrgB = await studentsService.create(
      {
        firstName: 'Jasur Other Org',
        lastName: 'Aliyev',
        phone: testPhone,
      },
      orgB.id,
    );
    expect(studentInOrgB.organizationId).toBe(orgB.id);
  });

  it('7. Soft Delete: Student marked deletedAt and Restore works', async () => {
    await studentsService.remove(student1.id, orgA.id);
    const softDeleted = await prisma.student.findUnique({ where: { id: student1.id } });
    expect(softDeleted?.deletedAt).not.toBeNull();

    await studentsService.restore(student1.id, orgA.id);
    const restored = await prisma.student.findUnique({ where: { id: student1.id } });
    expect(restored?.deletedAt).toBeNull();
  });

  it('8. Student + Parent + Initial Enrollment Atomic Creation', async () => {
    courseA = await prisma.course.create({
      data: {
        organizationId: orgA.id,
        name: `Step 3 Course ${ts}`,
        price: 1500000,
        duration: 3,
        lessonCount: 24,
      },
    });

    groupA = await prisma.group.create({
      data: {
        organizationId: orgA.id,
        branchId: branchA1.id,
        courseId: courseA.id,
        name: `Step 3 Group A1 ${ts}`,
        days: 'ODD_DAYS',
        startTime: '10:00',
        endTime: '12:00',
      },
    });

    studentWithParentAndGroup = await studentsService.create(
      {
        firstName: 'Anvar',
        lastName: 'Tursunov',
        phone: `+99898${String(ts).slice(-7)}`,
        parentName: 'Karim Tursunov',
        parentPhone,
        initialGroupId: groupA.id,
        branchId: branchA1.id,
      },
      orgA.id,
    );

    const studentDetails = await studentsService.findOne(studentWithParentAndGroup.id, orgA.id);
    expect(studentDetails.parents.length).toBeGreaterThanOrEqual(1);
    expect(studentDetails.enrollments.length).toBeGreaterThanOrEqual(1);
  });

  it('9. Cross-Tenant Initial Group: Org B student into Org A group REJECTED', async () => {
    await expect(
      studentsService.create(
        {
          firstName: 'Hacker',
          lastName: 'Student',
          phone: `+99890${String(ts).slice(-7)}`,
          initialGroupId: groupA.id,
        },
        orgB.id,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('10. Lifecycle: Student status changed to FROZEN', async () => {
    const frozen = await studentsService.update(
      studentWithParentAndGroup.id,
      { status: StudentStatus.FROZEN },
      orgA.id,
    );
    expect(frozen.status).toBe(StudentStatus.FROZEN);
  });
});
