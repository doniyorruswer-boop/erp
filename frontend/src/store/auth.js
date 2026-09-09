import { defineStore } from "pinia";

import { authApi } from "@/api/services";
import { USER_ROLES } from "@/constants/roles.constants";
import { STORAGE_KEYS } from "@/constants/storage.constants";
import { UI_MESSAGES } from "@/constants/ui.constants";
import { permissionAdapter } from "@/core/security";
import { safeJsonParse } from "@/utils/storage";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem(STORAGE_KEYS.TOKEN) || null,
    refreshToken: localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) || null,
    user: safeJsonParse(localStorage.getItem(STORAGE_KEYS.USER), null),
    userRole: localStorage.getItem(STORAGE_KEYS.USER_ROLE) || null,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    currentUser: (state) => state.user,
    role: (state) => state.userRole || state.user?.role || USER_ROLES.GUEST,
    isSuperAdmin: (state) => (state.userRole || state.user?.role) === USER_ROLES.SUPER_ADMIN,
    isAdmin: (state) =>
      [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN].includes(state.userRole || state.user?.role),
    isTeacher: (state) =>
      [USER_ROLES.TEACHER, USER_ROLES.MENTOR].includes(state.userRole || state.user?.role),
    isParent: (state) => state.userRole === USER_ROLES.PARENT,
    userName: (state) =>
      state.user?.name || state.user?.fullName || state.user?.email || "Foydalanuvchi",
    userAvatar: (state) => state.user?.avatar || null,
    organization: (state) => state.user?.organization || null,
    permissions: (state) => state.user?.permissions || permissionAdapter.getPermissions(),
  },

  actions: {
    setAuth({ token, refreshToken, user, userRole }) {
      if (token) {
        this.token = token;
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      }
      if (refreshToken) {
        this.refreshToken = refreshToken;
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      }
      if (user) {
        this.user = user;
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        if (user.role) {
          this.userRole = user.role;
          localStorage.setItem(STORAGE_KEYS.USER_ROLE, user.role);
        }
        permissionAdapter.syncFromUser(user);
      }
      if (userRole) {
        this.userRole = userRole;
        localStorage.setItem(STORAGE_KEYS.USER_ROLE, userRole);
      }
    },

    async login(email, password) {
      this.loading = true;
      this.error = null;
      try {
        const res = await authApi.login(email, password);
        if (res && res.accessToken) {
          this.setAuth({
            token: res.accessToken,
            refreshToken: res.refreshToken,
            user: res.user,
            userRole: res.user?.role,
          });
          return res;
        }
        throw new Error(UI_MESSAGES.TOKEN_NOT_RECEIVED);
      } catch (err) {
        this.error = err.response?.data?.message || err.message || "Kirishda xatolik";
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      try {
        if (this.refreshToken) {
          await authApi.logout({ refreshToken: this.refreshToken });
        }
      } catch (err) {
        console.warn(UI_MESSAGES.LOGOUT_ERROR, err);
      } finally {
        this.token = null;
        this.refreshToken = null;
        this.user = null;
        this.userRole = null;
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.USER_ROLE);
        localStorage.removeItem(STORAGE_KEYS.PARENT_USER);
        permissionAdapter.reset();
      }
    },

    updateUser(userData) {
      this.user = { ...this.user, ...userData };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(this.user));
      permissionAdapter.syncFromUser(this.user);
    },
  },
});

export default useAuthStore;
