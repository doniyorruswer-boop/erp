/**
 * EduHub Formatters & Helper Utilities
 * SOLID: Single Responsibility Principle for data formatting across the CRM
 */

export function formatUZS(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return "0 so'm";
  return new Intl.NumberFormat('uz-UZ').format(amount) + " so'm";
}

export function formatShortNumber(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return "0 so'm";
  return `${new Intl.NumberFormat("uz-UZ").format(amount)} so'm`;
}

export function formatPhone(phone) {
  if (!phone) return '-';
  const cleaned = ('' + phone).replace(/\D/g, '');
  if (cleaned.length === 12 && cleaned.startsWith('998')) {
    return `+998 (${cleaned.slice(3, 5)}) ${cleaned.slice(5, 8)}-${cleaned.slice(8, 10)}-${cleaned.slice(10, 12)}`;
  }
  return phone;
}

export function formatDate(dateStr, options = {}) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  };
  return date.toLocaleDateString('uz-UZ', defaultOptions);
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  return date.toLocaleString('uz-UZ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getStatusBadgeVariant(status) {
  const map = {
    ACTIVE: 'success',
    TRIAL: 'info',
    FROZEN: 'warning',
    INACTIVE: 'danger',
    COMPLETED: 'purple',
    PAID: 'success',
    PENDING: 'warning',
    OVERDUE: 'danger',
  };
  return map[status] || 'secondary';
}

export function getStatusLabel(status) {
  const map = {
    ACTIVE: 'Faol',
    TRIAL: 'Sinov darsida',
    FROZEN: 'Muzlatilgan',
    INACTIVE: 'Nofaol / Tark etgan',
    COMPLETED: 'Bitirgan',
    NEW: 'Yangi',
    CONTACTED: 'Bog\'lanildi',
    TRIAL_SCHEDULED: 'Sinov darsi belgilandi',
    TRIAL_ATTENDED: 'Sinov darsiga keldi',
    WON: 'To\'lov qildi',
    LOST: 'Rad etildi',
  };
  return map[status] || status;
}
