/**
 * EduHub Repeated UI Text, Feedback Messages & Notification Labels
 * Centralizes user-facing notifications, toasts, and fallback texts.
 */

export const UI_MESSAGES = {
  // Empty states
  EMPTY_STATE_DEFAULT: "Hech qanday ma'lumot topilmadi",

  // Action feedback
  ACTION_SUCCESS: "Muvaffaqiyatli",
  ACTION_ERROR: "Xatolik yuz berdi",
  SAVE_SUCCESS: "Muvaffaqiyatli saqlandi!",
  UPDATE_SUCCESS: "Muvaffaqiyatli yangilandi!",
  DELETE_SUCCESS: "Muvaffaqiyatli o'chirildi!",

  // Toast titles
  TOAST_TITLE_SUCCESS: "Muvaffaqiyatli",
  TOAST_TITLE_ERROR: "Xatolik yuz berdi",
  TOAST_TITLE_WARNING: "Ogohlantirish",
  TOAST_TITLE_INFO: "Ma'lumot",

  // Modals & Confirmations
  CONFIRM_DELETE_TITLE: "O'chirishni tasdiqlang",
  CONFIRM_DELETE_MESSAGE: "Haqiqatan ham ushbu ma'lumotni o'chirmoqchimisiz?",
  CONFIRM_RESTORE_TITLE: "Qayta tiklashni tasdiqlang",

  // Authentication & Session
  SESSION_EXPIRED: "Sessiya muddati tugadi. Iltimos, qayta kiring.",
  AUTH_INVALID_CREDENTIALS: "Email yoki parol noto'g'ri",
  TOKEN_NOT_RECEIVED: "Token olinmadi",
  LOGOUT_ERROR: "Logout API xatoligi:",
  NETWORK_ERROR: "Server bilan aloqa uzildi. Iltimos, internetingizni tekshiring.",
};

export default UI_MESSAGES;
