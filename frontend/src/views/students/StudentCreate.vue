<template>
  <div class="student-create-page p-4 font-lexend space-y-5">
    <!-- Breadcrumb & Header -->
    <div class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <Breadcrumb :items="[{ title: 'O\'quvchilar', to: '/students' }, { title: 'O\'quvchini qo\'shish' }]" />
        <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">O'quvchini qo'shish</h1>
      </div>

      <div class="flex items-center gap-2.5">
        <router-link
          to="/students"
          class="px-4 py-2 text-xs font-semibold bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md transition"
        >
          Bekor qilish
        </router-link>
        <button
          type="button"
          @click="submitStudentForm"
          :disabled="saving"
          class="px-6 py-2 text-xs font-semibold bg-primary hover:bg-primary/90 text-white rounded-md shadow-sm transition flex items-center gap-1.5 cursor-pointer"
        >
          <Icon v-if="saving" icon="eos-icons:loading" class="animate-spin text-base" />
          <Icon v-else icon="solar:diskette-bold" class="text-base" />
          <span>{{ saving ? 'Saqlanmoqda...' : 'Saqlash' }}</span>
        </button>
      </div>
    </div>

    <!-- Alert Toast -->
    <Alert v-if="alertMessage" :message="alertMessage" :type="alertType" @close="alertMessage = ''" />

    <!-- Form Container Card -->
    <form @submit.prevent="submitStudentForm" class="space-y-6">
      <!-- SECTION 1: Asosiy Ma'lumotlar -->
      <div class="card bg-white dark:bg-gray-800 p-5 rounded-lg border dark:border-gray-700 shadow-sm space-y-4">
        <!-- Row 1: Passport, Enrolled Date, Group -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <FormInput
            v-model="form.pinfl"
            label="PINFL (JSHSHIR) / Metrika"
            placeholder="14 xonali raqam yoki Metrika"
            icon="solar:card-2-linear"
          />
          <FormInput
            v-model="form.contractNumber"
            label="Shartnoma raqami"
            placeholder="SH-2026-001"
            icon="solar:document-text-linear"
          />
          <FormDatePicker
            v-model="form.enrolledDate"
            label="Qabul qilingan sana"
            placeholder="Sanani tanlang"
          />
          <FormSelect
            v-model="form.groupId"
            label="Guruh"
            placeholder="Guruhni tanlang"
            :options="groupOptions"
          />
        </div>

        <!-- Row 2: Familiya, Ism, Jinsi, Tug'ilgan kuni -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <FormInput
            v-model="form.lastName"
            label="Familiya"
            required
            placeholder="Aliyev"
            :error="formErrors.lastName"
            @input="clearFieldError('lastName')"
          />
          <FormInput
            v-model="form.firstName"
            label="Ism"
            required
            placeholder="Sardor"
            :error="formErrors.firstName"
            @input="clearFieldError('firstName')"
          />
          <FormSelect
            v-model="form.gender"
            label="Jinsi"
            :options="[
              { value: 'MALE', label: 'Erkak' },
              { value: 'FEMALE', label: 'Ayol' },
            ]"
          />
          <FormDatePicker
            v-model="form.birthDate"
            label="Tug'ilgan kuni"
            placeholder="01-01-2000"
          />
        </div>

        <!-- Row 3: Foto, Mobil raqam, Email, Status -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
          <!-- Photo Upload Dropzone -->
          <div>
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              O'quvchi fotosi
            </label>
            <div
              @click="triggerPhotoUpload"
              class="border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary rounded-md p-3 text-center cursor-pointer transition bg-gray-50/50 dark:bg-gray-900/40 flex flex-col items-center justify-center min-h-[88px]"
            >
              <input type="file" ref="photoInput" @change="onPhotoSelected" class="hidden" accept="image/*" />
              <img v-if="photoPreview" :src="photoPreview" class="w-12 h-12 rounded-full object-cover mb-1 border border-primary" />
              <Icon v-else icon="solar:upload-track-2-linear" class="text-xl text-gray-400 mb-1" />
              <span class="text-[11px] text-gray-400">Faylni bu yerga olib tashlang yoki bosing</span>
            </div>
          </div>

          <FormInput
            v-model="form.phone"
            label="Mobil raqam"
            required
            placeholder="+998 (90) 123-45-67"
            icon="solar:phone-calling-linear"
            :error="formErrors.phone"
            @input="onPhoneInput('phone')"
          />
          <FormInput
            v-model="form.email"
            label="Email"
            placeholder="user@example.com"
            icon="solar:letter-linear"
            :error="formErrors.email"
            @input="clearFieldError('email')"
          />
          <FormSelect
            v-model="form.status"
            label="O'quvchi statusi"
            required
            :options="[
              { value: 'ACTIVE', label: 'O\'qimoqda (Faol)' },
              { value: 'CONTACT', label: 'Aloqa' },
              { value: 'DEBTOR', label: 'Qarzdor' },
              { value: 'TRIAL', label: 'Sinov darsida' },
              { value: 'FROZEN', label: 'Muzlatilgan' },
              { value: 'GRADUATED', label: 'Bitirgan' },
            ]"
          />
        </div>
      </div>

      <!-- SECTION 2: Qo'shimcha Ma'lumotlar -->
      <div class="card bg-white dark:bg-gray-800 p-5 rounded-lg border dark:border-gray-700 shadow-sm space-y-4">
        <h3 class="font-bold text-sm text-gray-800 dark:text-gray-100 pb-2 border-b dark:border-gray-700">
          Qo'shimcha ma'lumotlar
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- O'qish tili -->
          <div>
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">O'qish tili</label>
            <div class="space-y-1.5 text-xs">
              <label v-for="lang in ['O\'zbekcha', 'Ruscha', 'Inglizcha', 'Tojikcha', 'Qozoqcha']" :key="lang" class="flex items-center gap-2 text-gray-700 dark:text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  :value="lang"
                  v-model="form.studyLanguages"
                  class="rounded text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer"
                />
                <span>{{ lang }}</span>
              </label>
            </div>
          </div>

          <!-- Kurs va Daraja -->
          <div class="space-y-3">
            <FormSelect
              v-model="form.courseId"
              label="Kurs"
              placeholder="Tanlash"
              :options="courseOptions"
            />
            <FormSelect
              v-model="form.level"
              label="Daraja"
              placeholder="Tanlash"
              :options="[
                { value: 'BEGINNER', label: 'Boshlang\'ich (Beginner)' },
                { value: 'ELEMENTARY', label: 'Elementary' },
                { value: 'INTERMEDIATE', label: 'Intermediate' },
                { value: 'ADVANCED', label: 'Advanced' },
              ]"
            />
            <FormTimePicker
              v-model="form.contactTime"
              label="Qulay bog'lanish / dars vaqti"
              placeholder="Masalan: 14:00 - 18:00"
            />
          </div>

          <!-- Dars kunlari -->
          <div>
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Dars kunlari</label>
            <div class="space-y-1 text-xs">
              <label v-for="day in ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya']" :key="day" class="flex items-center gap-2 text-gray-700 dark:text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  :value="day"
                  v-model="form.studyDays"
                  class="rounded text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer"
                />
                <span>{{ day }}</span>
              </label>
            </div>
          </div>

          <!-- Korxona, Manba, Izoh -->
          <div class="space-y-3">
            <FormInput
              v-model="form.workplace"
              label="O'quvchi ishlaydigan / o'qiydigan korxona"
              placeholder="Maktab yoki korxona nomi"
            />
            <FormSelect
              v-model="form.source"
              label="Biz haqimizda qayerdan bildingiz?"
              placeholder="Tanlash"
              :options="[
                { value: 'Instagram', label: 'Instagram Target' },
                { value: 'Telegram', label: 'Telegram' },
                { value: 'Sayt', label: 'Veb-sayt' },
                { value: 'Tavsiya', label: 'Do\'stlar tavsiyasi' },
                { value: 'Banner', label: 'Banner' },
              ]"
            />
            <div>
              <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Izoh</label>
              <textarea
                v-model="form.notes"
                rows="2"
                placeholder="Qo'shimcha izohlar..."
                class="w-full text-xs rounded-md border border-gray-300 dark:border-gray-700 p-2.5 outline-none focus:border-primary dark:bg-gray-900 text-gray-800 dark:text-gray-100"
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- SECTION 3: Sinov Darsi Bo'yicha Ma'lumotlar -->
      <div class="card bg-white dark:bg-gray-800 p-5 rounded-lg border dark:border-gray-700 shadow-sm space-y-4">
        <h3 class="font-bold text-sm text-gray-800 dark:text-gray-100 pb-2 border-b dark:border-gray-700">
          Sinov darsi bo'yicha ma'lumotlar
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormSelect
            v-model="form.teacherId"
            label="Mas'ul o'qituvchi"
            placeholder="O'qituvchini tanlang"
            :options="teacherOptions"
          />
          <FormDatePicker
            v-model="form.trialInvitedDate"
            label="Sinov darsiga chaqirildi"
            placeholder="Sanani tanlang"
          />
          <FormDatePicker
            v-model="form.trialAttendedDate"
            label="Sinov darsiga keldi"
            placeholder="Sanani tanlang"
          />
        </div>
      </div>

      <!-- SECTION 4: Ota-ona Ma'lumotlari -->
      <div class="card bg-white dark:bg-gray-800 p-5 rounded-lg border dark:border-gray-700 shadow-sm space-y-4">
        <h3 class="font-bold text-sm text-gray-800 dark:text-gray-100 pb-2 border-b dark:border-gray-700">
          Ota-ona ma'lumotlari
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormInput
            v-model="form.parentName"
            label="Ota-ona ismi"
            placeholder="Otasining yoki onasining F.I.Sh"
          />
          <FormInput
            v-model="form.parentPhone"
            label="Ota-ona telefoni"
            placeholder="+998 (90) 123-45-67"
            icon="solar:phone-calling-linear"
            :error="formErrors.parentPhone"
            @input="onPhoneInput('parentPhone')"
          />
          <FormInput
            v-model="form.parentEmail"
            label="Ota-ona Emaili"
            type="email"
            placeholder="otaona@gmail.com"
            icon="solar:letter-linear"
            :error="formErrors.parentEmail"
            @input="clearFieldError('parentEmail')"
          />
        </div>
      </div>

      <!-- SECTION 5: O'quvchi Manzili -->
      <div class="card bg-white dark:bg-gray-800 p-5 rounded-lg border dark:border-gray-700 shadow-sm space-y-4">
        <h3 class="font-bold text-sm text-gray-800 dark:text-gray-100 pb-2 border-b dark:border-gray-700">
          O'quvchi manzili
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormSelect
            v-model="form.region"
            label="Viloyat"
            placeholder="Tanlash"
            :options="regionOptions"
          />
          <FormInput
            v-model="form.city"
            label="Shahar/tuman"
            placeholder="Masalan: Yunusobod tumani"
          />
          <div>
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Doimiy manzil</label>
            <textarea
              v-model="form.address"
              rows="2"
              placeholder="Ko'cha, uy, kvartira..."
              class="w-full text-xs rounded-md border border-gray-300 dark:border-gray-700 p-2.5 outline-none focus:border-primary dark:bg-gray-900 text-gray-800 dark:text-gray-100"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Bottom Form Submit Action -->
      <div class="flex items-center justify-end gap-3 pt-2">
        <router-link
          to="/students"
          class="px-5 py-2.5 text-xs font-semibold bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md transition"
        >
          Bekor qilish
        </router-link>
        <button
          type="submit"
          :disabled="saving"
          class="px-8 py-2.5 text-xs font-semibold bg-primary hover:bg-primary/90 text-white rounded-md shadow-sm transition flex items-center gap-2 cursor-pointer"
        >
          <Icon v-if="saving" icon="eos-icons:loading" class="animate-spin text-base" />
          <Icon v-else icon="solar:diskette-bold" class="text-base" />
          <span>{{ saving ? 'Saqlanmoqda...' : 'Saqlash' }}</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";
import Breadcrumb from "@/components/Breadcrumb.vue";
import Alert from "@/components/Alert.vue";
import FormInput from "@/components/FormInput.vue";
import FormSelect from "@/components/FormSelect.vue";
import FormDatePicker from "@/components/FormDatePicker.vue";
import { studentsApi, coursesApi, groupsApi, usersApi } from "@/api/services";
import { validateForm, rules, formatPhone } from "@/utils/validators";

export default {
  name: "StudentCreate",
  components: {
    Icon,
    Breadcrumb,
    Alert,
    FormInput,
    FormSelect,
    FormDatePicker,
  },
  data() {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    return {
      saving: false,
      alertMessage: "",
      alertType: "info",
      photoPreview: null,
      courses: [],
      groups: [],
      teachers: [],
      formErrors: {},
      regionOptions: [
        { value: "Toshkent shahri", label: "Toshkent shahri" },
        { value: "Toshkent viloyati", label: "Toshkent viloyati" },
        { value: "Samarqand", label: "Samarqand viloyati" },
        { value: "Farg'ona", label: "Farg'ona viloyati" },
        { value: "Andijon", label: "Andijon viloyati" },
        { value: "Namangan", label: "Namangan viloyati" },
        { value: "Buxoro", label: "Buxoro viloyati" },
        { value: "Xorazm", label: "Xorazm viloyati" },
        { value: "Qashqadaryo", label: "Qashqadaryo viloyati" },
        { value: "Surxondaryo", label: "Surxondaryo viloyati" },
        { value: "Navoiy", label: "Navoiy viloyati" },
        { value: "Jizzax", label: "Jizzax viloyati" },
        { value: "Sirdaryo", label: "Sirdaryo viloyati" },
        { value: "Qoraqalpog'iston", label: "Qoraqalpog'iston Respublikasi" },
      ],
      form: {
        passportNumber: "",
        enrolledDate: todayStr,
        groupId: "",
        lastName: "",
        firstName: "",
        gender: "MALE",
        birthDate: "2000-01-01",
        photo: null,
        phone: "",
        email: "",
        status: "ACTIVE",
        contractNumber: "",
        pinfl: "",
        studyLanguages: ["O'zbekcha"],
        courseId: "",
        level: "INTERMEDIATE",
        studyDays: ["Du", "Ch", "Ju"],
        contactTime: "",
        workplace: "",
        source: "Instagram",
        notes: "",
        teacherId: "",
        trialInvitedDate: "",
        trialAttendedDate: "",
        parentName: "",
        parentPhone: "",
        parentEmail: "",
        region: "Toshkent shahri",
        city: "",
        address: "",
      },
    };
  },
  computed: {
    courseOptions() {
      return this.courses.map((c) => ({
        value: c.id,
        label: `${c.name || c.title}`,
      }));
    },
    groupOptions() {
      return [
        { value: "", label: "Guruhni tanlang (ixtiyoriy)" },
        ...this.groups.map((g) => ({
          value: g.id,
          label: `${g.name || g.title} (${g.course?.name || 'Kurs'})`,
        })),
      ];
    },
    teacherOptions() {
      return this.teachers.map((t) => ({
        value: t.id,
        label: `${t.firstName} ${t.lastName}`,
      }));
    },
  },
  async mounted() {
    try {
      const [cRes, gRes, tRes] = await Promise.all([
        coursesApi.getAll().catch(() => []),
        groupsApi.getAll().catch(() => []),
        usersApi.getAll({ role: "TEACHER" }).catch(() => []),
      ]);
      this.courses = cRes || [];
      this.groups = gRes || [];
      this.teachers = tRes || [];
      if (this.courses.length > 0) {
        this.form.courseId = this.courses[0].id;
      }
      if (this.teachers.length > 0) {
        this.form.teacherId = this.teachers[0].id;
      }
    } catch (e) {
      console.error(e);
    }
  },
  methods: {
    triggerPhotoUpload() {
      this.$refs.photoInput.click();
    },
    onPhotoSelected(e) {
      const file = e.target.files[0];
      if (file) {
        this.form.photo = file;
        this.photoPreview = URL.createObjectURL(file);
      }
    },
    clearFieldError(field) {
      if (this.formErrors && this.formErrors[field]) {
        delete this.formErrors[field];
      }
    },
    onPhoneInput(field) {
      this.form[field] = formatPhone(this.form[field]);
      this.clearFieldError(field);
    },
    async submitStudentForm() {
      const validation = validateForm(this.form, {
        firstName: [rules.required("Ism"), rules.name("Ism", 2)],
        lastName: [rules.required("Familiya"), rules.name("Familiya", 2)],
        phone: [rules.required("Telefon raqami"), rules.phone("Telefon raqami")],
        email: this.form.email ? [rules.email("Email")] : [],
        parentPhone:
          this.form.parentPhone &&
          this.form.parentPhone.trim() !== "+998" &&
          this.form.parentPhone.trim() !== "+998 "
            ? [rules.phone("Ota-ona telefoni")]
            : [],
        parentEmail: this.form.parentEmail ? [rules.email("Ota-ona emaili")] : [],
      });

      if (!validation.isValid) {
        this.formErrors = validation.errors;
        this.alertType = "danger";
        this.alertMessage = validation.firstError || "Iltimos, maydonlarni to'g'ri to'ldiring!";
        return;
      }
      this.formErrors = {};

      this.saving = true;
      try {
        const payload = {
          firstName: this.form.firstName,
          lastName: this.form.lastName || "—",
          phone: this.form.phone,
          email: this.form.email || undefined,
          passportNumber: this.form.passportNumber || undefined,
          pinfl: this.form.pinfl || undefined,
          gender: this.form.gender || "MALE",
          enrolledDate: this.form.enrolledDate || undefined,
          level: this.form.level || undefined,
          studyDays: this.form.studyDays || [],
          studyLanguages: this.form.studyLanguages || [],
          contactTime: this.form.contactTime || undefined,
          contractNumber: this.form.contractNumber || undefined,
          region: this.form.region || undefined,
          city: this.form.city || undefined,
          address: this.form.address || undefined,
          workplace: this.form.workplace || undefined,
          source: this.form.source || undefined,
          parentName: this.form.parentName || undefined,
          parentPhone: this.form.parentPhone || undefined,
          parentEmail: this.form.parentEmail || undefined,
          notes: this.form.notes || undefined,
          initialGroupId: this.form.groupId || undefined,
        };

        const created = await studentsApi.create(payload);

        // Assign to group if chosen
        if (this.form.groupId && created && created.id) {
          try {
            await groupsApi.addStudent(this.form.groupId, created.id);
          } catch (gErr) {
            console.error("Guruhga biriktirishda xatolik:", gErr);
          }
        }

        this.alertType = "success";
        this.alertMessage = `${this.form.firstName} ${this.form.lastName} bazaga muvaffaqiyatli saqlandi!`;

        setTimeout(() => {
          this.$router.push("/students");
        }, 1200);
      } catch (err) {
        this.alertType = "danger";
        this.alertMessage = err.message || "O'quvchini saqlashda xatolik yuz berdi!";
      } finally {
        this.saving = false;
      }
    },
  },
};
</script>
