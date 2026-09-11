import { API_CONFIG, getApiBaseUrl } from "@/config/api.config";
import { HTTP_METHODS, HTTP_STATUS } from "@/constants/http.constants";
import { STORAGE_KEYS } from "@/constants/storage.constants";
import { UI_MESSAGES } from "@/constants/ui.constants";

function getToken() {
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
}

let isRefreshing = false;
let refreshPromise = null;

async function executeTokenRefresh() {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) return null;

      const refreshRes = await fetch(`${getApiBaseUrl()}${API_CONFIG.ENDPOINTS.AUTH.REFRESH}`, {
        method: HTTP_METHODS.POST,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (refreshRes.ok) {
        const data = await refreshRes.json();
        if (data.accessToken) {
          localStorage.setItem(STORAGE_KEYS.TOKEN, data.accessToken);
          if (data.refreshToken) {
            localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
          }
          return data.accessToken;
        }
      }
      return null;
    } catch (e) {
      console.warn("Avtomatik refresh muvaffaqiyatsiz bo'ldi:", e);
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function request(endpoint, options = {}) {
  const token = getToken();

  let orgId = "";
  try {
    const rawOrg = localStorage.getItem(STORAGE_KEYS.ORGANIZATION);
    if (rawOrg) {
      const parsed = JSON.parse(rawOrg);
      if (parsed?.id) orgId = parsed.id;
    }
  } catch (e) {}

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(orgId ? { "x-organization-id": orgId } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === "object") {
    config.body = JSON.stringify(options.body);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
    const response = await fetch(`${getApiBaseUrl()}${endpoint}`, {
      ...config,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.status === HTTP_STATUS.UNAUTHORIZED) {
      if (!options._retry && !endpoint.startsWith("/auth/")) {
        const newToken = await executeTokenRefresh();
        if (newToken) {
          return request(endpoint, { ...options, _retry: true });
        }
      }

      if (!endpoint.startsWith("/auth/")) {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        if (!window.location.pathname.startsWith("/auth")) {
          window.location.href = API_CONFIG.ENDPOINTS.AUTH.LOGIN;
        }
        throw new Error(UI_MESSAGES.SESSION_EXPIRED);
      } else {
        let errorMsg = UI_MESSAGES.AUTH_INVALID_CREDENTIALS;
        let errorData = null;
        try {
          errorData = await response.json();
          errorMsg = errorData.message || errorMsg;
        } catch {}
        const error = new Error(errorMsg);
        error.response = { status: response.status, data: errorData || { message: errorMsg } };
        throw error;
      }
    }

    if (!response.ok) {
      let errorMessage = UI_MESSAGES.ACTION_ERROR;
      let errorData = null;
      try {
        errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = response.statusText;
      }
      const error = new Error(errorMessage);
      error.response = { status: response.status, data: errorData || { message: errorMessage } };
      throw error;
    }

    if (response.status === HTTP_STATUS.NO_CONTENT) return null;

    return await response.json();
  } catch (err) {
    console.warn(`API Error [${endpoint}]:`, err.message);
    throw err;
  }
}

export const api = {
  get: (endpoint, options) => request(endpoint, { ...options, method: HTTP_METHODS.GET }),
  post: (endpoint, body, options) =>
    request(endpoint, { ...options, method: HTTP_METHODS.POST, body }),
  put: (endpoint, body, options) =>
    request(endpoint, { ...options, method: HTTP_METHODS.PUT, body }),
  delete: (endpoint, options) => request(endpoint, { ...options, method: HTTP_METHODS.DELETE }),
};

export default api;
