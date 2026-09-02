import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateStudentDto } from '../src/students/dto/student.dto';
import { CreateCourseDto } from '../src/courses/dto/course.dto';
import { CreateGroupDto } from '../src/groups/dto/group.dto';
import { CreateParentDto, LinkStudentParentDto } from '../src/students/dto/parent.dto';
import { CreateContractDto } from '../src/students/dto/contract.dto';
import { CreatePaymentDto } from '../src/payments/dto/payment.dto';
import { MarkAttendanceDto } from '../src/attendance/dto/attendance.dto';
import { CreateExamDto } from '../src/groups/dto/exam.dto';

describe('DTO & Mass Assignment Security Validation (Jest)', () => {
  it('1. should pass valid CreateStudentDto', async () => {
    const instance = plainToInstance(CreateStudentDto, {
      firstName: 'Ali',
      lastName: 'Valiyev',
      phone: '+998901234567',
      email: 'ali@example.com',
      birthDate: '2005-01-01',
    });
    const errors = await validate(instance, { whitelist: true, forbidNonWhitelisted: true });
    expect(errors.length).toBe(0);
  });

  it('2. should reject organizationId mass assignment in CreateStudentDto', async () => {
    const instance = plainToInstance(CreateStudentDto, {
      firstName: 'Ali',
      phone: '+998901234567',
      organizationId: 'malicious-org-id-12345',
    });
    const errors = await validate(instance, { whitelist: true, forbidNonWhitelisted: true });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'organizationId')).toBe(true);
  });

  it('3. should reject tenantId mass assignment in CreateStudentDto', async () => {
    const instance = plainToInstance(CreateStudentDto, {
      firstName: 'Ali',
      phone: '+998901234567',
      tenantId: 'malicious-tenant-id-12345',
    });
    const errors = await validate(instance, { whitelist: true, forbidNonWhitelisted: true });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'tenantId')).toBe(true);
  });

  it('4. should reject role mass assignment in CreateStudentDto', async () => {
    const instance = plainToInstance(CreateStudentDto, {
      firstName: 'Ali',
      phone: '+998901234567',
      role: 'SUPER_ADMIN',
    });
    const errors = await validate(instance, { whitelist: true, forbidNonWhitelisted: true });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'role')).toBe(true);
  });

  it('5. should reject createdAt and deletedAt mass assignment in CreateStudentDto', async () => {
    const instance = plainToInstance(CreateStudentDto, {
      firstName: 'Ali',
      phone: '+998901234567',
      createdAt: '2020-01-01T00:00:00.000Z',
      deletedAt: null,
    });
    const errors = await validate(instance, { whitelist: true, forbidNonWhitelisted: true });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('6. should reject invalid student email format', async () => {
    const instance = plainToInstance(CreateStudentDto, {
      firstName: 'Ali',
      phone: '+998901234567',
      email: 'not-an-email',
    });
    const errors = await validate(instance, { whitelist: true, forbidNonWhitelisted: true });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });

  it('7. should reject invalid student date format', async () => {
    const instance = plainToInstance(CreateStudentDto, {
      firstName: 'Ali',
      phone: '+998901234567',
      birthDate: 'invalid-date-string',
    });
    const errors = await validate(instance, { whitelist: true, forbidNonWhitelisted: true });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'birthDate')).toBe(true);
  });

  it('8. should reject invalid student status enum', async () => {
    const instance = plainToInstance(CreateStudentDto, {
      firstName: 'Ali',
      phone: '+998901234567',
      status: 'SUPER_VIP_INVALID_STATUS',
    });
    const errors = await validate(instance, { whitelist: true, forbidNonWhitelisted: true });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'status')).toBe(true);
  });

  it('9. should reject course with negative price', async () => {
    const instance = plainToInstance(CreateCourseDto, {
      name: 'Math',
      price: -50000,
      duration: 3,
      lessonCount: 24,
    });
    const errors = await validate(instance, { whitelist: true, forbidNonWhitelisted: true });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'price')).toBe(true);
  });

  it('10. should reject course with zero or negative duration', async () => {
    const instance = plainToInstance(CreateCourseDto, {
      name: 'Math',
      price: 50000,
      duration: 0,
      lessonCount: 24,
    });
    const errors = await validate(instance, { whitelist: true, forbidNonWhitelisted: true });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'duration')).toBe(true);
  });

  it('11. should reject group with invalid lessonDays enum', async () => {
    const instance = plainToInstance(CreateGroupDto, {
      name: 'Group A',
      courseId: 'c-1',
      startTime: '09:00',
      endTime: '11:00',
      days: 'INVALID_DAYS',
    });
    const errors = await validate(instance, { whitelist: true, forbidNonWhitelisted: true });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'days')).toBe(true);
  });

  it('12. should reject payment with negative amount', async () => {
    const instance = plainToInstance(CreatePaymentDto, {
      studentId: 'st-1',
      amount: -100,
    });
    const errors = await validate(instance, { whitelist: true, forbidNonWhitelisted: true });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'amount')).toBe(true);
  });

  it('13. should reject contract with negative totalAmount', async () => {
    const instance = plainToInstance(CreateContractDto, {
      studentId: 'st-1',
      totalAmount: -1000,
    });
    const errors = await validate(instance, { whitelist: true, forbidNonWhitelisted: true });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'totalAmount')).toBe(true);
  });

  it('14. should reject exam with negative maxScore', async () => {
    const instance = plainToInstance(CreateExamDto, {
      groupId: 'grp-1',
      title: 'Midterm',
      maxScore: -10,
    });
    const errors = await validate(instance, { whitelist: true, forbidNonWhitelisted: true });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'maxScore')).toBe(true);
  });

  it('15. should reject parent with missing fullName', async () => {
    const instance = plainToInstance(CreateParentDto, {
      relationship: 'MOTHER',
    });
    const errors = await validate(instance, { whitelist: true, forbidNonWhitelisted: true });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'fullName')).toBe(true);
  });

  it('16. should accept valid LinkStudentParentDto pair', async () => {
    const instance = plainToInstance(LinkStudentParentDto, {
      studentId: 'uuid-student-1',
      parentId: 'uuid-parent-1',
      relationship: 'MOTHER',
      isPrimary: true,
    });
    const errors = await validate(instance, { whitelist: true, forbidNonWhitelisted: true });
    expect(errors.length).toBe(0);
  });

  it('17. should reject attendance with invalid status', async () => {
    const instance = plainToInstance(MarkAttendanceDto, {
      groupId: 'grp-1',
      date: '2026-09-01',
      records: [
        {
          studentId: 'st-1',
          status: 'UNKNOWN_ATTENDANCE_STATUS',
        },
      ],
    });
    const errors = await validate(instance, { whitelist: true, forbidNonWhitelisted: true });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('18. should reject unknown injected fields in CreatePaymentDto', async () => {
    const instance = plainToInstance(CreatePaymentDto, {
      studentId: 'st-1',
      amount: 500000,
      organizationId: 'injected-org-id',
      receivedById: 'injected-receiver-id',
    });
    const errors = await validate(instance, { whitelist: true, forbidNonWhitelisted: true });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'organizationId')).toBe(true);
  });
});
