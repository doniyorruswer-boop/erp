/**
 * EduHub ERP — Terminology Defaults & Dictionary
 * Provides type-safe terminology definitions, business presets, and fallback dictionaries.
 */

export type TerminologyKey =
  "client" | "staff" | "service" | "group" | "lesson" | "room" | "student" | "teacher" | "course";

export type TerminologyForm = "singular" | "plural";

export interface TermPair {
  singular: string;
  plural: string;
}

export type TerminologyDictionary = Record<TerminologyKey, TermPair>;

/**
 * Universal pluralizer for Uzbek words.
 * Appends '-lar' unless already pluralized.
 */
export function pluralizeUzbek(word: string): string {
  if (!word || typeof word !== "string") return "";
  const trimmed = word.trim();
  if (trimmed.toLowerCase().endsWith("lar")) {
    return trimmed;
  }
  return `${trimmed}lar`;
}

/**
 * Default fallback dictionary ensuring no label ever resolves to undefined.
 */
export const DEFAULT_FALLBACK_TERMINOLOGY: TerminologyDictionary = {
  client: { singular: "O'quvchi", plural: "O'quvchilar" },
  staff: { singular: "O'qituvchi", plural: "O'qituvchilar" },
  service: { singular: "Kurs", plural: "Kurslar" },
  group: { singular: "Guruh", plural: "Guruhlar" },
  lesson: { singular: "Dars", plural: "Darslar" },
  room: { singular: "Xona", plural: "Xonalar" },
  student: { singular: "O'quvchi", plural: "O'quvchilar" },
  teacher: { singular: "O'qituvchi", plural: "O'qituvchilar" },
  course: { singular: "Kurs", plural: "Kurslar" },
};

/**
 * Business presets for instant terminology resolution based on BusinessType.
 */
export const DEFAULT_BUSINESS_TERMINOLOGY: Record<string, TerminologyDictionary> = {
  COURSE_CENTER: {
    client: { singular: "O'quvchi", plural: "O'quvchilar" },
    staff: { singular: "Mentor", plural: "Mentorlar" },
    service: { singular: "Kurs", plural: "Kurslar" },
    group: { singular: "Guruh", plural: "Guruhlar" },
    lesson: { singular: "Dars", plural: "Darslar" },
    room: { singular: "Xona", plural: "Xonalar" },
    student: { singular: "O'quvchi", plural: "O'quvchilar" },
    teacher: { singular: "Mentor", plural: "Mentorlar" },
    course: { singular: "Kurs", plural: "Kurslar" },
  },
  SCHOOL: {
    client: { singular: "O'quvchi", plural: "O'quvchilar" },
    staff: { singular: "O'qituvchi", plural: "O'qituvchilar" },
    service: { singular: "Fan", plural: "Fanlar" },
    group: { singular: "Sinf", plural: "Sinflar" },
    lesson: { singular: "Dars", plural: "Darslar" },
    room: { singular: "Sinfxona", plural: "Sinfxonalar" },
    student: { singular: "O'quvchi", plural: "O'quvchilar" },
    teacher: { singular: "O'qituvchi", plural: "O'qituvchilar" },
    course: { singular: "Fan", plural: "Fanlar" },
  },
  KINDERGARTEN: {
    client: { singular: "Tarbiyalanuvchi", plural: "Tarbiyalanuvchilar" },
    staff: { singular: "Tarbiyachi", plural: "Tarbiyachilar" },
    service: { singular: "Mashg'ulot", plural: "Mashg'ulotlar" },
    group: { singular: "Guruh", plural: "Guruhlar" },
    lesson: { singular: "Mashg'ulot", plural: "Mashg'ulotlar" },
    room: { singular: "Xona", plural: "Xonalar" },
    student: { singular: "Tarbiyalanuvchi", plural: "Tarbiyalanuvchilar" },
    teacher: { singular: "Tarbiyachi", plural: "Tarbiyachilar" },
    course: { singular: "Mashg'ulot", plural: "Mashg'ulotlar" },
  },
  CLINIC: {
    client: { singular: "Bemor", plural: "Bemorlar" },
    staff: { singular: "Shifokor", plural: "Shifokorlar" },
    service: { singular: "Xizmat", plural: "Xizmatlar" },
    group: { singular: "Bo'lim", plural: "Bo'limlar" },
    lesson: { singular: "Qabul", plural: "Qabullar" },
    room: { singular: "Xona", plural: "Xonalar" },
    student: { singular: "Bemor", plural: "Bemorlar" },
    teacher: { singular: "Shifokor", plural: "Shifokorlar" },
    course: { singular: "Xizmat", plural: "Xizmatlar" },
  },
  SERVICES: {
    client: { singular: "Mijoz", plural: "Mijozlar" },
    staff: { singular: "Mutaxassis", plural: "Mutaxassislar" },
    service: { singular: "Xizmat", plural: "Xizmatlar" },
    group: { singular: "Bo'lim", plural: "Bo'limlar" },
    lesson: { singular: "Seans", plural: "Seanslar" },
    room: { singular: "Xona", plural: "Xonalar" },
    student: { singular: "Mijoz", plural: "Mijozlar" },
    teacher: { singular: "Mutaxassis", plural: "Mutaxassislar" },
    course: { singular: "Xizmat", plural: "Xizmatlar" },
  },
};

/**
 * Backend field name mapping to canonical terminology keys.
 */
export const BACKEND_FIELD_MAP: Record<TerminologyKey, string[]> = {
  client: ["studentLabel", "clientLabel", "patientLabel"],
  student: ["studentLabel", "clientLabel", "patientLabel"],
  staff: ["teacherLabel", "staffLabel", "doctorLabel"],
  teacher: ["teacherLabel", "staffLabel", "doctorLabel"],
  service: ["courseLabel", "serviceLabel"],
  course: ["courseLabel", "serviceLabel"],
  group: ["groupLabel", "classLabel"],
  lesson: ["lessonLabel", "sessionLabel"],
  room: ["roomLabel", "classroomLabel"],
};
