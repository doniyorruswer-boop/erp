/**
 * EduHub Central Brand & Product Configuration (Single Source of Truth)
 * Centralizes brand naming, portal domain, support emails and copyright.
 */

import { ENV_CONFIG } from "./env.config";

export const BRAND_CONFIG = {
  // Asosiy mahsulot nomi
  name: ENV_CONFIG.APP_NAME,

  // Logo uchun 2 qismga ajratilgan ko'rinish
  prefix: ENV_CONFIG.BRAND_PREFIX,
  suffix: ENV_CONFIG.BRAND_SUFFIX,

  // Domen va Portal
  domain: ENV_CONFIG.DOMAIN,
  portalUrl: ENV_CONFIG.PORTAL_URL,

  // Ta'rif va shior
  description: ENV_CONFIG.DESCRIPTION,

  // Aloqa va tizim emaillari
  adminEmail: ENV_CONFIG.ADMIN_EMAIL,
  supportEmail: ENV_CONFIG.SUPPORT_EMAIL,

  // Mualliflik huquqi (Footer)
  copyright: `${ENV_CONFIG.APP_NAME} © ${new Date().getFullYear()}. Barcha huquqlar himoyalangan.`,
};

export default BRAND_CONFIG;
