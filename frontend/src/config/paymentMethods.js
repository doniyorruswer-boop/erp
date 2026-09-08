// Centralized Payment Methods Configuration for EduCRM
export const DEFAULT_PAYMENT_METHODS = [
  {
    code: 'CARD',
    name: 'Plastik karta',
    shortName: 'Karta',
    icon: 'solar:card-bold',
    linearIcon: 'solar:card-linear',
    color: '#3B82F6', // Blue
    badgeClass: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    enabled: true,
    description: 'Uzcard, Humo, Visa va Mastercard to\'lovlari',
  },
  {
    code: 'CLICK',
    name: 'Click',
    shortName: 'Click',
    icon: 'solar:smartphone-bold',
    linearIcon: 'solar:smartphone-linear',
    color: '#6366F1', // Indigo
    badgeClass: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
    enabled: true,
    description: 'Click Up to\'lov ilovasi orqali',
  },
  {
    code: 'CASH',
    name: 'Naqd pul',
    shortName: 'Naqd',
    icon: 'solar:wallet-money-bold',
    linearIcon: 'solar:wallet-money-linear',
    color: '#10B981', // Emerald
    badgeClass: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    enabled: true,
    description: 'Kassada qabul qilingan naqd to\'lovlar',
  },
  {
    code: 'PAYME',
    name: 'Payme',
    shortName: 'Payme',
    icon: 'solar:plain-bold',
    linearIcon: 'solar:plain-linear',
    color: '#06B6D4', // Cyan
    badgeClass: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800',
    enabled: true,
    description: 'Payme ilovasi va QR-kod to\'lovlari',
  },
  {
    code: 'UZUM',
    name: 'Uzum Pay',
    shortName: 'Uzum',
    icon: 'solar:shop-2-bold',
    linearIcon: 'solar:shop-2-linear',
    color: '#8B5CF6', // Purple
    badgeClass: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    enabled: true,
    description: 'Uzum Bank va Uzum Pay orqali',
  },
  {
    code: 'BANK_TRANSFER',
    name: 'Bank o\'tkazmasi',
    shortName: 'Bank',
    icon: 'solar:buildings-2-bold',
    linearIcon: 'solar:buildings-2-linear',
    color: '#F59E0B', // Amber
    badgeClass: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    enabled: true,
    description: 'Hisob raqamiga to\'g\'ridan-to\'g\'ri pul o\'tkazish',
  },
];

const LOCAL_STORAGE_KEY = 'educrm_payment_methods_list';

export function getPaymentMethodsList() {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    // fallback
  }
  return DEFAULT_PAYMENT_METHODS;
}

export function savePaymentMethodsList(list) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    // ignore
  }
}

export function getPaymentMethod(code) {
  if (!code) return null;
  const c = String(code).toUpperCase().trim();
  const list = getPaymentMethodsList();
  const found = list.find((m) => m.code === c);
  if (found) return found;

  return {
    code: c,
    name: c,
    shortName: c,
    icon: 'solar:wallet-money-bold',
    linearIcon: 'solar:wallet-money-linear',
    color: '#6B7280',
    badgeClass: 'bg-gray-100 text-gray-600 border-gray-200',
    enabled: true,
    description: 'Boshqa to\'lov turi',
  };
}

export function getPaymentMethodName(code) {
  return getPaymentMethod(code)?.name || code;
}

export function getPaymentMethodIcon(code, isLinear = false) {
  const m = getPaymentMethod(code);
  return isLinear ? (m?.linearIcon || 'solar:wallet-money-linear') : (m?.icon || 'solar:wallet-money-bold');
}

export function getPaymentMethodBadgeClass(code) {
  return getPaymentMethod(code)?.badgeClass || 'bg-gray-100 text-gray-600 border-gray-200';
}

export function getPaymentMethodColor(code) {
  return getPaymentMethod(code)?.color || '#6B7280';
}

export function getActivePaymentMethods() {
  return getPaymentMethodsList().filter((m) => m.enabled !== false);
}

export function getPaymentMethodOptions() {
  return getActivePaymentMethods().map((m) => ({
    value: m.code,
    label: m.name,
    icon: m.icon,
  }));
}
