import { reactive } from "vue";

import { TIME_CONSTANTS } from "@/constants/time.constants";
import { UI_MESSAGES } from "@/constants/ui.constants";

const state = reactive({
  toasts: [],
});

let toastId = 0;

export const toast = {
  show(options) {
    const id = ++toastId;
    const type = options.type || "info"; // 'success' | 'error' | 'warning' | 'info'
    const message = typeof options === "string" ? options : options.message || "";
    const title =
      options.title ||
      (type === "success"
        ? UI_MESSAGES.TOAST_TITLE_SUCCESS
        : type === "error"
          ? UI_MESSAGES.TOAST_TITLE_ERROR
          : type === "warning"
            ? UI_MESSAGES.TOAST_TITLE_WARNING
            : UI_MESSAGES.TOAST_TITLE_INFO);
    const duration =
      options.duration !== undefined ? options.duration : TIME_CONSTANTS.TOAST_DURATION.DEFAULT;

    const item = {
      id,
      type,
      title,
      message,
      duration,
      createdAt: Date.now(),
    };

    state.toasts.unshift(item);

    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }

    return id;
  },

  success(message, title, duration) {
    return this.show({ type: "success", message, title, duration });
  },

  error(message, title, duration) {
    return this.show({
      type: "error",
      message,
      title,
      duration: duration !== undefined ? duration : TIME_CONSTANTS.TOAST_DURATION.ERROR,
    });
  },

  warning(message, title, duration) {
    return this.show({
      type: "warning",
      message,
      title,
      duration: duration !== undefined ? duration : TIME_CONSTANTS.TOAST_DURATION.WARNING,
    });
  },

  info(message, title, duration) {
    return this.show({ type: "info", message, title, duration });
  },

  remove(id) {
    const index = state.toasts.findIndex((t) => t.id === id);
    if (index !== -1) {
      state.toasts.splice(index, 1);
    }
  },

  clear() {
    state.toasts.splice(0, state.toasts.length);
  },

  getToasts() {
    return state.toasts;
  },
};

export function useToast() {
  return toast;
}

export default toast;
