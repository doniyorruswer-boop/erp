<template>
  <div class="subscriptions-page p-4 font-lexend space-y-5">
    <!-- Breadcrumb -->
    <Breadcrumb :items="[{ title: 'Tariflar & Obuna' }]" />

    <!-- Header Section -->
    <div class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-200">EduHub Tarif Rejalari & Obuna (SaaS)</h1>
        <p class="text-sm text-gray-400 mt-0.5">
          O'quv markazingiz yoki maktabingiz uchun faol obuna holati, limitlar va qulay tariflar
        </p>
      </div>
      <div class="flex items-center gap-2.5">
        <button
          type="button"
          @click="fetchData"
          class="border flex items-center text-sm gap-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-700 rounded-md py-2 px-4 font-medium shadow-sm transition cursor-pointer"
        >
          <Icon icon="solar:restart-bold" class="text-base" />
          <span>Yangilash</span>
        </button>
      </div>
    </div>

    <!-- Alert Message -->
    <Alert v-if="alertMessage" :message="alertMessage" :type="alertType" @close="alertMessage = ''" />

    <!-- Active Subscription Status Banner (Windzo Card Style) -->
    <div class="card bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-5 shadow-sm space-y-4">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary rounded-md text-xs font-bold uppercase tracking-wider mb-2">
            <Icon icon="solar:star-fall-bold" class="text-sm" />
            <span>Faol Reja</span>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ currentSubscription?.plan?.name || "Professional Plan" }}
          </h2>
          <div class="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1 flex-wrap">
            <span class="flex items-center gap-1">
              <span>Status:</span>
              <Badge variant="success" :dot="true" size="sm">
                {{ currentSubscription?.status || "Faol (ACTIVE)" }}
              </Badge>
            </span>
            <span class="text-gray-300 dark:text-gray-600">•</span>
            <span>
              Amal qilish muddati:
              <strong class="text-gray-700 dark:text-gray-200">
                {{ currentSubscription?.endDate ? formatDate(currentSubscription.endDate) : "Cheksiz (Umrbod)" }}
              </strong>
            </span>
          </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div class="bg-gray-50 dark:bg-gray-700/50 p-3.5 rounded-md border dark:border-gray-700 text-center">
            <p class="text-[11px] text-gray-400 font-semibold uppercase">O'quvchilar Limiti</p>
            <p class="text-lg font-bold text-gray-800 dark:text-white mt-1">
              {{ currentSubscription?.studentLimit || "1,000" }} ta
            </p>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700/50 p-3.5 rounded-md border dark:border-gray-700 text-center">
            <p class="text-[11px] text-gray-400 font-semibold uppercase">Filiallar</p>
            <p class="text-lg font-bold text-gray-800 dark:text-white mt-1">
              {{ currentSubscription?.branchLimit || "5" }} ta
            </p>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700/50 p-3.5 rounded-md border dark:border-gray-700 text-center col-span-2 sm:col-span-1">
            <p class="text-[11px] text-gray-400 font-semibold uppercase">SMS Balans</p>
            <p class="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {{ currentSubscription?.smsBalance || "5,000" }} dona
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Pricing Plans Grid -->
    <div>
      <div class="mb-4">
        <h3 class="text-lg font-bold text-gray-800 dark:text-gray-200">Mavjud Tarif Rejalari</h3>
        <p class="text-xs text-gray-400">O'quv markazingiz ko'lami bo'yicha mos tarifni tanlang</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div
          v-for="plan in defaultPlans"
          :key="plan.id"
          :class="[
            'card bg-white dark:bg-gray-800 rounded-lg border p-5 transition flex flex-col justify-between space-y-5',
            plan.isPopular
              ? 'border-primary ring-2 ring-primary/20 shadow-md'
              : 'dark:border-gray-700 hover:shadow-sm'
          ]"
        >
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <h4 class="text-lg font-bold text-gray-800 dark:text-white">{{ plan.name }}</h4>
              <Badge v-if="plan.isPopular" variant="primary" size="xs">Tavsiya etiladi</Badge>
            </div>

            <p class="text-xs text-gray-500 dark:text-gray-400 min-h-[32px]">{{ plan.description }}</p>

            <div class="py-2 border-y dark:border-gray-700/70">
              <span class="text-3xl font-black text-gray-900 dark:text-white">{{ formatMoney(plan.price) }}</span>
              <span class="text-xs text-gray-400 ml-1">so'm / oyiga</span>
            </div>

            <!-- Features List -->
            <ul class="space-y-2 text-xs text-gray-600 dark:text-gray-300">
              <li v-for="(feat, idx) in plan.features" :key="idx" class="flex items-center gap-2">
                <Icon icon="solar:check-circle-bold" class="text-emerald-500 text-sm shrink-0" />
                <span>{{ feat }}</span>
              </li>
            </ul>
          </div>

          <div class="pt-2">
            <button
              type="button"
              :disabled="subscribing || isCurrentPlan(plan)"
              @click="subscribeToPlan(plan)"
              :class="[
                'w-full py-2.5 px-4 rounded-md text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5',
                isCurrentPlan(plan)
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                  : plan.isPopular
                  ? 'bg-primary hover:bg-primary/90 text-white shadow-sm'
                  : 'bg-gray-800 hover:bg-gray-900 text-white dark:bg-gray-700 dark:hover:bg-gray-600'
              ]"
            >
              <Icon v-if="subscribing && selectedPlanId === plan.id" icon="eos-icons:loading" class="animate-spin text-sm" />
              <span>{{ isCurrentPlan(plan) ? 'Joriy Tarif' : 'Ushbu Tarifga O\'tish' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";
import Breadcrumb from "@/components/Breadcrumb.vue";
import Badge from "@/components/Badge.vue";
import Alert from "@/components/Alert.vue";
import { subscriptionsApi } from "@/api/services";

export default {
  name: "SubscriptionsView",
  components: {
    Icon,
    Breadcrumb,
    Badge,
    Alert,
  },
  data() {
    return {
      currentSubscription: null,
      plans: [],
      loading: false,
      subscribing: false,
      selectedPlanId: null,
      alertMessage: "",
      alertType: "success",
      defaultPlans: [
        {
          id: "STARTER",
          name: "Boshlang'ich (Starter)",
          price: 350000,
          description: "Kichik o'quv markazlari va individual repetitorlar uchun",
          features: [
            "200 tagacha faol o'quvchi",
            "1 ta filial boshqaruvi",
            "Davomat va dars jadvallari",
            "Boshlang'ich moliya va kassa",
            "SMS xabarnomalar integratsiyasi",
          ],
        },
        {
          id: "PRO",
          name: "Professional (Pro)",
          price: 750000,
          isPopular: true,
          description: "Rivojlanayotgan ta'lim markazlari va til maktablari uchun",
          features: [
            "1,000 tagacha faol o'quvchi",
            "3 tagacha filial boshqaruvi",
            "CRM Lidlar va Kanban voronkasi",
            "Xodimlar va Oylik maosh (HR)",
            "O'quv shartnomalari va cheklar",
            "Payme / Click to'lovlari",
          ],
        },
        {
          id: "ENTERPRISE",
          name: "Maktab & Katta Tarmoq",
          price: 1500000,
          description: "Xususiy maktablar, bog'chalar va ko'p tarmoqli akademiyalar uchun",
          features: [
            "Cheksiz o'quvchilar soni",
            "Cheksiz filiallar tarmog'i",
            "Maxsus xavfsizlik va RBAC rollari",
            "Xavfsizlik audit jurnali",
            "Shaxsiy menejer va 24/7 yordam",
            "Export va Import (Excel/CSV)",
          ],
        },
      ],
    };
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      this.loading = true;
      try {
        const [curRes, plansRes] = await Promise.allSettled([
          subscriptionsApi.getCurrent(),
          subscriptionsApi.getPlans(),
        ]);
        if (curRes.status === "fulfilled" && curRes.value) {
          this.currentSubscription = curRes.value;
        }
        if (plansRes.status === "fulfilled" && Array.isArray(plansRes.value) && plansRes.value.length > 0) {
          this.plans = plansRes.value;
        }
      } catch (err) {
        console.warn("Obuna ma'lumotlarini yuklashda xatolik:", err);
      } finally {
        this.loading = false;
      }
    },
    isCurrentPlan(plan) {
      if (!this.currentSubscription) return plan.id === "PRO";
      return this.currentSubscription.plan?.name === plan.name || this.currentSubscription.planId === plan.id;
    },
    async subscribeToPlan(plan) {
      if (!confirm(`${plan.name} tarifiga o'tishni tasdiqlaysizmi?`)) return;
      this.subscribing = true;
      this.selectedPlanId = plan.id;
      try {
        await subscriptionsApi.subscribe({ planId: plan.id, periodMonths: 1 });
        this.alertType = "success";
        this.alertMessage = `${plan.name} tarifiga muvaffaqiyatli obuna bo'lindi!`;
        await this.fetchData();
      } catch (err) {
        this.alertType = "danger";
        this.alertMessage = "Obuna bo'lishda xatolik: " + (err.response?.data?.message || err.message);
      } finally {
        this.subscribing = false;
        this.selectedPlanId = null;
      }
    },
    formatMoney(val) {
      if (!val) return "0";
      return Number(val).toLocaleString("uz-UZ");
    },
    formatDate(dateStr) {
      if (!dateStr) return "-";
      return new Date(dateStr).toLocaleDateString("uz-UZ");
    },
  },
};
</script>
