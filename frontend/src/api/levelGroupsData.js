// Mock & Persistence Data for Level Groups (Darajalar va to'garaklar)
import { getStudentsByClass } from "@/api/schoolClassesData";

export const INITIAL_LEVEL_GROUPS = [
  {
    id: "lvl-1",
    name: "Informatika — dasturlash to'garagi",
    subject: "Informatika",
    teacherName: "Niyozova Sevara",
    level: "To'garak",
    sources: ["5-B", "6-A", "6-B", "7-A", "9-A", "10-A", "11-A"],
    capacity: 12,
    enrolledCount: 16,
    room: "304-IT xona",
    days: "Dush / Chor / Juma (14:30 - 16:00)",
    isLevelOnly: false,
    isArchived: false,
  },
  {
    id: "lvl-2",
    name: "Ingliz tili — Beginner",
    subject: "Ingliz tili",
    teacherName: "Usmonova Oysha",
    level: "Beginner",
    sources: ["5-A", "5-B", "6-A", "7-A", "8-A", "9-A", "10-A"],
    capacity: 15,
    enrolledCount: 16,
    room: "201-kabinet",
    days: "Sesh / Pay / Shanba (14:00 - 15:30)",
    isLevelOnly: true,
    isArchived: false,
  },
  {
    id: "lvl-3",
    name: "Ingliz tili — Intermediate",
    subject: "Ingliz tili",
    teacherName: "Toshpo'latova Asal",
    level: "Intermediate",
    sources: ["5-A", "5-B", "6-B", "7-A", "8-A", "9-A", "11-A"],
    capacity: 15,
    enrolledCount: 16,
    room: "205-kabinet",
    days: "Dush / Chor / Juma (15:30 - 17:00)",
    isLevelOnly: true,
    isArchived: false,
  },
  {
    id: "lvl-4",
    name: "Matematika — kuchaytirilgan",
    subject: "Matematika",
    teacherName: "Eshonova Hilola",
    level: "Kuchaytirilgan",
    sources: ["5-A", "5-B", "6-A", "6-B", "8-A", "9-A", "10-A", "11-A"],
    capacity: 12,
    enrolledCount: 16,
    room: "108-kabinet",
    days: "Sesh / Pay / Shanba (15:00 - 16:30)",
    isLevelOnly: true,
    isArchived: false,
  },
  {
    id: "lvl-5",
    name: "Shaxmat to'garagi",
    subject: "Shaxmat",
    teacherName: "Komilov Husan",
    level: "To'garak",
    sources: ["5-A", "6-A", "6-B", "7-A", "8-A", "10-A", "11-A"],
    capacity: 16,
    enrolledCount: 16,
    room: "Sport & Shaxmat zali",
    days: "Chor / Juma (16:00 - 17:30)",
    isLevelOnly: false,
    isArchived: false,
  },
  {
    id: "lvl-6",
    name: "Robototexnika va STEM",
    subject: "Robototexnika",
    teacherName: "Karimov Rustam",
    level: "Amaliy",
    sources: ["6-A", "7-A", "8-A", "9-A"],
    capacity: 14,
    enrolledCount: 12,
    room: "STEM laboratoriya",
    days: "Sesh / Shanba (14:30 - 16:00)",
    isLevelOnly: false,
    isArchived: false,
  },
  {
    id: "lvl-7",
    name: "Fizika — Olimpiada tayyorlov",
    subject: "Fizika",
    teacherName: "Xoliqova Nargiza",
    level: "Olimpiada",
    sources: ["8-A", "9-A", "10-A", "11-A"],
    capacity: 10,
    enrolledCount: 8,
    room: "Fizika laboratoriya",
    days: "Dush / Payshanba (16:00 - 17:30)",
    isLevelOnly: true,
    isArchived: false,
  },
  {
    id: "lvl-8",
    name: "Mental arifmetika",
    subject: "Matematika",
    teacherName: "Aliyeva Dildora",
    level: "Boshlang'ich",
    sources: ["1-A", "2-A", "3-A", "4-A"],
    capacity: 15,
    enrolledCount: 15,
    room: "102-kabinet",
    days: "Dush / Chor / Juma (13:30 - 14:45)",
    isLevelOnly: false,
    isArchived: false,
  },
  {
    id: "lvl-9",
    name: "Arab tili va xattotlik",
    subject: "Sharq tillari",
    teacherName: "Farhod Ismoilov",
    level: "Boshlang'ich",
    sources: ["5-A", "6-A", "7-A"],
    capacity: 12,
    enrolledCount: 10,
    room: "204-kabinet",
    days: "Sesh / Shanba (15:00 - 16:30)",
    isLevelOnly: true,
    isArchived: false,
  },
  {
    id: "lvl-10",
    name: "Rasm va tasviriy san'at",
    subject: "San'at",
    teacherName: "Madina Usmonova",
    level: "Ijodiy",
    sources: ["1-A", "2-B", "3-B", "5-A"],
    capacity: 15,
    enrolledCount: 14,
    room: "Tasviriy san'at ustaxonasi",
    days: "Dush / Payshanba (14:00 - 15:30)",
    isLevelOnly: false,
    isArchived: false,
  },
  {
    id: "lvl-11",
    name: "Biologiya — Yosh tabiatshunos",
    subject: "Biologiya",
    teacherName: "Zilola Karimova",
    level: "To'garak",
    sources: ["7-A", "8-A", "9-A"],
    capacity: 12,
    enrolledCount: 11,
    room: "Biologiya xonasi",
    days: "Chorshanba (15:00 - 16:30)",
    isLevelOnly: false,
    isArchived: false,
  },
];

const STORAGE_KEY = "educrm_level_groups_data";

export function loadLevelGroups() {
  if (typeof window !== "undefined" && window.localStorage) {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
  }
  return JSON.parse(JSON.stringify(INITIAL_LEVEL_GROUPS));
}

export function saveLevelGroups(list) {
  if (typeof window !== "undefined" && window.localStorage) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }
}

export function getLevelGroupStudents(group) {
  if (!group || !group.sources || group.sources.length === 0) return [];

  const key = `educrm_level_students_${group.id}`;
  if (typeof window !== "undefined" && window.localStorage) {
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
  }

  // Generate students pulled from source classes
  const members = [];
  const target = group.enrolledCount || 12;
  let added = 0;

  group.sources.forEach((clsName, cIdx) => {
    const classId = clsName.toLowerCase().replace(/\s+/g, "-");
    const classStudents = getStudentsByClass(classId, clsName, 25, "SCHOOL");

    // Pick 2-3 students from this class
    const take = Math.min(3, Math.max(1, Math.ceil(target / group.sources.length)));
    for (let k = 0; k < take && added < target; k++) {
      const st = classStudents[(cIdx * 3 + k * 4) % classStudents.length];
      if (st && !members.some((m) => m.id === st.id)) {
        members.push({
          id: st.id,
          studentId: st.studentId,
          fullName: st.fullName,
          className: clsName,
          parentName: st.parentName,
          parentPhone: st.parentPhone,
          addedDate: "05.09.2025",
          status: "Faol",
        });
        added++;
      }
    }
  });

  if (typeof window !== "undefined" && window.localStorage) {
    localStorage.setItem(key, JSON.stringify(members));
  }

  return members;
}

export function saveLevelGroupStudents(groupId, members) {
  if (typeof window !== "undefined" && window.localStorage) {
    localStorage.setItem(`educrm_level_students_${groupId}`, JSON.stringify(members));
  }
}
