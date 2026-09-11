/**
 * Student Business & API Service
 */
import { studentsApi } from "@/api/services";

export const studentService = {
  /**
   * Fetch all students from API with fallback and error handling
   */
  async getAll(params = {}) {
    try {
      const data = await studentsApi.getAll(params);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error("[StudentService.getAll] Error fetching students:", err);
      return [];
    }
  },

  /**
   * Fetch a single student by ID
   */
  async getById(id) {
    return studentsApi.getOne(id);
  },

  /**
   * Create a new student record
   */
  async create(payload) {
    return studentsApi.create(payload);
  },

  /**
   * Update student record
   */
  async update(id, payload) {
    return studentsApi.update(id, payload);
  },

  /**
   * Delete student record
   */
  async delete(id) {
    return studentsApi.delete(id);
  },

  /**
   * Restore deleted student
   */
  async restore(id) {
    return studentsApi.restore(id);
  },

  /**
   * Normalize and retrieve enrolled leads from local lead stores
   */
  getEnrolledLeads() {
    const leadStoreKeys = [
      "educrm_leads_store_COURSE_CENTER",
      "educrm_leads_store_SCHOOL",
      "educrm_leads_store_KINDERGARTEN",
    ];
    const enrolledLeads = [];

    leadStoreKeys.forEach((key) => {
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const leads = JSON.parse(raw);
          const list = leads.filter((l) => l.stage === "ENROLLED" || l.status === "ENROLLED");
          enrolledLeads.push(...list);
        }
      } catch (e) {
        console.warn(`[StudentService] Failed to read lead key ${key}`, e);
      }
    });

    return enrolledLeads.map((l) => {
      const names = (l.fullName || "").trim().split(" ");
      const fName = l.firstName || names[0] || "O'quvchi";
      const lName = l.lastName || names.slice(1).join(" ") || "—";
      return {
        id: l.id || `lead-${Date.now()}`,
        firstName: fName,
        lastName: lName,
        phone: l.phone || "",
        parentName: l.parentName || "-",
        parentPhone: l.parentPhone || "",
        address: l.address || "Manzil kiritilmagan",
        balance: Number(l.amount) || 0,
        status: "ACTIVE",
        enrollments: l.courseName ? [{ id: `en-${l.id}`, group: { name: l.courseName } }] : [],
        createdAt: l.createdAt || new Date().toISOString(),
      };
    });
  },

  /**
   * Get locally saved students from wizard
   */
  getSavedStudents() {
    try {
      const raw = localStorage.getItem("educrm_students_store");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  /**
   * Combine API students, saved students, and enrolled leads with deduplication
   */
  async getCombinedStudentsList() {
    const [apiStudents, saved, enrolled] = await Promise.all([
      this.getAll(),
      Promise.resolve(this.getSavedStudents()),
      Promise.resolve(this.getEnrolledLeads()),
    ]);

    const normalizePhone = (p) => (p || "").replace(/\D/g, "");
    const seenKeys = new Set();
    const result = [];

    // Recent local / enrolled students first
    [...saved, ...enrolled].forEach((s) => {
      const phoneDigits = normalizePhone(s.phone);
      const key = phoneDigits || s.id;
      if (key && !seenKeys.has(key)) {
        seenKeys.add(key);
        result.push(s);
      }
    });

    // API students
    apiStudents.forEach((s) => {
      const phoneDigits = normalizePhone(s.phone);
      const key = phoneDigits || s.id;
      if (key && !seenKeys.has(key)) {
        seenKeys.add(key);
        result.push(s);
      }
    });

    return result;
  },
};
