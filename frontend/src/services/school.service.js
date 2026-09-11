/**
 * School & Academic Domain Service
 * Connects school classes, parents, rooms, subjects, and schedules to backend database APIs
 * with graceful fallback to centralized education constants.
 */
import { groupsApi, parentsApi, roomsApi, scheduleApi } from "@/api/services";
import {
  BELL_SCHEDULE,
  DEFAULT_SUBJECTS,
  SCHOOL_QUARTERS,
  STANDARD_CLASS_NAMES,
  STUDENT_DEBT_OPTIONS,
  STUDENT_STAGES,
  WEEKDAYS,
} from "@/constants/education.constants";

export const schoolService = {
  /**
   * Get list of school classes / academic groups
   */
  async getClasses() {
    try {
      const data = await groupsApi.getAll({ type: "CLASS" });
      return Array.isArray(data) && data.length > 0 ? data : [];
    } catch (err) {
      console.error("[SchoolService.getClasses] Error fetching classes:", err);
      return [];
    }
  },

  /**
   * Get list of school parents from backend API
   */
  async getParents() {
    try {
      const data = await parentsApi.getAll();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error("[SchoolService.getParents] Error fetching parents:", err);
      return [];
    }
  },

  /**
   * Get rooms from database API or fallback to default constants
   */
  async getRooms() {
    try {
      const data = await roomsApi.getAll();
      if (Array.isArray(data) && data.length > 0) return data;
    } catch (err) {
      console.warn("[SchoolService.getRooms] Fallback to standard rooms:", err);
    }
    return [
      { id: "101", name: "101-xona" },
      { id: "102", name: "102-xona" },
      { id: "103", name: "103-xona" },
      { id: "201", name: "201-xona" },
      { id: "202", name: "202-xona" },
    ];
  },

  /**
   * Get school schedule by class ID
   */
  async getSchedule(classId) {
    try {
      return await scheduleApi.getByClass(classId);
    } catch (err) {
      console.error(`[SchoolService.getSchedule] Error for ${classId}:`, err);
      return null;
    }
  },

  /**
   * Domain constants getters
   */
  getQuarters() {
    return SCHOOL_QUARTERS;
  },

  getWeekdays() {
    return WEEKDAYS;
  },

  getBellSchedule() {
    return BELL_SCHEDULE;
  },

  getClassNames() {
    return STANDARD_CLASS_NAMES;
  },

  getSubjects() {
    return DEFAULT_SUBJECTS;
  },

  getStageOptions() {
    return STUDENT_STAGES;
  },

  getDebtOptions() {
    return STUDENT_DEBT_OPTIONS;
  },
};
