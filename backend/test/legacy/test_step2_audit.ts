import { PrismaClient } from '@prisma/client';
import { GroupsService } from './src/groups/groups.service';
import { ExamsService } from './src/groups/exams.service';
import { LessonsService } from './src/attendance/lessons.service';
import { AttendanceService } from './src/attendance/attendance.service';
import { AuditService } from './src/audit/audit.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

const prisma = new PrismaClient();
const auditService = new AuditService(prisma as any);
const groupsService = new GroupsService(prisma as any, auditService);
const examsService = new ExamsService(prisma as any, auditService);
const lessonsService = new LessonsService(prisma as any, auditService);
const attendanceService = new AttendanceService(prisma as any, auditService);

async function runStep2Audit() {
  console.log('========================================================================');
  console.log('🛡️  PHASE 10.4 — STEP 2 AUDIT & SECURITY TEST SUITE');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      passed++;
      console.log(`✅ [PASS] ${testName}`);
    } else {
      failed++;
      console.error(`❌ [FAIL] ${testName} ${detail ? `- ${detail}` : ''}`);
    }
  }

  try {
    // 1. Setup Test Tenants and Branches
    const orgA = await prisma.organization.upsert({
      where: { slug: 'audit-step2-org-a' },
      update: {},
      create: { name: 'Step 2 Academy A', slug: 'audit-step2-org-a', businessType: 'COURSE_CENTER' },
    });

    const orgB = await prisma.organization.upsert({
      where: { slug: 'audit-step2-org-b' },
      update: {},
      create: { name: 'Step 2 Academy B', slug: 'audit-step2-org-b', businessType: 'COURSE_CENTER' },
    });

    const branchA1 = await prisma.branch.create({
      data: { organizationId: orgA.id, name: 'Filial A1' },
    });

    const branchA2 = await prisma.branch.create({
      data: { organizationId: orgA.id, name: 'Filial A2' },
    });

    const branchB = await prisma.branch.create({
      data: { organizationId: orgB.id, name: 'Filial B' },
    });

    const courseA = await prisma.course.create({
      data: {
        organizationId: orgA.id,
        name: 'Node.js Backend Masterclass',
        price: 1500000.0,
        duration: 4,
        lessonCount: 48,
      },
    });

    const courseB = await prisma.course.create({
      data: {
        organizationId: orgB.id,
        name: 'Python Data Science',
        price: 1800000.0,
        duration: 6,
        lessonCount: 72,
      },
    });

    const studentA1 = await prisma.student.create({
      data: {
        organizationId: orgA.id,
        branchId: branchA1.id,
        firstName: 'Ulugbek',
        lastName: 'Azimov',
        phone: '+998941110001',
      },
    });

    const studentB1 = await prisma.student.create({
      data: {
        organizationId: orgB.id,
        branchId: branchB.id,
        firstName: 'Bobur',
        lastName: 'Mansurov',
        phone: '+998942220002',
      },
    });

    // -------------------------------------------------------------
    // TEST 1: Cross-Tenant Group Creation Attack
    // -------------------------------------------------------------
    let crossTenantCourseRejected = false;
    try {
      // Org A user trying to create group with Org B course
      await groupsService.create(
        {
          name: 'Hacked Group',
          courseId: courseB.id, // Org B
          startTime: '09:00',
          endTime: '11:00',
        },
        orgA.id,
      );
    } catch (e) {
      if (e instanceof BadRequestException) crossTenantCourseRejected = true;
    }
    assert(crossTenantCourseRejected, '1. Cross-Tenant Group: Creating group with Org B course REJECTED');

    // Valid group in Org A
    const groupA1 = await groupsService.create(
      {
        name: 'Node-Grp-01',
        courseId: courseA.id,
        branchId: branchA1.id,
        startTime: '10:00',
        endTime: '12:00',
      },
      orgA.id,
    );
    assert(groupA1.organizationId === orgA.id, '2. Valid Group created in Org A and Branch A1');

    const groupA2 = await groupsService.create(
      {
        name: 'Node-Grp-02',
        courseId: courseA.id,
        branchId: branchA2.id,
        startTime: '14:00',
        endTime: '16:00',
      },
      orgA.id,
    );

    // -------------------------------------------------------------
    // TEST 2: Enrollment Cross-Tenant & Cross-Branch Protection
    // -------------------------------------------------------------
    let crossTenantEnrollmentRejected = false;
    try {
      // Enrolling Org B student into Org A group
      await groupsService.addStudent(groupA1.id, studentB1.id, orgA.id);
    } catch (e) {
      if (e instanceof NotFoundException) crossTenantEnrollmentRejected = true;
    }
    assert(crossTenantEnrollmentRejected, '3. Cross-Tenant Enrollment: Org B student into Org A group REJECTED');

    // Room with capacity = 1
    const roomA1 = await prisma.room.create({
      data: { organizationId: orgA.id, branchId: branchA1.id, name: 'Xona-101', capacity: 1 },
    });

    // Enrolling Org A1 student into Org A1 group
    const enrollment = await groupsService.addStudent(groupA1.id, studentA1.id, orgA.id);
    assert(enrollment.groupId === groupA1.id && enrollment.studentId === studentA1.id, '4. Valid Enrollment established');

    // Duplicate enrollment: Re-enrolling same student in same group
    const reEnrollment = await groupsService.addStudent(groupA1.id, studentA1.id, orgA.id);
    const enrollmentCount = await prisma.groupEnrollment.count({
      where: { groupId: groupA1.id, studentId: studentA1.id },
    });
    assert(enrollmentCount === 1 && reEnrollment.isActive === true, '4c. Duplicate Enrollment: DB unique constraint prevents duplicate rows');

    // Attach group to room with capacity 1
    await prisma.group.update({ where: { id: groupA1.id }, data: { roomId: roomA1.id } });

    // Second student in same org
    const studentA2 = await prisma.student.create({
      data: {
        organizationId: orgA.id,
        branchId: branchA1.id,
        firstName: 'Farhod',
        lastName: 'Sobirov',
        phone: '+998943330003',
      },
    });

    let capacityExceededRejected = false;
    try {
      await groupsService.addStudent(groupA1.id, studentA2.id, orgA.id);
    } catch (e) {
      if (e instanceof BadRequestException) capacityExceededRejected = true;
    }
    assert(capacityExceededRejected, '4b. Group/Room Capacity: Overbooking beyond capacity (1) REJECTED');

    // -------------------------------------------------------------
    // TEST 3: Group Transfer Atomic Transaction & History
    // -------------------------------------------------------------
    // Update student branch to branchA2 for valid transfer
    await prisma.student.update({ where: { id: studentA1.id }, data: { branchId: branchA2.id } });

    const transferred = await groupsService.transferStudent(
      groupA1.id,
      groupA2.id,
      studentA1.id,
      orgA.id,
      'Yunusobod filialiga ko\'chirish',
    );
    assert(transferred.groupId === groupA2.id, '5. Group Transfer: Student successfully transferred in $transaction');

    const activeEnrollments = await prisma.groupEnrollment.findMany({
      where: { studentId: studentA1.id },
    });
    assert(activeEnrollments.length === 1 && activeEnrollments[0].groupId === groupA2.id, '6. Transfer deactivated old and activated new enrollment');

    const histories = await groupsService.getEnrollmentHistory({ studentId: studentA1.id, orgId: orgA.id });
    assert(histories.length >= 2, '7. EnrollmentHistory accurately tracked both transfer events');

    // -------------------------------------------------------------
    // TEST 4: Lessons & Cross-Tenant Protection
    // -------------------------------------------------------------
    let crossTenantLessonRejected = false;
    try {
      await lessonsService.create(
        {
          groupId: groupA1.id,
          title: 'Intro to NestJS',
          date: '2026-09-02',
        },
        orgB.id, // Org B trying to create lesson in Org A group
      );
    } catch (e) {
      if (e instanceof NotFoundException) crossTenantLessonRejected = true;
    }
    assert(crossTenantLessonRejected, '8. Cross-Tenant Lesson: Org B creating lesson in Org A group REJECTED');

    // Invalid time test: start > end
    let invalidTimeRejected = false;
    try {
      await lessonsService.create(
        {
          groupId: groupA2.id,
          title: 'Invalid Time Lesson',
          date: '2026-09-02',
          startTime: '16:00',
          endTime: '14:00',
        },
        orgA.id,
      );
    } catch (e) {
      if (e instanceof BadRequestException) invalidTimeRejected = true;
    }
    assert(invalidTimeRejected, '8b. Lesson Time Validation: startTime >= endTime (16:00 > 14:00) REJECTED');

    const lessonA = await lessonsService.create(
      {
        groupId: groupA2.id,
        title: 'Prisma ORM Deep Dive',
        date: '2026-09-02',
        topic: 'Prisma relations and indexing',
        homework: 'Write 5 schema models',
      },
      orgA.id,
    );
    assert(lessonA.homework !== null, '9. Lesson and Homework model created together');

    // Branch Attack test: user restricted to branchA1 trying to create lesson in groupA2 (which is in branchA2)
    const branchCtxUserA1 = {
      organizationId: orgA.id,
      accessibleBranchIds: [branchA1.id],
      isSuperAdmin: false,
      isOrgAdmin: false,
      userBranchIds: [branchA1.id],
      headerBranchId: undefined,
    };
    let crossBranchLessonRejected = false;
    try {
      await lessonsService.create(
        {
          groupId: groupA2.id, // in branchA2!
          title: 'Hacked Lesson in Branch A2',
          date: '2026-09-02',
        },
        orgA.id,
        'user-a1',
        branchCtxUserA1,
      );
    } catch (e) {
      if (e instanceof NotFoundException) crossBranchLessonRejected = true;
    }
    assert(crossBranchLessonRejected, '9b. Branch Attack Test: Branch A1 restricted user accessing Branch A2 group REJECTED');

    // -------------------------------------------------------------
    // TEST 5: Attendance Bulk & Duplicate Protection
    // -------------------------------------------------------------
    let crossTenantAttendanceRejected = false;
    try {
      await attendanceService.markAttendance(
        {
          groupId: groupA2.id,
          date: '2026-09-02',
          records: [{ studentId: studentB1.id, status: 'PRESENT' as any }],
        },
        orgA.id,
      );
    } catch (e) {
      if (e instanceof BadRequestException) crossTenantAttendanceRejected = true;
    }
    assert(crossTenantAttendanceRejected, '10. Cross-Tenant Attendance: Org B student attendance REJECTED');

    // Unrelated lesson check: marking attendance in groupA1 using lesson from groupA2
    let unrelatedLessonRejected = false;
    try {
      await attendanceService.markAttendance(
        {
          groupId: groupA1.id,
          lessonId: lessonA.id, // lesson from groupA2!
          date: '2026-09-02',
          records: [{ studentId: studentA1.id, status: 'PRESENT' as any }],
        },
        orgA.id,
      );
    } catch (e) {
      if (e instanceof BadRequestException) unrelatedLessonRejected = true;
    }
    assert(unrelatedLessonRejected, '10b. Attendance Ownership: Unrelated lessonId in groupId REJECTED');

    const markResult = await attendanceService.markAttendance(
      {
        groupId: groupA2.id,
        date: '2026-09-02',
        lessonId: lessonA.id,
        records: [{ studentId: studentA1.id, status: 'PRESENT' as any, comment: 'Darsga vaqtida keldi' }],
      },
      orgA.id,
    );
    assert(markResult.success && markResult.count === 1, '11. Bulk Attendance saved atomically in $transaction');

    // Duplicate attendance on same date upserts status without duplication
    const updateResult = await attendanceService.markAttendance(
      {
        groupId: groupA2.id,
        date: '2026-09-02',
        records: [{ studentId: studentA1.id, status: 'LATE' as any, comment: 'Kechikib keldi' }],
      },
      orgA.id,
    );
    const countAfterUpsert = await prisma.attendance.count({
      where: { groupId: groupA2.id, studentId: studentA1.id },
    });
    assert(countAfterUpsert === 1, '12. Duplicate Attendance: Database constraint & upsert prevents duplicate rows');

    // -------------------------------------------------------------
    // TEST 6: Exams, MaxScore & Grade Validation
    // -------------------------------------------------------------
    const exam = await examsService.create(
      {
        groupId: groupA2.id,
        title: 'Prisma & SQL Exam',
        maxScore: 100.0,
      },
      orgA.id,
    );
    assert(Number(exam.maxScore) === 100.0, '13. Exam created with maxScore = 100');

    // Negative score test
    let negativeScoreRejected = false;
    try {
      await examsService.recordGrades(
        {
          examId: exam.id,
          grades: [{ studentId: studentA1.id, score: -10 }],
        },
        orgA.id,
      );
    } catch (e) {
      if (e instanceof BadRequestException) negativeScoreRejected = true;
    }
    assert(negativeScoreRejected, '14. Grade Validation: Negative score (-10) REJECTED');

    // Score > maxScore test
    let overMaxScoreRejected = false;
    try {
      await examsService.recordGrades(
        {
          examId: exam.id,
          grades: [{ studentId: studentA1.id, score: 105 }],
        },
        orgA.id,
      );
    } catch (e) {
      if (e instanceof BadRequestException) overMaxScoreRejected = true;
    }
    assert(overMaxScoreRejected, '15. Grade Validation: Score 105 > maxScore 100 REJECTED');

    // Valid grade test
    const gradeResult = await examsService.recordGrades(
      {
        examId: exam.id,
        grades: [{ studentId: studentA1.id, score: 95.5, feedback: 'Ajoyib natija' }],
      },
      orgA.id,
    );
    assert(gradeResult.success && gradeResult.count === 1, '16. Valid Grade (95.5) recorded atomically in $transaction');

    // Duplicate grade test: updating grade for the same student on the same exam
    await examsService.recordGrades(
      {
        examId: exam.id,
        grades: [{ studentId: studentA1.id, score: 98.0, feedback: 'Qayta topshirish natijasi' }],
      },
      orgA.id,
    );
    const gradeCount = await prisma.grade.count({
      where: { examId: exam.id, studentId: studentA1.id },
    });
    const latestGrade = await prisma.grade.findFirst({
      where: { examId: exam.id, studentId: studentA1.id },
    });
    assert(gradeCount === 1 && Number(latestGrade?.score) === 98.0, '16b. Duplicate Grade: Updates score cleanly without duplicate rows');

    // Audit logs verification for Step 2 mutations
    const auditCount = await prisma.auditLog.count({
      where: { organizationId: orgA.id },
    });
    assert(auditCount >= 5, `17. Audit Trail: Step 2 mutations logged to central AuditLog table (Count: ${auditCount})`);

    // Clean up test data
    await prisma.grade.deleteMany({ where: { examId: exam.id } });
    await prisma.exam.deleteMany({ where: { id: exam.id } });
    await prisma.attendance.deleteMany({ where: { groupId: { in: [groupA1.id, groupA2.id] } } });
    await prisma.homework.deleteMany({ where: { lessonId: lessonA.id } });
    await prisma.lesson.deleteMany({ where: { id: lessonA.id } });
    await prisma.enrollmentHistory.deleteMany({ where: { studentId: studentA1.id } });
    await prisma.groupEnrollment.deleteMany({ where: { studentId: studentA1.id } });
    await prisma.group.deleteMany({ where: { id: { in: [groupA1.id, groupA2.id] } } });
    await prisma.room.deleteMany({ where: { id: roomA1.id } });
    await prisma.course.deleteMany({ where: { id: { in: [courseA.id, courseB.id] } } });
    await prisma.student.deleteMany({ where: { id: { in: [studentA1.id, studentA2.id, studentB1.id] } } });
    await prisma.branch.deleteMany({ where: { id: { in: [branchA1.id, branchA2.id, branchB.id] } } });
    await prisma.organization.deleteMany({ where: { id: { in: [orgA.id, orgB.id] } } });

    console.log('\n========================================================================');
    console.log(`📊 STEP 2 AUDIT TEST RESULTS: ${passed} PASSED / ${failed} FAILED (TOTAL: ${passed + failed})`);
    console.log('========================================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Step 2 Audit failed with error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runStep2Audit();
