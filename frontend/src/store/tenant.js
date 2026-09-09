import { defineStore } from "pinia";

import { setupApi } from "@/api/services";
import BRAND_CONFIG from "@/config/brand.config";
import { THEME_COLORS } from "@/constants/colors.constants";
import { STORAGE_KEYS } from "@/constants/storage.constants";
import { setPrimaryColor } from "@/helper/theme";
import { safeJsonParse } from "@/utils/storage";

export const useTenantStore = defineStore("tenant", {
  state: () => ({
    isSetupCompleted: localStorage.getItem(STORAGE_KEYS.IS_SETUP_COMPLETED) === "true",
    businessType: localStorage.getItem(STORAGE_KEYS.BUSINESS_TYPE) || "COURSE_CENTER",
    organization: safeJsonParse(localStorage.getItem(STORAGE_KEYS.ORGANIZATION), {
      name: `${BRAND_CONFIG.name} Markazi`,
      slug: "main",
      primaryColor: THEME_COLORS.PRIMARY,
      currency: "UZS",
    }),
    organizations: safeJsonParse(localStorage.getItem(STORAGE_KEYS.ORGANIZATIONS), []),
    enabledModules: safeJsonParse(localStorage.getItem(STORAGE_KEYS.ENABLED_MODULES), [
      "LEADS",
      "STUDENTS",
      "GROUPS",
      "COURSES",
      "ATTENDANCE",
      "FINANCE",
      "SMS",
      "PAYMENTS",
      "CONTRACTS",
    ]),
    features: {
      gradingSystem: false,
      canteenService: false,
      transportService: false,
      contracts: true,
      trialLessons: true,
    },
    terminology: safeJsonParse(localStorage.getItem(STORAGE_KEYS.TERMINOLOGY), {
      studentLabel: "O'quvchi",
      teacherLabel: "O'qituvchi",
      groupLabel: "Guruh",
      courseLabel: "Kurs",
    }),
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
    classLabel: (state) => {
      if (state.businessType === "SCHOOL") return "Sinf";
      if (state.businessType === "KINDERGARTEN") return "Guruh";
      return "Guruh";
    },
    classesLabel: (state) => {
      if (state.businessType === "SCHOOL") return "Sinflar";
      if (state.businessType === "KINDERGARTEN") return "Guruhlar";
      return "Guruhlar";
    },
    teacherRoleLabel: (state) => {
      if (state.businessType === "SCHOOL") return "Sinf rahbari";
      if (state.businessType === "KINDERGARTEN") return "Tarbiyachi";
      return "Mentor";
    },
    promoteActionLabel: (state) => {
      if (state.businessType === "SCHOOL") return "Sinfni keyingi yilga o'tkazish";
      if (state.businessType === "KINDERGARTEN") return "Katta guruhga o'tkazish";
      return "Guruhni keyingi bosqichga o'tkazish";
    },
    newClassButtonLabel: (state) => {
      if (state.businessType === "SCHOOL") return "Yangi sinf";
      if (state.businessType === "KINDERGARTEN") return "Yangi guruh";
      return "Yangi guruh";
    },
  },

  actions: {
    async fetchOrganizations() {
      try {
        const res = await setupApi.getOrganizations();
        if (Array.isArray(res)) {
          this.organizations = res;
          localStorage.setItem(STORAGE_KEYS.ORGANIZATIONS, JSON.stringify(res));
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
          localStorage.setItem(STORAGE_KEYS.ORGANIZATIONS, JSON.stringify(orgsRes.value));
        }

        // Check if user already explicitly selected a businessType / organization in localStorage
        const savedBusinessType = localStorage.getItem(STORAGE_KEYS.BUSINESS_TYPE);
        const savedOrg = safeJsonParse(localStorage.getItem(STORAGE_KEYS.ORGANIZATION), null);

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

          localStorage.setItem(STORAGE_KEYS.IS_SETUP_COMPLETED, String(this.isSetupCompleted));
          localStorage.setItem(STORAGE_KEYS.BUSINESS_TYPE, this.businessType);
          localStorage.setItem(STORAGE_KEYS.ORGANIZATION, JSON.stringify(this.organization));
          localStorage.setItem(STORAGE_KEYS.ENABLED_MODULES, JSON.stringify(this.enabledModules));
          localStorage.setItem(STORAGE_KEYS.TERMINOLOGY, JSON.stringify(this.terminology));
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
          localStorage.setItem(STORAGE_KEYS.BUSINESS_TYPE, this.businessType);
          localStorage.setItem(STORAGE_KEYS.ORGANIZATION, JSON.stringify(this.organization));
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

          localStorage.setItem(STORAGE_KEYS.BUSINESS_TYPE, this.businessType);
          localStorage.setItem(STORAGE_KEYS.ORGANIZATION, JSON.stringify(this.organization));
          localStorage.setItem(STORAGE_KEYS.ENABLED_MODULES, JSON.stringify(this.enabledModules));
          localStorage.setItem(STORAGE_KEYS.TERMINOLOGY, JSON.stringify(this.terminology));

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
            localStorage.setItem(STORAGE_KEYS.TOKEN, res.accessToken);
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

          localStorage.setItem(STORAGE_KEYS.IS_SETUP_COMPLETED, "true");
          localStorage.setItem(STORAGE_KEYS.BUSINESS_TYPE, this.businessType);
          localStorage.setItem(STORAGE_KEYS.ORGANIZATION, JSON.stringify(this.organization));
          localStorage.setItem(STORAGE_KEYS.ENABLED_MODULES, JSON.stringify(this.enabledModules));

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
      localStorage.setItem(STORAGE_KEYS.TERMINOLOGY, JSON.stringify(this.terminology));
    },
  },
});
