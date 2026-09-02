import { defineStore } from "pinia";
import { setupApi } from "@/api/services";
import { setPrimaryColor } from "@/helper/theme";
import BRAND_CONFIG from "@/config/brand.config";

export const useTenantStore = defineStore("tenant", {
  state: () => ({
    isSetupCompleted: localStorage.getItem("isSetupCompleted") === "true",
    businessType: localStorage.getItem("businessType") || "COURSE_CENTER",
    organization: JSON.parse(localStorage.getItem("organization") || "null") || {
      name: `${BRAND_CONFIG.name} Markazi`,
      slug: "main",
      primaryColor: "#4F46E5",
      currency: "UZS",
    },
    organizations: JSON.parse(localStorage.getItem("organizations") || "[]"),
    enabledModules: JSON.parse(localStorage.getItem("enabledModules") || "null") || [
      "LEADS",
      "STUDENTS",
      "GROUPS",
      "COURSES",
      "ATTENDANCE",
      "FINANCE",
      "SMS",
      "PAYMENTS",
      "CONTRACTS",
    ],
    features: {
      gradingSystem: false,
      canteenService: false,
      transportService: false,
      contracts: true,
      trialLessons: true,
    },
    terminology: {
      studentLabel: "O'quvchi",
      teacherLabel: "O'qituvchi",
      groupLabel: "Guruh",
      courseLabel: "Kurs",
    },
    integrations: {},
    loading: false,
  }),

  getters: {
    isSchool: (state) => state.businessType === "SCHOOL",
    isCourseCenter: (state) => state.businessType === "COURSE_CENTER",
    isKindergarten: (state) => state.businessType === "KINDERGARTEN",
    activeOrgId: (state) => state.organization?.id,
    hasModule: (state) => (moduleName) => {
      return state.enabledModules.includes(moduleName);
    },
    orgName: (state) => state.organization?.name || BRAND_CONFIG.name,
  },

  actions: {
    async fetchOrganizations() {
      try {
        const res = await setupApi.getOrganizations();
        if (Array.isArray(res)) {
          this.organizations = res;
          localStorage.setItem("organizations", JSON.stringify(res));
        }
      } catch (err) {
        console.warn("Tashkilotlarni yuklashda xatolik:", err.message);
      }
    },

    async fetchTenantConfig() {
      this.loading = true;
      try {
        const [statusRes, orgsRes] = await Promise.allSettled([
          setupApi.getStatus(),
          setupApi.getOrganizations(),
        ]);

        if (orgsRes.status === "fulfilled" && Array.isArray(orgsRes.value)) {
          this.organizations = orgsRes.value;
          localStorage.setItem("organizations", JSON.stringify(orgsRes.value));
        }

        // Check if user already explicitly selected a businessType / organization in localStorage
        const savedBusinessType = localStorage.getItem("businessType");
        const savedOrg = JSON.parse(localStorage.getItem("organization") || "null");

        if (statusRes.status === "fulfilled" && statusRes.value) {
          const res = statusRes.value;
          this.isSetupCompleted = Boolean(res.isSetupCompleted);

          // PRESERVE user selected branch/type across refresh
          if (savedBusinessType) {
            this.businessType = savedBusinessType;
          } else {
            this.businessType = res.businessType || "COURSE_CENTER";
          }

          if (savedOrg && savedOrg.name) {
            this.organization = savedOrg;
          } else if (res.organization) {
            this.organization = res.organization;
          }

          if (this.organization?.primaryColor) {
            setPrimaryColor(this.organization.primaryColor);
          }

          if (Array.isArray(res.enabledModules)) {
            this.enabledModules = res.enabledModules;
          }
          if (res.features) {
            this.features = { ...this.features, ...res.features };
          }
          if (res.terminology) {
            this.terminology = { ...this.terminology, ...res.terminology };
          }
          if (res.integrations) {
            this.integrations = res.integrations;
          }

          localStorage.setItem("isSetupCompleted", String(this.isSetupCompleted));
          localStorage.setItem("businessType", this.businessType);
          localStorage.setItem("organization", JSON.stringify(this.organization));
          localStorage.setItem("enabledModules", JSON.stringify(this.enabledModules));
        }
      } catch (err) {
        console.warn("Tenant konfiguratsiyasini yuklashda xatolik:", err.message);
      } finally {
        this.loading = false;
      }
    },

    async switchOrganization(orgId) {
      this.loading = true;
      try {
        const matched = this.organizations.find((o) => o.id === orgId);
        if (matched) {
          this.organization = matched;
          this.businessType = matched.businessType || "COURSE_CENTER";
          if (matched.primaryColor) {
            setPrimaryColor(matched.primaryColor);
          }
          localStorage.setItem("businessType", this.businessType);
          localStorage.setItem("organization", JSON.stringify(this.organization));
        }

        const res = await setupApi.switchOrganization(orgId).catch(() => null);
        if (res && res.organization) {
          this.organization = res.organization;
          this.businessType = res.businessType || this.businessType;
          this.enabledModules = res.enabledModules || this.enabledModules;
          this.features = res.features || this.features;
          this.terminology = res.terminology || this.terminology;
          this.integrations = res.integrations || this.integrations;

          if (res.organization.primaryColor) {
            setPrimaryColor(res.organization.primaryColor);
          }

          localStorage.setItem("businessType", this.businessType);
          localStorage.setItem("organization", JSON.stringify(this.organization));
          localStorage.setItem("enabledModules", JSON.stringify(this.enabledModules));

          return res;
        }
      } catch (err) {
        console.error("Tashkilotni almashtirishda xatolik:", err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async completeSetup(setupData) {
      this.loading = true;
      try {
        const res = await setupApi.initialize(setupData);
        if (res && res.success) {
          if (res.accessToken) {
            localStorage.setItem("token", res.accessToken);
          }
          this.isSetupCompleted = true;
          this.businessType = setupData.businessType;
          this.organization = res.organization || {
            name: setupData.organizationName,
            businessType: setupData.businessType,
          };
          this.enabledModules = setupData.enabledModules;

          if (setupData.primaryColor) {
            setPrimaryColor(setupData.primaryColor);
          }

          localStorage.setItem("isSetupCompleted", "true");
          localStorage.setItem("businessType", this.businessType);
          localStorage.setItem("organization", JSON.stringify(this.organization));
          localStorage.setItem("enabledModules", JSON.stringify(this.enabledModules));

          await this.fetchOrganizations();
          return res;
        }
        throw new Error(res?.message || "Setup amalga oshmadi");
      } catch (err) {
        console.error("Setup xatoligi:", err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    setBusinessType(type) {
      this.businessType = type;
      if (type === "SCHOOL") {
        this.terminology = {
          studentLabel: "O'quvchi",
          teacherLabel: "O'qituvchi",
          groupLabel: "Sinf",
          courseLabel: "Fan / Sinf",
        };
      } else if (type === "KINDERGARTEN") {
        this.terminology = {
          studentLabel: "Tarbiyalanuvchi",
          teacherLabel: "Tarbiyachi",
          groupLabel: "Guruh",
          courseLabel: "Mashg'ulot",
        };
      } else {
        this.terminology = {
          studentLabel: "O'quvchi",
          teacherLabel: "Mentor",
          groupLabel: "Guruh",
          courseLabel: "Kurs",
        };
      }
    },
  },
});

