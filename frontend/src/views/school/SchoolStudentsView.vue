<template>
  <div class="school-students-page p-4 font-lexend space-y-5">
    <!-- 1. Breadcrumb -->
    <Breadcrumb
      :items="[
        { title: 'Bosh sahifa', to: '/' },
        { title: 'Ta\'lim', to: '/school/classes' },
        { title: 'O\'quvchilar' }
      ]"
    />

    <!-- 2. Header Section -->
    <div class="flex items-center justify-between flex-wrap gap-4">
      <div class="flex items-center gap-3 flex-wrap">
        <PageTitle size="md">
          O'quvchilar
        </PageTitle>
      </div>

      <!-- Action Buttons (Export va Yangi o'quvchi) -->
      <div class="flex items-center gap-2.5 flex-wrap">
        <!-- Export tugmasi -->
        <AppButton
          variant="outline"
          icon="solar:export-linear"
          @click="exportToExcel"
        >
          Export
        </AppButton>

        <!-- Yangi o'quvchi -->
        <AppButton
          variant="primary"
          icon="solar:user-plus-bold"
          @click="openCreateModal"
        >
          Yangi o'quvchi
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
            @click="setDateRangeChip(chip.id)"
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
        :start-date="customDateFrom"
        :end-date="customDateTo"
        align="right"
        @update:startDate="val => { customDateFrom = val; onCustomDateChange(); }"
        @update:endDate="val => { customDateTo = val; onCustomDateChange(); }"
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
            placeholder="F.I.SH, telefon bo'yicha qidirish..."
            class="w-full pl-9 pr-3.5 h-9 sm:h-9.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 placeholder-gray-400 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition shadow-2xs"
          />
        </div>

        <!-- 1. Sinf Dropdown -->
        <AppFilterDropdown
          v-model="selectedClass"
          :options="classOptions"
          label="Sinf"
          all-label="Barcha sinflar"
          all-value="ALL"
          icon="solar:users-group-rounded-bold"
          min-width="min-w-[190px]"
          @change="currentPage = 1"
        />

        <!-- 2. Bosqich Dropdown (O'quvchi, Sinov, Lid) -->
        <AppFilterDropdown
          v-model="selectedStage"
          :options="stageOptions"
          label="Bosqich"
          all-label="Barchasi"
          all-value="ALL"
          icon="solar:user-bold"
          min-width="min-w-[180px]"
          @change="currentPage = 1"
        />

        <!-- 3. To'lov holati Dropdown -->
        <AppFilterDropdown
          v-model="selectedDebtFilter"
          :options="debtOptions"
          label="To'lov"
          all-label="Barchasi"
          all-value="ALL"
          icon="solar:wallet-money-bold"
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

      <!-- Tezkor ko'rsatkichlar -->
      <div class="flex items-center gap-2 text-xs">
        <span class="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800">
          Qarzsiz: <b>{{ paidCount }}</b>
        </span>
        <span class="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800">
          Qarzdorlar: <b>{{ debtCount }}</b>
        </span>
      </div>
    </div>

    <!-- 5. Yagona Universal AppTable Komponenti -->
    <AppTable
      :columns="tableColumns"
      :data="filteredStudents"
      :selectable="true"
      v-model="selectedStudentIds"
      :per-page="perPage"
      item-label="o'quvchi"
      empty-text="O'quvchilar topilmadi"
      empty-description="Qidiruv yoki filtrlar bo'yicha o'quvchilar topilmadi"
    >
      <!-- Ommaviy amallar sloti -->
      <template #bulkActions>
        <button
          type="button"
          @click="handleBulkSms"
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

      <!-- O'quvchi F.I.SH (Universal AppUserCell - 1-rasm standarti) -->
      <template #cell(fullName)="{ row: st }">
        <AppUserCell
          :name="st.fullName"
          :image="st.avatar"
          :subtitle="'ID: ' + st.studentId"
          :to="'/students/' + st.id"
        />
      </template>

      <!-- Sinf (Universal AppGroupBadge) -->
      <template #cell(className)="{ row: st }">
        <div class="text-center">
          <AppGroupBadge :name="st.className" />
        </div>
      </template>

      <!-- Bosqich (Universal AppStatusBadge) -->
      <template #cell(stage)="{ row: st }">
        <div class="text-center">
          <AppStatusBadge :status="st.stage" />
        </div>
      </template>

      <!-- Telefon (Universal AppPhoneCell) -->
      <template #cell(phone)="{ row: st }">
        <AppPhoneCell :phone="st.phone" />
      </template>

      <!-- Oylik to'lov (Universal AppMoneyCell) -->
      <template #cell(monthlyFee)="{ row: st }">
        <AppMoneyCell :amount="st.monthlyFee" align="right" />
      </template>

      <!-- Qarz (Universal AppMoneyCell - debt rejimi) -->
      <template #cell(debt)="{ row: st }">
        <AppMoneyCell :amount="st.debt" type="debt" align="right" />
      </template>

      <!-- Amallar -->
      <template #actions="{ row: st }">
        <div class="space-x-1 whitespace-nowrap text-right">
          <!-- Profil ko'rish -->
          <router-link
            :to="'/students/' + st.id"
            class="w-8 h-8 rounded-lg inline-flex items-center justify-center border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition shadow-2xs cursor-pointer"
            title="O'quvchi profili"
          >
            <Icon icon="solar:eye-linear" class="text-base" />
          </router-link>

          <!-- To'lov qabul qilish -->
          <button
            type="button"
            @click="openPaymentModal(st)"
            class="w-8 h-8 rounded-lg inline-flex items-center justify-center border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition shadow-2xs cursor-pointer"
            title="To'lov qabul qilish"
          >
            <Icon icon="solar:card-2-bold" class="text-base" />
          </button>

          <!-- Tahrirlash -->
          <button
            type="button"
            @click="openEditModal(st)"
            class="w-8 h-8 rounded-lg inline-flex items-center justify-center border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/70 dark:hover:bg-blue-950/40 transition shadow-2xs cursor-pointer"
            title="Tahrirlash"
          >
            <Icon icon="solar:pen-new-square-linear" class="text-base" />
          </button>

          <!-- O'chirish -->
          <button
            type="button"
            @click="confirmDelete(st)"
            class="w-8 h-8 rounded-lg inline-flex items-center justify-center border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-400 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50/70 dark:hover:bg-rose-950/40 transition shadow-2xs cursor-pointer"
            title="O'chirish"
          >
            <Icon icon="solar:trash-bin-2-linear" class="text-base" />
          </button>
        </div>
      </template>
    </AppTable>

    <!-- 7. Yangi o'quvchi qo'shish modal oynasi -->
    <vmodal
      ref="createModal"
      title="Yangi o'quvchi qo'shish"
      width="max-w-xl"
      hide-button
      hide-footer
    >
      <template v-slot:body>
        <form @submit.prevent="saveCreateForm" novalidate class="space-y-4 text-left text-xs sm:text-sm">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="sm:col-span-2">
              <label class="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                O'quvchi F.I.SH <span class="text-rose-500">*</span>
              </label>
              <input
                type="text"
                v-model="studentForm.fullName"
                @input="clearCreateError('fullName')"
                placeholder="Masalan: Abdullayev Bekzod Jasur o'g'li"
                :class="[
                  'w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none transition',
                  createErrors.fullName ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-gray-300 dark:border-gray-600 focus:border-primary'
                ]"
              />
              <FormFieldError :error="createErrors.fullName" />
            </div>

            <div>
              <label class="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                Sinf <span class="text-rose-500">*</span>
              </label>
              <select
                v-model="studentForm.className"
                @change="clearCreateError('className')"
                :class="[
                  'w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none transition',
                  createErrors.className ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-gray-300 dark:border-gray-600 focus:border-primary'
                ]"
              >
                <option v-for="c in classNamesList" :key="c" :value="c">{{ c }}</option>
              </select>
              <FormFieldError :error="createErrors.className" />
            </div>

            <div>
              <label class="block font-bold text-gray-700 dark:text-gray-300 mb-1">Bosqich</label>
              <select
                v-model="studentForm.stage"
                class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none"
              >
                <option value="O'quvchi">O'quvchi</option>
                <option value="Sinov">Sinov</option>
                <option value="Lid">Lid</option>
              </select>
            </div>

            <div>
              <label class="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                Telefon raqam <span class="text-rose-500">*</span>
              </label>
              <input
                type="text"
                v-model="studentForm.phone"
                @input="onPhoneInput('studentForm', 'phone')"
                placeholder="+998 (90) 123-45-67"
                :class="[
                  'w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none transition',
                  createErrors.phone ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-gray-300 dark:border-gray-600 focus:border-primary'
                ]"
              />
              <FormFieldError :error="createErrors.phone" />
            </div>

            <div>
              <label class="block font-bold text-gray-700 dark:text-gray-300 mb-1">Tug'ilgan sana</label>
              <input
                type="text"
                v-model="studentForm.birthDate"
                placeholder="15.04.2016"
                class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none focus:border-primary transition"
              />
            </div>

            <div>
              <label class="block font-bold text-gray-700 dark:text-gray-300 mb-1">Ota-onasi F.I.SH</label>
              <input
                type="text"
                v-model="studentForm.parentName"
                @input="clearCreateError('parentName')"
                placeholder="Abdullayev Sobir"
                :class="[
                  'w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none transition',
                  createErrors.parentName ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-gray-300 dark:border-gray-600 focus:border-primary'
                ]"
              />
              <FormFieldError :error="createErrors.parentName" />
            </div>

            <div>
              <label class="block font-bold text-gray-700 dark:text-gray-300 mb-1">Ota-onasi telefoni</label>
              <input
                type="text"
                v-model="studentForm.parentPhone"
                @input="onPhoneInput('studentForm', 'parentPhone')"
                placeholder="+998 (90) 064-38-80"
                :class="[
                  'w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none transition',
                  createErrors.parentPhone ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-gray-300 dark:border-gray-600 focus:border-primary'
                ]"
              />
              <FormFieldError :error="createErrors.parentPhone" />
            </div>

            <div>
              <label class="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                Oylik to'lov (so'm) <span class="text-rose-500">*</span>
              </label>
              <input
                type="number"
                v-model.number="studentForm.monthlyFee"
                @input="clearCreateError('monthlyFee')"
                min="0"
                step="100000"
                :class="[
                  'w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none transition',
                  createErrors.monthlyFee ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-gray-300 dark:border-gray-600 focus:border-primary'
                ]"
              />
              <FormFieldError :error="createErrors.monthlyFee" />
            </div>

            <div>
              <label class="block font-bold text-gray-700 dark:text-gray-300 mb-1">Boshlang'ich qarz (so'm)</label>
              <input
                type="number"
                v-model.number="studentForm.debt"
                @input="clearCreateError('debt')"
                min="0"
                step="100000"
                placeholder="0"
                :class="[
                  'w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none transition',
                  createErrors.debt ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-gray-300 dark:border-gray-600 focus:border-primary'
                ]"
              />
              <FormFieldError :error="createErrors.debt" />
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
              Saqlash
            </AppButton>
          </div>
        </form>
      </template>
    </vmodal>

    <!-- 8. To'lov qabul qilish modal oynasi -->
    <vmodal
      ref="paymentModal"
      title="To'lov qabul qilish"
      width="max-w-md"
      hide-button
      hide-footer
    >
      <template v-slot:body>
        <form @submit.prevent="submitPaymentForm" novalidate class="space-y-4 text-left text-xs sm:text-sm">
          <div v-if="selectedStudentForPayment" class="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg space-y-1">
            <div class="font-bold text-gray-900 dark:text-white text-sm">
              {{ selectedStudentForPayment.fullName }}
            </div>
            <div class="text-xs text-gray-500 flex items-center justify-between">
              <span>Sinf: {{ selectedStudentForPayment.className }}</span>
              <span class="text-red-500 font-semibold">Qarz: {{ formatSum(selectedStudentForPayment.debt) }}</span>
            </div>
          </div>

          <div>
            <label class="block font-bold text-gray-700 dark:text-gray-300 mb-1">
              To'lov summasi (so'm) <span class="text-rose-500">*</span>
            </label>
            <input
              type="number"
              v-model.number="paymentForm.amount"
              @input="clearPaymentError('amount')"
              min="1000"
              step="50000"
              placeholder="Masalan: 3 700 000"
              :class="[
                'w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none transition',
                paymentErrors.amount ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-gray-300 dark:border-gray-600 focus:border-primary'
              ]"
            />
            <FormFieldError :error="paymentErrors.amount" />
          </div>

          <div>
            <label class="block font-bold text-gray-700 dark:text-gray-300 mb-1">
              To'lov usuli <span class="text-rose-500">*</span>
            </label>
            <select
              v-model="paymentForm.paymentMethod"
              @change="clearPaymentError('paymentMethod')"
              :class="[
                'w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none transition',
                paymentErrors.paymentMethod ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-gray-300 dark:border-gray-600'
              ]"
            >
              <option value="Naqd">Naqd pul</option>
              <option value="Karta (Terminal)">Karta (Terminal / Uzcard / Humo)</option>
              <option value="Click / Payme">Click / Payme / Uzum</option>
              <option value="Bank o'tkazmasi">Bank o'tkazmasi (Hisob raqam)</option>
            </select>
            <FormFieldError :error="paymentErrors.paymentMethod" />
          </div>

          <div>
            <label class="block font-bold text-gray-700 dark:text-gray-300 mb-1">Izoh / Kvitansiya raqami</label>
            <input
              type="text"
              v-model="paymentForm.receiptNumber"
              placeholder="Kv-48921"
              class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none focus:border-primary transition"
            />
          </div>

          <div class="flex items-center justify-end gap-2 pt-4 border-t dark:border-gray-700">
            <AppButton
              type="button"
              variant="outline"
              @click="$refs.paymentModal.close()"
            >
              Bekor qilish
            </AppButton>
            <AppButton
              type="submit"
              variant="primary"
              icon="solar:card-2-bold"
            >
              To'lovni tasdiqlash
            </AppButton>
          </div>
        </form>
      </template>
    </vmodal>

    <!-- 9. Tahrirlash modal oynasi -->
    <vmodal
      ref="editModal"
      title="O'quvchi ma'lumotlarini tahrirlash"
      width="max-w-xl"
      hide-button
      hide-footer
    >
      <template v-slot:body>
        <form @submit.prevent="saveEditForm" novalidate class="space-y-4 text-left text-xs sm:text-sm">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="sm:col-span-2">
              <label class="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                O'quvchi F.I.SH <span class="text-rose-500">*</span>
              </label>
              <input
                type="text"
                v-model="editForm.fullName"
                @input="clearEditError('fullName')"
                :class="[
                  'w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none transition',
                  editErrors.fullName ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-gray-300 dark:border-gray-600 focus:border-primary'
                ]"
              />
              <FormFieldError :error="editErrors.fullName" />
            </div>

            <div>
              <label class="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                Sinf <span class="text-rose-500">*</span>
              </label>
              <select
                v-model="editForm.className"
                @change="clearEditError('className')"
                :class="[
                  'w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none transition',
                  editErrors.className ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-gray-300 dark:border-gray-600'
                ]"
              >
                <option v-for="c in classNamesList" :key="c" :value="c">{{ c }}</option>
              </select>
              <FormFieldError :error="editErrors.className" />
            </div>

            <div>
              <label class="block font-bold text-gray-700 dark:text-gray-300 mb-1">Bosqich</label>
              <select
                v-model="editForm.stage"
                class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none"
              >
                <option value="O'quvchi">O'quvchi</option>
                <option value="Sinov">Sinov</option>
                <option value="Lid">Lid</option>
              </select>
            </div>

            <div>
              <label class="block font-bold text-gray-700 dark:text-gray-300 mb-1">Telefon</label>
              <input
                type="text"
                v-model="editForm.phone"
                @input="onPhoneInput('editForm', 'phone')"
                :class="[
                  'w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none transition',
                  editErrors.phone ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-gray-300 dark:border-gray-600 focus:border-primary'
                ]"
              />
              <FormFieldError :error="editErrors.phone" />
            </div>

            <div>
              <label class="block font-bold text-gray-700 dark:text-gray-300 mb-1">Oylik to'lov (so'm)</label>
              <input
                type="number"
                v-model.number="editForm.monthlyFee"
                @input="clearEditError('monthlyFee')"
                min="0"
                step="100000"
                :class="[
                  'w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none transition',
                  editErrors.monthlyFee ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-gray-300 dark:border-gray-600 focus:border-primary'
                ]"
              />
              <FormFieldError :error="editErrors.monthlyFee" />
            </div>

            <div>
              <label class="block font-bold text-gray-700 dark:text-gray-300 mb-1">Qarz summasi (so'm)</label>
              <input
                type="number"
                v-model.number="editForm.debt"
                @input="clearEditError('debt')"
                min="0"
                step="100000"
                :class="[
                  'w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none transition',
                  editErrors.debt ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-gray-300 dark:border-gray-600 focus:border-primary'
                ]"
              />
              <FormFieldError :error="editErrors.debt" />
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-4 border-t dark:border-gray-700">
            <AppButton
              type="button"
              variant="outline"
              @click="$refs.editModal.close()"
            >
              Bekor qilish
            </AppButton>
            <AppButton
              type="submit"
              variant="primary"
              icon="solar:check-circle-bold"
            >
              O'zgarishlarni saqlash
            </AppButton>
          </div>
        </form>
      </template>
    </vmodal>

    <!-- 10. Standart AppConfirmModal - Yakkama-yakka o'chirish -->
    <AppConfirmModal
      ref="deleteConfirmModal"
      title="O'quvchini o'chirish"
      :message="studentToDelete ? '«' + studentToDelete.fullName + '» o\'quvchisini ro\'yxatdan o\'chirishni tasdiqlaysizmi?' : ''"
      confirm-text="Tasdiqlash va O'chirish"
      variant="danger"
      @confirm="executeDeleteStudent"
    />

    <!-- 11. Standart AppConfirmModal - Ommaviy o'chirish -->
    <AppConfirmModal
      ref="bulkDeleteConfirmModal"
      title="Tanlangan o'quvchilarni o'chirish"
      :message="'Tanlangan ' + selectedStudentIds.length + ' nafar o\'quvchini ro\'yxatdan o\'chirishni tasdiqlaysizmi?'"
      confirm-text="Barchasini O'chirish"
      variant="danger"
      @confirm="executeBulkDelete"
    />
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";
import Breadcrumb from "@/components/Breadcrumb.vue";
import PageTitle from "@/components/common/PageTitle.vue";
import AppButton from "@/components/AppButton.vue";
import AppTable from "@/components/AppTable.vue";
import AppFilterDropdown from "@/components/AppFilterDropdown.vue";
import AppConfirmModal from "@/components/common/AppConfirmModal.vue";
import FormDatePicker from "@/components/FormDatePicker.vue";
import vmodal from "@/components/modal.vue";
import {
  loadSchoolStudents,
  saveSchoolStudents,
  addSchoolStudent,
  updateSchoolStudent,
  deleteSchoolStudent,
  recordStudentPayment
} from "@/api/schoolStudentsData";
import { validateForm, rules, formatPhone } from "@/utils/validators";

export default {
  name: "SchoolStudentsView",
  components: {
    Icon,
    Breadcrumb,
    PageTitle,
    AppButton,
    AppTable,
    AppFilterDropdown,
    AppConfirmModal,
    FormDatePicker,
    vmodal
  },
  data() {
    const now = new Date();
    return {
      tableColumns: [
        { key: "fullName", label: "O'quvchi (F.I.SH)", sortable: true },
        { key: "className", label: "Sinf", align: "center", thClass: "py-3.5 px-4 text-center whitespace-nowrap" },
        { key: "stage", label: "Bosqich", align: "center", thClass: "py-3.5 px-4 text-center whitespace-nowrap" },
        { key: "phone", label: "Telefon", thClass: "py-3.5 px-4 whitespace-nowrap" },
        { key: "monthlyFee", label: "Oylik to'lov", align: "right", thClass: "py-3.5 px-4 text-right whitespace-nowrap" },
        { key: "debt", label: "Qarz", align: "right", thClass: "py-3.5 px-4 text-right whitespace-nowrap" },
      ],
      studentsList: [],
      searchQuery: "",
      selectedClass: "ALL",
      selectedStage: "ALL",
      selectedDebtFilter: "ALL",

      // Validation errors
      createErrors: {},
      paymentErrors: {},
      editErrors: {},

      // Date Filters & Chips
      activeDateChip: "ALL",
      customDateFrom: "",
      customDateTo: "",
      dateChips: [
        { id: "TODAY", label: "Bugun" },
        { id: "YESTERDAY", label: "Kecha" },
        { id: "7DAYS", label: "7 kun" },
        { id: "MONTH", label: "Oy" },
        { id: "YEAR", label: "Yil" },
        { id: "ALL", label: "Barchasi" },
      ],



      // Pagination & Sorting
      currentPage: 1,
      perPage: 10,
      sortOrder: "asc",

      // Bulk selections
      selectedStudentIds: [],

      // Target student for deletion
      studentToDelete: null,

      // Target student for payment
      selectedStudentForPayment: null,
      paymentForm: {
        amount: 0,
        paymentMethod: "Naqd",
        receiptNumber: ""
      },

      // Create student form
      studentForm: {
        fullName: "",
        className: "2-A",
        stage: "O'quvchi",
        phone: "+998 ",
        birthDate: "",
        parentName: "",
        parentPhone: "+998 ",
        monthlyFee: 4700000,
        debt: 0
      },

      // Edit form
      editForm: {
        id: "",
        fullName: "",
        className: "",
        stage: "",
        phone: "",
        monthlyFee: 0,
        debt: 0
      },

      classNamesList: [
        "1-A", "1-B", "2-A", "2-B", "3-A", "3-B",
        "4-A", "4-B", "5-A", "5-B", "6-A", "6-B",
        "7-A", "8-A", "9-A", "10-A", "11-A"
      ]
    };
  },
  computed: {
    classOptions() {
      return this.classNamesList;
    },
    stageOptions() {
      return ["O'quvchi", "Sinov", "Lid"];
    },
    debtOptions() {
      return [
        { label: "Qarzdorlar", value: "DEBT" },
        { label: "Qarzsiz (0 so'm)", value: "PAID" },
      ];
    },
    isFiltered() {
      return (
        this.searchQuery.trim() !== "" ||
        this.selectedClass !== "ALL" ||
        this.selectedStage !== "ALL" ||
        this.selectedDebtFilter !== "ALL" ||
        this.activeDateChip !== "ALL" ||
        this.customDateFrom !== "" ||
        this.customDateTo !== ""
      );
    },
    filteredStudents() {
      let list = [...this.studentsList];

      // 1. Qidiruv (F.I.SH, telefon, ID)
      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase().trim();
        list = list.filter(s =>
          (s.fullName && s.fullName.toLowerCase().includes(q)) ||
          (s.studentId && s.studentId.includes(q)) ||
          (s.phone && s.phone.replace(/\D/g, "").includes(q.replace(/\D/g, "")))
        );
      }

      // 2. Sinf filtri
      if (this.selectedClass !== "ALL") {
        list = list.filter(s => s.className === this.selectedClass);
      }

      // 3. Bosqich filtri
      if (this.selectedStage !== "ALL") {
        list = list.filter(s => s.stage === this.selectedStage);
      }

      // 4. To'lov filtri
      if (this.selectedDebtFilter === "DEBT") {
        list = list.filter(s => (s.debt || 0) > 0);
      } else if (this.selectedDebtFilter === "PAID") {
        list = list.filter(s => !s.debt || s.debt === 0);
      }

      // 5. Sana filtri
      if (this.activeDateChip !== "ALL" || this.customDateFrom || this.customDateTo) {
        list = list.filter(s => this.matchesDateFilter(s.createdAt));
      }



      return list;
    },
    paidCount() {
      return this.studentsList.filter(s => !s.debt || s.debt === 0).length;
    },
    debtCount() {
      return this.studentsList.filter(s => (s.debt || 0) > 0).length;
    },
  },
  created() {
    this.fetchStudents();
  },

  methods: {
    fetchStudents() {
      this.studentsList = loadSchoolStudents();
    },
    formatSum(amount) {
      if (!amount && amount !== 0) return "0 so'm";
      const num = Math.round(Number(amount));
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " so'm";
    },
    getInitials(name) {
      if (!name) return "OQ";
      const parts = name.trim().split(" ");
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name.slice(0, 2).toUpperCase();
    },

    onCustomDateChange() {
      this.activeDateChip = "CUSTOM";
      this.currentPage = 1;
    },
    handleDateRangePickerChange(payload) {
      this.customDateFrom = payload.start;
      this.customDateTo = payload.end;
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
    setDateRangeChip(chipId) {
      this.activeDateChip = chipId;
      const today = new Date();
      const formatYMD = d => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return y + "-" + m + "-" + day;
      };

      if (chipId === "TODAY") {
        this.customDateFrom = formatYMD(today);
        this.customDateTo = formatYMD(today);
      } else if (chipId === "YESTERDAY") {
        const y = new Date();
        y.setDate(y.getDate() - 1);
        this.customDateFrom = formatYMD(y);
        this.customDateTo = formatYMD(y);
      } else if (chipId === "7DAYS") {
        const past = new Date();
        past.setDate(past.getDate() - 7);
        this.customDateFrom = formatYMD(past);
        this.customDateTo = formatYMD(today);
      } else if (chipId === "MONTH") {
        const first = new Date(today.getFullYear(), today.getMonth(), 1);
        this.customDateFrom = formatYMD(first);
        this.customDateTo = formatYMD(today);
      } else if (chipId === "YEAR") {
        const first = new Date(today.getFullYear(), 0, 1);
        this.customDateFrom = formatYMD(first);
        this.customDateTo = formatYMD(today);
      } else if (chipId === "ALL") {
        this.customDateFrom = "";
        this.customDateTo = "";
      }
      this.currentPage = 1;
    },
    onCustomDateChange() {
      this.activeDateChip = "CUSTOM";
      this.currentPage = 1;
    },
    clearDateRange() {
      this.customDateFrom = "";
      this.customDateTo = "";
      this.activeDateChip = "ALL";
      this.currentPage = 1;
    },
    matchesDateFilter(dateStr) {
      if (!dateStr) return true;
      if (this.customDateFrom && dateStr < this.customDateFrom) return false;
      if (this.customDateTo && dateStr > this.customDateTo) return false;
      return true;
    },
    resetAllFilters() {
      this.searchQuery = "";
      this.selectedClass = "ALL";
      this.selectedStage = "ALL";
      this.selectedDebtFilter = "ALL";
      this.activeDateChip = "ALL";
      this.customDateFrom = "";
      this.customDateTo = "";
      this.currentPage = 1;
    },

    // Export amali
    exportToExcel() {
      if (this.filteredStudents.length === 0) {
        if (this.$toast) this.$toast.error("Export qilish uchun o'quvchilar mavjud emas");
        return;
      }

      const headers = ["F.I.SH", "Sinf", "Bosqich", "Telefon", "Ota-onasi", "Ota-onasi telefoni", "Oylik to'lov", "Qarz", "Qo'shilgan sana"];
      const rows = this.filteredStudents.map(s => [
        '"' + (s.fullName || "").replace(/"/g, '""') + '"',
        '"' + (s.className || "") + '"',
        '"' + (s.stage || "") + '"',
        '"' + (s.phone || "") + '"',
        '"' + (s.parentName || "").replace(/"/g, '""') + '"',
        '"' + (s.parentPhone || "") + '"',
        s.monthlyFee || 0,
        s.debt || 0,
        '"' + (s.createdAt || "") + '"'
      ]);

      const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "oquvchilar_royxati_" + new Date().toISOString().slice(0, 10) + ".csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (this.$toast) this.$toast.success("O'quvchilar ro'yxati muvaffaqiyatli export qilindi");
    },

    // Validation error clearing & formatting helpers
    clearCreateError(field) {
      if (this.createErrors && this.createErrors[field]) {
        delete this.createErrors[field];
      }
    },
    clearPaymentError(field) {
      if (this.paymentErrors && this.paymentErrors[field]) {
        delete this.paymentErrors[field];
      }
    },
    clearEditError(field) {
      if (this.editErrors && this.editErrors[field]) {
        delete this.editErrors[field];
      }
    },
    onPhoneInput(formName, field) {
      this[formName][field] = formatPhone(this[formName][field]);
      if (formName === "studentForm") {
        this.clearCreateError(field);
      } else if (formName === "editForm") {
        this.clearEditError(field);
      }
    },

    // Create modal
    openCreateModal() {
      this.createErrors = {};
      this.studentForm = {
        fullName: "",
        className: "2-A",
        stage: "O'quvchi",
        phone: "+998 ",
        birthDate: "",
        parentName: "",
        parentPhone: "+998 ",
        monthlyFee: 4700000,
        debt: 0
      };
      this.$refs.createModal.open();
    },
    saveCreateForm() {
      const validation = validateForm(this.studentForm, {
        fullName: [rules.required("O'quvchi F.I.SH"), rules.name("O'quvchi F.I.SH", 3)],
        className: [rules.required("Sinf")],
        phone: [rules.required("Telefon raqami"), rules.phone("Telefon raqami")],
        parentName: this.studentForm.parentName ? [rules.name("Ota-onasi F.I.SH", 3)] : [],
        parentPhone:
          this.studentForm.parentPhone &&
          this.studentForm.parentPhone.trim() !== "+998" &&
          this.studentForm.parentPhone.trim() !== "+998 "
            ? [rules.phone("Ota-onasi telefoni")]
            : [],
        monthlyFee: [rules.required("Oylik to'lov"), rules.positiveNumber("Oylik to'lov", 0)],
        debt: [rules.positiveNumber("Boshlang'ich qarz", 0)]
      });

      if (!validation.isValid) {
        this.createErrors = validation.errors;
        if (this.$toast) {
          this.$toast.error(validation.firstError || "Iltimos, maydonlarni to'g'ri to'ldiring");
        }
        return;
      }
      this.createErrors = {};

      const created = addSchoolStudent(this.studentForm);
      this.fetchStudents();
      this.$refs.createModal.close();
      if (this.$toast) this.$toast.success("«" + created.fullName + "» muvaffaqiyatli qo'shildi");
    },

    // Payment modal
    openPaymentModal(student) {
      this.selectedStudentForPayment = student;
      this.paymentErrors = {};
      this.paymentForm = {
        amount: student.debt > 0 ? student.debt : student.monthlyFee,
        paymentMethod: "Naqd",
        receiptNumber: "KV-" + Math.floor(10000 + Math.random() * 90000)
      };
      this.$refs.paymentModal.open();
    },
    submitPaymentForm() {
      if (!this.selectedStudentForPayment) return;

      const validation = validateForm(this.paymentForm, {
        amount: [rules.required("To'lov summasi"), rules.positiveNumber("To'lov summasi", 1000)],
        paymentMethod: [rules.required("To'lov usuli")]
      });

      if (!validation.isValid) {
        this.paymentErrors = validation.errors;
        if (this.$toast) {
          this.$toast.error(validation.firstError || "Iltimos, to'lov ma'lumotlarini to'g'ri kiriting");
        }
        return;
      }
      this.paymentErrors = {};

      const res = recordStudentPayment(
        this.selectedStudentForPayment.id,
        this.paymentForm.amount,
        this.paymentForm.paymentMethod
      );
      if (res.success) {
        this.fetchStudents();
        this.$refs.paymentModal.close();
        if (this.$toast) {
          this.$toast.success(
            "«" + this.selectedStudentForPayment.fullName + "» uchun " +
            this.formatSum(this.paymentForm.amount) + " to'lov muvaffaqiyatli qabul qilindi!"
          );
        }
      }
    },

    // Edit modal
    openEditModal(student) {
      this.editErrors = {};
      this.editForm = {
        id: student.id,
        fullName: student.fullName,
        className: student.className,
        stage: student.stage,
        phone: student.phone,
        monthlyFee: student.monthlyFee,
        debt: student.debt
      };
      this.$refs.editModal.open();
    },
    saveEditForm() {
      if (!this.editForm.id) return;

      const validation = validateForm(this.editForm, {
        fullName: [rules.required("O'quvchi F.I.SH"), rules.name("O'quvchi F.I.SH", 3)],
        className: [rules.required("Sinf")],
        phone:
          this.editForm.phone &&
          this.editForm.phone.trim() !== "+998" &&
          this.editForm.phone.trim() !== "+998 "
            ? [rules.phone("Telefon raqami")]
            : [],
        monthlyFee: [rules.positiveNumber("Oylik to'lov", 0)],
        debt: [rules.positiveNumber("Qarz summasi", 0)]
      });

      if (!validation.isValid) {
        this.editErrors = validation.errors;
        if (this.$toast) {
          this.$toast.error(validation.firstError || "Iltimos, maydonlarni to'g'ri to'ldiring");
        }
        return;
      }
      this.editErrors = {};

      updateSchoolStudent(this.editForm.id, {
        fullName: this.editForm.fullName,
        className: this.editForm.className,
        stage: this.editForm.stage,
        phone: this.editForm.phone,
        monthlyFee: this.editForm.monthlyFee,
        debt: this.editForm.debt
      });
      this.fetchStudents();
      this.$refs.editModal.close();
      if (this.$toast) this.$toast.success("O'quvchi ma'lumotlari yangilandi");
    },

    // Delete single student
    confirmDelete(student) {
      this.studentToDelete = student;
      this.$refs.deleteConfirmModal.open();
    },
    executeDeleteStudent() {
      if (this.studentToDelete) {
        deleteSchoolStudent(this.studentToDelete.id);
        this.fetchStudents();
        if (this.$toast) this.$toast.success("«" + this.studentToDelete.fullName + "» o'chirildi");
        this.studentToDelete = null;
      }
    },

    // Bulk actions
    handleBulkSms() {
      if (this.$toast) this.$toast.info(this.selectedStudentIds.length + " ta o'quvchiga SMS yuborish oynasi tayyorlanmoqda");
    },
    confirmBulkDelete() {
      this.$refs.bulkDeleteConfirmModal.open();
    },
    executeBulkDelete() {
      const remaining = this.studentsList.filter(s => !this.selectedStudentIds.includes(s.id));
      saveSchoolStudents(remaining);
      this.fetchStudents();
      if (this.$toast) this.$toast.success(this.selectedStudentIds.length + " ta o'quvchi o'chirildi");
      this.selectedStudentIds = [];
    }
  }
};
</script>

<style scoped>
.school-students-page {
  min-height: calc(100vh - 80px);
}
</style>
