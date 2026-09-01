<template>
  <div class="crm-settings-page p-4 sm:p-6 space-y-6 font-lexend">
    <!-- Breadcrumb & Top Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <Breadcrumb :items="breadcrumbItems" />
        <h1 class="text-2xl sm:text-3xl font-extrabold text-gray-800 dark:text-gray-100 flex items-center gap-2.5 mt-1">
          <span class="p-2 rounded-xl bg-primary/10 text-primary">
            <Icon icon="solar:settings-bold" class="text-2xl" />
          </span>
          <span>CRM Sozlamalari</span>
        </h1>
      </div>

      <!-- Action button for active tab -->
      <div class="flex items-center gap-2">
        <button
          v-if="activeTab === 'telephony'"
          type="button"
          @click="openEditTelephonyModal"
          class="border flex items-center text-sm gap-2 text-white bg-primary hover:bg-primary/90 rounded py-2.5 px-4 font-medium shadow-sm transition cursor-pointer"
        >
          <Icon icon="solar:pen-linear" class="text-lg" />
          <span>Tahrirlash</span>
        </button>

        <button
          v-else-if="activeTab === 'permissions'"
          type="button"
          @click="syncPermissions"
          class="border flex items-center text-sm gap-2 text-white bg-primary hover:bg-primary/90 rounded py-2.5 px-4 font-medium shadow-sm transition cursor-pointer"
        >
          <Icon icon="solar:refresh-linear" class="text-lg" />
          <span>Sinxronlash</span>
        </button>

        <button
          v-else-if="actionButtonText"
          type="button"
          @click="openAddModalForActiveTab"
          class="border flex items-center text-sm gap-2 text-white bg-primary hover:bg-primary/90 rounded py-2.5 px-4 font-medium shadow-sm transition cursor-pointer"
        >
          <Icon icon="solar:add-circle-bold" class="text-lg" />
          <span>{{ actionButtonText }}</span>
        </button>
      </div>
    </div>

    <!-- Alert Message -->
    <Alert v-if="alertMessage" :message="alertMessage" @close="alertMessage = ''" />

    <!-- 8 Tabs Header Bar -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-2 shadow-xs overflow-x-auto">
      <div class="flex items-center gap-1.5 min-w-max">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          @click="activeTab = tab.id"
          :class="[
            'flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer',
            activeTab === tab.id
              ? 'bg-primary text-white shadow-xs'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60'
          ]"
        >
          <Icon :icon="tab.icon" class="text-base shrink-0" />
          <span>{{ tab.label }}</span>
          <span
            v-if="tab.count !== undefined"
            :class="[
              'px-2 py-0.5 rounded-full text-[11px] font-extrabold',
              activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            ]"
          >
            {{ tab.count }}
          </span>
        </button>
      </div>
    </div>

    <!-- TAB 1: MIJOZ DARAJASI -->
    <div v-if="activeTab === 'tiers'" class="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs sm:text-sm">
          <thead class="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 uppercase text-[11px] font-bold border-b dark:border-gray-700">
            <tr>
              <th class="p-3.5 pl-6 w-16">#</th>
              <th class="p-3.5">DARAJALAR</th>
              <th class="p-3.5">YARATILGAN VAQT</th>
              <th class="p-3.5 pr-6 text-right w-48">AMALLAR</th>
            </tr>
          </thead>
          <tbody class="divide-y dark:divide-gray-700">
            <tr
              v-for="(item, idx) in settings.clientTiers"
              :key="item.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition"
            >
              <td class="p-3.5 pl-6 font-bold text-gray-400">{{ idx + 1 }}</td>
              <td class="p-3.5">
                <span
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold"
                  :class="item.badgeClass || 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300'"
                >
                  <span v-if="item.emoji">{{ item.emoji }}</span>
                  <span>{{ item.name }}</span>
                </span>
              </td>
              <td class="p-3.5 text-gray-500 dark:text-gray-400 text-xs">{{ item.createdAt }}</td>
              <td class="p-3.5 pr-6 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    @click="openEditTierModal(item)"
                    class="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold flex items-center gap-1 cursor-pointer transition shadow-2xs"
                  >
                    <Icon icon="solar:pen-linear" class="text-sm" />
                    <span>Tahrirlash</span>
                  </button>
                  <button
                    type="button"
                    @click="deleteTier(item.id)"
                    class="px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 text-xs font-semibold flex items-center gap-1 cursor-pointer transition shadow-2xs"
                  >
                    <Icon icon="solar:trash-bin-trash-linear" class="text-sm" />
                    <span>O'chirish</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- TAB 2: TAGLAR -->
    <div v-if="activeTab === 'tags'" class="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs sm:text-sm">
          <thead class="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 uppercase text-[11px] font-bold border-b dark:border-gray-700">
            <tr>
              <th class="p-3.5 pl-6 w-16">#</th>
              <th class="p-3.5">TAGLAR</th>
              <th class="p-3.5">YARATILGAN VAQT</th>
              <th class="p-3.5 pr-6 text-right w-48">AMALLAR</th>
            </tr>
          </thead>
          <tbody class="divide-y dark:divide-gray-700">
            <tr
              v-for="(item, idx) in settings.tags"
              :key="item.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition"
            >
              <td class="p-3.5 pl-6 font-bold text-gray-400">{{ idx + 1 }}</td>
              <td class="p-3.5">
                <span
                  class="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold"
                  :class="item.badgeClass || 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300'"
                >
                  # {{ item.name }}
                </span>
              </td>
              <td class="p-3.5 text-gray-500 dark:text-gray-400 text-xs">{{ item.createdAt }}</td>
              <td class="p-3.5 pr-6 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    @click="openEditTagModal(item)"
                    class="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold flex items-center gap-1 cursor-pointer transition shadow-2xs"
                  >
                    <Icon icon="solar:pen-linear" class="text-sm" />
                    <span>Tahrirlash</span>
                  </button>
                  <button
                    type="button"
                    @click="deleteTag(item.id)"
                    class="px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 text-xs font-semibold flex items-center gap-1 cursor-pointer transition shadow-2xs"
                  >
                    <Icon icon="solar:trash-bin-trash-linear" class="text-sm" />
                    <span>O'chirish</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- TAB 3: MANBALAR -->
    <div v-if="activeTab === 'sources'" class="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs sm:text-sm">
          <thead class="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 uppercase text-[11px] font-bold border-b dark:border-gray-700">
            <tr>
              <th class="p-3.5 pl-6 w-16">#</th>
              <th class="p-3.5">MANBALAR</th>
              <th class="p-3.5 text-center">RASM</th>
              <th class="p-3.5">KOD</th>
              <th class="p-3.5 text-center">TARGET UCHUN LINK</th>
              <th class="p-3.5">YARATILGAN VAQT</th>
              <th class="p-3.5 pr-6 text-right w-48">AMALLAR</th>
            </tr>
          </thead>
          <tbody class="divide-y dark:divide-gray-700">
            <tr
              v-for="(item, idx) in settings.sources"
              :key="item.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition"
            >
              <td class="p-3.5 pl-6 font-bold text-gray-400">{{ idx + 1 }}</td>
              <td class="p-3.5 font-bold text-gray-800 dark:text-gray-100">{{ item.name }}</td>
              <td class="p-3.5 text-center">
                <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-lg" :class="item.iconColor">
                  <Icon :icon="item.icon" />
                </span>
              </td>
              <td class="p-3.5 font-mono text-xs">
                <code class="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                  {{ item.code }}
                </code>
              </td>
              <td class="p-3.5 text-center">
                <button
                  type="button"
                  @click="copyTargetLink(item.code)"
                  class="p-1.5 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 cursor-pointer transition shadow-2xs"
                  title="Havolani nusxalash"
                >
                  <Icon icon="solar:copy-linear" class="text-base" />
                </button>
              </td>
              <td class="p-3.5 text-gray-500 dark:text-gray-400 text-xs">{{ item.createdAt }}</td>
              <td class="p-3.5 pr-6 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    @click="openEditSourceModal(item)"
                    class="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold flex items-center gap-1 cursor-pointer transition shadow-2xs"
                  >
                    <Icon icon="solar:pen-linear" class="text-sm" />
                    <span>Tahrirlash</span>
                  </button>
                  <button
                    type="button"
                    @click="deleteSource(item.id)"
                    class="px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 text-xs font-semibold flex items-center gap-1 cursor-pointer transition shadow-2xs"
                  >
                    <Icon icon="solar:trash-bin-trash-linear" class="text-sm" />
                    <span>O'chirish</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- TAB 4: VORONKALAR -->
    <div v-if="activeTab === 'pipelines'" class="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs sm:text-sm">
          <thead class="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 uppercase text-[11px] font-bold border-b dark:border-gray-700">
            <tr>
              <th class="p-3.5 pl-6 w-16">#</th>
              <th class="p-3.5">VORONKALAR</th>
              <th class="p-3.5">YARATILGAN VAQT</th>
              <th class="p-3.5 text-center">STANDART VORONKA</th>
              <th class="p-3.5 pr-6 text-right w-48">AMALLAR</th>
            </tr>
          </thead>
          <tbody class="divide-y dark:divide-gray-700">
            <tr
              v-for="(item, idx) in settings.pipelines"
              :key="item.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition"
            >
              <td class="p-3.5 pl-6 font-bold text-gray-400">{{ idx + 1 }}</td>
              <td class="p-3.5 font-bold text-gray-800 dark:text-gray-100">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-primary" />
                  <span>{{ item.name }}</span>
                </div>
              </td>
              <td class="p-3.5 text-gray-500 dark:text-gray-400 text-xs">{{ item.createdAt }}</td>
              <td class="p-3.5 text-center">
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    :checked="item.isDefault"
                    @change="setDefaultPipeline(item.id)"
                    class="sr-only peer"
                  />
                  <div
                    class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"
                  ></div>
                </label>
              </td>
              <td class="p-3.5 pr-6 text-right">
                <router-link
                  to="/leads"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold transition shadow-2xs"
                >
                  <Icon icon="solar:settings-minimalistic-linear" class="text-sm text-primary" />
                  <span>Sozlash</span>
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- TAB 5: YO'QOTILGAN LID SABABLARI -->
    <div v-if="activeTab === 'lostReasons'" class="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs sm:text-sm">
          <thead class="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 uppercase text-[11px] font-bold border-b dark:border-gray-700">
            <tr>
              <th class="p-3.5 pl-6 w-16">#</th>
              <th class="p-3.5">YO'QOTILGAN LID SABABLARI</th>
              <th class="p-3.5 pr-6 text-right w-48">AMALLAR</th>
            </tr>
          </thead>
          <tbody class="divide-y dark:divide-gray-700">
            <tr
              v-for="(item, idx) in settings.lostReasons"
              :key="item.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition"
            >
              <td class="p-3.5 pl-6 font-bold text-gray-400">{{ idx + 1 }}</td>
              <td class="p-3.5 font-semibold text-gray-800 dark:text-gray-100">{{ item.reason }}</td>
              <td class="p-3.5 pr-6 text-right">
                <button
                  type="button"
                  @click="deleteLostReason(item.id)"
                  class="px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition shadow-2xs"
                >
                  <Icon icon="solar:trash-bin-trash-linear" class="text-sm" />
                  <span>O'chirish</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- TAB 6: IP TELEFONIYA -->
    <div v-if="activeTab === 'telephony'" class="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs sm:text-sm">
          <thead class="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 uppercase text-[11px] font-bold border-b dark:border-gray-700">
            <tr>
              <th class="p-3.5 pl-6 w-16">#</th>
              <th class="p-3.5">SOZLAMA NOMI</th>
              <th class="p-3.5 pr-6 text-left">SOZLAMA QIYMATI</th>
            </tr>
          </thead>
          <tbody class="divide-y dark:divide-gray-700">
            <tr
              v-for="(item, idx) in telephonyItems"
              :key="item.key"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition"
            >
              <td class="p-3.5 pl-6 font-bold text-gray-400">{{ idx + 1 }}</td>
              <td class="p-3.5 font-bold font-mono text-xs text-gray-800 dark:text-gray-100">{{ item.key }}</td>
              <td class="p-3.5 pr-6">
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    @click="copyText(item.value)"
                    class="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-700 cursor-pointer"
                    title="Nusxalash"
                  >
                    <Icon icon="solar:copy-linear" class="text-sm" />
                  </button>
                  <span class="font-mono text-xs text-gray-600 dark:text-gray-300">{{ item.value }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- TAB 7: SIP RAQAMLAR -->
    <div v-if="activeTab === 'sip'" class="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs sm:text-sm">
          <thead class="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 uppercase text-[11px] font-bold border-b dark:border-gray-700">
            <tr>
              <th class="p-3.5 pl-6 w-16">#</th>
              <th class="p-3.5">RAQAMLAR</th>
              <th class="p-3.5">NOMI</th>
              <th class="p-3.5">OPERATOR</th>
              <th class="p-3.5">YARATILGAN VAQT</th>
              <th class="p-3.5 pr-6 text-right w-36">AMALLAR</th>
            </tr>
          </thead>
          <tbody class="divide-y dark:divide-gray-700">
            <tr
              v-for="(item, idx) in sipNumbers"
              :key="item.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition"
            >
              <td class="p-3.5 pl-6 font-bold text-gray-400">{{ idx + 1 }}</td>
              <td class="p-3.5 font-bold font-mono text-xs text-gray-800 dark:text-gray-100">{{ item.number }}</td>
              <td class="p-3.5 text-gray-600 dark:text-gray-300 font-medium">{{ item.name }}</td>
              <td class="p-3.5 font-semibold text-gray-800 dark:text-gray-100">{{ item.operator }}</td>
              <td class="p-3.5 text-gray-500 dark:text-gray-400 text-xs">{{ item.createdAt }}</td>
              <td class="p-3.5 pr-6 text-right">
                <button
                  type="button"
                  @click="openEditSipModal(item)"
                  class="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition shadow-2xs"
                >
                  <Icon icon="solar:pen-linear" class="text-sm" />
                  <span>Tahrirlash</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- TAB 8: RUXSATLAR -->
    <div v-if="activeTab === 'permissions'" class="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs sm:text-sm">
          <thead class="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 uppercase text-[11px] font-bold border-b dark:border-gray-700">
            <tr>
              <th class="p-3.5 pl-6 w-16">#</th>
              <th class="p-3.5">XODIMLAR</th>
              <th class="p-3.5">FOYDALANUVCHI ROLI</th>
              <th class="p-3.5 pr-6 text-right w-36">AMALLAR</th>
            </tr>
          </thead>
          <tbody class="divide-y dark:divide-gray-700">
            <tr
              v-for="(item, idx) in employeesList"
              :key="item.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition"
            >
              <td class="p-3.5 pl-6 font-bold text-gray-400">{{ idx + 1 }}</td>
              <td class="p-3.5 font-bold text-gray-800 dark:text-gray-100">{{ item.name }}</td>
              <td class="p-3.5 text-gray-600 dark:text-gray-300 font-medium">{{ item.role }}</td>
              <td class="p-3.5 pr-6 text-right">
                <button
                  type="button"
                  @click="openPermissionsModal(item)"
                  class="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition shadow-2xs"
                >
                  <Icon icon="solar:shield-check-linear" class="text-sm text-primary" />
                  <span>Ruxsatlar</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL 1: MIJOZ DARAJASI (TIER) -->
    <vmodal
      ref="tierModal"
      :hideButton="true"
      :title="editingTierId ? 'Darajani tahrirlash' : 'Yangi daraja qo\'shish'"
      subtitle="Mijoz qiziqish darajasi (issiq/sovuq)"
      btnTextSubmit="Saqlash"
      btnTextClose="Bekor qilish"
      btnColorSubmit="bg-primary"
      @submit="saveTierForm"
    >
      <template v-slot:Icon>
        <Icon icon="solar:user-bold" class="text-3xl text-primary mb-2" />
      </template>
      <template v-slot:body>
        <div class="space-y-3 text-sm text-left">
          <FormInput v-model="tierForm.name" label="Daraja nomi" required placeholder="Qaynoq, O'rtacha, Past..." />
          <FormInput v-model="tierForm.emoji" label="Ikonka / Emoji" placeholder="❤️, 👍, 👎, 🔥..." />
          <div>
            <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Rang uslubi</label>
            <div class="grid grid-cols-4 gap-2">
              <button
                v-for="color in tierColorOptions"
                :key="color.name"
                type="button"
                @click="tierForm.badgeClass = color.class"
                :class="[
                  'py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-1.5',
                  color.class,
                  tierForm.badgeClass === color.class ? 'ring-2 ring-primary border-primary' : 'border-transparent'
                ]"
              >
                <span>{{ color.name }}</span>
              </button>
            </div>
          </div>
        </div>
      </template>
    </vmodal>

    <!-- MODAL 2: TAG -->
    <vmodal
      ref="tagModal"
      :hideButton="true"
      :title="editingTagId ? 'Tagni tahrirlash' : 'Yangi Tag qo\'shish'"
      subtitle="Lidlarni tezkor guruhlash uchun belgilar"
      btnTextSubmit="Saqlash"
      btnTextClose="Bekor qilish"
      btnColorSubmit="bg-primary"
      @submit="saveTagForm"
    >
      <template v-slot:Icon>
        <Icon icon="solar:hashtag-bold" class="text-3xl text-primary mb-2" />
      </template>
      <template v-slot:body>
        <div class="space-y-3 text-sm text-left">
          <FormInput v-model="tagForm.name" label="Tag nomi" required placeholder="Muhim, Qayta aloqa, Chegirma..." />
          <div>
            <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Rangi</label>
            <div class="grid grid-cols-4 gap-2">
              <button
                v-for="color in tagColorOptions"
                :key="color.name"
                type="button"
                @click="tagForm.badgeClass = color.class"
                :class="[
                  'py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-1.5',
                  color.class,
                  tagForm.badgeClass === color.class ? 'ring-2 ring-primary border-primary' : 'border-transparent'
                ]"
              >
                <span>{{ color.name }}</span>
              </button>
            </div>
          </div>
        </div>
      </template>
    </vmodal>

    <!-- MODAL 3: MANBA (SOURCE) -->
    <vmodal
      ref="sourceModal"
      :hideButton="true"
      :title="editingSourceId ? 'Manbani tahrirlash' : 'Yangi reklama manbasi'"
      subtitle="Lidlar kelib tushadigan kanal va havola"
      btnTextSubmit="Saqlash"
      btnTextClose="Bekor qilish"
      btnColorSubmit="bg-primary"
      @submit="saveSourceForm"
    >
      <template v-slot:Icon>
        <Icon icon="solar:global-bold" class="text-3xl text-primary mb-2" />
      </template>
      <template v-slot:body>
        <div class="space-y-3 text-sm text-left">
          <FormInput v-model="sourceForm.name" label="Manba nomi" required placeholder="YouTube, Facebook, Telegram..." />
          <FormInput v-model="sourceForm.code" label="Kod / Slug (Tracking uchun)" required placeholder="youtube, fb_target, telegram..." />
          <FormInput v-model="sourceForm.icon" label="Iconify Ikonka kodi" placeholder="logos:youtube-icon, logos:facebook..." />
        </div>
      </template>
    </vmodal>

    <!-- MODAL 4: VORONKA (PIPELINE) -->
    <vmodal
      ref="pipelineModal"
      :hideButton="true"
      :title="editingPipelineId ? 'Voronkani tahrirlash' : 'Yangi Voronka / Mavsum'"
      subtitle="Qabul kampaniyasi yoki alohida yo'nalish voronkasi"
      btnTextSubmit="Saqlash"
      btnTextClose="Bekor qilish"
      btnColorSubmit="bg-primary"
      @submit="savePipelineForm"
    >
      <template v-slot:Icon>
        <Icon icon="solar:tuning-square-2-bold" class="text-3xl text-primary mb-2" />
      </template>
      <template v-slot:body>
        <div class="space-y-3 text-sm text-left">
          <FormInput v-model="pipelineForm.name" label="Voronka nomi" required placeholder="Qabul 2026-2027, Bog'cha uchun..." />
          <label class="flex items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 cursor-pointer">
            <input type="checkbox" v-model="pipelineForm.isDefault" class="rounded text-primary" />
            <span class="text-xs font-semibold text-gray-700 dark:text-gray-200">Asosiy standart voronka sifatida belgilash</span>
          </label>
        </div>
      </template>
    </vmodal>

    <!-- MODAL 5: YO'QOTILGAN LID SABABI (LOST REASON) -->
    <vmodal
      ref="lostReasonModal"
      :hideButton="true"
      :title="editingLostReasonId ? 'Sababni tahrirlash' : 'Yo\'qotilgan lid sababi'"
      subtitle="Mijoz voz kechishining asosiy sababi"
      btnTextSubmit="Saqlash"
      btnTextClose="Bekor qilish"
      btnColorSubmit="bg-primary"
      @submit="saveLostReasonForm"
    >
      <template v-slot:Icon>
        <Icon icon="solar:close-circle-bold" class="text-3xl text-red-500 mb-2" />
      </template>
      <template v-slot:body>
        <div class="space-y-3 text-sm text-left">
          <FormInput v-model="lostReasonForm.reason" label="Sabab tavsifi" required placeholder="Boshqa maktabga ketdi, Narxi to'g'ri kelmadi..." />
        </div>
      </template>
    </vmodal>

    <!-- MODAL 6: SIP RAQAM (SIP MODAL) -->
    <vmodal
      ref="sipModal"
      :hideButton="true"
      :title="editingSipId ? 'SIP raqamini tahrirlash' : 'Yangi SIP raqam qo\'shish'"
      subtitle="Ichki raqam va mas'ul operator"
      btnTextSubmit="Saqlash"
      btnTextClose="Bekor qilish"
      btnColorSubmit="bg-primary"
      @submit="saveSipForm"
    >
      <template v-slot:Icon>
        <Icon icon="solar:phone-bold" class="text-3xl text-primary mb-2" />
      </template>
      <template v-slot:body>
        <div class="space-y-3 text-sm text-left">
          <FormInput v-model="sipForm.number" label="Ichki raqam" required placeholder="101, 1, 3, 4..." />
          <FormInput v-model="sipForm.name" label="Nomi" placeholder="Operator 1, Kassa..." />
          <FormInput v-model="sipForm.operator" label="Mas'ul xodim (Operator)" required placeholder="Toshpulatov Jamshid..." />
        </div>
      </template>
    </vmodal>

    <!-- MODAL 7: RUXSATLAR (PERMISSIONS MODAL) -->
    <vmodal
      ref="permissionsModal"
      :hideButton="true"
      title="Xodim ruxsatlarini sozlash"
      :subtitle="selectedEmployee ? selectedEmployee.name + ' (' + selectedEmployee.role + ')' : ''"
      btnTextSubmit="Saqlash"
      btnTextClose="Bekor qilish"
      btnColorSubmit="bg-primary"
      @submit="saveEmployeePermissions"
    >
      <template v-slot:Icon>
        <Icon icon="solar:shield-check-bold" class="text-3xl text-primary mb-2" />
      </template>
      <template v-slot:body>
        <div class="space-y-2.5 text-xs text-left">
          <label class="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 cursor-pointer">
            <span>Barcha lidlarni ko'rish</span>
            <input type="checkbox" v-model="employeePermissions.viewAllLeads" class="rounded text-primary" />
          </label>
          <label class="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 cursor-pointer">
            <span>Lid ma'lumotlarini tahrirlash</span>
            <input type="checkbox" v-model="employeePermissions.editLeads" class="rounded text-primary" />
          </label>
          <label class="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 cursor-pointer">
            <span>O'quvchiga aylantirish (Qabul qilish)</span>
            <input type="checkbox" v-model="employeePermissions.convertLeads" class="rounded text-primary" />
          </label>
          <label class="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 cursor-pointer">
            <span>Lidlarni o'chirish huquqi</span>
            <input type="checkbox" v-model="employeePermissions.deleteLeads" class="rounded text-primary" />
          </label>
        </div>
      </template>
    </vmodal>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";
import Breadcrumb from "@/components/Breadcrumb.vue";
import Alert from "@/components/Alert.vue";
import FormInput from "@/components/FormInput.vue";
import vmodal from "@/components/modal.vue";
import { useTenantStore } from "@/store/tenant";

const DEFAULT_CRM_SETTINGS = {
  clientTiers: [
    { id: "1", name: "yaxshi", emoji: "", badgeClass: "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300", createdAt: "2 Iyn, 2026 - 12:48" },
    { id: "2", name: "Past", emoji: "👎", badgeClass: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300", createdAt: "6 May, 2026 - 18:28" },
    { id: "3", name: "O'rtacha", emoji: "👍", badgeClass: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300", createdAt: "6 May, 2026 - 18:28" },
    { id: "4", name: "Qaynoq", emoji: "❤️", badgeClass: "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300", createdAt: "6 May, 2026 - 18:28" },
  ],
  tags: [
    { id: "1", name: "Muhim", badgeClass: "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300", createdAt: "6 May, 2026 - 18:28" },
    { id: "2", name: "Qayta aloqa", badgeClass: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300", createdAt: "6 May, 2026 - 18:28" },
    { id: "3", name: "Javob bermadi", badgeClass: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300", createdAt: "6 May, 2026 - 18:28" },
    { id: "4", name: "Qiziqmadi", badgeClass: "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300", createdAt: "6 May, 2026 - 18:28" },
  ],
  sources: [
    { id: "1", name: "YouTube", code: "youtube", icon: "logos:youtube-icon", iconColor: "text-red-600", createdAt: "2 Iyl, 2026 - 16:43" },
    { id: "2", name: "Facebook", code: "facebook", icon: "logos:facebook", iconColor: "text-blue-600", createdAt: "23 Iyn, 2026 - 10:43" },
    { id: "3", name: "Telefon", code: "phone", icon: "solar:phone-bold", iconColor: "text-emerald-600", createdAt: "6 May, 2026 - 18:28" },
    { id: "4", name: "Tanish bilish", code: "referral", icon: "solar:users-group-rounded-bold", iconColor: "text-indigo-600", createdAt: "6 May, 2026 - 18:28" },
    { id: "5", name: "Veb sayt", code: "website", icon: "solar:global-bold", iconColor: "text-cyan-600", createdAt: "6 May, 2026 - 18:28" },
    { id: "6", name: "Telegram", code: "telegram", icon: "logos:telegram", iconColor: "text-sky-500", createdAt: "6 May, 2026 - 18:28" },
    { id: "7", name: "Instagram", code: "instagram", icon: "skill-icons:instagram", iconColor: "text-pink-600", createdAt: "6 May, 2026 - 18:28" },
  ],
  pipelines: [
    { id: "p1", name: "Bog'cha uchun", isDefault: false, createdAt: "24 Iyl, 2026 - 11:02" },
    { id: "p2", name: "Qabul 2026-2027", isDefault: true, createdAt: "6 May, 2026 - 18:28" },
  ],
  lostReasons: [
    { id: "1", reason: "Boshqa maktabga ketdi" },
    { id: "2", reason: "Maktab uzoqlik qildi" },
    { id: "3", reason: "Narxi to'g'ri kelmadi" },
  ],
};

export default {
  name: "CrmSettings",
  components: {
    Icon,
    Breadcrumb,
    Alert,
    FormInput,
    vmodal,
  },
  setup() {
    const tenantStore = useTenantStore();
    return { tenantStore };
  },
  data() {
    return {
      activeTab: "tiers",
      alertMessage: "",
      breadcrumbItems: [
        { title: "Bosh sahifa", path: "/" },
        { title: "CRM", path: "/leads" },
        { title: "Sozlamalar", path: "/crm/settings" },
      ],
      settings: JSON.parse(JSON.stringify(DEFAULT_CRM_SETTINGS)),
      
      // Tier Form
      editingTierId: null,
      tierForm: { name: "", emoji: "❤️", badgeClass: "bg-rose-50 text-rose-600" },
      tierColorOptions: [
        { name: "Pushti / Qizil", class: "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300" },
        { name: "Sariq / To'q sariq", class: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" },
        { name: "Ko'k / Moviy", class: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300" },
        { name: "Yashil / Zumrad", class: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" },
      ],

      // Tag Form
      editingTagId: null,
      tagForm: { name: "", badgeClass: "bg-rose-50 text-rose-600" },
      tagColorOptions: [
        { name: "Pushti / Qizil", class: "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300" },
        { name: "Ko'k", class: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300" },
        { name: "Sariq", class: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300" },
        { name: "Binafsha", class: "bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-300" },
      ],

      // Source Form
      editingSourceId: null,
      sourceForm: { name: "", code: "", icon: "solar:global-bold" },

      // Pipeline Form
      editingPipelineId: null,
      pipelineForm: { name: "", isDefault: false },

      // Lost Reason Form
      editingLostReasonId: null,
      lostReasonForm: { reason: "" },

      // Telephony Data (Exact match with screenshot 1)
      telephonyItems: [
        { key: "AMI_HOST", value: "1" },
        { key: "AMI_PORT", value: "1" },
        { key: "AMI_USER", value: "1" },
        { key: "RECORDING_BASE_URL", value: "1" },
        { key: "AMI_SECRET", value: "••••••••" },
        { key: "RECORDING_TOKEN", value: "••••••••" },
        { key: "WEBHOOK_SECRET", value: "••••••••" },
      ],

      // SIP Numbers (Exact match with screenshot 2)
      sipNumbers: [
        { id: "1", number: "1", name: "1", operator: "Toshpulatov Jamshid Akbarovich", createdAt: "25 Iyn, 2026 - 09:57" },
        { id: "2", number: "3", name: "3", operator: "Aliyev Rustam Alievich", createdAt: "22 Iyn, 2026 - 11:18" },
        { id: "3", number: "4", name: "4", operator: "Raxmatov Nodir Raxmatovich", createdAt: "22 Iyn, 2026 - 11:08" },
      ],
      editingSipId: null,
      sipForm: { number: "", name: "", operator: "" },

      // Employees / Permissions (Exact match with screenshot 3)
      employeesList: [
        { id: "1", name: "Toshpulatov Jamshid Akbarovich", role: "Bosh buxgalter" },
        { id: "2", name: "Raxmatov Nodir Raxmatovich", role: "Direktor" },
        { id: "3", name: "Aliyev Rustam Alievich", role: "Buxgalter" },
        { id: "4", name: "teyst test test", role: "O'quv ishlari bo'yicha direktor o'rinbosari" },
      ],
      selectedEmployee: null,
      employeePermissions: {
        viewAllLeads: true,
        editLeads: true,
        convertLeads: true,
        deleteLeads: false,
      },
    };
  },
  computed: {
    tabs() {
      return [
        { id: "tiers", label: "Mijoz darajasi", count: this.settings.clientTiers.length, icon: "solar:user-bold" },
        { id: "tags", label: "Taglar", count: this.settings.tags.length, icon: "solar:hashtag-bold" },
        { id: "sources", label: "Manbalar", count: this.settings.sources.length, icon: "solar:global-bold" },
        { id: "pipelines", label: "Voronkalar", count: this.settings.pipelines.length, icon: "solar:tuning-square-2-bold" },
        { id: "lostReasons", label: "Yo'qotilgan lid sabablari", count: this.settings.lostReasons.length, icon: "solar:close-circle-bold" },
        { id: "telephony", label: "IP telefoniya", count: this.telephonyItems.length, icon: "solar:phone-calling-bold" },
        { id: "sip", label: "SIP raqamlar", count: this.sipNumbers.length, icon: "solar:phone-bold" },
        { id: "permissions", label: "Ruxsatlar", count: this.employeesList.length, icon: "solar:shield-check-bold" },
      ];
    },
    actionButtonText() {
      if (this.activeTab === "tiers") return "Yangi Daraja Qo'shish";
      if (this.activeTab === "tags") return "Yangi Tag Qo'shish";
      if (this.activeTab === "sources") return "Yangi Manba Qo'shish";
      if (this.activeTab === "pipelines") return "Yangi Voronka Qo'shish";
      if (this.activeTab === "lostReasons") return "Yangi Sabab Qo'shish";
      if (this.activeTab === "sip") return "Yangi Raqam Qo'shish";
      return null;
    },
    storageKey() {
      const type = this.tenantStore.businessType || "COURSE_CENTER";
      return `educrm_crm_settings_${type}`;
    },
  },
  mounted() {
    this.loadSettings();
  },
  methods: {
    loadSettings() {
      try {
        const raw = localStorage.getItem(this.storageKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          this.settings = { ...DEFAULT_CRM_SETTINGS, ...parsed };
        }
      } catch (e) {
        console.error(e);
      }
    },
    saveToStorage() {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
      } catch (e) {
        console.error(e);
      }
    },
    openAddModalForActiveTab() {
      if (this.activeTab === "tiers") this.openAddTierModal();
      else if (this.activeTab === "tags") this.openAddTagModal();
      else if (this.activeTab === "sources") this.openAddSourceModal();
      else if (this.activeTab === "pipelines") this.openAddPipelineModal();
      else if (this.activeTab === "lostReasons") this.openAddLostReasonModal();
      else if (this.activeTab === "sip") this.openAddSipModal();
    },

    // TIERS
    openAddTierModal() {
      this.editingTierId = null;
      this.tierForm = { name: "", emoji: "❤️", badgeClass: "bg-rose-50 text-rose-600" };
      if (this.$refs.tierModal) this.$refs.tierModal.isOpen = true;
    },
    openEditTierModal(item) {
      this.editingTierId = item.id;
      this.tierForm = { ...item };
      if (this.$refs.tierModal) this.$refs.tierModal.isOpen = true;
    },
    saveTierForm() {
      if (!this.tierForm.name) return;
      if (this.editingTierId) {
        const idx = this.settings.clientTiers.findIndex((t) => t.id === this.editingTierId);
        if (idx !== -1) this.settings.clientTiers[idx] = { ...this.settings.clientTiers[idx], ...this.tierForm };
        this.alertMessage = "Mijoz darajasi muvaffaqiyatli yangilandi!";
      } else {
        this.settings.clientTiers.push({
          id: String(Date.now()),
          ...this.tierForm,
          createdAt: new Date().toLocaleDateString("uz-UZ", { day: "numeric", month: "short", year: "numeric" }),
        });
        this.alertMessage = "Yangi mijoz darajasi qo'shildi!";
      }
      this.saveToStorage();
      if (this.$refs.tierModal) this.$refs.tierModal.isOpen = false;
    },
    deleteTier(id) {
      this.settings.clientTiers = this.settings.clientTiers.filter((t) => t.id !== id);
      this.saveToStorage();
      this.alertMessage = "Mijoz darajasi o'chirildi!";
    },

    // TAGS
    openAddTagModal() {
      this.editingTagId = null;
      this.tagForm = { name: "", badgeClass: "bg-rose-50 text-rose-600" };
      if (this.$refs.tagModal) this.$refs.tagModal.isOpen = true;
    },
    openEditTagModal(item) {
      this.editingTagId = item.id;
      this.tagForm = { ...item };
      if (this.$refs.tagModal) this.$refs.tagModal.isOpen = true;
    },
    saveTagForm() {
      if (!this.tagForm.name) return;
      if (this.editingTagId) {
        const idx = this.settings.tags.findIndex((t) => t.id === this.editingTagId);
        if (idx !== -1) this.settings.tags[idx] = { ...this.settings.tags[idx], ...this.tagForm };
        this.alertMessage = "Tag muvaffaqiyatli yangilandi!";
      } else {
        this.settings.tags.push({
          id: String(Date.now()),
          ...this.tagForm,
          createdAt: new Date().toLocaleDateString("uz-UZ", { day: "numeric", month: "short", year: "numeric" }),
        });
        this.alertMessage = "Yangi Tag yaratildi!";
      }
      this.saveToStorage();
      if (this.$refs.tagModal) this.$refs.tagModal.isOpen = false;
    },
    deleteTag(id) {
      this.settings.tags = this.settings.tags.filter((t) => t.id !== id);
      this.saveToStorage();
      this.alertMessage = "Tag o'chirildi!";
    },

    // SOURCES
    openAddSourceModal() {
      this.editingSourceId = null;
      this.sourceForm = { name: "", code: "", icon: "solar:global-bold" };
      if (this.$refs.sourceModal) this.$refs.sourceModal.isOpen = true;
    },
    openEditSourceModal(item) {
      this.editingSourceId = item.id;
      this.sourceForm = { ...item };
      if (this.$refs.sourceModal) this.$refs.sourceModal.isOpen = true;
    },
    saveSourceForm() {
      if (!this.sourceForm.name || !this.sourceForm.code) return;
      if (this.editingSourceId) {
        const idx = this.settings.sources.findIndex((s) => s.id === this.editingSourceId);
        if (idx !== -1) this.settings.sources[idx] = { ...this.settings.sources[idx], ...this.sourceForm };
        this.alertMessage = "Manba muvaffaqiyatli yangilandi!";
      } else {
        this.settings.sources.push({
          id: String(Date.now()),
          ...this.sourceForm,
          iconColor: "text-primary",
          createdAt: new Date().toLocaleDateString("uz-UZ", { day: "numeric", month: "short", year: "numeric" }),
        });
        this.alertMessage = "Yangi reklama manbasi qo'shildi!";
      }
      this.saveToStorage();
      if (this.$refs.sourceModal) this.$refs.sourceModal.isOpen = false;
    },
    deleteSource(id) {
      this.settings.sources = this.settings.sources.filter((s) => s.id !== id);
      this.saveToStorage();
      this.alertMessage = "Manba o'chirildi!";
    },
    copyTargetLink(code) {
      const url = `https://crm.my-school.uz/lead?source=${code}`;
      navigator.clipboard.writeText(url);
      this.alertMessage = `"${url}" havolasi nusxalandi!`;
    },

    // PIPELINES
    openAddPipelineModal() {
      this.editingPipelineId = null;
      this.pipelineForm = { name: "", isDefault: false };
      if (this.$refs.pipelineModal) this.$refs.pipelineModal.isOpen = true;
    },
    savePipelineForm() {
      if (!this.pipelineForm.name) return;
      if (this.pipelineForm.isDefault) {
        this.settings.pipelines.forEach((p) => (p.isDefault = false));
      }
      this.settings.pipelines.push({
        id: String(Date.now()),
        ...this.pipelineForm,
        createdAt: new Date().toLocaleDateString("uz-UZ", { day: "numeric", month: "short", year: "numeric" }),
      });
      this.alertMessage = "Yangi voronka yaratildi!";
      this.saveToStorage();
      if (this.$refs.pipelineModal) this.$refs.pipelineModal.isOpen = false;
    },
    setDefaultPipeline(id) {
      this.settings.pipelines.forEach((p) => {
        p.isDefault = p.id === id;
      });
      this.saveToStorage();
      this.alertMessage = "Standart voronka o'zgartirildi!";
    },

    // LOST REASONS
    openAddLostReasonModal() {
      this.editingLostReasonId = null;
      this.lostReasonForm = { reason: "" };
      if (this.$refs.lostReasonModal) this.$refs.lostReasonModal.isOpen = true;
    },
    saveLostReasonForm() {
      if (!this.lostReasonForm.reason) return;
      this.settings.lostReasons.push({
        id: String(Date.now()),
        ...this.lostReasonForm,
      });
      this.alertMessage = "Yangi yo'qotish sababi qo'shildi!";
      this.saveToStorage();
      if (this.$refs.lostReasonModal) this.$refs.lostReasonModal.isOpen = false;
    },
    deleteLostReason(id) {
      this.settings.lostReasons = this.settings.lostReasons.filter((r) => r.id !== id);
      this.saveToStorage();
      this.alertMessage = "Sabab o'chirildi!";
    },

    // TELEPHONY & SIP
    openEditTelephonyModal() {
      this.alertMessage = "IP telefoniya parametrlari tahrirlash rejimida";
    },
    openAddSipModal() {
      this.editingSipId = null;
      this.sipForm = { number: "", name: "", operator: "" };
      if (this.$refs.sipModal) this.$refs.sipModal.isOpen = true;
    },
    openEditSipModal(item) {
      this.editingSipId = item.id;
      this.sipForm = { ...item };
      if (this.$refs.sipModal) this.$refs.sipModal.isOpen = true;
    },
    saveSipForm() {
      if (!this.sipForm.number || !this.sipForm.operator) return;
      if (this.editingSipId) {
        const idx = this.sipNumbers.findIndex((s) => s.id === this.editingSipId);
        if (idx !== -1) this.sipNumbers[idx] = { ...this.sipNumbers[idx], ...this.sipForm };
        this.alertMessage = "SIP raqami yangilandi!";
      } else {
        this.sipNumbers.push({
          id: String(Date.now()),
          ...this.sipForm,
          createdAt: new Date().toLocaleDateString("uz-UZ", { day: "numeric", month: "short", year: "numeric" }),
        });
        this.alertMessage = "Yangi SIP raqami qo'shildi!";
      }
      if (this.$refs.sipModal) this.$refs.sipModal.isOpen = false;
    },

    // PERMISSIONS
    openPermissionsModal(employee) {
      this.selectedEmployee = employee;
      if (this.$refs.permissionsModal) this.$refs.permissionsModal.isOpen = true;
    },
    saveEmployeePermissions() {
      this.alertMessage = `${this.selectedEmployee?.name} uchun ruxsatlar saqlandi!`;
      if (this.$refs.permissionsModal) this.$refs.permissionsModal.isOpen = false;
    },
    syncPermissions() {
      this.alertMessage = "Barcha xodimlar rollari va ruxsatlari muvaffaqiyatli sinxronlandi!";
    },
    copyText(text) {
      navigator.clipboard.writeText(text);
      this.alertMessage = "Qiymat nusxalandi!";
    },
  },
};
</script>
