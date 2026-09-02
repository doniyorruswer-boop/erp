/**
 * ================================================================
 * 🌟 Central Brand & Product Configuration (Single Source of Truth)
 * ================================================================
 * Loyihaning barcha joylaridagi brend, nom, domen va email nomlanishlarini
 * yagona joydan boshqaruvchi konfiguratsiya fayli.
 *
 * Nomni o'zgartirish uchun faqat:
 * 1) Ushbu fayldagi BRAND_DEFAULTS ni o'zgartiring, yoki
 * 2) .env faylida VUE_APP_NAME="YangiNom" deb yozing!
 */

const rawName = process.env.VUE_APP_NAME || "EduHub";

export const BRAND_CONFIG = {
  // Asosiy mahsulot nomi
  name: rawName,

  // Logo uchun 2 qismga ajratilgan ko'rinish (masalan: Edu va HUB)
  prefix: process.env.VUE_APP_BRAND_PREFIX || (rawName.length > 3 ? rawName.slice(0, 3) : rawName),
  suffix: process.env.VUE_APP_BRAND_SUFFIX || (rawName.length > 3 ? rawName.slice(3) : ""),

  // Domen va Portal
  domain: process.env.VUE_APP_DOMAIN || "eduhub.uz",
  portalUrl: process.env.VUE_APP_PORTAL_URL || `https://${process.env.VUE_APP_DOMAIN || "eduhub.uz"}`,

  // Ta'rif va shior
  description: process.env.VUE_APP_DESCRIPTION || "Ta'lim va Biznes Boshqaruv Platformasi",

  // Aloqa va tizim emaillari
  adminEmail: process.env.VUE_APP_ADMIN_EMAIL || `admin@${process.env.VUE_APP_DOMAIN || "eduhub.uz"}`,
  supportEmail: process.env.VUE_APP_SUPPORT_EMAIL || `support@${process.env.VUE_APP_DOMAIN || "eduhub.uz"}`,

  // Mualliflik huquqi (Footer)
  copyright: `${rawName} © ${new Date().getFullYear()}. Barcha huquqlar himoyalangan.`,
};

export default BRAND_CONFIG;
