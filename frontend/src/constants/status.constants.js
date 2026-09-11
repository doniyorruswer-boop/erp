/**
 * EduHub Entity Status Constants & Uzbek Label Mappings
 */

export const ENTITY_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  ARCHIVED: "ARCHIVED",
  PAID: "PAID",
  DEBT: "DEBT",
  TRIAL: "TRIAL",
  FROZEN: "FROZEN",
  ON_LEAVE: "ON_LEAVE",
  REFUNDED: "REFUNDED",
  VOID: "VOID",
};

export const STATUS_LABELS = {
  ACTIVE: "Faol",
  INACTIVE: "Nofaol",
  PENDING: "Kutilmoqda",
  COMPLETED: "Bajarildi / Bitirgan",
  CANCELLED: "Bekor qilingan",
  ARCHIVED: "Arxivlangan",
  PAID: "To'langan",
  DEBT: "Qarzdor",
  TRIAL: "Sinov darsida",
  FROZEN: "Muzlatilgan",
  ON_LEAVE: "Ta'tilda",
  REFUNDED: "Qaytarilgan",
  VOID: "Bekor qilingan",
};

export const STATUS_BADGE_VARIANTS = {
  ACTIVE: "success",
  PAID: "success",
  TRIAL: "info",
  FROZEN: "warning",
  PENDING: "warning",
  ON_LEAVE: "warning",
  INACTIVE: "danger",
  CANCELLED: "danger",
  DEBT: "danger",
  COMPLETED: "purple",
  ARCHIVED: "secondary",
  VOID: "secondary",
  REFUNDED: "secondary",
};

export default ENTITY_STATUS;
