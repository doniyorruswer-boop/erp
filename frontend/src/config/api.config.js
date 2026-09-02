/**
 * EduHub Markazlashgan API Konfiguratsiyasi
 * Barcha API manzillari, timeout va server sozlamalari yagona joyda boshqariladi.
 */

export const API_CONFIG = {
  // Asosiy Backend URL manzili
  BASE_URL:
    process.env.VUE_APP_API_URL ||
    (typeof window !== 'undefined' && (localStorage.getItem('EDUHUB_API_URL') || localStorage.getItem('EDUC_CRM_API_URL'))) ||
    'http://localhost:3000/api',

  // So'rov kutish vaqti (ms)
  TIMEOUT: 8000,

  // Standart avtorizatsiya ma'lumotlari (kerak bo'lganda)
  DEFAULT_AUTH: {
    phone: '+998901234567',
    password: 'admin123',
  },

  // Barcha API Endpointlari
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      PROFILE: '/auth/profile',
    },
    DASHBOARD: {
      STATS: '/dashboard/stats',
    },
    STUDENTS: '/students',
    GROUPS: '/groups',
    COURSES: '/courses',
    PAYMENTS: '/payments',
    CONTRACTS: '/contracts',
    ATTENDANCE: '/attendance',
    USERS: '/users',
    ROOMS: '/rooms',
    LEADS: '/leads',
    SETUP: {
      STATUS: '/setup/status',
      ORGANIZATIONS: '/setup/organizations',
      SWITCH: '/setup/switch',
      INITIALIZE: '/setup/initialize',
      CONFIG: '/setup/config',
    },
  },
};

export function getApiBaseUrl() {
  return API_CONFIG.BASE_URL;
}

export function setApiBaseUrl(newUrl) {
  if (!newUrl) return;
  API_CONFIG.BASE_URL = newUrl.replace(/\/+$/, '');
  if (typeof window !== 'undefined') {
    localStorage.setItem('EDUC_CRM_API_URL', API_CONFIG.BASE_URL);
  }
}

export default API_CONFIG;
