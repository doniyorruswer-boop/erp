/**
 * EduHub Form Validation Rules (O'zbek tilidagi qoidalar)
 * Vee-Validate va Yup uchun maxsus qoidalar va yordamchi funksiyalar
 */

import * as yup from "yup";

// Standart O'zbekcha xato xabarlari bilan Yup konfiguratsiyasi
yup.setLocale({
  mixed: {
    default: "Maydon noto'g'ri to'ldirilgan",
    required: "Ushbu maydonni to'ldirish shart",
    notType: "Kiritilgan ma'lumot turi noto'g'ri",
  },
  string: {
    min: ({ min }) => `Kamida ${min} ta belgi kiritilishi lozim`,
    max: ({ max }) => `Ko'pi bilan ${max} ta belgi kiritilishi mumkin`,
    email: "Haqiqiy elektron pochta manzilini kiriting",
  },
  number: {
    min: ({ min }) => `Qiymat kamida ${min} bo'lishi kerak`,
    max: ({ max }) => `Qiymat ko'pi bilan ${max} bo'lishi kerak`,
    positive: "Musbat son kiritilishi kerak",
    integer: "Butun son bo'lishi kerak",
  },
});

// O'zbekiston telefon raqami regex tekshiruvi (+998 90 123 45 67 yoki 901234567)
const phoneRegex = /^(\+?998)?[0-9]{9}$/;

/**
 * O'quvchi qo'shish va tahrirlash formasi validation schemasi
 */
export const studentSchema = yup.object({
  fullName: yup.string().required("O'quvchi F.I.Sh ni kiritish shart").min(3, "Kamida 3 ta harf bo'lsin"),
  phone: yup
    .string()
    .required("Telefon raqamni kiritish shart")
    .test("is-phone", "Telefon formati noto'g'ri (masalan: 90 123 45 67)", (val) => {
      if (!val) return false;
      const clean = val.replace(/\D/g, "");
      return clean.length === 9 || (clean.length === 12 && clean.startsWith("998"));
    }),
  courseId: yup.mixed().required("Kursni tanlash shart"),
  birthDate: yup.string().nullable(),
});

/**
 * To'lov qabul qilish formasi validation schemasi
 */
export const paymentSchema = yup.object({
  studentId: yup.mixed().required("O'quvchini tanlash shart"),
  amount: yup.number().required("To'lov summasini kiriting").min(1000, "To'lov kamida 1,000 so'm bo'lishi kerak"),
  paymentMethod: yup.string().required("To'lov usulini tanlang"),
  date: yup.string().required("To'lov sanasini tanlang"),
});

/**
 * Yangi Lid (Murojaat) validation schemasi
 */
export const leadSchema = yup.object({
  name: yup.string().required("Lid ismini kiritish shart").min(2, "Kamida 2 ta harf"),
  phone: yup.string().required("Telefon raqamini kiritish shart"),
  source: yup.string().required("Murojaat manbasini tanlang"),
  course: yup.string().required("Qiziqqan kursini tanlang"),
});

/**
 * Yangi Kurs validation schemasi
 */
export const courseSchema = yup.object({
  name: yup.string().required("Kurs nomini kiritish shart").min(3, "Kamida 3 ta belgi"),
  price: yup.number().required("Oylik narxini kiriting").min(0, "Narx musbat bo'lishi kerak"),
  duration: yup.number().required("Davomiyligini kiriting").min(1, "Kamida 1 oy"),
});

/**
 * Taqvim / Tadbir validation schemasi
 */
export const taskSchema = yup.object({
  title: yup.string().required("Topshiriq yoki tadbir nomini kiriting").min(2, "Kamida 2 ta belgi"),
  date: yup.string().required("Sanani tanlash shart"),
  type: yup.string().required("Tadbir turini tanlang"),
});

export { yup };
