<template>
  <div class="school-levels-page p-4 font-lexend space-y-5">
    <!-- 1. Breadcrumb -->
    <Breadcrumb
      :items="[
        { title: 'Bosh sahifa', to: '/' },
        { title: 'Ta\'lim', to: '/school/classes' },
        { title: 'Darajalar va to\'garaklar' },
      ]"
    />

    <!-- 2. Header Section (Oq fonsiz, toza header) -->
    <div class="flex items-center justify-between flex-wrap gap-4">
      <div class="flex items-center gap-3 flex-wrap">
        <PageTitle size="md"> Darajalar va to'garaklar </PageTitle>
      </div>

      <!-- Action Button -->
      <AppButton variant="primary" icon="solar:add-circle-bold" @click="openCreateModal">
        Yangi daraja guruhi
      </AppButton>
    </div>

    <!-- 3. Filters Bar -->
    <div
      class="bg-white dark:bg-gray-800 p-3 sm:p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xs flex items-center justify-between flex-wrap gap-3"
    >
      <!-- Left Filters -->
      <div class="flex items-center gap-2.5 flex-wrap flex-1 min-w-[280px]">
        <!-- Search Input -->
        <div class="relative w-full sm:w-64">
          <Icon
            icon="solar:magnifer-linear"
            class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Nomi bo'yicha qidirish..."
            class="w-full pl-9 pr-3.5 h-9 sm:h-9.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 placeholder-gray-400 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition shadow-2xs"
            @input="currentPage = 1"
          />
        </div>

        <!-- 1. Fan Dropdown (O'quvchilar ro'yxati komponenti andozasida) -->
        <AppFilterDropdown
          v-model="selectedSubject"
          :options="subjectOptions"
          label="Fan"
          all-label="Barchasi"
          all-value="ALL"
          icon="solar:book-bookmark-bold"
          min-width="min-w-[210px]"
          @change="currentPage = 1"
        />

        <!-- 2. Manba sinf Dropdown -->
        <AppFilterDropdown
          v-model="selectedSourceClass"
          :options="sourceClassOptions"
          label="Manba sinf"
          all-label="Barchasi"
          all-value="ALL"
          icon="solar:users-group-rounded-bold"
          min-width="min-w-[210px]"
          @change="currentPage = 1"
        />

        <!-- 3. Daraja Dropdown -->
        <AppFilterDropdown
          v-model="selectedLevel"
          :options="levelOptions"
          label="Daraja"
          all-label="Barchasi"
          all-value="ALL"
          icon="solar:cup-star-bold"
          min-width="min-w-[200px]"
          @change="currentPage = 1"
        />

        <!-- Tozalash tugmasi -->
        <button
          v-if="isFiltered"
          type="button"
          class="h-9 sm:h-9.5 px-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1.5 transition cursor-pointer"
          title="Filtrlarni tozalash"
          @click="resetAllFilters"
        >
          <Icon icon="solar:restart-linear" class="text-sm" />
          <span>Tozalash</span>
        </button>
      </div>

      <!-- Right Toggles (Zamonaviy tugma-chiplar / pills) -->
      <div class="flex items-center gap-2 flex-wrap">
        <!-- Faqat darajalar Toggle Pill -->
        <button
          type="button"
          :class="[
            'h-9 sm:h-9.5 inline-flex items-center gap-1.5 px-3 rounded-lg text-xs font-semibold border transition cursor-pointer select-none shadow-2xs',
            onlyLevels
              ? 'bg-primary/10 text-primary border-primary font-bold'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-gray-400',
          ]"
          @click="
            onlyLevels = !onlyLevels;
            currentPage = 1;
          "
        >
          <Icon
            :icon="onlyLevels ? 'solar:check-circle-bold' : 'solar:layers-linear'"
            :class="onlyLevels ? 'text-primary' : 'text-gray-400'"
            class="text-base"
          />
          <span>Faqat darajalar</span>
        </button>

        <!-- Arxivda Toggle Pill -->
        <button
          type="button"
          :class="[
            'h-9 sm:h-9.5 inline-flex items-center gap-1.5 px-3 rounded-lg text-xs font-semibold border transition cursor-pointer select-none shadow-2xs',
            showArchived
              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500 font-bold'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-gray-400',
          ]"
          @click="
            showArchived = !showArchived;
            currentPage = 1;
          "
        >
          <Icon
            :icon="showArchived ? 'solar:archive-bold' : 'solar:archive-linear'"
            :class="showArchived ? 'text-amber-500' : 'text-gray-400'"
            class="text-base"
          />
          <span>Arxivda</span>
        </button>
      </div>
    </div>

    <!-- 4. Yagona Universal AppTable Komponenti -->
    <AppTable
      :columns="tableColumns"
      :data="filteredGroups"
      :show-index="true"
      index-label="#"
      :per-page="perPage"
      item-label="daraja guruhi"
      empty-text="Daraja guruhlari topilmadi"
      empty-description="Qidiruv yoki filtrlar bo'yicha daraja guruhlari topilmadi"
    >
      <!-- Name -->
      <template #cell(name)="{ row: g }">
        <div
          class="font-bold text-gray-900 dark:text-white hover:text-primary transition-colors cursor-pointer"
          @click="openMembersModal(g)"
        >
          {{ g.name }}
        </div>
      </template>

      <!-- Subject -->
      <template #cell(subject)="{ row: g }">
        <span
          v-if="g.subject && g.subject !== '—'"
          class="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
        >
          {{ g.subject }}
        </span>
        <span v-else class="text-gray-400">—</span>
      </template>

      <!-- Teacher -->
      <template #cell(teacherName)="{ row: g }">
        <span class="font-medium text-gray-800 dark:text-gray-200">
          {{ g.teacherName }}
        </span>
      </template>

      <!-- Level -->
      <template #cell(level)="{ row: g }">
        <div class="text-center">
          <span
            v-if="g.level && g.level !== '—'"
            :class="[
              'px-2.5 py-0.5 rounded-full text-xs font-bold border inline-block',
              g.level === 'Beginner'
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400'
                : g.level === 'Intermediate'
                  ? 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400'
                  : g.level === 'Kuchaytirilgan' || g.level === 'Advanced'
                    ? 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400'
                    : g.level === 'Olimpiada'
                      ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400'
                      : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-300',
            ]"
          >
            {{ g.level }}
          </span>
          <span v-else class="text-gray-400">—</span>
        </div>
      </template>

      <!-- Sources (Sinflar) -->
      <template #cell(sources)="{ row: g }">
        <div class="flex items-center gap-1 flex-wrap max-w-xs">
          <span
            v-for="s in g.sources"
            :key="s"
            class="px-1.5 py-0.5 rounded text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30"
          >
            {{ s }}
          </span>
        </div>
      </template>

      <!-- Enrolled / Capacity -->
      <template #cell(enrolledCount)="{ row: g }">
        <div class="text-center font-bold text-xs sm:text-sm">
          <span
            :class="
              g.enrolledCount >= g.capacity
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-gray-800 dark:text-gray-200'
            "
          >
            {{ g.enrolledCount }} / {{ g.capacity }}
          </span>
        </div>
      </template>

      <!-- Actions -->
      <template #actions="{ row: g }">
        <div class="space-x-1.5 whitespace-nowrap text-right">
          <!-- Tarkib Button -->
          <AppButton
            size="sm"
            variant="outline"
            icon="solar:users-group-two-rounded-linear"
            @click="openMembersModal(g)"
          >
            Tarkib
          </AppButton>

          <!-- Tahrirlash Button -->
          <button
            type="button"
            class="w-8 h-8 rounded-lg inline-flex items-center justify-center border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/70 dark:hover:bg-blue-950/40 transition shadow-2xs cursor-pointer"
            title="Tahrirlash"
            @click="openEditModal(g)"
          >
            <Icon icon="solar:pen-new-square-linear" class="text-base" />
          </button>

          <!-- O'chirish Button -->
          <button
            type="button"
            class="w-8 h-8 rounded-lg inline-flex items-center justify-center border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-400 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50/70 dark:hover:bg-rose-950/40 transition shadow-2xs cursor-pointer"
            title="O'chirish"
            @click="confirmDelete(g)"
          >
            <Icon icon="solar:trash-bin-2-linear" class="text-base" />
          </button>
        </div>
      </template>
    </AppTable>

    <!-- 5. Create / Edit Group Modal -->
    <Vmodal
      ref="groupModal"
      :title="isEditing ? 'Daraja guruhini tahrirlash' : 'Yangi daraja guruhi qo\'shish'"
      width="max-w-lg"
      hide-button
      hide-footer
    >
      <template #body>
        <form
          novalidate
          class="space-y-4 text-left text-xs sm:text-sm"
          @submit.prevent="saveGroupForm"
        >
          <div>
            <label class="block font-bold text-gray-700 dark:text-gray-300 mb-1">
              Guruh / To'garak nomi <span class="text-rose-500">*</span>
            </label>
            <input
              v-model="groupForm.name"
              type="text"
              placeholder="Masalan: Ingliz tili — IELTS Pro"
              :class="[
                'w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none transition',
                formErrors.name
                  ? 'border-rose-500 ring-2 ring-rose-500/20'
                  : 'border-gray-300 dark:border-gray-600 focus:border-primary',
              ]"
              @input="clearFieldError('name')"
            />
            <FormFieldError :error="formErrors.name" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                Fan <span class="text-rose-500">*</span>
              </label>
              <input
                v-model="groupForm.subject"
                type="text"
                placeholder="Ingliz tili"
                :class="[
                  'w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none transition',
                  formErrors.subject
                    ? 'border-rose-500 ring-2 ring-rose-500/20'
                    : 'border-gray-300 dark:border-gray-600 focus:border-primary',
                ]"
                @input="clearFieldError('subject')"
              />
              <FormFieldError :error="formErrors.subject" />
            </div>
            <div>
              <label class="block font-bold text-gray-700 dark:text-gray-300 mb-1">Daraja</label>
              <select
                v-model="groupForm.level"
                class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none"
              >
                <option value="—">—</option>
                <option value="Beginner">Beginner</option>
                <option value="Elementary">Elementary</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced / Kuchaytirilgan</option>
                <option value="Olimpiada">Olimpiada</option>
                <option value="To'garak">To'garak</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                O'qituvchi <span class="text-rose-500">*</span>
              </label>
              <input
                v-model="groupForm.teacherName"
                type="text"
                placeholder="Masalan: Usmonova Oysha"
                :class="[
                  'w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none transition',
                  formErrors.teacherName
                    ? 'border-rose-500 ring-2 ring-rose-500/20'
                    : 'border-gray-300 dark:border-gray-600 focus:border-primary',
                ]"
                @input="clearFieldError('teacherName')"
              />
              <FormFieldError :error="formErrors.teacherName" />
            </div>
            <div>
              <label class="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                Maksimal Sig'im <span class="text-rose-500">*</span>
              </label>
              <input
                v-model.number="groupForm.capacity"
                type="number"
                min="1"
                max="50"
                :class="[
                  'w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none transition',
                  formErrors.capacity
                    ? 'border-rose-500 ring-2 ring-rose-500/20'
                    : 'border-gray-300 dark:border-gray-600 focus:border-primary',
                ]"
                @input="clearFieldError('capacity')"
              />
              <FormFieldError :error="formErrors.capacity" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-gray-700 dark:text-gray-300 mb-1"
                >Dars kunlari</label
              >
              <input
                v-model="groupForm.days"
                type="text"
                placeholder="Dush / Chor / Juma"
                class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none focus:border-primary transition"
              />
            </div>
            <div>
              <label class="block font-bold text-gray-700 dark:text-gray-300 mb-1">Xona</label>
              <input
                v-model="groupForm.room"
                type="text"
                placeholder="201-kabinet"
                class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none focus:border-primary transition"
              />
            </div>
          </div>

          <!-- Sources (Classes included) -->
          <div>
            <label class="block font-bold text-gray-700 dark:text-gray-300 mb-1"
              >Manba sinflar (O'quvchilar qaysi sinflardan olinadi)</label
            >
            <div
              class="flex items-center gap-1.5 flex-wrap p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30"
            >
              <label
                v-for="cls in availableClasses"
                :key="cls"
                class="inline-flex items-center gap-1 px-2 py-1 rounded bg-white dark:bg-gray-800 border text-xs font-semibold cursor-pointer select-none"
                :class="
                  groupForm.sources.includes(cls)
                    ? 'border-primary text-primary'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600'
                "
              >
                <input
                  v-model="groupForm.sources"
                  type="checkbox"
                  :value="cls"
                  class="rounded border-gray-300 text-primary focus:ring-primary h-3.5 w-3.5"
                />
                <span>{{ cls }}</span>
              </label>
            </div>
          </div>

          <div class="pt-3 border-t dark:border-gray-700 flex justify-end gap-2">
            <AppButton variant="outline" type="button" @click="$refs.groupModal.close()">
              Bekor qilish
            </AppButton>
            <AppButton variant="primary" type="submit">
              {{ isEditing ? "Saqlash" : "Yaratish" }}
            </AppButton>
          </div>
        </form>
      </template>
    </Vmodal>

    <!-- 6. Members List Modal (Tarkib) -->
    <Vmodal
      ref="membersModal"
      :title="selectedGroup ? selectedGroup.name + ' — Tarkibi' : 'Guruh tarkibi'"
      :subtitle="selectedGroup ? `${selectedGroup.days} • ${selectedGroup.room}` : ''"
      width="max-w-2xl"
      hide-button
      hide-footer
    >
      <template #body>
        <div v-if="selectedGroup" class="space-y-4">
          <!-- Summary Info Bar -->
          <div
            class="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2 text-xs"
          >
            <div class="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span class="text-gray-500">Fan:</span>
                <span class="font-bold text-gray-800 dark:text-gray-100 ml-1">{{
                  selectedGroup.subject
                }}</span>
                <span class="mx-2 text-gray-300">•</span>
                <span class="text-gray-500">O'qituvchi:</span>
                <span class="font-bold text-gray-800 dark:text-gray-100 ml-1">{{
                  selectedGroup.teacherName
                }}</span>
              </div>
              <div>
                <span class="text-gray-500">Sig'im:</span>
                <span class="font-bold text-primary ml-1"
                  >{{ currentMembers.length }} / {{ selectedGroup.capacity }}</span
                >
              </div>
            </div>

            <!-- Dars jadvali va xona -->
            <div
              class="flex items-center gap-3 pt-2 border-t border-gray-200/60 dark:border-gray-700/60 text-gray-600 dark:text-gray-300 flex-wrap"
            >
              <div class="flex items-center gap-1.5 font-medium">
                <Icon icon="solar:clock-circle-linear" class="text-sm text-primary" />
                <span>{{ selectedGroup.days }}</span>
              </div>
              <span class="text-gray-300 dark:text-gray-600">•</span>
              <div class="flex items-center gap-1.5 font-medium">
                <Icon icon="solar:buildings-2-linear" class="text-sm text-primary" />
                <span>{{ selectedGroup.room }}</span>
              </div>
            </div>
          </div>

          <!-- Filter / Search within members -->
          <div class="relative">
            <Icon
              icon="solar:magnifer-linear"
              class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"
            />
            <input
              v-model="memberSearch"
              type="text"
              placeholder="O'quvchi ismi yoki sinfi bo'yicha qidirish..."
              class="w-full pl-9 pr-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs outline-none focus:border-primary"
            />
          </div>

          <!-- Members Table -->
          <div
            class="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl max-h-80 overflow-y-auto"
          >
            <table class="w-full text-left border-collapse text-xs">
              <thead
                class="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-bold uppercase text-[10px] border-b dark:border-gray-700 sticky top-0 bg-gray-50 z-10"
              >
                <tr>
                  <th class="py-2.5 px-3 w-10 text-center">#</th>
                  <th class="py-2.5 px-3">O'quvchi FISH</th>
                  <th class="py-2.5 px-3 text-center">Sinfi</th>
                  <th class="py-2.5 px-3">Ota-onasi</th>
                  <th class="py-2.5 px-3">Telefon</th>
                  <th class="py-2.5 px-3 text-right">Amal</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                <tr
                  v-for="(st, idx) in filteredMembers"
                  :key="st.id"
                  class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition"
                >
                  <td class="py-2.5 px-3 text-center text-gray-400">{{ idx + 1 }}</td>
                  <td class="py-2.5 px-3 font-bold text-gray-900 dark:text-white">
                    {{ st.fullName }}
                    <span class="block text-[10px] text-gray-400 font-normal"
                      >ID: {{ st.studentId }}</span
                    >
                  </td>
                  <td class="py-2.5 px-3 text-center">
                    <span
                      class="px-2 py-0.5 rounded font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300"
                    >
                      {{ st.className }}
                    </span>
                  </td>
                  <td class="py-2.5 px-3 text-gray-600 dark:text-gray-300">
                    {{ st.parentName }}
                  </td>
                  <td class="py-2.5 px-3 text-primary font-mono font-medium">
                    {{ st.parentPhone }}
                  </td>
                  <td class="py-2.5 px-3 text-right">
                    <button
                      type="button"
                      class="w-7 h-7 rounded-md inline-flex items-center justify-center border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/70 transition cursor-pointer"
                      title="Guruhdan chiqarish"
                      @click="removeMember(st)"
                    >
                      <Icon icon="solar:trash-bin-2-linear" class="text-xs" />
                    </button>
                  </td>
                </tr>
                <tr v-if="filteredMembers.length === 0">
                  <td colspan="6" class="py-6 text-center text-gray-400">O'quvchilar topilmadi</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Footer -->
          <div class="pt-3 border-t dark:border-gray-700 flex items-center justify-between">
            <span class="text-xs text-gray-400">
              Jami {{ currentMembers.length }} nafar o'quvchi biriktirilgan
            </span>
            <AppButton variant="outline" size="sm" @click="$refs.membersModal.close()">
              Yopish
            </AppButton>
          </div>
        </div>
      </template>
    </Vmodal>

    <!-- 7. Confirm Delete Group Modal (Standart AppConfirmModal) -->
    <AppConfirmModal
      ref="deleteConfirmModal"
      title="Guruhni o'chirish"
      :message="groupToDelete ? `«${groupToDelete.name}» guruhini o'chirishni tasdiqlaysizmi?` : ''"
      confirm-text="Tasdiqlash va O'chirish"
      variant="danger"
      @confirm="executeDeleteGroup"
    />

    <!-- 8. Confirm Remove Member Modal (Standart AppConfirmModal) -->
    <AppConfirmModal
      ref="removeMemberConfirmModal"
      title="O'quvchini chiqarish"
      :message="
        memberToRemove
          ? `«${memberToRemove.fullName}» o'quvchisini ushbu guruhdan chiqarishni tasdiqlaysizmi?`
          : ''
      "
      confirm-text="Tasdiqlash va Chiqarish"
      variant="danger"
      @confirm="executeRemoveMember"
    />
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";

import {
  getLevelGroupStudents,
  loadLevelGroups,
  saveLevelGroups,
  saveLevelGroupStudents,
} from "@/api/levelGroupsData";
import Breadcrumb from "@/components/Breadcrumb.vue";
import AppButton from "@/components/common/AppButton.vue";
import AppFilterDropdown from "@/components/common/AppFilterDropdown.vue";
import vmodal from "@/components/common/AppModal.vue";
import AppTable from "@/components/common/AppTable.vue";
import PageTitle from "@/components/common/PageTitle.vue";
import { levelValidationRules, validateForm } from "@/utils/validators";

export default {
  name: "SchoolLevelsView",
  components: {
    Icon,
    Breadcrumb,
    PageTitle,
    AppButton,
    AppTable,
    AppFilterDropdown,
    vmodal,
  },
  data() {
    return {
      tableColumns: [
        { key: "name", label: "Nomi", sortable: true, thClass: "py-3.5 px-4 min-w-[220px]" },
        { key: "subject", label: "Fan" },
        { key: "teacherName", label: "O'qituvchi" },
        {
          key: "level",
          label: "Daraja",
          align: "center",
          thClass: "py-3.5 px-4 text-center whitespace-nowrap",
        },
        { key: "sources", label: "Manbalar (Sinflar)", thClass: "py-3.5 px-4 min-w-[200px]" },
        {
          key: "enrolledCount",
          label: "O'quvchilar",
          align: "center",
          thClass: "py-3.5 px-4 text-center whitespace-nowrap",
        },
      ],
      groupsList: [],
      searchQuery: "",
      selectedSubject: "ALL",
      selectedSourceClass: "ALL",
      selectedLevel: "ALL",
      onlyLevels: true,
      showArchived: false,
      currentPage: 1,
      perPage: 10,

      // Validation errors
      formErrors: {},

      // Modal state
      isEditing: false,
      groupForm: {
        id: "",
        name: "",
        subject: "",
        teacherName: "",
        level: "Beginner",
        sources: ["5-A", "5-B"],
        capacity: 15,
        room: "201-kabinet",
        days: "Dush / Chor / Juma",
        isLevelOnly: true,
        isArchived: false,
      },
      availableClasses: [
        "1-A",
        "1-B",
        "2-A",
        "2-B",
        "3-A",
        "3-B",
        "4-A",
        "4-B",
        "5-A",
        "5-B",
        "6-A",
        "6-B",
        "7-A",
        "8-A",
        "9-A",
        "10-A",
        "11-A",
      ],

      // Members modal state
      selectedGroup: null,
      currentMembers: [],
      memberSearch: "",
      groupToDelete: null,
      memberToRemove: null,
    };
  },
  computed: {
    subjectOptions() {
      const set = new Set();
      this.groupsList.forEach((g) => {
        if (g.subject && g.subject !== "—") set.add(g.subject);
      });
      return Array.from(set);
    },
    sourceClassOptions() {
      const set = new Set();
      this.groupsList.forEach((g) => {
        if (Array.isArray(g.sources)) {
          g.sources.forEach((s) => set.add(s));
        }
      });
      return Array.from(set).sort();
    },
    levelOptions() {
      return [
        "Beginner",
        "Elementary",
        "Intermediate",
        "Kuchaytirilgan",
        "Olimpiada",
        "To'garak",
        "Amaliy",
        "Ijodiy",
      ];
    },
    filteredGroups() {
      return this.groupsList.filter((g) => {
        const q = this.searchQuery.toLowerCase().trim();
        const matchesQuery =
          !q ||
          g.name.toLowerCase().includes(q) ||
          g.teacherName.toLowerCase().includes(q) ||
          g.subject.toLowerCase().includes(q);

        const matchesSubject = this.selectedSubject === "ALL" || g.subject === this.selectedSubject;
        const matchesClass =
          this.selectedSourceClass === "ALL" ||
          (Array.isArray(g.sources) && g.sources.includes(this.selectedSourceClass));
        const matchesLevel = this.selectedLevel === "ALL" || g.level === this.selectedLevel;

        const matchesArchived = this.showArchived ? g.isArchived : !g.isArchived;
        const matchesOnlyLevels = !this.onlyLevels || g.isLevelOnly;

        return (
          matchesQuery &&
          matchesSubject &&
          matchesClass &&
          matchesLevel &&
          matchesArchived &&
          matchesOnlyLevels
        );
      });
    },
    filteredMembers() {
      if (!this.memberSearch.trim()) return this.currentMembers;
      const q = this.memberSearch.toLowerCase().trim();
      return this.currentMembers.filter(
        (m) =>
          m.fullName.toLowerCase().includes(q) ||
          m.className.toLowerCase().includes(q) ||
          String(m.studentId).includes(q)
      );
    },
    isFiltered() {
      return (
        this.searchQuery.trim() !== "" ||
        this.selectedSubject !== "ALL" ||
        this.selectedSourceClass !== "ALL" ||
        this.selectedLevel !== "ALL" ||
        !this.onlyLevels ||
        this.showArchived
      );
    },
  },
  mounted() {
    this.groupsList = loadLevelGroups();
  },
  methods: {
    resetAllFilters() {
      this.searchQuery = "";
      this.selectedSubject = "ALL";
      this.selectedSourceClass = "ALL";
      this.selectedLevel = "ALL";
      this.onlyLevels = true;
      this.showArchived = false;
      this.currentPage = 1;
    },
    clearFieldError(field) {
      if (this.formErrors && this.formErrors[field]) {
        delete this.formErrors[field];
      }
    },
    openCreateModal() {
      this.isEditing = false;
      this.formErrors = {};
      this.groupForm = {
        id: "lvl-" + Date.now(),
        name: "",
        subject: "",
        teacherName: "",
        level: "Beginner",
        sources: ["5-A", "5-B"],
        capacity: 15,
        enrolledCount: 0,
        room: "201-kabinet",
        days: "Dush / Chor / Juma (14:00 - 15:30)",
        isLevelOnly: true,
        isArchived: false,
      };
      if (this.$refs.groupModal) {
        this.$refs.groupModal.open();
      }
    },
    openEditModal(g) {
      this.isEditing = true;
      this.formErrors = {};
      this.groupForm = JSON.parse(JSON.stringify(g));
      if (this.$refs.groupModal) {
        this.$refs.groupModal.open();
      }
    },
    saveGroupForm() {
      const validation = validateForm(this.groupForm, levelValidationRules);
      if (!validation.isValid) {
        this.formErrors = validation.errors;
        if (this.$toast) {
          this.$toast.error(validation.firstError || "Iltimos, maydonlarni to'g'ri to'ldiring");
        }
        return;
      }
      this.formErrors = {};

      if (this.isEditing) {
        const idx = this.groupsList.findIndex((item) => item.id === this.groupForm.id);
        if (idx !== -1) {
          this.groupsList.splice(idx, 1, { ...this.groupForm });
        }
      } else {
        this.groupsList.unshift({ ...this.groupForm });
      }
      saveLevelGroups(this.groupsList);
      if (this.$refs.groupModal) {
        this.$refs.groupModal.close();
      }
    },
    confirmDelete(g) {
      this.groupToDelete = g;
      if (this.$refs.deleteConfirmModal) {
        this.$refs.deleteConfirmModal.open();
      }
    },
    executeDeleteGroup() {
      if (!this.groupToDelete) return;
      this.groupsList = this.groupsList.filter((item) => item.id !== this.groupToDelete.id);
      saveLevelGroups(this.groupsList);
      if (this.$refs.deleteConfirmModal) {
        this.$refs.deleteConfirmModal.close();
      }
      this.groupToDelete = null;
    },
    openMembersModal(group) {
      this.selectedGroup = group;
      this.currentMembers = getLevelGroupStudents(group);
      this.memberSearch = "";
      if (this.$refs.membersModal) {
        this.$refs.membersModal.open();
      }
    },
    removeMember(st) {
      this.memberToRemove = st;
      if (this.$refs.removeMemberConfirmModal) {
        this.$refs.removeMemberConfirmModal.open();
      }
    },
    executeRemoveMember() {
      if (!this.memberToRemove || !this.selectedGroup) return;
      this.currentMembers = this.currentMembers.filter((m) => m.id !== this.memberToRemove.id);
      saveLevelGroupStudents(this.selectedGroup.id, this.currentMembers);
      this.selectedGroup.enrolledCount = this.currentMembers.length;
      saveLevelGroups(this.groupsList);
      if (this.$refs.removeMemberConfirmModal) {
        this.$refs.removeMemberConfirmModal.close();
      }
      this.memberToRemove = null;
    },
  },
};
</script>

<style scoped>
.font-lexend {
  font-family: "Lexend", sans-serif;
}
</style>
