/**
 * Centralized Education Domain Constants for EduHub Frontend
 */

export const SCHOOL_QUARTERS = Object.freeze([
  {
    id: "1",
    name: "1-CHORAK",
    title: "1-chorak",
    startDate: "2025-09-02",
    endDate: "2025-11-03",
    dateRangeText: "02.09.2025 - 03.11.2025",
  },
  {
    id: "2",
    name: "2-CHORAK",
    title: "2-chorak",
    startDate: "2025-11-10",
    endDate: "2025-12-27",
    dateRangeText: "10.11.2025 - 27.12.2025",
  },
  {
    id: "3",
    name: "3-CHORAK",
    title: "3-chorak",
    startDate: "2026-01-12",
    endDate: "2026-03-20",
    dateRangeText: "12.01.2026 - 20.03.2026",
  },
  {
    id: "4",
    name: "4-CHORAK",
    title: "4-chorak",
    startDate: "2026-03-27",
    endDate: "2026-05-25",
    dateRangeText: "27.03.2026 - 25.05.2026",
  },
]);

export const WEEKDAYS = Object.freeze([
  { key: "mon", label: "Dushanba", shortLabel: "Dush" },
  { key: "tue", label: "Seshanba", shortLabel: "Sesh" },
  { key: "wed", label: "Chorshanba", shortLabel: "Chor" },
  { key: "thu", label: "Payshanba", shortLabel: "Pay" },
  { key: "fri", label: "Juma", shortLabel: "Juma" },
  { key: "sat", label: "Shanba", shortLabel: "Shan" },
]);

export const BELL_SCHEDULE = Object.freeze([
  { slot: 1, start: "08:30", end: "09:15" },
  { slot: 2, start: "09:25", end: "10:10" },
  { slot: 3, start: "10:20", end: "11:05" },
  { slot: 4, start: "11:25", end: "12:10" },
  { slot: 5, start: "12:20", end: "13:05" },
  { slot: 6, start: "13:15", end: "14:00" },
  { slot: 7, start: "14:10", end: "14:55" },
]);

export const STANDARD_CLASS_NAMES = Object.freeze([
  "1-A",
  "1-B",
  "2-A",
  "2-B",
  "3-A",
  "3-B",
  "4-A",
  "4-B",
  "5-A",
  "5-B",
  "6-A",
  "6-B",
  "7-A",
  "7-B",
  "8-A",
  "8-B",
  "9-A",
  "9-B",
  "10-A",
  "10-B",
  "11-A",
  "11-B",
]);

export const STUDENT_STAGES = Object.freeze([
  { label: "O'quvchi", value: "O'quvchi" },
  { label: "Sinov", value: "Sinov" },
  { label: "Lid", value: "Lid" },
]);

export const STUDENT_DEBT_OPTIONS = Object.freeze([
  { label: "Qarzdorlar", value: "DEBT" },
  { label: "Qarzsizlar", value: "NO_DEBT" },
]);

export const DEFAULT_SUBJECTS = Object.freeze([
  "Matematika",
  "Ona tili",
  "Adabiyot",
  "Ingliz tili",
  "Fizika",
  "Kimyo",
  "Biologiya",
  "Tarix",
  "Informatika",
  "Geografiya",
  "Jismoniy tarbiya",
  "Musiqa",
]);
