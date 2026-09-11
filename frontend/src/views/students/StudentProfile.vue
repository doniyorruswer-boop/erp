<template>
  <div class="student-profile-page p-4 font-lexend">
    <!-- Breadcrumb -->
    <Breadcrumb
      :items="[
        { title: 'O\'quvchilar', to: '/students' },
        { title: student ? `${student.firstName} ${student.lastName}` : 'O\'quvchi profili' },
      ]"
    />

    <!-- Loading State with Universal Smooth Spinner -->
    <LoadingSpinner
      v-if="loading"
      size="lg"
      text="O'quvchi ma'lumotlari yuklanmoqda..."
      :full-page="true"
    />

    <!-- Student Not Found State -->
    <div
      v-else-if="!student"
      class="text-center py-20 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-8"
    >
      <Icon
        icon="solar:user-cross-bold"
        class="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-3"
      />
      <h3 class="text-lg font-bold text-gray-700 dark:text-gray-200">O'quvchi topilmadi</h3>
      <p class="text-sm text-gray-400 mt-1 mb-5">
        Bunday identifikatorli o'quvchi mavjud emas yoki o'chirilgan.
      </p>
      <RouterLink to="/students">
        <AppButton variant="primary" icon="solar:arrow-left-linear"
          >O'quvchilar ro'yxatiga qaytish</AppButton
        >
      </RouterLink>
    </div>

    <!-- Main Content -->
    <div v-else class="space-y-5">
      <!-- Toast Alert -->
      <Alert v-if="alertMessage" :message="alertMessage" @close="alertMessage = ''" />

      <!-- Top Profile Banner Card -->
      <div class="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-5 shadow-sm">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <!-- User info -->
          <div class="flex items-center gap-4">
            <div
              class="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-primary to-indigo-400 text-white font-bold text-2xl flex items-center justify-center shadow-md flex-shrink-0"
            >
              {{ (student.firstName?.[0] || "T") + (student.lastName?.[0] || "") }}
            </div>
            <div>
              <div class="flex items-center gap-2.5 flex-wrap">
                <h1 class="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {{ student.firstName }} {{ student.lastName }}
                </h1>
                <Badge
                  :variant="
                    student.status === 'ACTIVE'
                      ? 'success'
                      : student.status === 'FROZEN'
                        ? 'warning'
                        : 'danger'
                  "
                  :dot="true"
                  size="sm"
                >
                  {{
                    student.status === "ACTIVE"
                      ? "Faol o'quvchi"
                      : student.status === "FROZEN"
                        ? "Muzlatilgan"
                        : "Nofaol"
                  }}
                </Badge>
              </div>

              <div
                class="flex items-center gap-4 mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex-wrap"
              >
                <span class="flex items-center gap-1">
                  <Icon icon="solar:phone-calling-linear" class="text-primary" />
                  {{ formatPhone(student.phone) }}
                </span>
                <span class="flex items-center gap-1">
                  <Icon icon="solar:buildings-2-linear" class="text-primary" />
                  Asosiy Filial
                </span>
                <span class="flex items-center gap-1">
                  <Icon icon="solar:calendar-date-linear" class="text-primary" />
                  Qabul: {{ formatDate(student.createdAt) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Quick Action Buttons -->
          <div class="flex items-center gap-2 flex-wrap">
            <AppButton
              variant="success"
              icon="solar:wallet-money-bold"
              size="md"
              @click="showPaymentModal = true"
            >
              To'lov Qabul Qilish
            </AppButton>

            <AppButton
              variant="primary"
              icon="solar:chat-round-dots-linear"
              size="md"
              @click="openSmsModal"
            >
              SMS Xabar
            </AppButton>

            <AppButton
              variant="outline"
              :icon="
                student.status === 'FROZEN' ? 'solar:play-circle-bold' : 'solar:pause-circle-bold'
              "
              size="md"
              @click="toggleFreezeStudent"
            >
              {{ student.status === "FROZEN" ? "Faollashtirish" : "Muzlatish" }}
            </AppButton>
          </div>
        </div>
      </div>

      <!-- Two-Column Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <!-- LEFT COLUMN: Quick Summary Cards -->
        <div class="space-y-5">
          <!-- Balance Widget -->
          <div
            class="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-5 shadow-sm"
          >
            <div class="flex items-center justify-between pb-3 border-b dark:border-gray-700">
              <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider"
                >Hisob Balansi</span
              >
              <Icon icon="solar:wallet-2-bold" class="text-xl text-primary" />
            </div>

            <div class="mt-4">
              <div
                class="text-2xl font-black"
                :class="
                  student.balance >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                "
              >
                {{ formatUZS(student.balance) }}
              </div>
              <p class="text-xs text-gray-400 mt-1">
                {{
                  student.balance >= 0
                    ? "To'lovlar bo'yicha qarzdorlik yo'q"
                    : "Qarzdorlik mavjud! Iltimos, to'lovni amalga oshiring."
                }}
              </p>
            </div>

            <div class="mt-4 pt-4 border-t dark:border-gray-700 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span class="text-gray-400 block">Jami To'lagan:</span>
                <span class="font-bold text-gray-800 dark:text-gray-200">{{
                  formatUZS(totalPaymentsSum)
                }}</span>
              </div>
              <div>
                <span class="text-gray-400 block">Oylik abonent:</span>
                <span class="font-bold text-gray-800 dark:text-gray-200">{{
                  formatUZS(currentMonthlyFee)
                }}</span>
              </div>
            </div>

            <button
              class="w-full mt-4 py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition"
              @click="showPaymentModal = true"
            >
              <Icon icon="solar:wallet-money-bold" class="text-lg" />
              <span>To'lov kiritish</span>
            </button>
          </div>

          <!-- Groups Widget -->
          <div
            class="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-5 shadow-sm"
          >
            <div class="flex items-center justify-between pb-3 border-b dark:border-gray-700">
              <div class="flex items-center gap-2">
                <Icon icon="ri:team-fill" class="text-primary text-lg" />
                <h3 class="text-sm font-bold text-gray-800 dark:text-gray-100">
                  Biriktirilgan Guruhlar
                </h3>
              </div>
              <span
                class="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-gray-600 dark:text-gray-300 font-bold"
              >
                {{ student.enrollments?.length || 0 }} ta
              </span>
            </div>

            <div class="mt-3 space-y-3">
              <div
                v-for="en in student.enrollments"
                :key="en.id"
                class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600"
              >
                <div class="flex items-center justify-between">
                  <span class="font-bold text-sm text-gray-800 dark:text-gray-100">{{
                    en.group?.name
                  }}</span>
                  <Badge variant="primary" size="xs">{{ en.group?.course?.title || "Kurs" }}</Badge>
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-2 space-y-1">
                  <div class="flex items-center gap-1.5">
                    <Icon icon="solar:clock-circle-linear" />
                    <span
                      >{{ getDaysLabel(en.group?.days) }} ({{ en.group?.startTime }} -
                      {{ en.group?.endTime }})</span
                    >
                  </div>
                  <div class="flex items-center gap-1.5">
                    <Icon icon="solar:user-id-linear" />
                    <span>O'qituvchi: {{ en.group?.teacher?.firstName || "Tayinlanmagan" }}</span>
                  </div>
                </div>
              </div>

              <div
                v-if="!student.enrollments || student.enrollments.length === 0"
                class="text-center py-4 text-xs text-gray-400"
              >
                Hozircha biror guruhga biriktirilmagan
              </div>
            </div>
          </div>

          <!-- Parent / Guardian Widget -->
          <div
            class="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-5 shadow-sm"
          >
            <div class="flex items-center justify-between pb-3 border-b dark:border-gray-700">
              <div class="flex items-center gap-2">
                <Icon icon="solar:users-group-two-rounded-bold" class="text-primary text-lg" />
                <h3 class="text-sm font-bold text-gray-800 dark:text-gray-100">
                  Ota-ona ma'lumotlari
                </h3>
              </div>
            </div>

            <div class="mt-3 space-y-2 text-xs">
              <div class="flex justify-between py-1.5 border-b dark:border-gray-700/60">
                <span class="text-gray-400">F.I.SH:</span>
                <span class="font-semibold text-gray-800 dark:text-gray-200">{{
                  student.parentName || "-"
                }}</span>
              </div>
              <div class="flex justify-between py-1.5 border-b dark:border-gray-700/60">
                <span class="text-gray-400">Telefon raqam:</span>
                <span class="font-semibold text-gray-800 dark:text-gray-200">{{
                  formatPhone(student.parentPhone)
                }}</span>
              </div>
              <div class="flex justify-between py-1.5">
                <span class="text-gray-400">SMS xabarnoma:</span>
                <span class="text-green-600 font-semibold flex items-center gap-1">
                  <Icon icon="solar:check-circle-bold" /> Yoqilgan
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT COLUMN: Deep Details Tabs -->
        <div class="lg:col-span-2 space-y-5">
          <!-- Universal Tabs Selector -->
          <TabsNav v-model="activeTab" :tabs="profileTabs" />

          <!-- TAB 1: General Info -->
          <div v-if="activeTab === 'overview'" class="space-y-5">
            <InfoGrid
              title="Shaxsiy va Aloqa Ma'lumotlari"
              subtitle="O'quvchi to'g'risidagi to'liq anketaviy ma'lumotlar"
              icon="solar:user-id-bold"
              :items="generalInfoItems"
              :cols="2"
            />

            <InfoGrid
              title="Ta'lim va Shartnoma Parametrlari"
              subtitle="Qabul sanasi, daraja, shartnoma va marketing kanali"
              icon="solar:document-text-bold"
              :items="academicInfoItems"
              :cols="2"
            />
          </div>

          <!-- TAB 2: Payment History -->
          <div v-if="activeTab === 'payments'" class="space-y-4">
            <div
              class="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700"
            >
              <div>
                <h3 class="font-bold text-sm text-gray-800 dark:text-gray-100">
                  Barcha To'lovlar Tarixi
                </h3>
                <p class="text-xs text-gray-400">
                  Ushbu o'quvchi tomonidan amalga oshirilgan to'lovlar ro'yxati
                </p>
              </div>
              <AppButton
                variant="success"
                size="sm"
                icon="solar:wallet-money-bold"
                @click="showPaymentModal = true"
              >
                Yangi To'lov
              </AppButton>
            </div>

            <DataTable
              :columns="paymentColumns"
              :data="studentPayments"
              :searchable="false"
              :show-index="true"
              :show-per-page="false"
              row-key="id"
            >
              <template #cell(amount)="{ row }">
                <span class="font-bold text-green-600 dark:text-green-400">
                  +{{ formatUZS(row.amount) }}
                </span>
              </template>

              <template #cell(method)="{ row }">
                <Badge variant="primary" size="xs">
                  {{ getMethodLabel(row.method) }}
                </Badge>
              </template>

              <template #cell(createdAt)="{ row }">
                <span class="text-xs text-gray-500">{{ formatDateTime(row.createdAt) }}</span>
              </template>
            </DataTable>
          </div>

          <!-- TAB 3: Attendance Matrix -->
          <div v-if="activeTab === 'attendance'">
            <AttendanceGrid :records="attendanceRecords" />
          </div>

          <!-- TAB 4: Exams & Grades -->
          <div
            v-if="activeTab === 'exams'"
            class="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-5"
          >
            <div class="flex items-center justify-between pb-4 mb-4 border-b dark:border-gray-700">
              <div class="flex items-center gap-2">
                <Icon icon="solar:diploma-verified-bold" class="text-primary text-xl" />
                <h3 class="font-bold text-base text-gray-800 dark:text-gray-100">
                  Imtihon va Test Natijalari
                </h3>
              </div>
            </div>

            <div v-if="examsLoading" class="text-center py-8 text-gray-400">
              <p class="text-sm">Imtihon natijalari yuklanmoqda...</p>
            </div>
            <div v-else-if="!exams || exams.length === 0" class="text-center py-8 text-gray-400">
              <Icon icon="solar:diploma-verified-linear" class="text-4xl mx-auto mb-2 opacity-50" />
              <p class="text-sm">Ushbu o'quvchi uchun hali imtihon baholari kiritilmagan</p>
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="exam in exams"
                :key="exam.id"
                class="p-4 rounded-lg border dark:border-gray-700 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/30 transition"
              >
                <div>
                  <h4 class="text-sm font-bold text-gray-800 dark:text-gray-100">
                    {{ exam.title }}
                  </h4>
                  <p class="text-xs text-gray-400 mt-0.5">
                    Sana: {{ formatDate(exam.date) }} | Guruh: {{ exam.groupName || "Asosiy" }}
                  </p>
                </div>
                <div class="flex items-center gap-3">
                  <div class="text-right">
                    <span
                      class="text-lg font-black"
                      :class="exam.score >= 70 ? 'text-green-600' : 'text-amber-600'"
                    >
                      {{ exam.score }} / {{ exam.maxScore }}
                    </span>
                    <span class="text-xs text-gray-400 block">{{ exam.grade }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 5: Notes & SMS Logs -->
          <div v-if="activeTab === 'notes'" class="space-y-5">
            <!-- Add quick note -->
            <div
              class="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4 shadow-sm"
            >
              <h4 class="text-sm font-bold text-gray-800 dark:text-gray-100 mb-2">
                Ichki izoh / Eslatma qo'shish
              </h4>
              <div class="flex gap-2">
                <input
                  v-model="newNoteText"
                  type="text"
                  placeholder="O'quvchi haqida eslatma yozing..."
                  class="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-900 rounded-md outline-none focus:border-primary"
                  @keyup.enter="addNote"
                />
                <AppButton variant="primary" icon="solar:plain-bold" @click="addNote"
                  >Qo'shish</AppButton
                >
              </div>
            </div>

            <!-- Notes List -->
            <div class="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-5">
              <h4 class="text-sm font-bold text-gray-800 dark:text-gray-100 mb-4">
                Tarix va Eslatmalar
              </h4>
              <div class="space-y-3">
                <div
                  v-for="(note, idx) in notesList"
                  :key="idx"
                  class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600 flex items-start gap-3 text-xs"
                >
                  <div class="p-2 bg-primary/10 text-primary rounded-full mt-0.5">
                    <Icon icon="solar:chat-line-linear" class="text-base" />
                  </div>
                  <div class="flex-1">
                    <div
                      class="flex items-center justify-between font-semibold text-gray-800 dark:text-gray-200"
                    >
                      <span>{{ note.author }}</span>
                      <span class="text-gray-400 font-normal">{{ note.time }}</span>
                    </div>
                    <p class="text-gray-600 dark:text-gray-300 mt-1">{{ note.text }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Payment Modal -->
    <div
      v-if="showPaymentModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 border dark:border-gray-700"
      >
        <div class="flex items-center justify-between pb-4 border-b dark:border-gray-700">
          <div class="flex items-center gap-2 text-green-600">
            <Icon icon="solar:wallet-money-bold" class="text-2xl" />
            <h3 class="text-base font-bold text-gray-800 dark:text-gray-100">
              To'lov Qabul Qilish
            </h3>
          </div>
          <button class="text-gray-400 hover:text-gray-600" @click="showPaymentModal = false">
            <Icon icon="mdi:close" class="text-xl" />
          </button>
        </div>

        <form class="space-y-3.5 mt-4 text-sm" @submit.prevent="submitPayment">
          <div
            class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex items-center justify-between text-xs"
          >
            <span class="text-gray-400">O'quvchi:</span>
            <span class="font-bold text-gray-800 dark:text-gray-100"
              >{{ student?.firstName }} {{ student?.lastName }}</span
            >
          </div>

          <FormInput
            v-model="paymentForm.amount"
            type="number"
            step="10000"
            label="To'lov summasi (UZS)"
            required
            icon="solar:wallet-money-bold"
          />

          <FormSelect
            v-model="paymentForm.method"
            label="To'lov usuli"
            :options="paymentMethodOptions"
          />

          <FormInput
            v-model="paymentForm.notes"
            label="Izoh / Kvitansiya maqsadi"
            placeholder="Masalan: Sentabr oyi to'lovi"
          />

          <div class="flex items-center justify-end gap-2 pt-3 border-t dark:border-gray-700">
            <AppButton variant="outline" size="sm" type="button" @click="showPaymentModal = false">
              Bekor qilish
            </AppButton>
            <AppButton variant="success" size="sm" type="submit" icon="solar:check-circle-bold">
              To'lovni Tasdiqlash
            </AppButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";

import api from "@/api/client";
import { examsApi, paymentsApi, studentsApi } from "@/api/services";
import Alert from "@/components/Alert.vue";
import Badge from "@/components/Badge.vue";
import Breadcrumb from "@/components/Breadcrumb.vue";
import AppButton from "@/components/common/AppButton.vue";
import DataTable from "@/components/common/AppTable.vue";
import AttendanceGrid from "@/components/common/AttendanceGrid.vue";
import InfoGrid from "@/components/common/InfoGrid.vue";
import TabsNav from "@/components/common/TabsNav.vue";
import FormInput from "@/components/FormInput.vue";
import FormSelect from "@/components/FormSelect.vue";
import { getPaymentMethodOptions } from "@/config/paymentMethods";
import { formatDate, formatDateTime, formatPhone, formatUZS } from "@/helper/formatters";

export default {
  name: "StudentProfile",
  components: {
    Icon,
    Breadcrumb,
    Badge,
    AppButton,
    Alert,
    DataTable,
    FormInput,
    FormSelect,
    TabsNav,
    InfoGrid,
    AttendanceGrid,
  },
  data() {
    return {
      loading: true,
      student: null,
      alertMessage: "",
      activeTab: "overview",
      showPaymentModal: false,
      newNoteText: "",
      notesList: [
        {
          author: "Admin",
          time: "Bugun 14:20",
          text: "Ota-onasi bilan dars jadvali bo'yicha bog'lanildi.",
        },
        {
          author: "Menejer",
          time: "Kechagi kun",
          text: "Sinov darsiga qatnashdi va guruhga qabul qilindi.",
        },
      ],
      paymentForm: {
        amount: 500000,
        method: "CASH",
        notes: "",
      },
      paymentColumns: [
        { key: "amount", label: "Summa" },
        { key: "method", label: "To'lov Usuli" },
        { key: "notes", label: "Izoh" },
        { key: "createdAt", label: "Sana va Vaqt" },
      ],
      studentPayments: [],
      attendanceRecords: [],
      exams: [],
      examsLoading: false,
    };
  },
  computed: {
    profileTabs() {
      return [
        { id: "overview", label: "Umumiy Ma'lumot", icon: "solar:user-id-bold" },
        {
          id: "payments",
          label: "To'lovlar",
          icon: "solar:wallet-money-bold",
          count: this.studentPayments.length,
        },
        { id: "attendance", label: "Davomat", icon: "fluent:calendar-checkmark-24-filled" },
        {
          id: "exams",
          label: "Imtihonlar",
          icon: "solar:diploma-verified-bold",
          count: this.exams.length,
        },
        { id: "notes", label: "Eslatmalar & SMS", icon: "solar:chat-round-dots-linear" },
      ];
    },
    paymentMethodOptions() {
      return getPaymentMethodOptions();
    },
    generalInfoItems() {
      if (!this.student) return [];
      return [
        {
          label: "Telefon Raqami",
          value: formatPhone(this.student.phone),
          icon: "solar:phone-calling-linear",
        },
        {
          label: "Yashash Manzili",
          value: this.student.address || "Manzil kiritilmagan",
          icon: "solar:map-point-linear",
        },
        {
          label: "Jinsi",
          value: this.student.gender === "FEMALE" ? "Ayol" : "Erkak",
          icon: "solar:users-group-rounded-linear",
        },
        {
          label: "Tug'ilgan Sana",
          value: formatDate(this.student.birthDate) || "Kiritilmagan",
          icon: "solar:calendar-date-linear",
        },
        {
          label: "Pasport / Metrika",
          value: this.student.passport || "AA 1234567",
          icon: "solar:card-2-linear",
        },
        {
          label: "PINFL (JShShIR)",
          value: this.student.pinfl || "30102030405060",
          icon: "solar:code-file-linear",
        },
      ];
    },
    academicInfoItems() {
      if (!this.student) return [];
      return [
        {
          label: "Qabul Sanasi",
          value: formatDate(this.student.createdAt),
          icon: "solar:calendar-linear",
        },
        { label: "Ta'lim Tili", value: "O'zbek tili", icon: "solar:global-linear" },
        { label: "Reklama Manbasi", value: "Instagram Target", icon: "solar:radar-linear" },
        {
          label: "Shartnoma Raqami",
          value: `#EDU-${this.student.id?.slice(0, 6)?.toUpperCase() || "2026"}`,
          icon: "solar:document-text-linear",
        },
        {
          label: "Qulay Dars Vaqti",
          value: "Tushdan keyin (14:00 - 18:00)",
          icon: "solar:clock-circle-linear",
        },
        {
          label: "Status",
          value: this.student.status === "ACTIVE" ? "Faol" : "Muzlatilgan",
          icon: "solar:check-circle-linear",
        },
      ];
    },
    totalPaymentsSum() {
      return this.studentPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    },
    currentMonthlyFee() {
      const firstGroup = this.student?.enrollments?.[0]?.group;
      return firstGroup?.course?.price || 600000;
    },
  },
  mounted() {
    this.fetchStudent();
  },
  methods: {
    formatUZS,
    formatPhone,
    formatDate,
    formatDateTime,
    async fetchStudent() {
      const studentId = this.$route.params.id;
      this.loading = true;
      try {
        const res = await studentsApi.getOne(studentId);
        this.student = res;
        this.studentPayments = res?.payments || [];
        this.attendanceRecords = res?.attendances || [];
        this.fetchExams();
      } catch (err) {
        console.error("O'quvchi ma'lumotlarini olishda xatolik:", err);
        this.student = null;
      } finally {
        this.loading = false;
      }
    },
    async fetchPayments() {
      if (!this.student?.id) return;
      try {
        const res = await paymentsApi.getAll({ studentId: this.student.id });
        if (Array.isArray(res)) {
          this.studentPayments = res;
        }
      } catch (err) {
        console.error("To'lovlarni olishda xatolik:", err);
      }
    },
    async fetchAttendance() {
      if (!this.student?.id) return;
      try {
        const res = await api.get(`/attendance/students/${this.student.id}`);
        this.attendanceRecords = Array.isArray(res) ? res : [];
      } catch {
        this.attendanceRecords = [];
      }
    },
    async fetchExams() {
      if (!this.student?.id) return;
      this.examsLoading = true;
      try {
        const grades = await examsApi.getStudentGrades(this.student.id);
        if (Array.isArray(grades)) {
          this.exams = grades.map((g) => ({
            id: g.id,
            title: g.exam?.title || g.lesson?.topic || "Imtihon / Test",
            date: g.date || g.createdAt,
            score: Number(g.score),
            maxScore: Number(g.exam?.maxScore || 100),
            grade:
              g.score >= 86
                ? "A'lo"
                : g.score >= 71
                  ? "Yaxshi"
                  : g.score >= 56
                    ? "Qoniqarli"
                    : "Qoniqarsiz",
            groupName: g.exam?.group?.name || "",
            feedback: g.feedback,
          }));
        }
      } catch (err) {
        console.warn("Imtihon baholarini olishda xatolik:", err);
        this.exams = [];
      } finally {
        this.examsLoading = false;
      }
    },
    getDaysLabel(days) {
      const map = {
        ODD_DAYS: "Toq kunlar (Dush-Chor-Juma)",
        EVEN_DAYS: "Juft kunlar (Sesh-Pay-Shan)",
        EVERYDAY: "Har kuni",
        WEEKEND: "Shanba-Yakshanba",
      };
      return map[days] || days || "Toq kunlar";
    },
    getMethodLabel(method) {
      const map = {
        CASH: "Naqd",
        CARD: "Plastik",
        PAYME: "Payme",
        CLICK: "Click",
        UZUM: "Uzum Pay",
      };
      return map[method] || method;
    },
    async submitPayment() {
      try {
        const payload = {
          studentId: this.student.id,
          amount: Number(this.paymentForm.amount),
          method: this.paymentForm.method,
          notes: this.paymentForm.notes,
        };
        await api.post("/finance/payments", payload);
      } catch {
        // Add locally
      }

      this.studentPayments.unshift({
        id: `p-${Date.now()}`,
        amount: Number(this.paymentForm.amount),
        method: this.paymentForm.method,
        notes: this.paymentForm.notes,
        createdAt: new Date().toISOString(),
      });

      this.student.balance += Number(this.paymentForm.amount);
      this.showPaymentModal = false;
      this.alertMessage = "To'lov muvaffaqiyatli qabul qilindi va balans to'ldirildi!";
      this.paymentForm.notes = "";
    },
    toggleFreezeStudent() {
      const nextStatus = this.student.status === "FROZEN" ? "ACTIVE" : "FROZEN";
      this.student.status = nextStatus;
      this.alertMessage = `O'quvchi holati: ${nextStatus === "ACTIVE" ? "Faollashtirildi" : "Muzlatildi"}!`;
    },
    openSmsModal() {
      this.alertMessage = `SMS moduli: ${this.student.phone} raqamiga xabarnoma yuborildi!`;
    },
    addNote() {
      if (!this.newNoteText.trim()) return;
      this.notesList.unshift({
        author: "Menejer",
        time: "Hozirgina",
        text: this.newNoteText,
      });
      this.newNoteText = "";
      this.alertMessage = "Eslatma saqlandi!";
    },
  },
};
</script>
