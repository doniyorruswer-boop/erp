/**
 * Test script for Terminology Engine logic
 */

const assert = require('assert');

// Test pluralizeUzbek
function pluralizeUzbek(word) {
  if (!word || typeof word !== 'string') return '';
  const trimmed = word.trim();
  if (trimmed.toLowerCase().endsWith('lar')) {
    return trimmed;
  }
  return `${trimmed}lar`;
}

// Defaults & business presets
const DEFAULT_FALLBACK_TERMINOLOGY = {
  client: { singular: "O'quvchi", plural: "O'quvchilar" },
  staff: { singular: "O'qituvchi", plural: "O'qituvchilar" },
  service: { singular: 'Kurs', plural: 'Kurslar' },
  group: { singular: 'Guruh', plural: 'Guruhlar' },
  lesson: { singular: 'Dars', plural: 'Darslar' },
  room: { singular: 'Xona', plural: 'Xonalar' },
  student: { singular: "O'quvchi", plural: "O'quvchilar" },
  teacher: { singular: "O'qituvchi", plural: "O'qituvchilar" },
  course: { singular: 'Kurs', plural: 'Kurslar' },
};

const DEFAULT_BUSINESS_TERMINOLOGY = {
  COURSE_CENTER: {
    client: { singular: "O'quvchi", plural: "O'quvchilar" },
    staff: { singular: 'Mentor', plural: 'Mentorlar' },
    service: { singular: 'Kurs', plural: 'Kurslar' },
    group: { singular: 'Guruh', plural: 'Guruhlar' },
    lesson: { singular: 'Dars', plural: 'Darslar' },
    room: { singular: 'Xona', plural: 'Xonalar' },
    student: { singular: "O'quvchi", plural: "O'quvchilar" },
    teacher: { singular: 'Mentor', plural: 'Mentorlar' },
    course: { singular: 'Kurs', plural: 'Kurslar' },
  },
  SCHOOL: {
    client: { singular: "O'quvchi", plural: "O'quvchilar" },
    staff: { singular: "O'qituvchi", plural: "O'qituvchilar" },
    service: { singular: 'Fan', plural: 'Fanlar' },
    group: { singular: 'Sinf', plural: 'Sinflar' },
    lesson: { singular: 'Dars', plural: 'Darslar' },
    room: { singular: 'Sinfxona', plural: 'Sinfxonalar' },
    student: { singular: "O'quvchi", plural: "O'quvchilar" },
    teacher: { singular: "O'qituvchi", plural: "O'qituvchilar" },
    course: { singular: 'Fan', plural: 'Fanlar' },
  },
  KINDERGARTEN: {
    client: { singular: 'Tarbiyalanuvchi', plural: 'Tarbiyalanuvchilar' },
    staff: { singular: 'Tarbiyachi', plural: 'Tarbiyachilar' },
    service: { singular: "Mashg'ulot", plural: "Mashg'ulotlar" },
    group: { singular: 'Guruh', plural: 'Guruhlar' },
    lesson: { singular: "Mashg'ulot", plural: "Mashg'ulotlar" },
    room: { singular: 'Xona', plural: 'Xonalar' },
    student: { singular: 'Tarbiyalanuvchi', plural: 'Tarbiyalanuvchilar' },
    teacher: { singular: 'Tarbiyachi', plural: 'Tarbiyachilar' },
    course: { singular: "Mashg'ulot", plural: "Mashg'ulotlar" },
  },
  CLINIC: {
    client: { singular: 'Bemor', plural: 'Bemorlar' },
    staff: { singular: 'Shifokor', plural: 'Shifokorlar' },
    service: { singular: 'Xizmat', plural: 'Xizmatlar' },
    group: { singular: "Bo'lim", plural: "Bo'limlar" },
    lesson: { singular: 'Qabul', plural: 'Qabullar' },
    room: { singular: 'Xona', plural: 'Xonalar' },
    student: { singular: 'Bemor', plural: 'Bemorlar' },
    teacher: { singular: 'Shifokor', plural: 'Shifokorlar' },
    course: { singular: 'Xizmat', plural: 'Xizmatlar' },
  },
};

const BACKEND_FIELD_MAP = {
  client: ['studentLabel', 'clientLabel', 'patientLabel'],
  student: ['studentLabel', 'clientLabel', 'patientLabel'],
  staff: ['teacherLabel', 'staffLabel', 'doctorLabel'],
  teacher: ['teacherLabel', 'staffLabel', 'doctorLabel'],
  service: ['courseLabel', 'serviceLabel'],
  course: ['courseLabel', 'serviceLabel'],
  group: ['groupLabel', 'classLabel'],
  lesson: ['lessonLabel', 'sessionLabel'],
  room: ['roomLabel', 'classroomLabel'],
};

function findBackendTerm(rawTerms, fieldKeys) {
  if (!rawTerms || typeof rawTerms !== 'object') {
    return null;
  }
  for (const field of fieldKeys) {
    const val = rawTerms[field];
    if (typeof val === 'string' && val.trim().length > 0) {
      return val.trim();
    }
  }
  return null;
}

function resolveTerm(key, form, rawTerms, businessType) {
  const fieldKeys = BACKEND_FIELD_MAP[key] || [key];
  const backendVal = findBackendTerm(rawTerms, fieldKeys);

  if (backendVal) {
    return form === 'plural' ? pluralizeUzbek(backendVal) : backendVal;
  }

  const businessPreset = DEFAULT_BUSINESS_TERMINOLOGY[businessType];
  if (businessPreset && businessPreset[key]) {
    return businessPreset[key][form];
  }

  const fallback = DEFAULT_FALLBACK_TERMINOLOGY[key];
  return fallback ? fallback[form] : key;
}

console.log('--- RUNNING TERMINOLOGY ENGINE TESTS ---');

// Test 1: Uzbek Pluralization
assert.strictEqual(pluralizeUzbek("O'quvchi"), "O'quvchilar");
assert.strictEqual(pluralizeUzbek("O'quvchilar"), "O'quvchilar");
assert.strictEqual(pluralizeUzbek("Bemor"), "Bemorlar");
assert.strictEqual(pluralizeUzbek("Tarbiyalanuvchi"), "Tarbiyalanuvchilar");
console.log('✅ Test 1 Passed: Uzbek pluralization works');

// Test 2: Fallback with empty/null terminology
assert.strictEqual(resolveTerm('client', 'singular', {}, 'UNKNOWN'), "O'quvchi");
assert.strictEqual(resolveTerm('client', 'plural', {}, 'UNKNOWN'), "O'quvchilar");
assert.strictEqual(resolveTerm('staff', 'singular', null, 'UNKNOWN'), "O'qituvchi");
assert.strictEqual(resolveTerm('group', 'singular', undefined, 'UNKNOWN'), "Guruh");
console.log('✅ Test 2 Passed: Safe fallback with empty/null terminology');

// Test 3: Business Presets without backend overrides
assert.strictEqual(resolveTerm('group', 'singular', {}, 'SCHOOL'), 'Sinf');
assert.strictEqual(resolveTerm('group', 'plural', {}, 'SCHOOL'), 'Sinflar');
assert.strictEqual(resolveTerm('service', 'singular', {}, 'SCHOOL'), 'Fan');
assert.strictEqual(resolveTerm('client', 'singular', {}, 'CLINIC'), 'Bemor');
assert.strictEqual(resolveTerm('client', 'plural', {}, 'CLINIC'), 'Bemorlar');
assert.strictEqual(resolveTerm('staff', 'singular', {}, 'CLINIC'), 'Shifokor');
assert.strictEqual(resolveTerm('client', 'singular', {}, 'KINDERGARTEN'), 'Tarbiyalanuvchi');
assert.strictEqual(resolveTerm('client', 'plural', {}, 'KINDERGARTEN'), 'Tarbiyalanuvchilar');
console.log('✅ Test 3 Passed: Business presets resolve correctly');

// Test 4: Backend overrides (Demo organization 1: educrm-markaziy)
const demo1Terms = { groupLabel: 'Guruh', courseLabel: 'Kurs', studentLabel: "O'quvchi", teacherLabel: 'Mentor' };
assert.strictEqual(resolveTerm('client', 'singular', demo1Terms, 'COURSE_CENTER'), "O'quvchi");
assert.strictEqual(resolveTerm('client', 'plural', demo1Terms, 'COURSE_CENTER'), "O'quvchilar");
assert.strictEqual(resolveTerm('staff', 'singular', demo1Terms, 'COURSE_CENTER'), 'Mentor');
assert.strictEqual(resolveTerm('staff', 'plural', demo1Terms, 'COURSE_CENTER'), 'Mentorlar');
console.log('✅ Test 4 Passed: Demo organization (educrm-markaziy) terminology matches');

// Test 5: Backend overrides (Demo organization 2: profi-maktab)
const demo2Terms = { groupLabel: 'Sinf', courseLabel: 'Fan', studentLabel: "O'quvchi", teacherLabel: "O'qituvchi" };
assert.strictEqual(resolveTerm('client', 'singular', demo2Terms, 'SCHOOL'), "O'quvchi");
assert.strictEqual(resolveTerm('group', 'singular', demo2Terms, 'SCHOOL'), 'Sinf');
assert.strictEqual(resolveTerm('group', 'plural', demo2Terms, 'SCHOOL'), 'Sinflar');
assert.strictEqual(resolveTerm('service', 'singular', demo2Terms, 'SCHOOL'), 'Fan');
console.log('✅ Test 5 Passed: Demo organization (profi-maktab) terminology matches');

// Test 6: Backend overrides (Demo organization 3: yulduzcha-bogcha)
const demo3Terms = { groupLabel: 'Guruh', courseLabel: "Mashg'ulot", studentLabel: 'Tarbiyalanuvchi', teacherLabel: 'Tarbiyachi' };
assert.strictEqual(resolveTerm('client', 'singular', demo3Terms, 'KINDERGARTEN'), 'Tarbiyalanuvchi');
assert.strictEqual(resolveTerm('client', 'plural', demo3Terms, 'KINDERGARTEN'), 'Tarbiyalanuvchilar');
assert.strictEqual(resolveTerm('staff', 'singular', demo3Terms, 'KINDERGARTEN'), 'Tarbiyachi');
assert.strictEqual(resolveTerm('service', 'singular', demo3Terms, 'KINDERGARTEN'), "Mashg'ulot");
console.log('✅ Test 6 Passed: Demo organization (yulduzcha-bogcha) terminology matches');

// Test 7: Backend overrides (Demo organization 4: universal-servis)
const demo4Terms = { groupLabel: 'Guruh', courseLabel: "Yo'nalish", studentLabel: 'Tinglovchi', teacherLabel: 'Instruktor' };
assert.strictEqual(resolveTerm('client', 'singular', demo4Terms, 'COURSE_CENTER'), 'Tinglovchi');
assert.strictEqual(resolveTerm('client', 'plural', demo4Terms, 'COURSE_CENTER'), 'Tinglovchilar');
assert.strictEqual(resolveTerm('staff', 'singular', demo4Terms, 'COURSE_CENTER'), 'Instruktor');
console.log('✅ Test 7 Passed: Demo organization (universal-servis) terminology matches');

// Test 8: Custom Clinic tenant configuration
const clinicTerms = { patientLabel: 'Bemor', doctorLabel: 'Shifokor', serviceLabel: 'Muolaja' };
assert.strictEqual(resolveTerm('client', 'singular', clinicTerms, 'CLINIC'), 'Bemor');
assert.strictEqual(resolveTerm('client', 'plural', clinicTerms, 'CLINIC'), 'Bemorlar');
assert.strictEqual(resolveTerm('staff', 'singular', clinicTerms, 'CLINIC'), 'Shifokor');
assert.strictEqual(resolveTerm('service', 'singular', clinicTerms, 'CLINIC'), 'Muolaja');
assert.strictEqual(resolveTerm('service', 'plural', clinicTerms, 'CLINIC'), 'Muolajalar');
console.log('✅ Test 8 Passed: Future-proof Clinic tenant configuration matches');

console.log('--- ALL 8 TERMINOLOGY TESTS PASSED! ---');
