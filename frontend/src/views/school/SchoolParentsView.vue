<template>
  <div class="school-parents-page p-4 font-lexend space-y-5">
    <!-- 1. Breadcrumb Navigatsiyasi -->
    <Breadcrumb
      :items="[
        { title: 'Ta\'lim', to: '/school/classes' },
        { title: 'Ota-onalar' }
      ]"
    />

    <!-- 2. Header Section (Sarlavha, soni, tavsifi va amallar) -->
    <div class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <div class="flex items-center gap-3">
          <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Ota-onalar
          </h1>
        </div>
      </div>

      <!-- Yuqori O'ng Tugmalar (Arxiv & Yangi ota-ona) -->
      <div class="flex items-center gap-2.5 flex-wrap">
        <AppButton
          variant="outline"
          icon="solar:box-minimalistic-linear"
          @click="toggleArchiveFilter"
          :class="showArchiveOnly ? 'border-primary text-primary bg-primary/5' : ''"
        >
          <span>{{ showArchiveOnly ? "Faol ota-onalar" : "Arxiv" }}</span>
        </AppButton>

        <AppButton
          variant="primary"
          icon="solar:user-plus-bold"
          @click="openCreateModal"
        >
          <span>Yangi ota-ona</span>
        </AppButton>
      </div>
    </div>

    <!-- 3. Sana filtri paneli (Dashboard uslubidagi chiplar va DateRange tanlagichi) -->
    <div class="bg-white dark:bg-gray-800 p-3 sm:p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xs flex items-center justify-between flex-wrap gap-3">
      <!-- Chap tomondagi tezkor sana chiplari (Dashboard HeaderBar andozasida segmented pills) -->
      <div class="flex items-center gap-2 flex-wrap text-xs sm:text-sm">
        <span class="text-gray-500 dark:text-gray-400 font-semibold mr-1">Qo'shilgan:</span>
        <div class="inline-flex rounded-lg bg-gray-100 dark:bg-gray-700/60 p-1">
          <button
            v-for="chip in dateChips"
            :key="chip.id"
            type="button"
            @click="setDateChip(chip.id)"
            :class="[
              'px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer select-none',
              activeDateChip === chip.id
                ? 'bg-white dark:bg-gray-800 text-primary shadow-2xs font-bold'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            ]"
          >
            {{ chip.label }}
          </button>
        </div>
      </div>

      <!-- O'ng tomondagi Dashboard DateRange Picker komponenti -->
      <AppDateRangePicker
        :start-date="dateFrom"
        :end-date="dateTo"
        align="right"
        @update:startDate="val => { dateFrom = val; onCustomDateChange(); }"
        @update:endDate="val => { dateTo = val; onCustomDateChange(); }"
        @change="handleDateRangePickerChange"
      />
    </div>

    <!-- 4. Qidiruv va Filtrlar paneli -->
    <div class="bg-white dark:bg-gray-800 p-3 sm:p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xs flex items-center justify-between flex-wrap gap-3">
      <div class="flex items-center gap-2.5 flex-wrap flex-1 min-w-[280px]">
        <!-- Qidiruv maydoni -->
        <div class="relative w-full sm:w-72">
          <Icon icon="solar:magnifer-linear" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
          <input
            type="text"
            v-model="searchQuery"
            @input="currentPage = 1"
            placeholder="F.I.SH, telefon, login bo'yicha qidirish..."
            class="w-full pl-9 pr-3.5 h-9 sm:h-9.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 placeholder-gray-400 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition shadow-2xs"
          />
        </div>

        <!-- 1. Sinf Dropdown -->
        <AppFilterDropdown
          v-model="selectedClass"
          :options="classList"
          label="Sinf"
          all-label="Barcha sinflar"
          all-value="ALL"
          icon="solar:users-group-rounded-bold"
          min-width="min-w-[180px]"
          @change="currentPage = 1"
        />

        <!-- 2. Holati Dropdown -->
        <AppFilterDropdown
          v-model="selectedLoginStatus"
          :options="[
            { label: 'Faollar (Kirish ochiq)', value: 'ACTIVE' },
            { label: 'Nofaollar (Muzlatilgan)', value: 'INACTIVE' },
            { label: 'Kabinetga kirganlar', value: 'LOGGED_IN' },
            { label: 'Kirmaganlar', value: 'NEVER_LOGGED' }
          ]"
          label="Holati"
          all-label="Barcha holatlar"
          all-value="ALL"
          icon="solar:shield-keyhole-linear"
          min-width="min-w-[190px]"
          @change="currentPage = 1"
        />

        <!-- Tozalash tugmasi -->
        <button
          v-if="isFiltered"
          type="button"
          @click="resetAllFilters"
          class="h-9 sm:h-9.5 px-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1.5 transition cursor-pointer"
          title="Filtrlarni tozalash"
        >
          <Icon icon="solar:restart-linear" class="text-sm" />
          <span>Tozalash</span>
        </button>
      </div>

      <!-- Tezkor ko'rsatkichlar (Real faollik statistikasi) -->
      <div class="flex items-center gap-2 text-xs flex-wrap">
        <span class="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800">
          Faol: <b>{{ activeParentsCount }}</b>
        </span>
        <span class="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800">
          Nofaol: <b>{{ inactiveParentsCount }}</b>
        </span>
        <span class="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 border border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
          Kirgan: <b>{{ loggedInCount }}</b>
        </span>
      </div>
    </div>

    <!-- 5. Yagona Universal AppTable Komponenti -->
    <AppTable
      :columns="tableColumns"
      :data="filteredParents"
      :selectable="true"
      v-model="selectedParentIds"
      :show-index="true"
      index-label="№"
      :per-page="perPage"
      item-label="ota-ona"
      empty-text="Ota-onalar topilmadi"
      empty-description="Qidiruv so'zini o'zgartirib ko'ring yoki yangi ota-ona profilini qo'shing."
    >
      <!-- Ommaviy amallar sloti -->
      <template #bulkActions>
        <button
          type="button"
          @click="openBulkSmsModal"
          class="px-3 py-1.5 rounded-lg border border-primary/30 bg-white dark:bg-gray-800 text-primary text-xs font-semibold hover:bg-primary hover:text-white transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <Icon icon="solar:letter-linear" class="text-sm" />
          <span>SMS yuborish</span>
        </button>
        <button
          type="button"
          @click="confirmBulkDelete"
          class="px-3 py-1.5 rounded-lg border border-rose-300 bg-white dark:bg-gray-800 text-rose-600 text-xs font-semibold hover:bg-rose-600 hover:text-white transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <Icon icon="solar:trash-bin-2-linear" class="text-sm" />
          <span>O'chirish</span>
        </button>
      </template>

      <!-- F.I.SH ustuni (Universal AppUserCell - 1-rasm standarti) -->
      <template #cell(fullName)="{ row: p }">
        <AppUserCell
          :name="p.fullName"
          :image="p.avatar"
          :badge="p.isActive === false ? 'Nofaol' : (p.status === 'archived' ? 'Arxiv' : '')"
          :badge-variant="p.isActive === false ? 'danger' : 'neutral'"
        />
      </template>

      <!-- Telefon ustuni (Universal AppPhoneCell) -->
      <template #cell(phone)="{ row: p }">
        <AppPhoneCell :phone="p.phone" />
      </template>

      <!-- Login ustuni (Universal AppCopyCell) -->
      <template #cell(login)="{ row: p }">
        <AppCopyCell :text="p.login" />
      </template>

      <!-- Farzandlari ustuni -->
      <template #cell(children)="{ row: p }">
        <div class="flex items-center gap-1.5 flex-wrap">
          <span
            v-for="ch in p.children"
            :key="ch.id || ch.name"
            class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600"
          >
            <span>{{ ch.name }}</span>
            <span class="text-gray-400">·</span>
            <span class="font-bold text-primary">{{ ch.className }}</span>
            <button
              type="button"
              @click.stop="confirmUnlinkChild(p, ch)"
              class="text-gray-400 hover:text-rose-500 cursor-pointer ml-1 transition"
              title="Farzandni ajratish"
            >
              <Icon icon="solar:close-circle-linear" class="text-xs" />
            </button>
          </span>
          <span v-if="!p.children || p.children.length === 0" class="text-gray-400 italic text-xs">
            Farzand biriktirilmagan
          </span>
        </div>
      </template>

      <!-- Oxirgi kirish ustuni -->
      <template #cell(lastLogin)="{ row: p }">
        <div class="text-center whitespace-nowrap text-xs">
          <span v-if="p.lastLogin" class="inline-flex items-center gap-1.5 text-gray-700 dark:text-gray-300 font-medium">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>{{ p.lastLogin }}</span>
          </span>
          <span v-else class="text-gray-400 dark:text-gray-500 italic">
            Kirmagan
          </span>
        </div>
      </template>

      <!-- Faollik ustuni -->
      <template #cell(isActive)="{ row: p }">
        <div class="text-center whitespace-nowrap">
          <button
            type="button"
            @click="toggleParentActive(p)"
            :class="[
              'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
              p.isActive ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
            ]"
            role="switch"
            :aria-checked="p.isActive"
            :title="p.isActive ? 'Faol (O\'chirish uchun bosing)' : 'Nofaol (Yoqish uchun bosing)'"
          >
            <span
              aria-hidden="true"
              :class="[
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out',
                p.isActive ? 'translate-x-5' : 'translate-x-0'
              ]"
            />
          </button>
        </div>
      </template>

      <!-- Amallar ustuni -->
      <template #actions="{ row: p }">
        <div class="space-x-1 whitespace-nowrap text-right">
          <!-- 1. SMS yuborish -->
          <button
            type="button"
            @click="openSmsModal(p)"
            class="w-8 h-8 rounded-lg inline-flex items-center justify-center border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition shadow-2xs cursor-pointer"
            title="SMS xabar yuborish"
          >
            <Icon icon="solar:letter-linear" class="text-base" />
          </button>

          <!-- 2. Farzand biriktirish -->
          <button
            type="button"
            @click="openAttachChildModal(p)"
            class="w-8 h-8 rounded-lg inline-flex items-center justify-center border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/70 dark:hover:bg-blue-950/40 transition shadow-2xs cursor-pointer"
            title="Farzand biriktirish"
          >
            <Icon icon="solar:link-linear" class="text-base" />
          </button>

          <!-- 3. Parolni qayta tiklash -->
          <button
            type="button"
            @click="openResetPasswordModal(p)"
            class="w-8 h-8 rounded-lg inline-flex items-center justify-center border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 hover:text-amber-600 hover:border-amber-300 hover:bg-amber-50/70 dark:hover:bg-amber-950/40 transition shadow-2xs cursor-pointer"
            title="Parolni qayta tiklash"
          >
            <Icon icon="solar:restart-linear" class="text-base" />
          </button>

          <!-- 4. O'chirish -->
          <button
            type="button"
            @click="confirmDeleteParent(p)"
            class="w-8 h-8 rounded-lg inline-flex items-center justify-center border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-400 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50/70 dark:hover:bg-rose-950/40 transition shadow-2xs cursor-pointer"
            title="O'chirish"
          >
            <Icon icon="solar:trash-bin-2-linear" class="text-base" />
          </button>
        </div>
      </template>
    </AppTable>

    <!-- 7. Yangi Ota-ona Qo'shish Modal Oynasi -->
    <vmodal
      ref="createModal"
      title="Yangi ota-ona qo'shish"
      width="max-w-xl"
      hide-button
      hide-footer
    >
      <template v-slot:body>
        <form @submit.prevent="saveNewParent" class="space-y-4 text-left text-xs sm:text-sm">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="sm:col-span-2">
              <label class="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                Ota-ona F.I.SH *
              </label>
              <input
                type="text"
                v-model="newParentForm.fullName"
                @input="autoGenerateLogin"
                placeholder="Masalan: Abdullayev Bobur Jasur o'g'li"
                :class="[
                  'w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none transition',
                  formErrors.fullName
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                    : 'border-gray-300 dark:border-gray-600 focus:border-primary'
                ]"
              />
              <FormFieldError :error="formErrors.fullName" />
            </div>

            <div>
              <label class="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                Telefon raqami *
              </label>
              <input
                type="text"
                v-model="newParentForm.phone"
                @input="onPhoneInput"
                placeholder="+998 (90) 123-45-67"
                :class="[
                  'w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none transition',
                  formErrors.phone
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                    : 'border-gray-300 dark:border-gray-600 focus:border-primary'
                ]"
              />
              <FormFieldError :error="formErrors.phone" />
            </div>

            <div>
              <label class="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                Telegram foydalanuvchi nomi
              </label>
              <input
                type="text"
                v-model="newParentForm.telegram"
                @input="clearFieldError('telegram')"
                placeholder="@username"
                :class="[
                  'w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none transition',
                  formErrors.telegram
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                    : 'border-gray-300 dark:border-gray-600 focus:border-primary'
                ]"
              />
              <FormFieldError :error="formErrors.telegram" />
            </div>

            <div>
              <label class="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                Kabinet Logini *
              </label>
              <input
                type="text"
                v-model="newParentForm.login"
                @input="clearFieldError('login')"
                placeholder="abdullayev.bobur.ota"
                :class="[
                  'w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none transition font-mono text-xs',
                  formErrors.login
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                    : 'border-gray-300 dark:border-gray-600 focus:border-primary'
                ]"
              />
              <FormFieldError :error="formErrors.login" />
            </div>

            <div>
              <label class="block font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center justify-between">
                <span>Boshlang'ich parol</span>
                <button
                  type="button"
                  @click="generateRandomPassword"
                  class="text-primary hover:underline text-xs font-normal cursor-pointer"
                >
                  Generatsiya
                </button>
              </label>
              <input
                type="text"
                v-model="newParentForm.password"
                placeholder="8 xonali parol"
                class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none focus:border-primary transition font-mono text-xs"
              />
            </div>

            <!-- Boshlang'ich farzand biriktirish -->
            <div class="sm:col-span-2">
              <label class="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                Farzandini tanlash (Ixtiyoriy)
              </label>
              <select
                v-model="newParentForm.selectedStudentId"
                class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none focus:border-primary transition"
              >
                <option value="">-- O'quvchi tanlanmagan --</option>
                <option
                  v-for="st in availableStudents"
                  :key="st.id"
                  :value="st.id"
                >
                  {{ st.fullName }} ({{ st.className }})
                </option>
              </select>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-4 border-t dark:border-gray-700">
            <AppButton
              type="button"
              variant="outline"
              @click="$refs.createModal.close()"
            >
              Bekor qilish
            </AppButton>
            <AppButton
              type="submit"
              variant="primary"
              icon="solar:check-circle-bold"
            >
              Saqlash va Yaratish
            </AppButton>
          </div>
        </form>
      </template>
    </vmodal>

    <!-- 8. Farzand Biriktirish Modal Oynasi -->
    <vmodal
      ref="attachChildModal"
      title="Farzand biriktirish"
      width="max-w-md"
      hide-button
      hide-footer
    >
      <template v-slot:body>
        <div v-if="targetParentForChild" class="space-y-4 text-left text-xs sm:text-sm">
          <div class="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg space-y-1">
            <div class="text-xs text-gray-500">Ota-ona:</div>
            <div class="font-bold text-gray-900 dark:text-white text-sm">
              {{ targetParentForChild.fullName }}
            </div>
            <div class="text-xs text-gray-500">{{ targetParentForChild.phone }}</div>
          </div>

          <div>
            <label class="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              Mavjud o'quvchilardan tanlang:
            </label>
            <select
              v-model="selectedChildToAttach"
              class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none focus:border-primary transition"
            >
              <option value="">-- O'quvchini tanlang --</option>
              <option
                v-for="st in availableStudents"
                :key="st.id"
                :value="st.id"
              >
                {{ st.fullName }} · {{ st.className }}
              </option>
            </select>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t dark:border-gray-700">
            <AppButton
              type="button"
              variant="outline"
              @click="$refs.attachChildModal.close()"
            >
              Bekor qilish
            </AppButton>
            <AppButton
              type="button"
              variant="primary"
              icon="solar:link-linear"
              :disabled="!selectedChildToAttach"
              @click="submitAttachChild"
            >
              Biriktirish
            </AppButton>
          </div>
        </div>
      </template>
    </vmodal>

    <!-- 9. SMS Yuborish Modal Oynasi -->
    <vmodal
      ref="smsModal"
      title="SMS xabar yuborish"
      width="max-w-lg"
      hide-button
      hide-footer
    >
      <template v-slot:body>
        <div class="space-y-4 text-left text-xs sm:text-sm">
          <div v-if="smsTargetParent" class="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg space-y-1.5">
            <div class="text-xs text-gray-500">Qabul qiluvchi:</div>
            <div class="flex items-center justify-between">
              <span class="font-bold text-gray-900 dark:text-white">
                {{ smsTargetParent.fullName }} ({{ smsTargetParent.phone }})
              </span>
              <span
                :class="[
                  'px-2 py-0.5 rounded text-[10px] font-bold border',
                  smsTargetParent.isActive !== false
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                    : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                ]"
              >
                {{ smsTargetParent.isActive !== false ? 'Faol ota-ona' : 'Nofaol (Muzlatilgan)' }}
              </span>
            </div>
            <!-- Alert agar hisob nofaol bo'lsa -->
            <div
              v-if="smsTargetParent.isActive === false"
              class="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2 mt-2"
            >
              <Icon icon="solar:danger-triangle-bold" class="text-base shrink-0 text-amber-500" />
              <span>Diqqat: Ushbu ota-onaning shaxsiy kabinetga kirishi bloklangan. SMS xabar uning telefoniga yuboriladi.</span>
            </div>
          </div>
          <div v-else class="p-3 bg-primary/10 rounded-lg text-primary space-y-2">
            <div class="font-semibold text-xs sm:text-sm">
              Jami {{ selectedParentIds.length }} ta ota-onaga ommaviy SMS yuborilmoqda
            </div>
            <div class="flex items-center gap-3 text-xs">
              <span class="text-emerald-700 dark:text-emerald-400 font-semibold">
                Faollar: {{ activeSelectedParentsCount }} ta
              </span>
              <span v-if="inactiveSelectedParentsCount > 0" class="text-rose-700 dark:text-rose-400 font-semibold">
                Nofaollar: {{ inactiveSelectedParentsCount }} ta
              </span>
            </div>
            <div v-if="inactiveSelectedParentsCount > 0" class="pt-1.5 border-t border-primary/20">
              <label class="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700 dark:text-gray-200">
                <input
                  type="checkbox"
                  v-model="smsOnlyActiveParents"
                  class="rounded border-gray-300 text-primary focus:ring-primary cursor-pointer w-4 h-4"
                />
                <span>Faqat faol ota-onalarga yuborilsin (nofaollar chetlab o'tilsin)</span>
              </label>
            </div>
          </div>

          <div>
            <label class="block font-bold text-gray-700 dark:text-gray-300 mb-1">
              Tayyor shablonlar:
            </label>
            <div class="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                @click="applySmsTemplate('payment')"
                class="px-2 py-1 rounded-md border text-xs bg-gray-50 dark:bg-gray-700/50 hover:bg-primary/10 hover:text-primary transition cursor-pointer"
              >
                To'lov eslatmasi
              </button>
              <button
                type="button"
                @click="applySmsTemplate('meeting')"
                class="px-2 py-1 rounded-md border text-xs bg-gray-50 dark:bg-gray-700/50 hover:bg-primary/10 hover:text-primary transition cursor-pointer"
              >
                Ota-onalar majlisi
              </button>
              <button
                type="button"
                @click="applySmsTemplate('credentials')"
                class="px-2 py-1 rounded-md border text-xs bg-gray-50 dark:bg-gray-700/50 hover:bg-primary/10 hover:text-primary transition cursor-pointer"
              >
                Kabinet ma'lumotlari
              </button>
            </div>
          </div>

          <div>
            <label class="block font-bold text-gray-700 dark:text-gray-300 mb-1">
              Xabar matni *
            </label>
            <textarea
              v-model="smsMessageText"
              rows="4"
              placeholder="SMS matnini kiriting..."
              class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none focus:border-primary transition"
            ></textarea>
            <div class="text-[11px] text-gray-400 text-right mt-1">
              {{ smsMessageText.length }} belgi
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t dark:border-gray-700">
            <AppButton
              type="button"
              variant="outline"
              @click="$refs.smsModal.close()"
            >
              Bekor qilish
            </AppButton>
            <AppButton
              type="submit"
              variant="primary"
              icon="solar:plain-2-linear"
              :disabled="!smsMessageText.trim()"
              @click="sendSms"
            >
              Yuborish
            </AppButton>
          </div>
        </div>
      </template>
    </vmodal>

    <!-- 10. Parolni Qayta Tiklash Modal Oynasi -->
    <vmodal
      ref="resetPasswordModal"
      title="Parolni qayta tiklash"
      width="max-w-md"
      hide-button
      hide-footer
    >
      <template v-slot:body>
        <div v-if="targetParentForPassword" class="space-y-4 text-left text-xs sm:text-sm">
          <p class="text-gray-600 dark:text-gray-300">
            «<b>{{ targetParentForPassword.fullName }}</b>» uchun yangi vaqtinchalik parol generatsiya qilindi:
          </p>

          <div class="p-3 bg-gray-100 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <span class="font-mono text-base font-bold text-primary tracking-wider">
              {{ generatedTempPassword }}
            </span>
            <button
              type="button"
              @click="copyToClipboard(generatedTempPassword)"
              class="text-xs px-2 py-1 rounded bg-white dark:bg-gray-800 border hover:bg-gray-50 font-medium cursor-pointer shadow-2xs"
            >
              Nusxalash
            </button>
          </div>

          <p class="text-[11px] text-gray-400">
            Parolni ota-onaning <b>{{ targetParentForPassword.phone }}</b> raqamiga SMS orqali ham yuborishingiz mumkin.
          </p>

          <div class="flex items-center justify-end gap-2 pt-3 border-t dark:border-gray-700">
            <AppButton
              type="button"
              variant="outline"
              @click="$refs.resetPasswordModal.close()"
            >
              Yopish
            </AppButton>
            <AppButton
              type="button"
              variant="primary"
              icon="solar:letter-linear"
              @click="sendNewPasswordViaSms"
            >
              SMS yuborish
            </AppButton>
          </div>
        </div>
      </template>
    </vmodal>

    <!-- 11. Yakkama-yakka O'chirish Standart AppConfirmModal -->
    <AppConfirmModal
      ref="deleteConfirmModal"
      title="Ota-onani o'chirish"
      :message="parentToDelete ? '«' + parentToDelete.fullName + '» profilini va unga tegishli barcha kirish ma\'lumotlarini o\'chirishni tasdiqlaysizmi?' : ''"
      confirm-text="Tasdiqlash va O'chirish"
      variant="danger"
      @confirm="executeDeleteParent"
    />

    <!-- 12. Ommaviy O'chirish Standart AppConfirmModal -->
    <AppConfirmModal
      ref="bulkDeleteConfirmModal"
      title="Tanlangan ota-onalarni o'chirish"
      :message="'Tanlangan ' + selectedParentIds.length + ' nafar o\'ta-onani ro\'yxatdan o\'chirishni tasdiqlaysizmi?'"
      confirm-text="Barchasini O'chirish"
      variant="danger"
      @confirm="executeBulkDelete"
    />

    <!-- 13. Farzandni ajratish tasdiqlash modali -->
    <AppConfirmModal
      ref="unlinkConfirmModal"
      title="Farzandni ajratish"
      :message="childToUnlink ? '«' + childToUnlink.child.name + '» ni «' + childToUnlink.parent.fullName + '» profilidan ajratishni tasdiqlaysizmi?' : ''"
      confirm-text="Ajratish"
      variant="danger"
      @confirm="executeUnlinkChild"
    />
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";
import Breadcrumb from "@/components/Breadcrumb.vue";
import AppButton from "@/components/AppButton.vue";
import AppTable from "@/components/AppTable.vue";
import AppFilterDropdown from "@/components/AppFilterDropdown.vue";
import AppConfirmModal from "@/components/common/AppConfirmModal.vue";
import AppDateRangePicker from "@/components/common/AppDateRangePicker.vue";
import vmodal from "@/components/modal.vue";
import {
  loadSchoolParents,
  saveSchoolParents,
  addSchoolParent,
  updateSchoolParent,
  deleteSchoolParent,
  linkChildToParent,
  unlinkChildFromParent,
  generateLoginFromName
} from "@/api/schoolParentsData";
import { loadSchoolStudents } from "@/api/schoolStudentsData";
import { validateForm, parentValidationRules, formatPhone } from "@/utils/validators";

export default {
  name: "SchoolParentsView",
  components: {
    Icon,
    Breadcrumb,
    AppButton,
    AppTable,
    AppFilterDropdown,
    AppConfirmModal,
    AppDateRangePicker,
    vmodal
  },
  data() {
    return {
      tableColumns: [
        { key: "fullName", label: "F.I.SH" },
        { key: "phone", label: "Telefon", thClass: "py-3.5 px-4 whitespace-nowrap" },
        { key: "login", label: "Login", thClass: "py-3.5 px-4 whitespace-nowrap" },
        { key: "children", label: "Bog'liq o'quvchi", sortable: false },
        { key: "lastLogin", label: "Oxirgi kirish", align: "center", thClass: "py-3.5 px-4 text-center whitespace-nowrap" },
        { key: "isActive", label: "Faollik", align: "center", thClass: "py-3.5 px-4 text-center whitespace-nowrap" },
      ],
      parentsList: [],
      availableStudents: [],
      searchQuery: "",
      selectedClass: "ALL",
      selectedLoginStatus: "ALL",
      showArchiveOnly: false,
      formErrors: {},

      // Sana filtri va chipslar
      activeDateChip: "ALL",
      dateFrom: "",
      dateTo: "",
      dateChips: [
        { id: "TODAY", label: "Bugun" },
        { id: "YESTERDAY", label: "Kecha" },
        { id: "7DAYS", label: "7 kun" },
        { id: "MONTH", label: "Oy" },
        { id: "YEAR", label: "Yil" },
        { id: "ALL", label: "Barchasi" },
      ],

      // Sahifalash va saralash
      currentPage: 1,
      perPage: 10,
      sortOrder: "asc",

      // Tanlangan ID lar
      selectedParentIds: [],

      // Amallar obyektlari
      parentToDelete: null,
      childToUnlink: null,
      targetParentForChild: null,
      selectedChildToAttach: "",
      targetParentForPassword: null,
      generatedTempPassword: "",
      smsTargetParent: null,
      smsMessageText: "",
      smsOnlyActiveParents: true,

      // Yangi ota-ona shakli
      newParentForm: {
        fullName: "",
        phone: "+998 ",
        telegram: "",
        login: "",
        password: "",
        selectedStudentId: ""
      },

      classList: [
        "1-A", "1-B", "2-A", "2-B", "3-A", "3-B",
        "4-A", "4-B", "5-A", "5-B", "6-A", "6-B",
        "7-A", "8-A", "9-A", "10-A", "11-A"
      ]
    };
  },
  computed: {
    filteredParents() {
      let list = [...this.parentsList];

      // Arxiv filtri
      if (this.showArchiveOnly) {
        list = list.filter(p => p.status === "archived");
      } else {
        list = list.filter(p => p.status !== "archived");
      }

      // Qidiruv (F.I.SH, telefon, login)
      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase().trim();
        list = list.filter(p =>
          (p.fullName && p.fullName.toLowerCase().includes(q)) ||
          (p.login && p.login.toLowerCase().includes(q)) ||
          (p.phone && p.phone.replace(/\D/g, "").includes(q.replace(/\D/g, "")))
        );
      }

      // Sinf filtri (Farzandlarining sinfi bo'yicha)
      if (this.selectedClass !== "ALL") {
        list = list.filter(p =>
          Array.isArray(p.children) &&
          p.children.some(c => c.className === this.selectedClass)
        );
      }

      // Holat filtri (Faol / Nofaol / Kirgan / Kirmagan)
      if (this.selectedLoginStatus === "ACTIVE") {
        list = list.filter(p => p.isActive !== false);
      } else if (this.selectedLoginStatus === "INACTIVE") {
        list = list.filter(p => p.isActive === false);
      } else if (this.selectedLoginStatus === "LOGGED_IN") {
        list = list.filter(p => Boolean(p.lastLogin));
      } else if (this.selectedLoginStatus === "NEVER_LOGGED") {
        list = list.filter(p => !p.lastLogin);
      }

      // Sana filtri (Qo'shilgan sanasi bo'yicha)
      if (this.activeDateChip !== "ALL" || this.dateFrom || this.dateTo) {
        list = list.filter(p => this.matchesDateFilter(p.createdAt));
      }

      // Saralash
      list.sort((a, b) => {
        const nameA = (a.fullName || "").toLowerCase();
        const nameB = (b.fullName || "").toLowerCase();
        return this.sortOrder === "asc"
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      });

      return list;
    },
    isFiltered() {
      return (
        this.searchQuery.trim() !== "" ||
        this.selectedClass !== "ALL" ||
        this.selectedLoginStatus !== "ALL" ||
        this.activeDateChip !== "ALL" ||
        this.dateFrom !== "" ||
        this.dateTo !== "" ||
        this.showArchiveOnly
      );
    },
    loggedInCount() {
      return this.parentsList.filter(p => Boolean(p.lastLogin)).length;
    },
    neverLoggedCount() {
      return this.parentsList.filter(p => !p.lastLogin).length;
    },
    activeParentsCount() {
      return this.parentsList.filter(p => p.isActive !== false && p.status !== "archived").length;
    },
    inactiveParentsCount() {
      return this.parentsList.filter(p => p.isActive === false && p.status !== "archived").length;
    },
    activeSelectedParentsCount() {
      return this.parentsList.filter(p => this.selectedParentIds.includes(p.id) && p.isActive !== false).length;
    },
    inactiveSelectedParentsCount() {
      return this.parentsList.filter(p => this.selectedParentIds.includes(p.id) && p.isActive === false).length;
    }
  },
  created() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      this.parentsList = loadSchoolParents();
      this.availableStudents = loadSchoolStudents();
    },
    getInitials(name) {
      if (!name) return "OT";
      const parts = name.trim().split(" ");
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name.slice(0, 2).toUpperCase();
    },
    toggleArchiveFilter() {
      this.showArchiveOnly = !this.showArchiveOnly;
      this.currentPage = 1;
    },
    resetAllFilters() {
      this.searchQuery = "";
      this.selectedClass = "ALL";
      this.selectedLoginStatus = "ALL";
      this.activeDateChip = "ALL";
      this.dateFrom = "";
      this.dateTo = "";
      this.showArchiveOnly = false;
      this.currentPage = 1;
    },
    setDateChip(chipId) {
      this.activeDateChip = chipId;
      const today = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      const fmt = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

      if (chipId === "TODAY") {
        this.dateFrom = fmt(today);
        this.dateTo = fmt(today);
      } else if (chipId === "YESTERDAY") {
        const y = new Date();
        y.setDate(y.getDate() - 1);
        this.dateFrom = fmt(y);
        this.dateTo = fmt(y);
      } else if (chipId === "7DAYS") {
        const past = new Date();
        past.setDate(past.getDate() - 6);
        this.dateFrom = fmt(past);
        this.dateTo = fmt(today);
      } else if (chipId === "MONTH") {
        const first = new Date(today.getFullYear(), today.getMonth(), 1);
        const last = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        this.dateFrom = fmt(first);
        this.dateTo = fmt(last);
      } else if (chipId === "YEAR") {
        const first = new Date(today.getFullYear(), 0, 1);
        this.dateFrom = fmt(first);
        this.dateTo = fmt(today);
      } else if (chipId === "ALL") {
        this.dateFrom = "";
        this.dateTo = "";
      }
      this.currentPage = 1;
    },
    onCustomDateChange() {
      this.activeDateChip = "CUSTOM";
      this.currentPage = 1;
    },
    handleDateRangePickerChange(payload) {
      this.dateFrom = payload.start;
      this.dateTo = payload.end;
      if (payload.rangeKey && payload.rangeKey !== "custom") {
        const keyMap = {
          today: "TODAY",
          yesterday: "YESTERDAY",
          "7days": "7DAYS",
          month: "MONTH",
          this_month: "MONTH",
          year: "YEAR",
          all: "ALL",
        };
        this.activeDateChip = keyMap[payload.rangeKey] || "CUSTOM";
      } else if (payload.start || payload.end) {
        this.activeDateChip = "CUSTOM";
      } else {
        this.activeDateChip = "ALL";
      }
      this.currentPage = 1;
    },
    matchesDateFilter(dateStr) {
      if (!dateStr) return true;
      if (this.dateFrom && dateStr < this.dateFrom) return false;
      if (this.dateTo && dateStr > this.dateTo) return false;
      return true;
    },
    copyToClipboard(text) {
      if (!text) return;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
      }
      if (this.$toast) {
        this.$toast.success("Login nusxalandi: " + text);
      }
    },

    // 1. Yangi ota-ona
    openCreateModal() {
      this.newParentForm = {
        fullName: "",
        phone: "+998 ",
        telegram: "",
        login: "",
        password: this.generateRandomPasswordString(),
        selectedStudentId: ""
      };
      this.formErrors = {};
      this.$refs.createModal.open();
    },
    clearFieldError(field) {
      if (this.formErrors[field]) {
        delete this.formErrors[field];
      }
    },
    onPhoneInput() {
      this.newParentForm.phone = formatPhone(this.newParentForm.phone);
      this.clearFieldError("phone");
    },
    autoGenerateLogin() {
      this.newParentForm.login = generateLoginFromName(this.newParentForm.fullName);
      if (this.formErrors.fullName) delete this.formErrors.fullName;
      if (this.formErrors.login) delete this.formErrors.login;
    },
    generateRandomPassword() {
      this.newParentForm.password = this.generateRandomPasswordString();
    },
    generateRandomPasswordString() {
      const chars = "abcdefghjkmnpqrstuvwxyz23456789";
      let pwd = "";
      for (let i = 0; i < 8; i++) {
        pwd += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return pwd;
    },
    saveNewParent() {
      // Markazlashtirilgan validatsiya
      const validation = validateForm(this.newParentForm, parentValidationRules);
      if (!validation.isValid) {
        this.formErrors = validation.errors;
        if (this.$toast) {
          this.$toast.error(
            validation.firstError || "Iltimos, maydonlarni to'g'ri to'ldiring!",
            "Validatsiya xatosi"
          );
        }
        return;
      }

      const children = [];
      if (this.newParentForm.selectedStudentId) {
        const found = this.availableStudents.find(s => s.id === this.newParentForm.selectedStudentId);
        if (found) {
          children.push({
            id: found.id,
            name: found.fullName,
            className: found.className
          });
        }
      }

      addSchoolParent({
        fullName: this.newParentForm.fullName,
        phone: this.newParentForm.phone,
        telegram: this.newParentForm.telegram,
        login: this.newParentForm.login,
        children
      });

      this.fetchData();
      this.$refs.createModal.close();
      if (this.$toast) {
        this.$toast.success("Yangi ota-ona muvaffaqiyatli qo'shildi!");
      }
    },

    // 2. Farzand biriktirish
    openAttachChildModal(parent) {
      this.targetParentForChild = parent;
      this.selectedChildToAttach = "";
      this.$refs.attachChildModal.open();
    },
    submitAttachChild() {
      if (!this.targetParentForChild || !this.selectedChildToAttach) return;
      const student = this.availableStudents.find(s => s.id === this.selectedChildToAttach);
      if (student) {
        linkChildToParent(this.targetParentForChild.id, {
          id: student.id,
          name: student.fullName,
          className: student.className
        });
        this.fetchData();
        this.$refs.attachChildModal.close();
        if (this.$toast) {
          this.$toast.success(`«${student.fullName}» farzand sifatida biriktirildi!`);
        }
      }
    },
    confirmUnlinkChild(parent, child) {
      this.childToUnlink = { parent, child };
      this.$refs.unlinkConfirmModal.open();
    },
    executeUnlinkChild() {
      if (this.childToUnlink) {
        unlinkChildFromParent(this.childToUnlink.parent.id, this.childToUnlink.child.name);
        this.fetchData();
        this.childToUnlink = null;
        if (this.$toast) {
          this.$toast.info("Farzand ota-onadan ajratildi.");
        }
      }
    },

    // 3. SMS yuborish
    openSmsModal(parent) {
      this.smsTargetParent = parent;
      this.smsMessageText = "";
      this.$refs.smsModal.open();
    },
    openBulkSmsModal() {
      this.smsTargetParent = null;
      this.smsMessageText = "";
      this.$refs.smsModal.open();
    },
    applySmsTemplate(type) {
      if (type === "payment") {
        this.smsMessageText = "Hurmatli ota-ona! Farzandingizning o'quv to'lovi bo'yicha hisobingizni tekshirishingizni so'raymiz. To'lov haqida ma'lumot shaxsiy kabinetingizda mavjud.";
      } else if (type === "meeting") {
        this.smsMessageText = "Hurmatli ota-ona! Ertaga soat 17:00 da umumiy ota-onalar majlisi bo'lib o'tadi. Barcha ota-onalarning ishtirok etishi shart.";
      } else if (type === "credentials") {
        const login = this.smsTargetParent ? this.smsTargetParent.login : "loginingiz";
        this.smsMessageText = `Hurmatli ota-ona! Shaxsiy kabinetga kirish uchun login: ${login}. Parolni unutgan bo'lsangiz ma'muriyatga murojaat qiling.`;
      }
    },
    sendSms() {
      if (this.smsTargetParent) {
        this.$refs.smsModal.close();
        if (this.$toast) {
          this.$toast.success(`«${this.smsTargetParent.fullName}» ga SMS muvaffaqiyatli yuborildi!`);
        }
        return;
      }

      // Ommaviy SMS yuborish
      const selectedParents = this.parentsList.filter(p => this.selectedParentIds.includes(p.id));
      let recipients = selectedParents;
      let skippedCount = 0;

      if (this.smsOnlyActiveParents) {
        recipients = selectedParents.filter(p => p.isActive !== false);
        skippedCount = selectedParents.length - recipients.length;
      }

      this.$refs.smsModal.close();
      if (this.$toast) {
        if (skippedCount > 0) {
          this.$toast.success(
            `${recipients.length} nafar faol ota-onaga SMS yuborildi. ${skippedCount} ta nofaol hisob chetlab o'tildi.`
          );
        } else {
          this.$toast.success(`${recipients.length} nafar ota-onaga SMS muvaffaqiyatli yuborildi!`);
        }
      }
    },

    // 4. Parolni qayta tiklash
    openResetPasswordModal(parent) {
      this.targetParentForPassword = parent;
      this.generatedTempPassword = this.generateRandomPasswordString();
      this.$refs.resetPasswordModal.open();
    },
    sendNewPasswordViaSms() {
      this.$refs.resetPasswordModal.close();
      if (this.$toast) {
        this.$toast.success(`Yangi parol ${this.targetParentForPassword.phone} raqamiga SMS orqali yuborildi!`);
      }
    },

    // 5. O'chirish
    confirmDeleteParent(parent) {
      this.parentToDelete = parent;
      this.$refs.deleteConfirmModal.open();
    },
    executeDeleteParent() {
      if (this.parentToDelete) {
        deleteSchoolParent(this.parentToDelete.id);
        this.fetchData();
        this.parentToDelete = null;
        if (this.$toast) {
          this.$toast.error("Ota-ona muvaffaqiyatli o'chirildi.");
        }
      }
    },
    confirmBulkDelete() {
      this.$refs.bulkDeleteConfirmModal.open();
    },
    executeBulkDelete() {
      const current = loadSchoolParents();
      const idsSet = new Set(this.selectedParentIds);
      const remaining = current.filter(p => !idsSet.has(p.id));
      saveSchoolParents(remaining);
      this.selectedParentIds = [];
      this.fetchData();
      if (this.$toast) {
        this.$toast.error("Tanlangan barcha ota-onalar o'chirildi.");
      }
    },
    toggleParentActive(parent) {
      const newActive = !parent.isActive;
      parent.isActive = newActive;
      const idx = this.parentsList.findIndex(p => p.id === parent.id);
      if (idx !== -1) {
        this.parentsList[idx].isActive = newActive;
        this.parentsList = [...this.parentsList];
      }
      updateSchoolParent(parent.id, { isActive: newActive });
      if (this.$toast) {
        this.$toast.success(
          newActive
            ? `«${parent.fullName}» faollashtirildi`
            : `«${parent.fullName}» nofaol holatga o'tkazildi`
        );
      }
    }
  }
};
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.15s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.98) translateY(-4px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
