/**
 * EduHub Real API Services (Connected to NestJS + PostgreSQL)
 */
import api from './client';

export const authApi = {
  login: (credential, password) => {
    const payload = typeof credential === 'object'
      ? { ...credential, password }
      : (credential && credential.includes('@') ? { email: credential, password } : { phone: credential, password });
    return api.post('/auth/login', payload);
  },
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  logout: (body = {}) => api.post('/auth/logout', body),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
};

export const dashboardApi = {
  getStats: (params = {}) => {
    if (typeof params === 'string') {
      return api.get(`/dashboard/stats?type=${params}`);
    }
    const query = new URLSearchParams(params).toString();
    return api.get(`/dashboard/stats${query ? '?' + query : ''}`);
  },
  getWidgets: (role) => api.get(`/dashboard/widgets${role ? '?role=' + role : ''}`),
};

export const studentsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/students${query ? '?' + query : ''}`);
  },
  getOne: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
  restore: (id) => api.post(`/students/${id}/restore`),
};

export const coursesApi = {
  getAll: () => api.get('/courses'),
  getOne: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
  restore: (id) => api.post(`/courses/${id}/restore`),
};

export const groupsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/groups${query ? '?' + query : ''}`);
  },
  getOne: (id) => api.get(`/groups/${id}`),
  create: (data) => api.post('/groups', data),
  update: (id, data) => api.put(`/groups/${id}`, data),
  delete: (id) => api.delete(`/groups/${id}`),
  restore: (id) => api.post(`/groups/${id}/restore`),
  addStudent: (groupId, studentId) => api.post(`/groups/${groupId}/students`, { studentId }),
  removeStudent: (groupId, studentId) => api.delete(`/groups/${groupId}/students/${studentId}`),
};

export const attendanceApi = {
  getAttendance: (groupId, date) => api.get(`/attendance?groupId=${groupId}&date=${date}`),
  getMonthlyAttendance: (groupId, month) => api.get(`/attendance/monthly?groupId=${groupId}&month=${month}`),
  markAttendance: (groupId, date, records) => api.post('/attendance', { groupId, date, records }),
};

export const paymentsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/payments${query ? '?' + query : ''}`);
  },
  getOne: (id) => api.get(`/payments/${id}`),
  getSummary: () => api.get('/payments/summary'),
  create: (data) => api.post('/payments', data),
  update: (id, data) => api.put(`/payments/${id}`, data),
  delete: (id) => api.delete(`/payments/${id}`),
  void: (id, reason) => api.post(`/payments/${id}/void`, { reason }),
  refund: (id, reason) => api.post(`/payments/${id}/refund`, { reason }),
};

export const leadsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/leads${query ? '?' + query : ''}`);
  },
  getKanban: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/leads/kanban${query ? '?' + query : ''}`);
  },
  getOne: (id) => api.get(`/leads/${id}`),
  create: (data) => api.post('/leads', data),
  update: (id, data) => api.put(`/leads/${id}`, data),
  moveToStage: (id, stageId) => api.post(`/leads/${id}/stage`, { stageId }),
  convert: (id, data = {}) => api.post(`/leads/${id}/convert`, data),
  delete: (id) => api.delete(`/leads/${id}`),
  restore: (id) => api.post(`/leads/${id}/restore`),
};

export const pipelinesApi = {
  getAll: () => api.get('/crm/pipelines'),
  getOne: (id) => api.get(`/crm/pipelines/${id}`),
  create: (data) => api.post('/crm/pipelines', data),
  update: (id, data) => api.put(`/crm/pipelines/${id}`, data),
  delete: (id) => api.delete(`/crm/pipelines/${id}`),
  addStage: (pipelineId, data) => api.post(`/crm/pipelines/${pipelineId}/stages`, data),
  updateStage: (stageId, data) => api.put(`/crm/pipelines/stages/${stageId}`, data),
  removeStage: (stageId) => api.delete(`/crm/pipelines/stages/${stageId}`),
  reorderStages: (pipelineId, stageIds) => api.post(`/crm/pipelines/${pipelineId}/stages/reorder`, { stageIds }),
};

export const customersApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/crm/customers${query ? '?' + query : ''}`);
  },
  getOne: (id) => api.get(`/crm/customers/${id}`),
  create: (data) => api.post('/crm/customers', data),
  update: (id, data) => api.put(`/crm/customers/${id}`, data),
  delete: (id) => api.delete(`/crm/customers/${id}`),
  restore: (id) => api.post(`/crm/customers/${id}/restore`),
};

export const tasksApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/crm/tasks${query ? '?' + query : ''}`);
  },
  getOne: (id) => api.get(`/crm/tasks/${id}`),
  create: (data) => api.post('/crm/tasks', data),
  update: (id, data) => api.put(`/crm/tasks/${id}`, data),
  complete: (id) => api.post(`/crm/tasks/${id}/complete`),
  delete: (id) => api.delete(`/crm/tasks/${id}`),
  restore: (id) => api.post(`/crm/tasks/${id}/restore`),
};

export const activitiesApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/crm/activities${query ? '?' + query : ''}`);
  },
  create: (data) => api.post('/crm/activities', data),
};

export const crmNotesApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/crm/notes${query ? '?' + query : ''}`);
  },
  create: (data) => api.post('/crm/notes', data),
  update: (id, data) => api.put(`/crm/notes/${id}`, data),
  delete: (id) => api.delete(`/crm/notes/${id}`),
};

export const usersApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/users${query ? '?' + query : ''}`);
  },
  getOne: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  restore: (id) => api.post(`/users/${id}/restore`),
};

export const roomsApi = {
  getAll: () => api.get('/rooms'),
  getOne: (id) => api.get(`/rooms/${id}`),
  create: (data) => api.post('/rooms', data),
  update: (id, data) => api.put(`/rooms/${id}`, data),
  delete: (id) => api.delete(`/rooms/${id}`),
  restore: (id) => api.post(`/rooms/${id}/restore`),
};

export const setupApi = {
  getStatus: () => api.get('/setup/status'),
  getOrganizations: () => api.get('/setup/organizations'),
  switchOrganization: (id) => api.post(`/setup/switch/${id}`),
  initialize: (data) => api.post('/setup/initialize', data),
  getConfig: () => api.get('/setup/config'),
  updateConfig: (data) => api.put('/setup/config', data),
};

export const contractsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/contracts${query ? '?' + query : ''}`);
  },
  create: (data) => api.post('/contracts', data),
};

export const branchesApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/branches${query ? '?' + query : ''}`);
  },
  getOne: (id) => api.get(`/branches/${id}`),
  create: (data) => api.post('/branches', data),
  update: (id, data) => api.put(`/branches/${id}`, data),
  delete: (id) => api.delete(`/branches/${id}`),
  restore: (id) => api.post(`/branches/${id}/restore`),
  assignUser: (branchId, userId, isDefault = false) => api.post(`/branches/${branchId}/users/${userId}`, { isDefault }),
  removeUser: (branchId, userId) => api.delete(`/branches/${branchId}/users/${userId}`),
  getUserBranches: (userId) => api.get(`/branches/user/${userId}`),
};

export const rolesApi = {
  getPermissions: () => api.get('/roles/permissions'),
  getAll: () => api.get('/roles'),
  getOne: (id) => api.get(`/roles/${id}`),
  create: (data) => api.post('/roles', data),
  update: (id, data) => api.put(`/roles/${id}`, data),
  delete: (id) => api.delete(`/roles/${id}`),
  restore: (id) => api.post(`/roles/${id}/restore`),
};

export const auditApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/audit${query ? '?' + query : ''}`);
  },
};

export const customFieldsApi = {
  getDefinitions: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/custom-fields/definitions${query ? '?' + query : ''}`);
  },
  getDefinition: (id) => api.get(`/custom-fields/definitions/${id}`),
  createDefinition: (data) => api.post('/custom-fields/definitions', data),
  updateDefinition: (id, data) => api.put(`/custom-fields/definitions/${id}`, data),
  deleteDefinition: (id) => api.delete(`/custom-fields/definitions/${id}`),
  restoreDefinition: (id) => api.post(`/custom-fields/definitions/${id}/restore`),
  validate: (entityType, values) => api.post('/custom-fields/validate', { entityType, values }),
};

export const resourcesApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/resources${query ? '?' + query : ''}`);
  },
  getOne: (id) => api.get(`/resources/${id}`),
  create: (data) => api.post('/resources', data),
  update: (id, data) => api.put(`/resources/${id}`, data),
  delete: (id) => api.delete(`/resources/${id}`),
  restore: (id) => api.post(`/resources/${id}/restore`),
};

export const scheduleApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/schedules${query ? '?' + query : ''}`);
  },
  getOne: (id) => api.get(`/schedules/${id}`),
  create: (data) => api.post('/schedules', data),
  update: (id, data) => api.put(`/schedules/${id}`, data),
  checkConflict: (data) => api.post('/schedules/check-conflict', data),
  delete: (id) => api.delete(`/schedules/${id}`),
  restore: (id) => api.post(`/schedules/${id}/restore`),
};

export const financeApi = {
  getSummary: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/finance/summary${query ? '?' + query : ''}`);
  },
  // Invoices
  getInvoices: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/finance/invoices${query ? '?' + query : ''}`);
  },
  getInvoice: (id) => api.get(`/finance/invoices/${id}`),
  createInvoice: (data) => api.post('/finance/invoices', data),
  updateInvoice: (id, data) => api.put(`/finance/invoices/${id}`, data),
  deleteInvoice: (id) => api.delete(`/finance/invoices/${id}`),
  restoreInvoice: (id) => api.post(`/finance/invoices/${id}/restore`),
  allocatePayment: (data) => api.post('/finance/allocate', data),
  // Cashboxes
  getCashboxes: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/finance/cashboxes${query ? '?' + query : ''}`);
  },
  getCashbox: (id) => api.get(`/finance/cashboxes/${id}`),
  createCashbox: (data) => api.post('/finance/cashboxes', data),
  updateCashbox: (id, data) => api.put(`/finance/cashboxes/${id}`, data),
  deleteCashbox: (id) => api.delete(`/finance/cashboxes/${id}`),
  // Expenses
  getExpenses: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/finance/expenses${query ? '?' + query : ''}`);
  },
  getExpense: (id) => api.get(`/finance/expenses/${id}`),
  createExpense: (data) => api.post('/finance/expenses', data),
  updateExpense: (id, data) => api.put(`/finance/expenses/${id}`, data),
  deleteExpense: (id) => api.delete(`/finance/expenses/${id}`),
  getExpenseCategories: () => api.get('/finance/expenses/categories'),
  createExpenseCategory: (data) => api.post('/finance/expenses/categories', data),
  // Catalog
  getCatalog: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/finance/catalog${query ? '?' + query : ''}`);
  },
  createCatalogItem: (data) => api.post('/finance/catalog', data),
  updateCatalogItem: (id, data) => api.put(`/finance/catalog/${id}`, data),
  deleteCatalogItem: (id) => api.delete(`/finance/catalog/${id}`),
  // Transactions Ledger
  getTransactions: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/finance/transactions${query ? '?' + query : ''}`);
  },
  // Refunds
  refundPayment: (data) => api.post('/finance/refund', data),
};

export const notificationsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/notifications${query ? '?' + query : ''}`);
  },
  send: (data) => api.post('/notifications/send', data),
  sendEvent: (data) => api.post('/notifications/send-event', data),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.post('/notifications/read-all'),
  getTemplates: () => api.get('/notifications/templates'),
  createTemplate: (data) => api.post('/notifications/templates', data),
  updateTemplate: (id, data) => api.put(`/notifications/templates/${id}`, data),
  deleteTemplate: (id) => api.delete(`/notifications/templates/${id}`),
};

export const jobsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/jobs${query ? '?' + query : ''}`);
  },
  getOne: (id) => api.get(`/jobs/${id}`),
  create: (data) => api.post('/jobs', data),
  triggerMaintenance: () => api.post('/jobs/trigger-maintenance'),
  retry: (id) => api.post(`/jobs/${id}/retry`),
};

export const importExportApi = {
  preview: (data) => api.post('/data-transfer/import/preview', data),
  confirm: (data) => api.post('/data-transfer/import/confirm', data),
  exportUrl: (entity, format = 'csv') => `/api/data-transfer/export/${entity}?format=${format}`,
  exportData: (entity, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/data-transfer/export/${entity}${query ? '?' + query : ''}`);
  },
};

export const subscriptionsApi = {
  getPlans: () => api.get('/subscriptions/plans'),
  getCurrent: () => api.get('/subscriptions/current'),
  subscribe: (data) => api.post('/subscriptions/subscribe', data),
  cancel: () => api.post('/subscriptions/cancel'),
  checkLimit: (data) => api.post('/subscriptions/check-limit', data),
};

export const workflowsApi = {
  getAll: () => api.get('/workflows'),
  getOne: (id) => api.get(`/workflows/${id}`),
  create: (data) => api.post('/workflows', data),
  update: (id, data) => api.put(`/workflows/${id}`, data),
  delete: (id) => api.delete(`/workflows/${id}`),
  triggerEvent: (data) => api.post('/workflows/trigger-event', data),
};

export const examsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/exams${query ? '?' + query : ''}`);
  },
  getOne: (id) => api.get(`/exams/${id}`),
  create: (data) => api.post('/exams', data),
  update: (id, data) => api.put(`/exams/${id}`, data),
  delete: (id) => api.delete(`/exams/${id}`),
  recordGrades: (data) => api.post('/exams/grades', data),
  getStudentGrades: (studentId) => api.get(`/exams/students/${studentId}/grades`),
};

export const employeesApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/employees${query ? '?' + query : ''}`);
  },
  getOne: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
  createPayroll: (data) => api.post('/employees/payroll', data),
  getEmployeePayrolls: (id) => api.get(`/employees/${id}/payroll`),
  getPayrollSummary: (period) => api.get(`/employees/payroll/summary${period ? '?period=' + period : ''}`),
};

export const lessonsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/lessons${query ? '?' + query : ''}`);
  },
  getOne: (id) => api.get(`/lessons/${id}`),
  create: (data) => api.post('/lessons', data),
  update: (id, data) => api.put(`/lessons/${id}`, data),
  delete: (id) => api.delete(`/lessons/${id}`),
};

export const parentsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/parents${query ? '?' + query : ''}`);
  },
  getOne: (id) => api.get(`/parents/${id}`),
  create: (data) => api.post('/parents', data),
  update: (id, data) => api.put(`/parents/${id}`, data),
  delete: (id) => api.delete(`/parents/${id}`),
  linkStudent: (data) => api.post('/parents/link', data),
  unlinkStudent: (parentId, studentId) => api.delete(`/parents/${parentId}/students/${studentId}`),
};


