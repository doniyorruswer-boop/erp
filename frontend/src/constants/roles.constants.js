/**
 * EduHub Central User Roles & Permission Constants
 */

export const USER_ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  TEACHER: "TEACHER",
  MENTOR: "MENTOR",
  STUDENT: "STUDENT",
  PARENT: "PARENT",
  STAFF: "STAFF",
  RECEPTIONIST: "RECEPTIONIST",
  GUEST: "GUEST",
};

export const ROLE_LABELS = {
  SUPER_ADMIN: "Bosh Administrator",
  ADMIN: "Administrator",
  TEACHER: "O'qituvchi",
  MENTOR: "Mentor",
  STUDENT: "O'quvchi",
  PARENT: "Ota-ona",
  STAFF: "Xodim",
  RECEPTIONIST: "Qabulxona (Reception)",
  GUEST: "Mehmon",
};

export const ADMIN_ROLES = [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN];

export const TEACHER_ROLES = [USER_ROLES.TEACHER, USER_ROLES.MENTOR];

export default USER_ROLES;
