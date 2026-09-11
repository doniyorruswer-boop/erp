/**
 * Course & Group Business & API Service
 */
import { coursesApi, groupsApi } from "@/api/services";

export const courseService = {
  async getAll() {
    try {
      const data = await coursesApi.getAll();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error("[CourseService.getAll] Error fetching courses:", err);
      return [];
    }
  },

  async getById(id) {
    return coursesApi.getOne(id);
  },

  async create(payload) {
    return coursesApi.create(payload);
  },

  async update(id, payload) {
    return coursesApi.update(id, payload);
  },

  async delete(id) {
    return coursesApi.delete(id);
  },

  async restore(id) {
    return coursesApi.restore(id);
  },

  // Groups
  async getGroups(params = {}) {
    try {
      const data = await groupsApi.getAll(params);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error("[CourseService.getGroups] Error fetching groups:", err);
      return [];
    }
  },

  async getGroupById(id) {
    return groupsApi.getOne(id);
  },

  async createGroup(payload) {
    return groupsApi.create(payload);
  },

  async updateGroup(id, payload) {
    return groupsApi.update(id, payload);
  },

  async deleteGroup(id) {
    return groupsApi.delete(id);
  },

  async addStudentToGroup(groupId, studentId) {
    return groupsApi.addStudent(groupId, studentId);
  },

  async removeStudentFromGroup(groupId, studentId) {
    return groupsApi.removeStudent(groupId, studentId);
  },

  async generateLessons(groupId, options = {}) {
    return groupsApi.generateLessons(groupId, options);
  },
};
