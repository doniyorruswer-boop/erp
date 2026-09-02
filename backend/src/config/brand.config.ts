/**
 * ================================================================
 * 🌟 Central Backend Brand Configuration (Single Source of Truth)
 * ================================================================
 * Tizimning barcha joylaridagi mahsulot nomi, email, domen va
 * API hujjatlashtirish nomlarini yagona markazdan boshqaradi.
 */

const rawName = process.env.APP_NAME || 'EduHub';
const domain = process.env.APP_DOMAIN || 'eduhub.uz';

export const BrandConfig = {
  name: rawName,
  domain: domain,
  portalUrl: process.env.APP_PORTAL_URL || `https://${domain}`,
  adminEmail: process.env.ADMIN_EMAIL || `admin@${domain}`,
  supportEmail: process.env.SUPPORT_EMAIL || `support@${domain}`,
  noReplyEmail: process.env.SMTP_FROM || `${rawName} <no-reply@${domain}>`,
  apiTitle: `${rawName} API`,
  apiDescription: `O‘zbekistondagi o‘quv markazlari va ta'lim muassasalari uchun Universal ERP API hujjatlari (${rawName})`,
  apiVersion: '2.0.0',
};

export default BrandConfig;
