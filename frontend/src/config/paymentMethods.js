// Centralized Payment Methods Configuration for EduHub
import { THEME_COLORS } from "@/constants/colors.constants";
import {
  PAYMENT_METHOD_ICONS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHODS,
} from "@/constants/payments.constants";
import { STORAGE_KEYS } from "@/constants/storage.constants";

export const DEFAULT_PAYMENT_METHODS = [
  {
    code: PAYMENT_METHODS.CARD,
    name: PAYMENT_METHOD_LABELS[PAYMENT_METHODS.CARD],
    shortName: "Karta",
    icon: PAYMENT_METHOD_ICONS[PAYMENT_METHODS.CARD],
    linearIcon: "solar:card-linear",
    color: THEME_COLORS.INFO,
    badgeClass:
      "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    enabled: true,
    description: "Uzcard, Humo, Visa va Mastercard to'lovlari",
  },
  {
    code: PAYMENT_METHODS.CLICK,
    name: PAYMENT_METHOD_LABELS[PAYMENT_METHODS.CLICK],
    shortName: "Click",
    icon: PAYMENT_METHOD_ICONS[PAYMENT_METHODS.CLICK],
    linearIcon: "solar:smartphone-linear",
    color: "#6366F1",
    badgeClass:
      "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",
    enabled: true,
    description: "Click Up to'lov ilovasi orqali",
  },
  {
    code: PAYMENT_METHODS.CASH,
    name: PAYMENT_METHOD_LABELS[PAYMENT_METHODS.CASH],
    shortName: "Naqd",
    icon: PAYMENT_METHOD_ICONS[PAYMENT_METHODS.CASH],
    linearIcon: "solar:wallet-money-linear",
    color: THEME_COLORS.SUCCESS,
    badgeClass:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    enabled: true,
    description: "Kassada qabul qilingan naqd to'lovlar",
  },
  {
    code: PAYMENT_METHODS.PAYME,
    name: PAYMENT_METHOD_LABELS[PAYMENT_METHODS.PAYME],
    shortName: "Payme",
    icon: PAYMENT_METHOD_ICONS[PAYMENT_METHODS.PAYME],
    linearIcon: "solar:plain-linear",
    color: THEME_COLORS.CYAN,
    badgeClass:
      "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800",
    enabled: true,
    description: "Payme ilovasi va QR-kod to'lovlari",
  },
  {
    code: PAYMENT_METHODS.UZUM,
    name: PAYMENT_METHOD_LABELS[PAYMENT_METHODS.UZUM],
    shortName: "Uzum",
    icon: PAYMENT_METHOD_ICONS[PAYMENT_METHODS.UZUM],
    linearIcon: "solar:shop-2-linear",
    color: THEME_COLORS.PURPLE,
    badgeClass:
      "bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200 dark:border-purple-800",
    enabled: true,
    description: "Uzum Bank va Uzum Pay orqali",
  },
  {
    code: PAYMENT_METHODS.BANK_TRANSFER,
    name: PAYMENT_METHOD_LABELS[PAYMENT_METHODS.BANK_TRANSFER],
    shortName: "Bank",
    icon: PAYMENT_METHOD_ICONS[PAYMENT_METHODS.BANK_TRANSFER],
    linearIcon: "solar:buildings-2-linear",
    color: THEME_COLORS.WARNING,
    badgeClass:
      "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    enabled: true,
    description: "Hisob raqamiga to'g'ridan-to'g'ri pul o'tkazish",
  },
];

export function getPaymentMethodsList() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PAYMENT_METHODS_LIST);
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
    localStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS_LIST, JSON.stringify(list));
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
    icon: "solar:wallet-money-bold",
    linearIcon: "solar:wallet-money-linear",
    color: THEME_COLORS.GRAY,
    badgeClass: "bg-gray-100 text-gray-600 border-gray-200",
    enabled: true,
    description: "Boshqa to'lov turi",
  };
}

export function getPaymentMethodName(code) {
  return getPaymentMethod(code)?.name || String(code || "");
}

export function getPaymentMethodIcon(code, isLinear = false) {
  const m = getPaymentMethod(code);
  return isLinear
    ? m?.linearIcon || "solar:wallet-money-linear"
    : m?.icon || "solar:wallet-money-bold";
}

export function getPaymentMethodBadgeClass(code) {
  return getPaymentMethod(code)?.badgeClass || "bg-gray-100 text-gray-600 border-gray-200";
}

export function getPaymentMethodColor(code) {
  return getPaymentMethod(code)?.color || THEME_COLORS.GRAY;
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
