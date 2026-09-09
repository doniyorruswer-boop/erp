import type { ModuleDefinition } from "@/core/modules/types";

import { attendanceRoutes } from "./routes";

export const attendanceModule: ModuleDefinition = {
  id: "ATTENDANCE",
  name: "Davomat",
  description: "Dars davomati, dars qoldirishlar va davomat jurnali",
  category: "ACADEMIC",
  icon: "fluent:calendar-checkmark-24-filled",
  version: "1.0.0",
  permissions: ["attendance.view", "attendance.create", "attendance.update"],
  dependencies: ["STUDENTS"],
  applicableBusinessTypes: ["COURSE_CENTER", "SCHOOL", "KINDERGARTEN"],
  routes: attendanceRoutes,
  navigation: [
    {
      id: "nav-attendance",
      label: "Davomat",
      path: "/attendance",
      icon: "fluent:calendar-checkmark-24-filled",
      permission: "attendance.view",
      order: 40,
    },
  ],
};

export default attendanceModule;
