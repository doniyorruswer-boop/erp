import * as yup from "yup";

const UZ_PHONE_REGEX = /^(?:\+?998)?[0-9]{9}$/;

export const employeeSchema = yup.object({
  firstName: yup.string().required("Ismni kiritish shart").min(2, "Kamida 2 ta harf bo'lsin"),

  lastName: yup.string().required("Familiyani kiritish shart").min(2, "Kamida 2 ta harf bo'lsin"),

  phone: yup
    .string()
    .required("Telefon raqamini kiritish shart")
    .matches(UZ_PHONE_REGEX, "Telefon formati noto'g'ri (masalan: +998901234567)"),

  position: yup.string().required("Lavozimni tanlash yoki kiritish shart"),

  department: yup.string().optional(),

  baseSalary: yup.number().min(0, "Maosh 0 dan kam bo'lishi mumkin emas").default(0),

  employmentType: yup
    .string()
    .oneOf(["FULL_TIME", "PART_TIME", "CONTRACT"], "Noto'g'ri bandlik turi")
    .default("FULL_TIME"),

  salaryType: yup
    .string()
    .oneOf(["FIXED", "HOURLY", "PERCENTAGE"], "Noto'g'ri maosh turi")
    .default("FIXED"),
});

export type EmployeeSchemaInput = yup.InferType<typeof employeeSchema>;
