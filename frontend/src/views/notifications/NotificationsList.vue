<template>
  <div class="notifications-page p-4 font-lexend">
    <!-- Breadcrumb -->
    <Breadcrumb :items="[{ title: 'Xabarnomalar' }]" />

    <!-- Header Section -->
    <div class="flex items-center justify-between flex-wrap gap-4 mb-5">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-200">Xabarnomalar Markazi</h1>
        <p class="text-sm text-gray-400">SMS, Email, Telegram va Tizim ichki bildirishnomalari</p>
      </div>

      <div class="flex items-center gap-2.5">
        <button
          type="button"
          @click="markAllRead"
          :disabled="unreadCount === 0"
          class="border flex items-center text-sm gap-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-700 rounded py-2.5 px-4 font-medium shadow-sm transition cursor-pointer disabled:opacity-40"
        >
          <Icon icon="solar:check-read-linear" class="text-lg" />
          <span>Barchasini o'qildi qilish</span>
        </button>

        <button
          type="button"
          @click="showSendModal = true"
          class="border flex items-center text-sm gap-2 text-white bg-primary hover:bg-primary/90 dark:border-gray-700 rounded py-2.5 px-4 font-medium shadow-sm transition cursor-pointer"
        >
          <Icon icon="solar:plain-bold" class="text-lg" />
          <span>Xabar Yuborish</span>
        </button>
      </div>
    </div>

    <!-- 4 Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
      <StatsCard title="Jami Xabarlar" :value="`${notifications.length} ta`" icon="solar:bell-bold" variant="primary" />
      <StatsCard title="SMS Xabarnomalar" :value="`${smsCount} ta`" icon="solar:chat-round-dots-bold" variant="success" valueClass="text-green-600 dark:text-green-400" />
      <StatsCard title="Email Xabarlar" :value="`${emailCount} ta`" icon="solar:letter-bold" variant="info" valueClass="text-blue-600 dark:text-blue-400" />
      <StatsCard title="Telegram Xabarlar" :value="`${telegramCount} ta`" icon="solar:plain-bold" variant="purple" valueClass="text-sky-500" />
    </div>

    <!-- Data Table Component -->
    <DataTable
      title="Barcha Xabarnomalar"
      subtitle="Jo'natilgan va qabul qilingan bildirishnomalar ro'yxati"
      :columns="columns"
      :data="filteredNotifications"
      :loading="loading"
      :searchable="true"
      :showIndex="true"
      :showPerPage="true"
      searchPlaceholder="Sarlavha, qabul qiluvchi yoki matn..."
      rowKey="id"
    >
      <!-- Header Actions: Channel Filter -->
      <template #headerActions>
        <select
          v-model="activeTab"
          class="py-1.5 px-3 text-xs border border-gray-300 dark:border-gray-600 dark:bg-gray-900 rounded-md outline-none text-gray-800 dark:text-gray-200"
        >
          <option value="ALL">Barcha kanallar</option>
          <option value="SMS">Faqat SMS</option>
          <option value="EMAIL">Faqat Email</option>
          <option value="TELEGRAM">Faqat Telegram</option>
          <option value="IN_APP">Faqat Tizim ichki</option>
        </select>
      </template>

      <!-- Custom Channel Cell -->
      <template #cell(channel)="{ row }">
        <Badge :variant="getChannelBadgeVariant(row.channel)" size="sm">
          <span class="flex items-center gap-1">
            <Icon :icon="getChannelIcon(row.channel)" class="text-xs" />
            {{ row.channel || "IN_APP" }}
          </span>
        </Badge>
      </template>

      <!-- Custom Title / Body Cell -->
      <template #cell(title)="{ row }">
        <div class="font-semibold text-gray-800 dark:text-gray-100">{{ row.title }}</div>
        <div class="text-xs text-gray-400 mt-0.5 line-clamp-1 max-w-md">{{ row.body || row.message }}</div>
      </template>

      <!-- Custom Recipient Cell -->
      <template #cell(recipient)="{ row }">
        <div class="text-gray-800 dark:text-gray-200 text-xs font-mono">
          <span v-if="row.recipient">{{ row.recipient }}</span>
          <span v-else-if="row.user">{{ row.user.firstName }} {{ row.user.lastName }}</span>
          <span v-else class="text-gray-400">Barcha xodimlar</span>
        </div>
      </template>

      <!-- Custom Created Date Cell -->
      <template #cell(createdAt)="{ row }">
        <span class="text-xs text-gray-500 dark:text-gray-400">
          {{ formatDateTime(row.createdAt) }}
        </span>
      </template>

      <!-- Custom Status Cell -->
      <template #cell(status)="{ row }">
        <Badge
          :variant="row.status === 'FAILED' ? 'danger' : 'success'"
          :dot="true"
          size="sm"
        >
          {{ row.status || 'SENT' }}
        </Badge>
      </template>

      <!-- Actions Slot -->
      <template #actions="{ row }">
        <div class="flex items-center justify-end gap-2">
          <button
            v-if="!row.isRead"
            type="button"
            @click="markRead(row)"
            class="text-xs text-primary hover:underline font-semibold"
          >
            O'qildi
          </button>
          <span v-else class="text-xs text-gray-400">
            O'qilgan
          </span>
        </div>
      </template>
    </DataTable>

    <!-- Send Notification Modal -->
    <div v-if="showSendModal" class="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-gray-800 rounded-md max-w-lg w-full p-6 shadow-xl border dark:border-gray-700 font-lexend">
        <div class="flex items-center justify-between pb-4 border-b dark:border-gray-700">
          <h3 class="text-base font-bold text-gray-800 dark:text-gray-100">
            Yangi Xabarnoma Yuborish
          </h3>
          <button @click="showSendModal = false" class="text-gray-400 hover:text-gray-600">
            <Icon icon="solar:close-circle-bold" class="w-6 h-6" />
          </button>
        </div>

        <form @submit.prevent="sendNotification" class="mt-4 space-y-4">
          <div>
            <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Aloqa Kanali *</label>
            <select
              v-model="sendForm.channel"
              required
              class="w-full py-2 px-3 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-900 rounded-md outline-none text-gray-800 dark:text-gray-200"
            >
              <option value="SMS">SMS (Eskiz.uz)</option>
              <option value="EMAIL">Email (SMTP)</option>
              <option value="TELEGRAM">Telegram Bot</option>
              <option value="IN_APP">Tizim ichki xabarnoma (In-App)</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              {{ sendForm.channel === 'SMS' ? 'Telefon raqam *' : sendForm.channel === 'EMAIL' ? 'Email manzil *' : sendForm.channel === 'TELEGRAM' ? 'Telegram Chat ID *' : 'Qabul qiluvchi' }}
            </label>
            <input
              v-model="sendForm.recipient"
              required
              type="text"
              :placeholder="sendForm.channel === 'SMS' ? '+998901234567' : sendForm.channel === 'EMAIL' ? 'student@gmail.com' : '12345678'"
              class="w-full py-2 px-3 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-900 rounded-md outline-none text-gray-800 dark:text-gray-200"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Sarlavha *</label>
            <input
              v-model="sendForm.title"
              required
              type="text"
              placeholder="Masalan: Dars vaqti o'zgardi"
              class="w-full py-2 px-3 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-900 rounded-md outline-none text-gray-800 dark:text-gray-200"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Xabar Matni *</label>
            <textarea
              v-model="sendForm.body"
              required
              rows="3"
              placeholder="Xabar to'liq matnini kiriting..."
              class="w-full py-2 px-3 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-900 rounded-md outline-none text-gray-800 dark:text-gray-200"
            ></textarea>
          </div>

          <div class="pt-4 border-t dark:border-gray-700 flex justify-end gap-3">
            <button
              type="button"
              @click="showSendModal = false"
              class="border rounded px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              :disabled="sending"
              class="border flex items-center text-sm gap-2 text-white bg-primary hover:bg-primary/90 dark:border-gray-700 rounded py-2 px-4 font-medium shadow-sm transition disabled:opacity-50"
            >
              {{ sending ? "Yuborilmoqda..." : "Yuborish" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";
import Breadcrumb from "@/components/Breadcrumb.vue";
import StatsCard from "@/components/StatsCard.vue";
import DataTable from "@/components/DataTable.vue";
import Badge from "@/components/Badge.vue";
import { notificationsApi } from "@/api/services";

export default {
  name: "NotificationsList",
  components: {
    Icon,
    Breadcrumb,
    StatsCard,
    DataTable,
    Badge,
  },
  data() {
    return {
      notifications: [],
      unreadCount: 0,
      loading: true,
      sending: false,
      showSendModal: false,
      activeTab: "ALL",
      columns: [
        { key: "channel", label: "Kanal", sortable: true },
        { key: "title", label: "Xabar", sortable: true },
        { key: "recipient", label: "Qabul Qiluvchi", sortable: false },
        { key: "createdAt", label: "Sana & Vaqt", sortable: true },
        { key: "status", label: "Holat", sortable: true },
      ],
      sendForm: {
        channel: "SMS",
        recipient: "",
        title: "",
        body: "",
      },
    };
  },
  computed: {
    smsCount() {
      return this.notifications.filter((n) => n.channel === "SMS").length;
    },
    emailCount() {
      return this.notifications.filter((n) => n.channel === "EMAIL").length;
    },
    telegramCount() {
      return this.notifications.filter((n) => n.channel === "TELEGRAM").length;
    },
    filteredNotifications() {
      if (this.activeTab === "ALL") return this.notifications;
      return this.notifications.filter((n) => (n.channel || "IN_APP") === this.activeTab);
    },
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      this.loading = true;
      try {
        const [listRes, countRes] = await Promise.allSettled([
          notificationsApi.getAll(),
          notificationsApi.getUnreadCount(),
        ]);
        if (listRes.status === "fulfilled") {
          this.notifications = Array.isArray(listRes.value)
            ? listRes.value
            : (listRes.value?.items || []);
        }
        if (countRes.status === "fulfilled") {
          this.unreadCount = countRes.value?.count || 0;
        }
      } catch (err) {
        console.error("Error loading notifications:", err);
      } finally {
        this.loading = false;
      }
    },
    getChannelBadgeVariant(channel) {
      const map = {
        SMS: "success",
        EMAIL: "primary",
        TELEGRAM: "purple",
        IN_APP: "warning",
      };
      return map[channel] || "primary";
    },
    getChannelIcon(channel) {
      const map = {
        SMS: "solar:chat-round-dots-bold",
        EMAIL: "solar:letter-bold",
        TELEGRAM: "solar:plain-bold",
        IN_APP: "solar:bell-bold",
      };
      return map[channel] || "solar:bell-bold";
    },
    formatDateTime(d) {
      if (!d) return "-";
      return new Date(d).toLocaleString("uz-UZ", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    async markRead(item) {
      try {
        await notificationsApi.markAsRead(item.id);
        item.isRead = true;
        if (this.unreadCount > 0) this.unreadCount--;
        this.$toast.success("Xabar o'qildi deb belgilandi");
      } catch (e) {
        console.error("Error marking read:", e);
      }
    },
    async markAllRead() {
      try {
        await notificationsApi.markAllAsRead();
        this.notifications.forEach((n) => (n.isRead = true));
        this.unreadCount = 0;
        this.$toast.success("Barcha xabarlar o'qildi deb belgilandi");
      } catch (e) {
        this.$toast.error("Xatolik yuz berdi");
      }
    },
    async sendNotification() {
      this.sending = true;
      try {
        await notificationsApi.send(this.sendForm);
        this.$toast.success("Xabarnoma muvaffaqiyatli yuborildi!");
        this.showSendModal = false;
        this.sendForm = { channel: "SMS", recipient: "", title: "", body: "" };
        await this.fetchData();
      } catch (err) {
        this.$toast.error(err.response?.data?.message || err.message || "Xabarnoma yuborishda xatolik");
      } finally {
        this.sending = false;
      }
    },
  },
};
</script>
