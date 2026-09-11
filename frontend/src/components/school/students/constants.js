import {
  STANDARD_CLASS_NAMES,
  STUDENT_DEBT_OPTIONS,
  STUDENT_STAGES,
} from "@/constants/education.constants";

export const DATE_CHIPS = [
  { id: "ALL", label: "Barchasi" },
  { id: "TODAY", label: "Bugun" },
  { id: "THIS_WEEK", label: "Shu hafta" },
  { id: "THIS_MONTH", label: "Shu oy" },
  { id: "THIS_YEAR", label: "Shu yil" },
];

export const STAGE_OPTIONS = STUDENT_STAGES;
export const DEBT_OPTIONS = STUDENT_DEBT_OPTIONS;
export const CLASS_NAMES_LIST = STANDARD_CLASS_NAMES;

export const TABLE_COLUMNS = [
  { key: "fullName", label: "O'quvchi (F.I.SH)", sortable: true },
  {
    key: "className",
    label: "Sinf",
    align: "center",
    thClass: "py-3.5 px-4 text-center whitespace-nowrap",
  },
  {
    key: "stage",
    label: "Bosqich",
    align: "center",
    thClass: "py-3.5 px-4 text-center whitespace-nowrap",
  },
  { key: "phone", label: "Telefon", thClass: "py-3.5 px-4 whitespace-nowrap" },
  {
    key: "monthlyFee",
    label: "To'lov summasi",
    align: "right",
    sortable: true,
    thClass: "py-3.5 px-4 text-right whitespace-nowrap",
  },
  {
    key: "debt",
    label: "Qarzdorlik",
    align: "right",
    sortable: true,
    thClass: "py-3.5 px-4 text-right whitespace-nowrap",
  },
  {
    key: "status",
    label: "Holati",
    align: "center",
    thClass: "py-3.5 px-4 text-center whitespace-nowrap",
  },
  {
    key: "actions",
    label: "Amallar",
    align: "right",
    thClass: "py-3.5 px-4 text-right whitespace-nowrap",
  },
];
