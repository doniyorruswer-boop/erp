// Maktabdan/Guruhdan chetlatilgan o'quvchilar ma'lumotlar bazasi

export const initialDroppedStudents = [
  {
    id: "drop-101",
    studentId: "25002600103",
    fullName: "Abdullayev Bobur",
    className: "5-A",
    phone: "+998 (90) 123-45-67",
    droppedDate: "2026-07-18",
    reasonCategory: "Boshqa shaharga ko'chish",
    reason: "Boshqa shaharga ko'chish: Oilasi bilan boshqa shaharga ko'chib ketmoqda.",
    notes: "Hujjatlari topshirilgan, qarzdorligi yo'q.",
  },
  {
    id: "drop-102",
    studentId: "25002600205",
    fullName: "Karimov Jasur",
    className: "9-A",
    phone: "+998 (93) 512-34-56",
    droppedDate: "2026-08-05",
    reasonCategory: "Boshqa ta'lim muassasasiga o'tish",
    reason: "Boshqa maktabga o'tish: Ixtisoslashtirilgan litseyga qabul qilindi.",
    notes: "Tavsiyanoma va baholar tabeli berildi.",
  },
  {
    id: "drop-103",
    studentId: "25002600312",
    fullName: "Toshmatova Zilola",
    className: "7-A",
    phone: "+998 (97) 745-12-89",
    droppedDate: "2026-08-20",
    reasonCategory: "O'qish narxi / Shartnoma",
    reason: "O'qish narxi sababli: Shartnoma to'lovi o'z vaqtida to'lanmadi.",
    notes: "Ota-onasi bilan kelishilgan holda shartnoma bekor qilindi.",
  },
  {
    id: "drop-104",
    studentId: "25002600418",
    fullName: "Rustamov Diyorbek",
    className: "6-B",
    phone: "+998 (99) 831-22-33",
    droppedDate: "2026-09-01",
    reasonCategory: "Salomatlik sababli",
    reason: "Salomatlik sababli: Uzoq muddatli davolanishga ketmoqda.",
    notes: "Tibbiy ma'lumotnoma ilova qilingan.",
  },
  {
    id: "drop-105",
    studentId: "25002600520",
    fullName: "Yo'ldoshev Otabek",
    className: "10-A",
    phone: "+998 (91) 402-99-11",
    droppedDate: "2026-09-03",
    reasonCategory: "Intizom qoidalari buzilishi",
    reason: "Intizom buzilishi: Darslarni muntazam sababsiz qoldirgan.",
    notes: "Pedagogik kengash qarori asosida chetlatildi.",
  },
  {
    id: "drop-106",
    studentId: "25002600615",
    fullName: "Sodiqova Madina",
    className: "2-B",
    phone: "+998 (95) 170-45-60",
    droppedDate: "2026-08-14",
    reasonCategory: "Oilaviy sharoit",
    reason: "Oilaviy sharoit: Yashash manzili uzoqlashganligi sababli.",
    notes: "Ariza asosida chetlatildi.",
  },
  {
    id: "drop-107",
    studentId: "25002600724",
    fullName: "Qodirov Sardor",
    className: "8-A",
    phone: "+998 (94) 620-77-88",
    droppedDate: "2026-07-29",
    reasonCategory: "O'z xohishiga ko'ra",
    reason: "O'z xohishiga ko'ra: Ota-onasining arizasiga binoan.",
    notes: "Barcha hisob-kitoblar to'liq yopildi.",
  },
];

const STORAGE_KEY = "educrm_dropped_students_list";

export function loadSchoolDroppedStudents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Error loading dropped students from localStorage:", e);
  }
  saveSchoolDroppedStudents(initialDroppedStudents);
  return [...initialDroppedStudents];
}

export function saveSchoolDroppedStudents(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error("Error saving dropped students to localStorage:", e);
  }
}

export function deleteDroppedStudent(id) {
  const list = loadSchoolDroppedStudents();
  const filtered = list.filter((s) => s.id !== id);
  saveSchoolDroppedStudents(filtered);
  return filtered;
}

export function restoreDroppedStudent(id, targetClass = null) {
  const list = loadSchoolDroppedStudents();
  const student = list.find((s) => s.id === id);
  if (!student) return null;

  const filtered = list.filter((s) => s.id !== id);
  saveSchoolDroppedStudents(filtered);

  // Faol o'quvchilar safiga qo'shish
  try {
    const STUDENTS_STORAGE_KEY = "educrm_school_students_list";
    const studentsRaw = localStorage.getItem(STUDENTS_STORAGE_KEY);
    let students = studentsRaw ? JSON.parse(studentsRaw) : [];

    // Agar oldin mavjud bo'lmasa yoki qayta tiklansa
    const restoredRecord = {
      ...student,
      className: targetClass || student.className,
      status: "Faol",
      stage: "O'quvchi",
      restoredAt: new Date().toISOString().split("T")[0],
    };

    const existingIndex = students.findIndex(
      (s) => s.id === student.id || s.studentId === student.studentId
    );
    if (existingIndex >= 0) {
      students[existingIndex] = { ...students[existingIndex], ...restoredRecord };
    } else {
      students.unshift(restoredRecord);
    }
    localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(students));
  } catch (e) {
    console.error("Error syncing restored student to active list:", e);
  }

  return student;
}

export function addDroppedStudent(data) {
  const list = loadSchoolDroppedStudents();
  const newRecord = {
    id: `drop-${Date.now()}`,
    studentId: data.studentId || String(Date.now()),
    fullName: data.fullName,
    className: data.className || "1-A",
    phone: data.phone || "",
    droppedDate: data.droppedDate || new Date().toISOString().split("T")[0],
    reasonCategory: data.reasonCategory || "Boshqa sabab",
    reason: data.reason || "Chetlatilgan",
    notes: data.notes || "",
  };
  list.unshift(newRecord);
  saveSchoolDroppedStudents(list);
  return newRecord;
}
