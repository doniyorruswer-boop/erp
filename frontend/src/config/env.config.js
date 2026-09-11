/**
 * EduHub Environment Variables Configuration
 * Centralizes all process.env accesses with strict fallbacks.
 */

const rawName = process.env.VUE_APP_NAME || "EduHub";
const rawDomain = process.env.VUE_APP_DOMAIN || "eduhub.uz";

export const ENV_CONFIG = {
  // Environment mode
  NODE_ENV: process.env.NODE_ENV || "development",
  IS_PROD: process.env.NODE_ENV === "production",
  IS_DEV: process.env.NODE_ENV !== "production",

  // API URLs
  API_URL: process.env.VUE_APP_API_URL || "http://localhost:3000/api",

  // Brand and Domain
  APP_NAME: rawName,
  DOMAIN: rawDomain,
  PORTAL_URL: process.env.VUE_APP_PORTAL_URL || `https://${rawDomain}`,
  CRM_LEAD_PORTAL_URL: process.env.VUE_APP_CRM_LEAD_PORTAL_URL || "https://crm.my-school.uz/lead",

  // Brand Typography Splitting
  BRAND_PREFIX:
    process.env.VUE_APP_BRAND_PREFIX || (rawName.length > 3 ? rawName.slice(0, 3) : rawName),
  BRAND_SUFFIX: process.env.VUE_APP_BRAND_SUFFIX || (rawName.length > 3 ? rawName.slice(3) : ""),

  // Description & Contact
  DESCRIPTION: process.env.VUE_APP_DESCRIPTION || "Ta'lim va Biznes Boshqaruv Platformasi",
  ADMIN_EMAIL: process.env.VUE_APP_ADMIN_EMAIL || `admin@${rawDomain}`,
  SUPPORT_EMAIL: process.env.VUE_APP_SUPPORT_EMAIL || `support@${rawDomain}`,
};

export default ENV_CONFIG;
