<template>
  <div class="dashboard-page p-3 sm:p-5 font-lexend space-y-5">
    <!-- Universal Unified CRM Dashboard (Matching 5 Reference Images in Light Mode) -->
    <UniversalUnifiedDashboard :selected-academic-year="selectedAcademicYear" />
  </div>
</template>

<script>
import { useTenantStore } from "@/store/tenant";

import UniversalUnifiedDashboard from "./dashboard/UniversalUnifiedDashboard.vue";

export default {
  name: "Dashboard",
  components: {
    UniversalUnifiedDashboard,
  },
  setup() {
    const tenantStore = useTenantStore();
    return { tenantStore };
  },
  data() {
    const now = new Date();
    const startYr = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
    return {
      selectedAcademicYear: `${startYr}-${startYr + 1}`,
    };
  },
};
</script>
