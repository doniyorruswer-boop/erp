<template>
  <div class="subscriptions-page p-4 font-lexend space-y-5">
    <!-- Breadcrumb -->
    <Breadcrumb :items="[{ title: 'Tariflar & Obuna' }]" />

    <!-- Header Section -->
    <div class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-200">EduHub Tarif Rejalari & Obuna (SaaS)</h1>
        <p class="text-sm text-gray-400 mt-0.5">
          O'quv markazingiz yoki maktabingiz uchun faol obuna holati, limitlar va qulay tariflar.
        </p>
      </div>
      <div class="flex items-center gap-2.5">
        <button
          @click="fetchData"
          class="inline-flex items-center px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-650 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-xl transition cursor-pointer"
        >
          <Icon icon="solar:restart-bold" class="w-4 h-4 mr-1.5" />
          Yangilash
        </button>
      </div>
    </div>

    <!-- Active Subscription Status Banner -->
    <div class="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-3xl p-6 relative overflow-hidden">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 bg-primary text-white rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <Icon icon="solar:star-fall-bold" class="w-4 h-4" />
            Faol Reja
          </div>
          <h2 class="text-3xl font-black text-gray-900 dark:text-white">
            {{ currentSubscription?.plan?.name || "Professional Plan" }}
          </h2>
          <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">
            Status: <span class="text-emerald-600 font-bold uppercase">{{ currentSubscription?.status || "ACTIVE" }}</span>
            | Muddat: <span class="font-medium">{{ currentSubscription?.endDate ? formatDate(currentSubscription.endDate) : "Cheksiz (Umrbod)" }}</span>
          </p>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur p-4 rounded-2xl border border-gray-100 dark:border-gray-700 text-center">
            <p class="text-xs text-gray-400 font-semibold">O'quvchilar Limiti</p>
            <p class="text-xl font-bold text-gray-800 dark:text-white mt-1">1,000 / 2,500</p>
          </div>
          <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur p-4 rounded-2xl border border-gray-100 dark:border-gray-700 text-center">
            <p class="text-xs text-gray-400 font-semibold">Filiallar</p>
            <p class="text-xl font-bold text-gray-800 dark:text-white mt-1">3 / 5 ta</p>
          </div>
          <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur p-4 rounded-2xl border border-gray-100 dark:border-gray-700 text-center col-span-2 sm:col-span-1">
            <p class="text-xs text-gray-400 font-semibold">SMS Balans</p>
            <p class="text-xl font-bold text-emerald-600 mt-1">5,000 dona</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Pricing Plans Grid -->
    <div>
      <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Mavjud Tarif Rejalari</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          v-for="plan in plans"
          :key="plan.id"
          class="bg-white dark:bg-gray-800 rounded-3xl p-6 border transition-all duration-200 flex flex-col justify-between"
          :class="plan.isPopular ? 'border-primary ring-2 ring-primary/20 shadow-lg relative' : 'border-gray-100 dark:border-gray-700 shadow-sm'"
        >
          <div v-if="plan.isPopular" class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-primary text-white text-2xs font-bold uppercase rounded-full tracking-wider">
            Eng Ommabop
          </div>

          <div>
            <h4 class="text-xl font-bold text-gray-900 dark:text-white">{{ plan.name }}</h4>
            <p class="text-xs text-gray-400 mt-1">{{ plan.description }}</p>

            <div class="mt-6 mb-6">
              <span class="text-3xl font-black text-gray-900 dark:text-white">{{ formatMoney(plan.price) }}</span>
              <span class="text-xs text-gray-400 ml-1">so'm / oyiga</span>
            </div>

            <ul class="space-y-3 text-xs text-gray-600 dark:text-gray-300">
              <li v-for="(feat, idx) in plan.features" :key="idx" class="flex items-center gap-2">
                <Icon icon="solar:check-circle-bold" class="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{{ feat }}</span>
              </li>
            </ul>
          </div>

          <div class="mt-8 pt-6 border-t dark:border-gray-700">
            <button
              @click="selectPlan(plan)"
              :disabled="subscribing"
              class="w-full py-2.5 rounded-xl text-sm font-semibold transition text-center"
              :class="plan.isPopular ? 'bg-primary text-white hover:bg-primary-dark shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-650'"
            >
              {{ plan.current ? "Joriy Rejangiz" : "Rejani Tanlash" }}
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
import { subscriptionsApi } from "@/api/services";

export default {
  name: "SubscriptionsView",
  components: { Icon, Breadcrumb },
  data() {
    return {
      currentSubscription: null,
      loading: true,
      subscribing: false,
      plans: [
        {
          id: "starter",
          name: "Starter",
          price: 350000,
          description: "Kichik kurslar va yangi ochilgan markazlar uchun",
          features: [
            "200 tagacha o'quvchi",
            "1 ta filial boshqaruvi",
            "O'quvchilar va Davomat nazorati",
            "Moliya va Kassa hisobi",
            "500 ta bepul SMS",
          ],
        },
        {
          id: "pro",
          name: "Professional",
          price: 790000,
          isPopular: true,
          current: true,
          description: "Rivojlanayotgan o'quv markazlari va akademiyalar uchun",
          features: [
            "1,000 tagacha o'quvchi",
            "3 ta filial boshqaruvi",
            "Avtomatlashtirilgan SMS va Telegram xabarnomalar",
            "CRM Lidlar va Voronka (Kanban)",
            "Xodimlar va Oylik maosh (HR)",
            "2,000 ta bepul SMS",
          ],
        },
        {
          id: "enterprise",
          name: "Enterprise & Maktab",
          price: 1800000,
          description: "Xususiy maktablar va tarmoqli yirik o'quv markazlari uchun",
          features: [
            "Cheksiz o'quvchilar soni",
            "Cheksiz filiallar",
            "To'liq Maktab sinflari, dars jadvali va baholar",
            "Shaxsiy SMS Sender ID & Telegram bot",
            "24/7 Shaxsiy menejer qo'llab-quvvatlashi",
            "Maxsus integratsiyalar va API",
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
        const res = await subscriptionsApi.getCurrent();
        if (res && res.plan) {
          this.currentSubscription = res;
        }
      } catch (err) {
        console.warn("Could not fetch active subscription:", err);
      } finally {
        this.loading = false;
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
    async selectPlan(plan) {
      if (confirm(`"${plan.name}" tarifiga obuna bo'lishni xohlaysizmi?`)) {
        this.subscribing = true;
        try {
          await subscriptionsApi.subscribe({ planId: plan.id });
          this.$toast.success("Obuna muvaffaqiyatli tanlandi!");
          await this.fetchData();
        } catch (err) {
          this.$toast.error(err.response?.data?.message || "Obunani yangilashda xatolik yuz berdi");
        } finally {
          this.subscribing = false;
        }
      }
    },
  },
};
</script>
