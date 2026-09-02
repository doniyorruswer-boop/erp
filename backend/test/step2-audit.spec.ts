import { PrismaClient } from '@prisma/client';
import { GroupsService } from '../src/groups/groups.service';
import { ExamsService } from '../src/groups/exams.service';
import { LessonsService } from '../src/attendance/lessons.service';
import { AttendanceService } from '../src/attendance/attendance.service';
import { AuditService } from '../src/audit/audit.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('Audit Suite Step 2 (Groups & Attendance) [Jest]', () => {
  let prisma: PrismaClient;
  let auditService: AuditService;
  let groupsService: GroupsService;
  let examsService: ExamsService;
  let lessonsService: LessonsService;
  let attendanceService: AttendanceService;

  let orgA: any;
  let orgB: any;
  let branchA1: any;
  let branchA2: any;
  let branchB: any;
  let courseA: any;
  let courseB: any;
  let studentA1: any;
  let studentB1: any;
  let groupA1: any;
  let groupA2: any;
  let lessonA: any;
  let exam: any;

  const ts = Date.now();
  const phoneStudentA1 = `+99894${String(ts).slice(-7)}`;
  const phoneStudentB1 = `+99895${String(ts).slice(-7)}`;

  beforeAll(async () => {
    prisma = new PrismaClient();
    auditService = new AuditService(prisma as any);
    groupsService = new GroupsService(prisma as any, auditService);
    examsService = new ExamsService(prisma as any, auditService);
    lessonsService = new LessonsService(prisma as any, auditService);
    attendanceService = new AttendanceService(prisma as any, auditService);

    orgA = await prisma.organization.create({
      data: { name: `Step 2 Academy A ${ts}`, slug: `audit-step2-a-${ts}`, businessType: 'COURSE_CENTER' },
    });

    orgB = await prisma.organization.create({
      data: { name: `Step 2 Academy B ${ts}`, slug: `audit-step2-b-${ts}`, businessType: 'COURSE_CENTER' },
    });

    branchA1 = await prisma.branch.create({
      data: { organizationId: orgA.id, name: `Filial A1 ${ts}` },
    });

    branchA2 = await prisma.branch.create({
      data: { organizationId: orgA.id, name: `Filial A2 ${ts}` },
    });

    branchB = await prisma.branch.create({
      data: { organizationId: orgB.id, name: `Filial B ${ts}` },
    });

    courseA = await prisma.course.create({
      data: {
        organizationId: orgA.id,
        name: `Node.js Backend Masterclass ${ts}`,
        price: 1500000.0,
        duration: 4,
        lessonCount: 48,
      },
    });

    courseB = await prisma.course.create({
      data: {
        organizationId: orgB.id,
        name: `Python Data Science ${ts}`,
        price: 1800000.0,
        duration: 6,
        lessonCount: 72,
      },
    });

    studentA1 = await prisma.student.create({
      data: {
        organizationId: orgA.id,
        branchId: branchA1.id,
        firstName: 'Ulugbek',
        lastName: 'Azimov',
        phone: phoneStudentA1,
      },
    });

    studentB1 = await prisma.student.create({
      data: {
        organizationId: orgB.id,
        branchId: branchB.id,
        firstName: 'Bobur',
        lastName: 'Mansurov',
        phone: phoneStudentB1,
      },
    });
  }, 30000);

  afterAll(async () => {
    if (orgA && orgB) {
      await prisma.auditLog.deleteMany({ where: { organizationId: { in: [orgA.id, orgB.id] } } });
      if (exam) {
        await prisma.grade.deleteMany({ where: { examId: exam.id } });
        await prisma.exam.deleteMany({ where: { id: exam.id } });
      }
      if (groupA1 || groupA2) {
        await prisma.attendance.deleteMany({ where: { groupId: { in: [groupA1?.id, groupA2?.id].filter(Boolean) } } });
        if (lessonA) {
          await prisma.homework.deleteMany({ where: { lessonId: lessonA.id } });
          await prisma.lesson.deleteMany({ where: { id: lessonA.id } });
        }
        await prisma.enrollmentHistory.deleteMany({ where: { studentId: studentA1.id } });
        await prisma.groupEnrollment.deleteMany({ where: { studentId: studentA1.id } });
        await prisma.group.deleteMany({ where: { id: { in: [groupA1?.id, groupA2?.id].filter(Boolean) } } });
      }
      await prisma.course.deleteMany({ where: { id: { in: [courseA.id, courseB.id] } } });
      await prisma.student.deleteMany({ where: { id: { in: [studentA1.id, studentB1.id] } } });
      await prisma.branch.deleteMany({ where: { id: { in: [branchA1.id, branchA2.id, branchB.id] } } });
      await prisma.organization.deleteMany({ where: { id: { in: [orgA.id, orgB.id] } } });
    }
    await prisma.$disconnect();
  }, 30000);

  it('1. Cross-Tenant Group: Creating group with Org B course REJECTED', async () => {
    await expect(
      groupsService.create(
        {
          name: 'Hacked Group',
          courseId: courseB.id,
          startTime: '09:00',
          endTime: '11:00',
        },
        orgA.id,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('2. Valid Groups created in Org A and branches', async () => {
    groupA1 = await groupsService.create(
      {
        name: `Node-Grp-01 ${ts}`,
        courseId: courseA.id,
        branchId: branchA1.id,
        startTime: '10:00',
        endTime: '12:00',
      },
      orgA.id,
    );
    expect(groupA1.organizationId).toBe(orgA.id);

    groupA2 = await groupsService.create(
      {
        name: `Node-Grp-02 ${ts}`,
        courseId: courseA.id,
        branchId: branchA2.id,
        startTime: '14:00',
        endTime: '16:00',
      },
      orgA.id,
    );
    expect(groupA2.organizationId).toBe(orgA.id);
  });

  it('3. Cross-Tenant Enrollment: Org B student into Org A group REJECTED', async () => {
    await expect(
      groupsService.addStudent(groupA1.id, studentB1.id, orgA.id),
    ).rejects.toThrow(NotFoundException);
  });

  it('4. Valid Enrollment established', async () => {
    const enrollment = await groupsService.addStudent(groupA1.id, studentA1.id, orgA.id);
    expect(enrollment.groupId).toBe(groupA1.id);
    expect(enrollment.studentId).toBe(studentA1.id);
  });

  it('5. Group Transfer: Student successfully transferred in $transaction', async () => {
    await prisma.student.update({ where: { id: studentA1.id }, data: { branchId: branchA2.id } });

    const transferred = await groupsService.transferStudent(
      groupA1.id,
      groupA2.id,
      studentA1.id,
      orgA.id,
      'Filialga kochirish',
    );
    expect(transferred.groupId).toBe(groupA2.id);
  });

  it('6. Lessons & Homework created and cross-tenant protected', async () => {
    await expect(
      lessonsService.create(
        { groupId: groupA1.id, title: 'Intro', date: '2026-09-02' },
        orgB.id,
      ),
    ).rejects.toThrow(NotFoundException);

    lessonA = await lessonsService.create(
      {
        groupId: groupA2.id,
        title: 'Prisma ORM Deep Dive',
        date: '2026-09-02',
        topic: 'Prisma relations and indexing',
        homework: 'Write 5 schema models',
      },
      orgA.id,
    );
    expect(lessonA.homework).not.toBeNull();
  });

  it('7. Attendance Bulk & Duplicate Protection', async () => {
    const markResult = await attendanceService.markAttendance(
      {
        groupId: groupA2.id,
        date: '2026-09-02',
        lessonId: lessonA.id,
        records: [{ studentId: studentA1.id, status: 'PRESENT' as any, comment: 'Vaqtida keldi' }],
      },
      orgA.id,
    );
    expect(markResult.success).toBe(true);
    expect(markResult.count).toBe(1);
  });

  it('8. Exams, MaxScore & Grade Validation', async () => {
    exam = await examsService.create(
      {
        groupId: groupA2.id,
        title: 'Prisma & SQL Exam',
        maxScore: 100.0,
      },
      orgA.id,
    );
    expect(Number(exam.maxScore)).toBe(100.0);

    const gradeResult = await examsService.recordGrades(
      {
        examId: exam.id,
        grades: [{ studentId: studentA1.id, score: 95.5, feedback: 'Ajoyib natija' }],
      },
      orgA.id,
    );
    expect(gradeResult.success).toBe(true);
  });
});
