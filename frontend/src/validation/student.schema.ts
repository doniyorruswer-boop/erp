import * as yup from "yup";

import type { StudentGender, StudentStage, StudentStatus } from "@/types/student";

/**
 * Uzbek phone regex: +998XXXXXXXXX or 998XXXXXXXXX or 9XXXXXXXX
 */
const UZ_PHONE_REGEX = /^(?:\+?998)?[0-9]{9}$/;

export const studentSchema = yup.object({
  fullName: yup
    .string()
    .required("O'quvchi F.I.Sh ni kiritish shart")
    .min(3, "Kamida 3 ta harf bo'lishi kerak")
    .max(100, "100 ta belgidan oshmasligi kerak"),

  phone: yup
    .string()
    .required("Telefon raqamini kiritish shart")
    .matches(UZ_PHONE_REGEX, "Telefon formati noto'g'ri (masalan: +998901234567)"),

  className: yup.string().required("Sinf yoki guruhni tanlash shart"),

  stage: yup.string<StudentStage>().default("O'quvchi"),

  status: yup.string<StudentStatus>().default("Faol"),

  gender: yup.string<StudentGender>().default("Erkak"),

  monthlyFee: yup.number().min(0, "Oylik to'lov 0 dan kam bo'lishi mumkin emas").default(0),

  parentName: yup.string().optional(),

  parentPhone: yup
    .string()
    .test("is-valid-parent-phone", "Ota-ona telefon raqami noto'g'ri", (value) => {
      if (!value) return true;
      return UZ_PHONE_REGEX.test(value);
    })
    .optional(),

  birthDate: yup.string().optional(),
});

export type StudentSchemaInput = yup.InferType<typeof studentSchema>;
