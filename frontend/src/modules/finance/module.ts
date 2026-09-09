/**
 * Finance Module Definition
 * Canonical ID: FINANCE
 */

import type { ModuleDefinition } from "@/core/modules/types";

export const financeModule: ModuleDefinition = {
  id: "FINANCE",
  name: "Moliya & Kassa",
  description: "Kassalar, to'lovlar, xarajatlar va moliyaviy hisobotlar",
  category: "FINANCE",
  icon: "solar:wallet-money-bold",
  version: "1.0.0",
  permissions: ["payments.view", "payments.create", "payments.refund", "payments.delete"],
  dependencies: [],
  applicableBusinessTypes: ["COURSE_CENTER", "SCHOOL", "KINDERGARTEN"],
  navigation: [
    {
      id: "nav-finance",
      label: "Moliya & Kassa",
      path: "/finance",
      icon: "solar:wallet-money-bold",
      permission: "payments.view",
      order: 50,
    },
  ],
};

export default financeModule;
