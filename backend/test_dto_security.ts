import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateStudentDto } from './src/students/dto/student.dto';
import { CreateCourseDto } from './src/courses/dto/course.dto';
import { CreateGroupDto } from './src/groups/dto/group.dto';
import { CreateParentDto, LinkStudentParentDto } from './src/students/dto/parent.dto';
import { CreateContractDto } from './src/students/dto/contract.dto';
import { CreatePaymentDto } from './src/payments/dto/payment.dto';
import { MarkAttendanceDto } from './src/attendance/dto/attendance.dto';
import { CreateLessonDto } from './src/attendance/dto/lesson.dto';
import { CreateExamDto } from './src/groups/dto/exam.dto';

interface TestCase {
  name: string;
  dtoClass: any;
  payload: any;
  shouldFail: boolean;
  expectedFieldInError?: string;
}

async function runSecurityTests() {
  console.log('===============================================================');
  console.log('🛡️  PHASE 10.3 — EDUCATION DTOs & SECURITY VALIDATION TESTS');
  console.log('===============================================================\n');

  const tests: TestCase[] = [
    {
      name: '1. Valid CreateStudentDto (Normal)',
      dtoClass: CreateStudentDto,
      payload: {
        firstName: 'Ali',
        lastName: 'Valiyev',
        phone: '+998901234567',
        email: 'ali@example.com',
        birthDate: '2005-01-01',
      },
      shouldFail: false,
    },
    {
      name: '2. Mass Assignment: organizationId injection in CreateStudentDto',
      dtoClass: CreateStudentDto,
      payload: {
        firstName: 'Ali',
        phone: '+998901234567',
        organizationId: 'malicious-org-id-12345',
      },
      shouldFail: true,
      expectedFieldInError: 'organizationId',
    },
    {
      name: '3. Mass Assignment: tenantId injection in CreateStudentDto',
      dtoClass: CreateStudentDto,
      payload: {
        firstName: 'Ali',
        phone: '+998901234567',
        tenantId: 'malicious-tenant-id-12345',
      },
      shouldFail: true,
      expectedFieldInError: 'tenantId',
    },
    {
      name: '4. Mass Assignment: role injection in CreateStudentDto',
      dtoClass: CreateStudentDto,
      payload: {
        firstName: 'Ali',
        phone: '+998901234567',
        role: 'SUPER_ADMIN',
      },
      shouldFail: true,
      expectedFieldInError: 'role',
    },
    {
      name: '5. Mass Assignment: createdAt & deletedAt injection in CreateStudentDto',
      dtoClass: CreateStudentDto,
      payload: {
        firstName: 'Ali',
        phone: '+998901234567',
        createdAt: '2020-01-01T00:00:00.000Z',
        deletedAt: null,
      },
      shouldFail: true,
      expectedFieldInError: 'createdAt',
    },
    {
      name: '6. Student with Invalid Email Format',
      dtoClass: CreateStudentDto,
      payload: {
        firstName: 'Ali',
        phone: '+998901234567',
        email: 'not-an-email',
      },
      shouldFail: true,
      expectedFieldInError: 'email',
    },
    {
      name: '7. Student with Invalid Date Format',
      dtoClass: CreateStudentDto,
      payload: {
        firstName: 'Ali',
        phone: '+998901234567',
        birthDate: 'invalid-date-string',
      },
      shouldFail: true,
      expectedFieldInError: 'birthDate',
    },
    {
      name: '8. Student with Invalid Status Enum',
      dtoClass: CreateStudentDto,
      payload: {
        firstName: 'Ali',
        phone: '+998901234567',
        status: 'SUPER_VIP_INVALID_STATUS',
      },
      shouldFail: true,
      expectedFieldInError: 'status',
    },
    {
      name: '9. Course with Negative Price',
      dtoClass: CreateCourseDto,
      payload: {
        name: 'Math',
        price: -50000,
        duration: 3,
        lessonCount: 24,
      },
      shouldFail: true,
      expectedFieldInError: 'price',
    },
    {
      name: '10. Course with Invalid Duration (0 or negative)',
      dtoClass: CreateCourseDto,
      payload: {
        name: 'Math',
        price: 50000,
        duration: 0,
        lessonCount: 24,
      },
      shouldFail: true,
      expectedFieldInError: 'duration',
    },
    {
      name: '11. Group with Invalid LessonDays Enum',
      dtoClass: CreateGroupDto,
      payload: {
        name: 'Group A',
        courseId: 'c-1',
        startTime: '09:00',
        endTime: '11:00',
        days: 'INVALID_DAYS',
      },
      shouldFail: true,
      expectedFieldInError: 'days',
    },
    {
      name: '12. Payment with Negative / Zero Amount',
      dtoClass: CreatePaymentDto,
      payload: {
        studentId: 'st-1',
        amount: -100,
      },
      shouldFail: true,
      expectedFieldInError: 'amount',
    },
    {
      name: '13. Contract with Negative TotalAmount',
      dtoClass: CreateContractDto,
      payload: {
        studentId: 'st-1',
        totalAmount: -1000,
      },
      shouldFail: true,
      expectedFieldInError: 'totalAmount',
    },
    {
      name: '14. Exam with Negative maxScore',
      dtoClass: CreateExamDto,
      payload: {
        groupId: 'grp-1',
        title: 'Midterm',
        maxScore: -10,
      },
      shouldFail: true,
      expectedFieldInError: 'maxScore',
    },
    {
      name: '15. Parent with Missing FullName & Phone',
      dtoClass: CreateParentDto,
      payload: {
        relationship: 'MOTHER',
      },
      shouldFail: true,
      expectedFieldInError: 'fullName',
    },
    {
      name: '16. LinkStudentParentDto Valid Pair',
      dtoClass: LinkStudentParentDto,
      payload: {
        studentId: 'uuid-student-1',
        parentId: 'uuid-parent-1',
        relationship: 'MOTHER',
        isPrimary: true,
      },
      shouldFail: false,
    },
    {
      name: '17. Attendance with Invalid Status Enum',
      dtoClass: MarkAttendanceDto,
      payload: {
        groupId: 'grp-1',
        date: '2026-09-01',
        records: [
          {
            studentId: 'st-1',
            status: 'UNKNOWN_ATTENDANCE_STATUS',
          },
        ],
      },
      shouldFail: true,
      expectedFieldInError: 'records',
    },
    {
      name: '18. Mass Assignment: Unknown fields rejected in CreatePaymentDto',
      dtoClass: CreatePaymentDto,
      payload: {
        studentId: 'st-1',
        amount: 500000,
        organizationId: 'injected-org-id',
        receivedById: 'injected-receiver-id',
        receiptNumber: 'injected-receipt-999',
      },
      shouldFail: true,
      expectedFieldInError: 'organizationId',
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const instance = plainToInstance(test.dtoClass, test.payload);
    const errors = await validate(instance, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    const hasErrors = errors.length > 0;
    const isSuccess = test.shouldFail ? hasErrors : !hasErrors;

    if (isSuccess) {
      passed++;
      console.log(`✅ [PASS] ${test.name}`);
    } else {
      failed++;
      console.error(`❌ [FAIL] ${test.name} - Errors:`, JSON.stringify(errors, null, 2));
    }
  }

  console.log('\n===============================================================');
  console.log(`📊 TEST RESULTS: ${passed} PASSED / ${failed} FAILED (TOTAL: ${tests.length})`);
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runSecurityTests();
