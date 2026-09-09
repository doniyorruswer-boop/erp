/**
 * Test script for Scheduling Extension & Conflict Policies
 * Tests:
 * 1. Working hours policy validation (time of day and day of week)
 * 2. Status-aware conflict checking (CANCELLED schedules do not conflict)
 * 3. Auto-kind resolution (GROUP_CLASS vs APPOINTMENT)
 * 4. Cancellation and Reschedule lifecycle transitions
 */

const assert = require('assert');

// Enums matching @prisma/client / schema.prisma
const ScheduleKind = {
  GROUP_CLASS: 'GROUP_CLASS',
  APPOINTMENT: 'APPOINTMENT',
};

const ScheduleStatus = {
  SCHEDULED: 'SCHEDULED',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW',
};

// 1. Working Hours Policy Checker (mirroring backend logic)
function validateWorkingHours(startAtDate, endAtDate, workingHours) {
  if (!workingHours || typeof workingHours !== 'object') return null;
  const { start, end, days } = workingHours;
  if (!start || !end) return null;

  const dayOfWeek = startAtDate.getDay();
  if (Array.isArray(days) && days.length > 0 && !days.includes(dayOfWeek)) {
    return {
      type: 'WORKING_HOURS',
      message: 'Mutaxassis ushbu kunda ishlamaydi',
    };
  }

  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const startMinutes = startAtDate.getHours() * 60 + startAtDate.getMinutes();
  const endMinutes = endAtDate.getHours() * 60 + endAtDate.getMinutes();
  const whStartMin = sh * 60 + sm;
  const whEndMin = eh * 60 + em;

  if (startMinutes < whStartMin || endMinutes > whEndMin) {
    return {
      type: 'WORKING_HOURS',
      message: `Mutaxassis ish vaqtidan tashqarida (${start} - ${end})`,
    };
  }

  return null;
}

// 2. Status-aware Conflict Checker (mirroring backend logic)
function checkScheduleOverlap(newStart, newEnd, existingSchedules) {
  const nStart = new Date(newStart).getTime();
  const nEnd = new Date(newEnd).getTime();

  return existingSchedules.filter((sched) => {
    // Crucial rule: CANCELLED schedules must NEVER conflict!
    if (sched.status === ScheduleStatus.CANCELLED) {
      return false;
    }
    const eStart = new Date(sched.startAt).getTime();
    const eEnd = new Date(sched.endAt).getTime();
    // Overlap condition: startAt < endAt AND endAt > startAt
    return eStart < nEnd && eEnd > nStart;
  });
}

// 3. Auto-Kind Resolution (mirroring backend logic)
function resolveScheduleKind(data) {
  if (data.kind) return data.kind;
  if (data.groupId) return ScheduleKind.GROUP_CLASS;
  if (data.studentId) return ScheduleKind.APPOINTMENT;
  return ScheduleKind.GROUP_CLASS;
}

// 4. Lifecycle transitions
function cancelSchedule(schedule, cancelReason) {
  if (schedule.status === ScheduleStatus.CANCELLED) {
    throw new Error('Ushbu jadval allaqachon bekor qilingan');
  }
  return {
    ...schedule,
    status: ScheduleStatus.CANCELLED,
    cancelReason,
  };
}

function reschedule(schedule, newStartAt, newEndAt) {
  const start = new Date(newStartAt);
  const end = new Date(newEndAt);
  if (end <= start) {
    throw new Error("Tugash vaqti boshlanish vaqtidan keyin bo'lishi kerak");
  }
  return {
    ...schedule,
    startAt: start.toISOString(),
    endAt: end.toISOString(),
    status: ScheduleStatus.SCHEDULED,
    cancelReason: null,
  };
}

// --- RUN TESTS ---
console.log('--- RUNNING SCHEDULING POLICY TESTS ---');

// Test 1: Working hours validation
console.log('1. Testing Working Hours Policy...');
const doctorHours = {
  start: '09:00',
  end: '17:00',
  days: [1, 2, 3, 4, 5], // Mon - Fri
};

// Monday 10:00 - 11:00 (inside hours)
const validStart = new Date('2026-09-14T10:00:00'); // 2026-09-14 is Monday
const validEnd = new Date('2026-09-14T11:00:00');
assert.strictEqual(validateWorkingHours(validStart, validEnd, doctorHours), null, 'Should be valid within hours');

// Monday 08:00 - 09:30 (starts before 09:00)
const earlyStart = new Date('2026-09-14T08:00:00');
const earlyEnd = new Date('2026-09-14T09:30:00');
const earlyConflict = validateWorkingHours(earlyStart, earlyEnd, doctorHours);
assert.ok(earlyConflict !== null, 'Should detect early start conflict');
assert.strictEqual(earlyConflict.type, 'WORKING_HOURS');

// Monday 16:30 - 17:30 (ends after 17:00)
const lateStart = new Date('2026-09-14T16:30:00');
const lateEnd = new Date('2026-09-14T17:30:00');
const lateConflict = validateWorkingHours(lateStart, lateEnd, doctorHours);
assert.ok(lateConflict !== null, 'Should detect late end conflict');

// Sunday 11:00 - 12:00 (day 0, not in working days)
const sundayStart = new Date('2026-09-13T11:00:00'); // 2026-09-13 is Sunday
const sundayEnd = new Date('2026-09-13T12:00:00');
const dayConflict = validateWorkingHours(sundayStart, sundayEnd, doctorHours);
assert.ok(dayConflict !== null, 'Should detect working day mismatch');
assert.ok(dayConflict.message.includes('ishlamaydi'));
console.log('  ✓ Working Hours Policy validation passed');

// Test 2: Status-aware conflict checking
console.log('2. Testing Status-aware Conflict Checking...');
const existingSlots = [
  {
    id: 'slot-1',
    title: 'Dr. Karimov - Qabul',
    startAt: '2026-09-14T10:00:00',
    endAt: '2026-09-14T11:00:00',
    status: ScheduleStatus.SCHEDULED,
  },
  {
    id: 'slot-2',
    title: 'Dr. Karimov - Bekor qilingan qabul',
    startAt: '2026-09-14T14:00:00',
    endAt: '2026-09-14T15:00:00',
    status: ScheduleStatus.CANCELLED,
    cancelReason: 'Bemor kela olmadi',
  },
];

// Slot overlaps with active slot-1
const overlapsActive = checkScheduleOverlap('2026-09-14T10:30:00', '2026-09-14T11:30:00', existingSlots);
assert.strictEqual(overlapsActive.length, 1, 'Should find 1 conflict with active slot');
assert.strictEqual(overlapsActive[0].id, 'slot-1');

// Slot overlaps with cancelled slot-2
const overlapsCancelled = checkScheduleOverlap('2026-09-14T14:15:00', '2026-09-14T14:45:00', existingSlots);
assert.strictEqual(overlapsCancelled.length, 0, 'Cancelled schedule must NOT cause conflict');
console.log('  ✓ Cancelled schedules properly ignored in conflict checks');

// Test 3: Auto-Kind Resolution
console.log('3. Testing Auto-Kind Resolution...');
assert.strictEqual(
  resolveScheduleKind({ groupId: 'group-101' }),
  ScheduleKind.GROUP_CLASS,
  'groupId should resolve to GROUP_CLASS'
);
assert.strictEqual(
  resolveScheduleKind({ studentId: 'student-202' }),
  ScheduleKind.APPOINTMENT,
  'studentId without groupId should resolve to APPOINTMENT'
);
assert.strictEqual(
  resolveScheduleKind({ groupId: 'group-101', studentId: 'student-202' }),
  ScheduleKind.GROUP_CLASS,
  'Both groupId and studentId should prioritize GROUP_CLASS'
);
assert.strictEqual(
  resolveScheduleKind({ kind: ScheduleKind.APPOINTMENT, groupId: 'group-101' }),
  ScheduleKind.APPOINTMENT,
  'Explicit kind should always take precedence'
);
assert.strictEqual(
  resolveScheduleKind({}),
  ScheduleKind.GROUP_CLASS,
  'Default fallback must be GROUP_CLASS'
);
console.log('  ✓ Auto-Kind resolution passed');

// Test 4: Cancellation & Reschedule Lifecycle
console.log('4. Testing Cancellation & Reschedule Lifecycle...');
let appt = {
  id: 'appt-1',
  title: 'Kardiolog konsultatsiyasi',
  startAt: '2026-09-14T10:00:00.000Z',
  endAt: '2026-09-14T10:45:00.000Z',
  status: ScheduleStatus.SCHEDULED,
  cancelReason: null,
};

// Cancel appointment
appt = cancelSchedule(appt, "Bemorning iltimosiga ko'ra");
assert.strictEqual(appt.status, ScheduleStatus.CANCELLED);
assert.strictEqual(appt.cancelReason, "Bemorning iltimosiga ko'ra");

// Attempt to cancel again should throw
assert.throws(() => {
  cancelSchedule(appt, 'Ikkinchi marta bekor qilish');
}, /allaqachon bekor qilingan/);

// Reschedule appointment
appt = reschedule(appt, '2026-09-15T11:00:00.000Z', '2026-09-15T11:45:00.000Z');
assert.strictEqual(appt.status, ScheduleStatus.SCHEDULED);
assert.strictEqual(appt.cancelReason, null);
assert.strictEqual(appt.startAt, '2026-09-15T11:00:00.000Z');

// Reschedule with invalid time range should throw
assert.throws(() => {
  reschedule(appt, '2026-09-15T12:00:00.000Z', '2026-09-15T11:00:00.000Z');
}, /Tugash vaqti boshlanish vaqtidan keyin/);
console.log('  ✓ Cancellation & Reschedule lifecycle passed');

console.log('\n--- ALL SCHEDULING TESTS PASSED SUCCESSFULLY! ---');
