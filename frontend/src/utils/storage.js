/**
 * Safe LocalStorage utilities to prevent unexpected JSON parsing errors
 * and handle corrupted storage states gracefully.
 */

export function safeJsonParse(val, fallback = null) {
  if (val === null || val === undefined || val === "") return fallback;
  if (typeof val !== "string") return val;
  try {
    const parsed = JSON.parse(val);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch (e) {
    console.warn("safeJsonParse error:", e);
    return fallback;
  }
}

export const safeStorage = {
  getItem(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null || raw === undefined) return fallback;
      return safeJsonParse(raw, raw);
    } catch (e) {
      console.warn(`safeStorage.getItem error for key "${key}":`, e);
      return fallback;
    }
  },

  setItem(key, value) {
    try {
      const serialized = typeof value === "string" ? value : JSON.stringify(value);
      localStorage.setItem(key, serialized);
    } catch (e) {
      console.warn(`safeStorage.setItem error for key "${key}":`, e);
    }
  },

  removeItem(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`safeStorage.removeItem error for key "${key}":`, e);
    }
  },

  clear() {
    try {
      localStorage.clear();
    } catch (e) {
      console.warn("safeStorage.clear error:", e);
    }
  },
};

export default safeStorage;
