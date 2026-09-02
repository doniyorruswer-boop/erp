import { API_CONFIG, getApiBaseUrl } from '@/config/api.config';

function getToken() {
  return localStorage.getItem('token');
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
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return null;

      const refreshRes = await fetch(`${getApiBaseUrl()}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (refreshRes.ok) {
        const data = await refreshRes.json();
        if (data.accessToken) {
          localStorage.setItem('token', data.accessToken);
          if (data.refreshToken) {
            localStorage.setItem('refreshToken', data.refreshToken);
          }
          return data.accessToken;
        }
      }
      return null;
    } catch (e) {
      console.warn('Avtomatik refresh muvaffaqiyatsiz bo\'ldi:', e);
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

  let orgId = '';
  try {
    const rawOrg = localStorage.getItem('organization');
    if (rawOrg) {
      const parsed = JSON.parse(rawOrg);
      if (parsed?.id) orgId = parsed.id;
    }
  } catch (e) {}

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(orgId ? { 'x-organization-id': orgId } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT || 8000);
    const response = await fetch(`${getApiBaseUrl()}${endpoint}`, {
      ...config,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.status === 401) {
      if (!options._retry && !endpoint.startsWith('/auth/')) {
        const newToken = await executeTokenRefresh();
        if (newToken) {
          return request(endpoint, { ...options, _retry: true });
        }
      }

      if (!endpoint.startsWith('/auth/')) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        if (!window.location.pathname.startsWith('/auth')) {
          window.location.href = '/auth/login';
        }
        throw new Error('Sessiya muddati tugadi. Iltimos, qayta kiring.');
      } else {
        let errorMsg = "Email yoki parol noto'g'ri";
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
      let errorMessage = 'Xatolik yuz berdi';
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

    if (response.status === 204) return null;

    return await response.json();
  } catch (err) {
    console.warn(`API Error [${endpoint}]:`, err.message);
    throw err;
  }
}

export const api = {
  get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) => request(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options) => request(endpoint, { ...options, method: 'PUT', body }),
  delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' }),
};

export default api;
