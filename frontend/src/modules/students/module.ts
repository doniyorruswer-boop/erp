import type { ModuleDefinition } from "@/core/modules/types";

import { studentsRoutes } from "./routes";

export const studentsModule: ModuleDefinition = {
  id: "STUDENTS",
  name: "O'quvchilar va Mijozlar",
  description: "O'quvchilar bazasi, profillar va qabul jarayoni",
  category: "CORE",
  icon: "ph:student-fill",
  version: "1.0.0",
  permissions: [
    "students.view",
    "students.create",
    "students.update",
    "students.delete",
    "students.export",
  ],
  dependencies: [],
  applicableBusinessTypes: ["COURSE_CENTER", "SCHOOL", "KINDERGARTEN"],
  routes: studentsRoutes,
  navigation: [
    {
      id: "nav-students",
      label: "O'quvchilar",
      path: "/students",
      icon: "ph:student-fill",
      permission: "students.view",
      order: 10,
    },
  ],
};

export default studentsModule;
