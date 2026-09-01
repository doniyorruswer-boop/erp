<template>
  <div class="setup-wizard-page min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-lexend p-4 sm:p-6 lg:p-10 flex flex-col justify-between">
    <!-- Top Header Brand (Clean, centered, no return link) -->
    <div class="max-w-4xl mx-auto w-full flex items-center justify-between pb-5 border-b dark:border-gray-800">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xl shadow-sm transition-colors">
          E
        </div>
        <div>
          <h1 class="text-xl font-bold text-gray-800 dark:text-gray-100">
            Edu<span class="text-primary transition-colors">CRM</span> Dastlabki Sozlash
          </h1>
          <p class="text-xs text-gray-400">Muassasa yo'nalishi va parametrlarini belgilash ustasi</p>
        </div>
      </div>

      <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-md border dark:border-gray-700 hidden sm:block">
        Universal Platforma v1.0.1
      </div>
    </div>

    <!-- Main Wizard Card -->
    <div class="max-w-4xl mx-auto w-full my-6 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 shadow-sm flex flex-col min-h-[580px]">
      <!-- Step Indicator Bar -->
      <div class="p-4 sm:px-6 border-b dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800/80">
        <div class="grid grid-cols-5 gap-2 sm:gap-3">
          <button
            v-for="(st, idx) in steps"
            :key="st.id"
            type="button"
            @click="goToStep(idx + 1)"
            class="flex items-center gap-2.5 p-2.5 rounded-lg text-left text-xs sm:text-sm transition cursor-pointer"
            :class="[
              currentStep === idx + 1
                ? 'bg-primary/10 text-primary font-bold border border-primary/30'
                : currentStep > idx + 1
                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-medium'
                : 'text-gray-400 opacity-70'
            ]"
          >
            <div
              class="w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 font-bold"
              :class="[
                currentStep === idx + 1
                  ? 'bg-primary text-white shadow-sm'
                  : currentStep > idx + 1
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
              ]"
            >
              <Icon v-if="currentStep > idx + 1" icon="solar:check-read-linear" class="text-sm" />
              <span v-else>{{ idx + 1 }}</span>
            </div>
            <span class="truncate hidden md:inline">{{ st.title }}</span>
          </button>
        </div>
      </div>

      <!-- Step Body Content Area -->
      <div class="p-6 sm:p-8 flex-1 space-y-6">
        <!-- STEP 1: BUSINESS TYPE -->
        <div v-if="currentStep === 1" class="space-y-5">
          <div>
            <h2 class="text-xl font-bold text-gray-800 dark:text-gray-100">1. Muassasa turini tanlang</h2>
            <p class="text-sm text-gray-400 mt-1">Tizim menyulari va funksiyalari tanlangan yo'nalishga qarab avtomatik moslashadi</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <!-- 1. Course Center -->
            <div
              @click="selectBusinessType('COURSE_CENTER')"
              class="p-5 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between space-y-4 hover:shadow-sm"
              :class="[
                form.businessType === 'COURSE_CENTER'
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              ]"
            >
              <div class="space-y-3">
                <div class="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-2xl">
                  <Icon icon="ph:student-fill" />
                </div>
                <h3 class="font-bold text-base text-gray-800 dark:text-gray-100">O'quv Markazi / IT Akademiya</h3>
                <p class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Til markazlari, o'quv kurslari, IT maktablar va abituriyent tayyorlov markazlari uchun.
                </p>
              </div>
              <div class="text-xs font-bold flex items-center justify-between pt-3 border-t dark:border-gray-700">
                <span>{{ form.businessType === 'COURSE_CENTER' ? 'Tanlandi' : 'Tanlash' }}</span>
                <Icon :icon="form.businessType === 'COURSE_CENTER' ? 'solar:check-circle-bold' : 'solar:circle-linear'" class="text-xl" />
              </div>
            </div>

            <!-- 2. Private School -->
            <div
              @click="selectBusinessType('SCHOOL')"
              class="p-5 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between space-y-4 hover:shadow-sm"
              :class="[
                form.businessType === 'SCHOOL'
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              ]"
            >
              <div class="space-y-3">
                <div class="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl">
                  <Icon icon="solar:buildings-3-bold" />
                </div>
                <h3 class="font-bold text-base text-gray-800 dark:text-gray-100">Xususiy Maktab / Litsey</h3>
                <p class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  1–11 sinflar, fanlar, shartnomalar, jurnal, oshxona va transport xizmatlari.
                </p>
              </div>
              <div class="text-xs font-bold flex items-center justify-between pt-3 border-t dark:border-gray-700">
                <span>{{ form.businessType === 'SCHOOL' ? 'Tanlandi' : 'Tanlash' }}</span>
                <Icon :icon="form.businessType === 'SCHOOL' ? 'solar:check-circle-bold' : 'solar:circle-linear'" class="text-xl" />
              </div>
            </div>

            <!-- 3. Kindergarten -->
            <div
              @click="selectBusinessType('KINDERGARTEN')"
              class="p-5 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between space-y-4 hover:shadow-sm"
              :class="[
                form.businessType === 'KINDERGARTEN'
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              ]"
            >
              <div class="space-y-3">
                <div class="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl">
                  <Icon icon="solar:smile-circle-bold" />
                </div>
                <h3 class="font-bold text-base text-gray-800 dark:text-gray-100">Xususiy Bog'cha</h3>
                <p class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Kichik yosh guruhlari, ovqatlanish nazorati, oylik to'lov va ota-onalar xabarnomalari.
                </p>
              </div>
              <div class="text-xs font-bold flex items-center justify-between pt-3 border-t dark:border-gray-700">
                <span>{{ form.businessType === 'KINDERGARTEN' ? 'Tanlandi' : 'Tanlash' }}</span>
                <Icon :icon="form.businessType === 'KINDERGARTEN' ? 'solar:check-circle-bold' : 'solar:circle-linear'" class="text-xl" />
              </div>
            </div>
          </div>
        </div>

        <!-- STEP 2: PROFILE & GLOBAL BRAND COLOR -->
        <div v-if="currentStep === 2" class="space-y-5 max-w-2xl">
          <div>
            <h2 class="text-xl font-bold text-gray-800 dark:text-gray-100">2. Tashkilot ma'lumotlari & Brend rangi</h2>
            <p class="text-sm text-gray-400 mt-1">Muassasa nomi va butun tizimning asosiy rangini tanlang</p>
          </div>

          <div class="space-y-4 pt-2 text-sm">
            <div>
              <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Muassasa nomi *</label>
              <input
                v-model="form.organizationName"
                type="text"
                placeholder="Masalan: 'Registon Academy' yoki 'Profi School'"
                class="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-900 rounded-lg outline-none focus:border-primary transition"
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Aloqa telefoni</label>
                <input
                  v-model="form.phone"
                  type="text"
                  placeholder="+998 90 123 45 67"
                  class="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-900 rounded-lg outline-none focus:border-primary transition"
                />
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Asosiy Valyuta</label>
                <select
                  v-model="form.currency"
                  class="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-900 rounded-lg outline-none focus:border-primary transition"
                >
                  <option value="UZS">UZS (O'zbekiston so'mi)</option>
                  <option value="USD">USD (AQSH Dollari)</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Manzil</label>
              <input
                v-model="form.address"
                type="text"
                placeholder="Toshkent shahri, Yunusobod tumani"
                class="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-900 rounded-lg outline-none focus:border-primary transition"
              />
            </div>

            <!-- Global Dynamic Color Palette Selector -->
            <div class="pt-2">
              <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                Asosiy mavzu rangi (Butun tizimda bir zumda o'zgaradi)
              </label>
              <div class="flex items-center gap-3.5">
                <button
                  v-for="color in colorPresets"
                  :key="color.hex"
                  type="button"
                  @click="applyColor(color.hex)"
                  class="w-11 h-11 rounded-xl flex items-center justify-center transition-transform hover:scale-105 shadow-sm border-2 cursor-pointer"
                  :class="form.primaryColor === color.hex ? 'border-gray-900 dark:border-white ring-2 ring-offset-2 ring-primary' : 'border-transparent'"
                  :style="{ backgroundColor: color.hex }"
                  :title="color.name"
                >
                  <Icon v-if="form.primaryColor === color.hex" icon="solar:check-read-bold" class="text-white text-base drop-shadow" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- STEP 3: MODULES -->
        <div v-if="currentStep === 3" class="space-y-5">
          <div>
            <h2 class="text-xl font-bold text-gray-800 dark:text-gray-100">3. Kerakli modullarni yoqish</h2>
            <p class="text-sm text-gray-400 mt-1">Faqat muassasangizga kerakli modullarni belgilang (boshqalari interfeysda yashiriladi)</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div
              v-for="mod in availableModules"
              :key="mod.id"
              @click="toggleModule(mod.id)"
              class="p-4 rounded-xl border cursor-pointer transition flex items-center justify-between gap-3 select-none hover:shadow-xs"
              :class="[
                form.enabledModules.includes(mod.id)
                  ? 'bg-primary/5 border-primary/40'
                  : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 opacity-60'
              ]"
            >
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xl shrink-0 transition-colors">
                  <Icon :icon="mod.icon" />
                </div>
                <div class="truncate">
                  <h4 class="text-sm font-bold text-gray-800 dark:text-gray-200">{{ mod.name }}</h4>
                  <p class="text-xs text-gray-400 truncate">{{ mod.desc }}</p>
                </div>
              </div>

              <input
                type="checkbox"
                :checked="form.enabledModules.includes(mod.id)"
                class="w-5 h-5 rounded text-primary focus:ring-primary cursor-pointer shrink-0"
              />
            </div>
          </div>
        </div>

        <!-- STEP 4: INTEGRATIONS -->
        <div v-if="currentStep === 4" class="space-y-5 max-w-2xl">
          <div>
            <h2 class="text-xl font-bold text-gray-800 dark:text-gray-100">4. SMS va To'lov integratsiyalari</h2>
            <p class="text-sm text-gray-400 mt-1">Ushbu maydonlarni to'ldirish ixtiyoriy, keyinroq ham kiritish mumkin</p>
          </div>

          <div class="space-y-4 pt-1 text-sm">
            <div class="p-4 bg-gray-50 dark:bg-gray-700/40 rounded-xl border dark:border-gray-600 space-y-3">
              <div class="flex items-center gap-2.5 text-sm font-bold text-gray-800 dark:text-gray-200">
                <Icon icon="solar:chat-round-dots-bold" class="text-xl text-primary" />
                <span>Eskiz.uz SMS Provayder</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  v-model="form.integrations.eskizEmail"
                  type="text"
                  placeholder="Eskiz email / login"
                  class="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-900 rounded-lg outline-none focus:border-primary"
                />
                <input
                  v-model="form.integrations.eskizToken"
                  type="password"
                  placeholder="Eskiz API Token"
                  class="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-900 rounded-lg outline-none focus:border-primary"
                />
              </div>
            </div>

            <div class="p-4 bg-gray-50 dark:bg-gray-700/40 rounded-xl border dark:border-gray-600 space-y-3">
              <div class="flex items-center gap-2.5 text-sm font-bold text-gray-800 dark:text-gray-200">
                <Icon icon="solar:card-bold" class="text-xl text-green-600" />
                <span>Payme / Click Savdo hisobi</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  v-model="form.integrations.paymeMerchantId"
                  type="text"
                  placeholder="Payme Merchant ID"
                  class="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-900 rounded-lg outline-none focus:border-primary"
                />
                <input
                  v-model="form.integrations.clickServiceId"
                  type="text"
                  placeholder="Click Service ID"
                  class="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-900 rounded-lg outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- STEP 5: ADMIN & FINISH -->
        <div v-if="currentStep === 5" class="space-y-5 max-w-2xl">
          <div>
            <h2 class="text-xl font-bold text-gray-800 dark:text-gray-100">5. Bosh Administrator (SuperAdmin)</h2>
            <p class="text-sm text-gray-400 mt-1">Tizimga kirish uchun bosh administrator hisobini tasdiqlang</p>
          </div>

          <div class="space-y-4 pt-1 text-sm">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Ism *</label>
                <input
                  v-model="form.adminFirstName"
                  type="text"
                  placeholder="Sanjar"
                  class="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-900 rounded-lg outline-none focus:border-primary"
                />
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Familiya *</label>
                <input
                  v-model="form.adminLastName"
                  type="text"
                  placeholder="Karimov"
                  class="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-900 rounded-lg outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Telefon raqam (Login) *</label>
              <input
                v-model="form.adminPhone"
                type="text"
                placeholder="+998901234567"
                class="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-900 rounded-lg outline-none focus:border-primary"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Parol *</label>
              <input
                v-model="form.adminPassword"
                type="password"
                placeholder="Kamida 6 ta belgi"
                class="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-900 rounded-lg outline-none focus:border-primary"
              />
            </div>

            <label class="flex items-center gap-3 pt-2 cursor-pointer select-none">
              <input
                type="checkbox"
                v-model="form.seedDemoData"
                class="w-4 h-4 rounded text-primary focus:ring-primary"
              />
              <span class="text-xs font-medium text-gray-700 dark:text-gray-300">
                Boshlang'ich namunaviy guruhlar, sinflar va kurslarni avtomatik qo'shish
              </span>
            </label>
          </div>
        </div>
      </div>

      <!-- Footer Buttons (Larger & Spacious) -->
      <div class="p-5 sm:px-8 border-t dark:border-gray-700 flex items-center justify-between bg-gray-50/60 dark:bg-gray-800/60">
        <button
          v-if="currentStep > 1"
          type="button"
          @click="prevStep"
          class="px-6 py-2.5 text-sm font-semibold bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition flex items-center gap-2 cursor-pointer"
        >
          <Icon icon="solar:arrow-left-linear" class="text-base" />
          <span>Orqaga</span>
        </button>
        <div v-else></div>

        <button
          v-if="currentStep < totalSteps"
          type="button"
          @click="nextStep"
          class="px-7 py-2.5 text-sm font-bold bg-primary hover:bg-primary/90 text-white rounded-lg transition shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <span>Keyingisi</span>
          <Icon icon="solar:arrow-right-linear" class="text-base" />
        </button>

        <button
          v-else
          type="button"
          @click="submitSetup"
          :disabled="submitting"
          class="px-8 py-3 text-sm font-bold bg-primary hover:bg-primary/90 text-white rounded-lg transition shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Icon v-if="submitting" icon="eos-icons:loading" class="animate-spin text-base" />
          <Icon v-else icon="solar:check-circle-bold" class="text-base" />
          <span>{{ submitting ? "Saqlanmoqda..." : "Tizimni Ishga Tushirish" }}</span>
        </button>
      </div>
    </div>

    <!-- Footer Copyright -->
    <div class="max-w-4xl mx-auto w-full text-center text-xs text-gray-400 pt-3">
      EduCRM &copy; 2026. Barcha huquqlar himoyalangan.
    </div>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";
import { useTenantStore } from "@/store/tenant";
import { setPrimaryColor, loadPrimaryColor } from "@/helper/theme";

export default {
  name: "SetupWizard",
  components: { Icon },
  data() {
    return {
      currentStep: 1,
      totalSteps: 5,
      submitting: false,
      steps: [
        { id: 1, title: "Muassasa Turi" },
        { id: 2, title: "Tashkilot Profili" },
        { id: 3, title: "Modullar" },
        { id: 4, title: "Integratsiyalar" },
        { id: 5, title: "Administrator" },
      ],
      colorPresets: [
        { name: "Klassik Indigo (Asl rang)", hex: "#4F46E5" },
        { name: "Moviy Ko'k", hex: "#2563eb" },
        { name: "Zumrad Yashil", hex: "#059669" },
        { name: "Binafsha", hex: "#7c3aed" },
        { name: "Qizil", hex: "#e11d48" },
        { name: "Oltin / Qahrabo", hex: "#d97706" },
      ],
      availableModules: [
        { id: "LEADS", name: "Sotuv Voronkasi (Kanban)", desc: "Murojaatlar va qabul jarayoni", icon: "solar:tuning-square-2-bold" },
        { id: "STUDENTS", name: "O'quvchilar Boshqaruvi", desc: "O'quvchilar bazasi va profillari", icon: "ph:student-fill" },
        { id: "COURSES", name: "Kurslar & Guruhlar / Sinflar", desc: "O'quv reja va guruhlar", icon: "solar:book-bookmark-bold" },
        { id: "ATTENDANCE", name: "Davomat Tizimi", desc: "Kunlik va oylik davomat", icon: "fluent:calendar-checkmark-24-filled" },
        { id: "FINANCE", name: "Moliya & Kassa", desc: "To'lovlar va kassa hisoboti", icon: "solar:wallet-money-bold" },
        { id: "CONTRACTS", name: "Shartnomalar Moduli", desc: "O'quv shartnomalari va grafiklar", icon: "solar:document-text-bold" },
        { id: "SERVICES", name: "Oshxona & Transport", desc: "Qo'shimcha maktab xizmatlari", icon: "solar:bus-bold" },
        { id: "SMS", name: "SMS Xabarnomalar", desc: "Eskiz.uz orqali SMS jo'natish", icon: "solar:chat-round-dots-bold" },
      ],
      form: {
        businessType: "COURSE_CENTER",
        organizationName: "EduCRM Markazi",
        phone: "+998901234567",
        address: "Toshkent shahri",
        currency: "UZS",
        primaryColor: "#4F46E5",
        enabledModules: [
          "LEADS",
          "STUDENTS",
          "GROUPS",
          "COURSES",
          "ATTENDANCE",
          "FINANCE",
          "SMS",
          "PAYMENTS",
          "CONTRACTS",
        ],
        integrations: {
          eskizEmail: "",
          eskizToken: "",
          paymeMerchantId: "",
          clickServiceId: "",
        },
        adminFirstName: "Bosh",
        adminLastName: "Administrator",
        adminPhone: "+998901234567",
        adminEmail: "admin@educrm.uz",
        adminPassword: "admin123",
        seedDemoData: true,
      },
    };
  },
  mounted() {
    const activeColor = loadPrimaryColor();
    if (activeColor) {
      this.form.primaryColor = activeColor;
    }
  },
  methods: {
    goToStep(stepNum) {
      this.currentStep = stepNum;
    },
    selectBusinessType(type) {
      this.form.businessType = type;
      const tenantStore = useTenantStore();
      tenantStore.setBusinessType(type);
    },
    applyColor(hex) {
      this.form.primaryColor = hex;
      setPrimaryColor(hex);
    },
    toggleModule(id) {
      const idx = this.form.enabledModules.indexOf(id);
      if (idx > -1) {
        this.form.enabledModules.splice(idx, 1);
      } else {
        this.form.enabledModules.push(id);
      }
    },
    nextStep() {
      if (this.currentStep === 2 && !this.form.organizationName.trim()) {
        alert("Iltimos, muassasa nomini kiriting!");
        return;
      }
      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
      }
    },
    prevStep() {
      if (this.currentStep > 1) {
        this.currentStep--;
      }
    },
    async submitSetup() {
      if (!this.form.adminFirstName || !this.form.adminPhone || !this.form.adminPassword) {
        alert("Iltimos, administrator ma'lumotlarini to'liq to'ldiring!");
        return;
      }

      this.submitting = true;
      const tenantStore = useTenantStore();
      try {
        await tenantStore.completeSetup(this.form);
        setPrimaryColor(this.form.primaryColor);
        alert("EduCRM muvaffaqiyatli sozlandi!");
        this.$router.push("/");
      } catch (err) {
        alert(err.message || "O'rnatishda xatolik yuz berdi");
      } finally {
        this.submitting = false;
      }
    },
  },
};
</script>
