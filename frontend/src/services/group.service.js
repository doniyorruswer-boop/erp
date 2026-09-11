/**
 * Group Business & API Service
 */
import { coursesApi, groupsApi, roomsApi, usersApi } from "@/api/services";

export const groupService = {
  async getAll(params = {}) {
    try {
      const data = await groupsApi.getAll(params);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error("[GroupService.getAll] Error fetching groups:", err);
      return [];
    }
  },

  async getById(id) {
    return groupsApi.getOne(id);
  },

  async create(payload) {
    return groupsApi.create(payload);
  },

  async update(id, payload) {
    return groupsApi.update(id, payload);
  },

  async delete(id) {
    return groupsApi.delete(id);
  },

  async generateLessons(groupId, options = {}) {
    return groupsApi.generateLessons(groupId, options);
  },

  async getRelatedResources() {
    try {
      const [courses, users, rooms] = await Promise.all([
        coursesApi.getAll().catch(() => []),
        usersApi.getAll().catch(() => []),
        roomsApi.getAll().catch(() => []),
      ]);

      const teachers = Array.isArray(users)
        ? users.filter((u) => u.role === "TEACHER" || u.role === "ADMIN")
        : [];

      return {
        courses: Array.isArray(courses) ? courses : [],
        teachers,
        rooms: Array.isArray(rooms) ? rooms : [],
      };
    } catch (err) {
      console.error("[GroupService.getRelatedResources] Error:", err);
      return { courses: [], teachers: [], rooms: [] };
    }
  },
};
