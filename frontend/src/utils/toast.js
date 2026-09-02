import { reactive } from 'vue';

const state = reactive({
  toasts: [],
});

let toastId = 0;

export const toast = {
  show(options) {
    const id = ++toastId;
    const type = options.type || 'info'; // 'success' | 'error' | 'warning' | 'info'
    const message = typeof options === 'string' ? options : (options.message || '');
    const title = options.title || (
      type === 'success' ? 'Muvaffaqiyatli' :
      type === 'error' ? 'Xatolik yuz berdi' :
      type === 'warning' ? 'Ogohlantirish' : 'Ma\'lumot'
    );
    const duration = options.duration !== undefined ? options.duration : 4500;

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
    return this.show({ type: 'success', message, title, duration });
  },

  error(message, title, duration) {
    return this.show({ type: 'error', message, title, duration: duration !== undefined ? duration : 6000 });
  },

  warning(message, title, duration) {
    return this.show({ type: 'warning', message, title, duration: duration !== undefined ? duration : 5000 });
  },

  info(message, title, duration) {
    return this.show({ type: 'info', message, title, duration });
  },

  remove(id) {
    const index = state.toasts.findIndex(t => t.id === id);
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
