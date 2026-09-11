/**
 * Authentication Business & API Service
 */
import { authApi } from "@/api/services";

export const authService = {
  async login(credential, password) {
    return authApi.login(credential, password);
  },

  async register(payload) {
    return authApi.register(payload);
  },

  async refresh(refreshToken) {
    return authApi.refresh(refreshToken);
  },

  async logout(body = {}) {
    return authApi.logout(body);
  },

  async getProfile() {
    return authApi.getProfile();
  },
};
