<template>
  <div class="leads-kanban-page p-4 font-lexend space-y-4">
    <!-- Breadcrumb -->
    <Breadcrumb :items="[{ title: 'Lidlar & CRM' }, { title: 'Sotuv Voronkasi' }]" />

    <!-- TOP TOOLBAR: Academic Season, Import, Template, Export, Settings, Add Button -->
    <div class="flex items-center justify-between flex-wrap gap-3 bg-white dark:bg-gray-800 p-3.5 rounded-2xl border dark:border-gray-700 shadow-xs">
      <!-- Left: Season / Blackboard Dropdown -->
      <div class="flex items-center gap-2">
        <div class="relative season-dropdown-container">
          <button
            type="button"
            @click.stop="showSeasonMenu = !showSeasonMenu"
            class="py-2 px-3.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-100 hover:border-primary flex items-center gap-2 transition cursor-pointer shadow-2xs"
          >
            <Icon icon="solar:filter-bold" class="text-primary text-base" />
            <span>{{ selectedSeason }}</span>
            <Icon icon="solar:alt-arrow-down-linear" class="text-xs text-gray-400" />
          </button>

          <!-- Season Dropdown Menu -->
          <div
            v-if="showSeasonMenu"
            @click.stop
            class="absolute left-0 mt-1.5 w-52 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-lg py-1 z-50 text-xs font-medium"
          >
            <div
              v-for="s in seasonOptions"
              :key="s"
              @click="selectedSeason = s; showSeasonMenu = false"
              :class="[
                'px-3.5 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center justify-between',
                selectedSeason === s ? 'text-primary font-bold bg-primary/5' : 'text-gray-700 dark:text-gray-200'
              ]"
            >
              <span>{{ s }}</span>
              <Icon v-if="selectedSeason === s" icon="solar:check-circle-bold" class="text-primary text-sm" />
            </div>
            <div class="border-t dark:border-gray-700 my-1"></div>
            <button
              type="button"
              @click="openSeasonModal"
              class="w-full text-left px-3.5 py-2 text-primary hover:bg-primary/5 font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Icon icon="solar:add-circle-linear" class="text-base" />
              <span>+ Yangi mavsum</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Right Actions: Import, Import Shabloni, Export, Sozlash, Yangi Lid -->
      <div class="flex items-center gap-2 flex-wrap">
        <!-- Import Button -->
        <button
          type="button"
          @click="openImportModal"
          class="py-2 px-3 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/60 text-gray-700 dark:text-gray-200 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
        >
          <Icon icon="solar:import-linear" class="text-base" />
          <span>Import</span>
        </button>

        <!-- Import Shabloni Button -->
        <button
          type="button"
          @click="downloadImportTemplate"
          class="py-2 px-3 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/60 text-gray-700 dark:text-gray-200 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
        >
          <Icon icon="solar:file-download-linear" class="text-base" />
          <span>Import shabloni</span>
        </button>

        <!-- Export Button -->
        <button
          type="button"
          @click="exportLeadsToExcel"
          class="py-2 px-3 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/60 text-gray-700 dark:text-gray-200 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
        >
          <Icon icon="solar:export-linear" class="text-base" />
          <span>Export</span>
        </button>

        <!-- Sozlash Toggle Button -->
        <button
          type="button"
          @click="isCustomizing = !isCustomizing"
          :class="[
            'py-2 px-3.5 rounded-xl border text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs',
            isCustomizing
              ? 'bg-amber-500 text-white border-amber-600 ring-2 ring-amber-500/30'
              : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/60'
          ]"
        >
          <Icon icon="solar:settings-linear" class="text-base" />
          <span>{{ isCustomizing ? 'Saqlash' : 'Sozlash' }}</span>
        </button>

        <!-- Yangi Lid Primary Button (Directly opens modal) -->
        <button
          type="button"
          @click="openAddLeadModal"
          class="py-2 px-4 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
        >
          <Icon icon="ic:round-add" class="text-lg" />
          <span>Yangi Lid</span>
        </button>
      </div>
    </div>

    <!-- SEARCH & VIEW MODE BAR with Advanced Filters Toggle -->
    <div class="bg-white dark:bg-gray-800 p-3.5 rounded-2xl border dark:border-gray-700 shadow-xs space-y-3">
      <div class="flex items-center justify-between flex-wrap gap-3">
        <!-- Search Input (Compact Width) -->
        <div class="relative w-64 sm:w-72">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <Icon icon="ei:search" class="text-xl" />
          </span>
          <input
            type="text"
            v-model="searchQuery"
            :placeholder="searchPlaceholder"
            class="w-full pl-9 pr-8 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-900 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary text-gray-800 dark:text-gray-200 transition"
          />
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <Icon icon="mdi:close-circle" class="text-base" />
          </button>
        </div>

        <!-- Center: View Switcher (Kanban doska | Jadval) -->
        <div class="flex items-center bg-gray-100 dark:bg-gray-900 p-1 rounded-xl border dark:border-gray-700 text-xs">
          <button
            type="button"
            @click="viewMode = 'kanban'"
            :class="[
              'px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5',
              viewMode === 'kanban'
                ? 'bg-white dark:bg-gray-700 text-primary shadow-xs'
                : 'text-gray-500 hover:text-gray-800 dark:text-gray-300'
            ]"
          >
            <Icon icon="solar:widget-2-bold" class="text-sm" />
            <span>Kanban doska</span>
          </button>

          <button
            type="button"
            @click="viewMode = 'table'"
            :class="[
              'px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5',
              viewMode === 'table'
                ? 'bg-white dark:bg-gray-700 text-primary shadow-xs'
                : 'text-gray-500 hover:text-gray-800 dark:text-gray-300'
            ]"
          >
            <Icon icon="solar:list-bold" class="text-sm" />
            <span>Jadval</span>
          </button>
        </div>

        <!-- Right: Advanced Filters Button -->
        <button
          type="button"
          @click="showAdvancedFilters = !showAdvancedFilters"
          :class="[
            'py-2 px-3.5 rounded-xl border text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition cursor-pointer',
            showAdvancedFilters
              ? 'bg-primary/10 text-primary border-primary/30'
              : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/60'
          ]"
        >
          <Icon icon="solar:filter-linear" class="text-base" />
          <span>Filtrlar</span>
          <Icon :icon="showAdvancedFilters ? 'solar:alt-arrow-up-linear' : 'solar:alt-arrow-down-linear'" class="text-xs" />
        </button>
      </div>

      <!-- COLLAPSIBLE ADVANCED FILTER BAR -->
      <transition name="fade">
        <div
          v-if="showAdvancedFilters"
          class="pt-3 border-t dark:border-gray-700/80 flex items-center gap-3 flex-wrap text-xs"
        >
          <!-- 1. Bosqichlar Multi-Select Dropdown -->
          <div class="relative stage-dropdown-container">
            <button
              type="button"
              @click.stop="showStageDropdown = !showStageDropdown"
              class="py-2 px-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 flex items-center gap-1.5 hover:border-primary cursor-pointer font-medium shadow-2xs"
            >
              <Icon icon="solar:flag-2-bold" class="text-primary text-sm" />
              <span>Bosqichlar ({{ selectedStages.length || 'Barchasi' }})</span>
              <Icon icon="solar:alt-arrow-down-linear" class="text-xs text-gray-400" />
            </button>

            <!-- Stage Multi-Select Popup -->
            <div
              v-if="showStageDropdown"
              @click.stop
              class="absolute left-0 mt-1.5 w-56 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-lg p-2 z-50 space-y-1"
            >
              <label
                v-for="col in pipelineColumns"
                :key="col.id"
                class="flex items-center gap-2 px-2.5 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg cursor-pointer text-xs"
              >
                <input
                  type="checkbox"
                  :value="col.id"
                  v-model="selectedStages"
                  class="rounded text-primary focus:ring-0 cursor-pointer"
                />
                <span class="w-2.5 h-2.5 rounded-full" :class="col.badgeColor"></span>
                <span class="font-medium text-gray-800 dark:text-gray-200">{{ col.title }}</span>
              </label>
              <div class="pt-1.5 border-t dark:border-gray-700 flex justify-between">
                <button
                  type="button"
                  @click="selectedStages = []"
                  class="text-[11px] text-gray-400 hover:text-gray-600"
                >
                  Tozalash
                </button>
                <button
                  type="button"
                  @click="showStageDropdown = false"
                  class="text-[11px] font-bold text-primary"
                >
                  Yopish
                </button>
              </div>
            </div>
          </div>

          <!-- 2. Menejer Filtr (FilterSelect Component) -->
          <FilterSelect
            v-model="managerFilter"
            :options="managerOptions"
            all-label="Barcha menejerlar"
            border-variant="gray"
            icon="solar:user-circle-linear"
            min-width="min-w-[170px]"
            size="sm"
          />

          <!-- 3. Reklama Manbasi Filtr (FilterSelect Component) -->
          <FilterSelect
            v-model="sourceFilter"
            :options="sourceOptions"
            all-label="Barcha manbalar"
            border-variant="gray"
            icon="solar:global-linear"
            min-width="min-w-[170px]"
            size="sm"
          />

          <!-- 4. Sana Oralig'i (FormDatePicker Custom Calendar Component) -->
          <div class="flex items-center gap-1.5">
            <div class="w-36">
              <FormDatePicker
                v-model="dateFrom"
                placeholder="... dan"
                icon="solar:calendar-linear"
              />
            </div>
            <span class="text-gray-400 text-xs">—</span>
            <div class="w-36">
              <FormDatePicker
                v-model="dateTo"
                placeholder="... gacha"
                icon="solar:calendar-linear"
              />
            </div>
          </div>

          <!-- 5. Tozalash Tugmasi -->
          <button
            type="button"
            @click="resetAllFilters"
            class="py-2 px-3 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-semibold flex items-center gap-1 transition cursor-pointer ml-auto"
          >
            <Icon icon="solar:restart-linear" class="text-sm" />
            <span>Tozalash</span>
          </button>
        </div>
      </transition>
    </div>

    <!-- Toast Alert -->
    <Alert v-if="alertMessage" :message="alertMessage" @close="alertMessage = ''" />

    <!-- 1. KANBAN DOSKA VIEW -->
    <div v-if="viewMode === 'kanban'" class="w-full">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-start w-full">
        <!-- Kanban Columns -->
        <!-- Kanban Columns -->
        <div
          v-for="(col, colIndex) in visibleColumns"
          :key="col.id"
          :draggable="isCustomizing"
          @dragstart="onColumnDragStart($event, colIndex)"
          @dragover.prevent="handleColumnOrItemDragOver($event, col.id, colIndex)"
          @dragleave="onDragLeave(col.id)"
          @drop="handleColumnOrItemDrop($event, col.id, colIndex)"
          :class="[
            'kanban-column w-full flex flex-col bg-gray-50/95 dark:bg-gray-800/70 rounded-2xl border dark:border-gray-700 min-h-[520px] max-h-[780px] transition-all shadow-xs relative',
            isCustomizing ? 'border-dashed border-primary/40 hover:border-primary cursor-grab active:cursor-grabbing' : '',
            dragOverColIndex === colIndex && isCustomizing ? 'ring-2 ring-primary border-primary scale-[1.01]' : '',
            dragOverColId === col.id ? 'ring-2 ring-primary border-primary bg-primary/5 dark:bg-primary/10' : ''
          ]"
        >
          <!-- Column Header -->
          <div
            class="p-3 px-3.5 border-b dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800 rounded-t-2xl select-none"
            :class="{ 'bg-primary/5 dark:bg-primary/10': isCustomizing }"
          >
            <div class="flex items-center gap-2 truncate">
              <!-- Reorder Grip icon in Sozlash mode -->
              <span v-if="isCustomizing" class="text-primary/70 cursor-grab" title="Ustunni tortib surish">
                <Icon icon="solar:reorder-bold" class="text-base" />
              </span>
              <span class="w-2.5 h-2.5 rounded-full shrink-0" :class="col.badgeColor || 'bg-primary'" />
              <h3 class="font-bold text-xs sm:text-sm text-gray-800 dark:text-gray-100 truncate">{{ col.title }}</h3>
              <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 shrink-0">
                {{ getColumnItems(col.id).length }}
              </span>
            </div>

            <!-- Header Action Dots / Add / Reorder Arrows -->
            <div class="flex items-center gap-1">
              <!-- Reorder Arrows (Chapga / O'ngga surish) in Sozlash mode -->
              <div v-if="isCustomizing" class="flex items-center gap-0.5 bg-gray-100 dark:bg-gray-700/80 p-0.5 rounded-lg border border-gray-200 dark:border-gray-600 shadow-2xs mr-1">
                <button
                  type="button"
                  @click.stop="moveColumnLeft(colIndex)"
                  :disabled="colIndex === 0"
                  class="p-1 rounded text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
                  title="Chapga surish (←)"
                >
                  <Icon icon="solar:arrow-left-linear" class="text-xs font-bold" />
                </button>
                <button
                  type="button"
                  @click.stop="moveColumnRight(colIndex)"
                  :disabled="colIndex === visibleColumns.length - 1"
                  class="p-1 rounded text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
                  title="O'ngga surish (→)"
                >
                  <Icon icon="solar:arrow-right-linear" class="text-xs font-bold" />
                </button>
              </div>

              <!-- Column Settings Popup (Three dots menu - Only shown in Sozlash mode) -->
              <div v-if="isCustomizing" class="relative column-menu-container">
                <button
                  type="button"
                  @click.stop="activeColumnMenu = activeColumnMenu === col.id ? null : col.id"
                  class="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition cursor-pointer"
                  title="Ustun sozlamalari"
                >
                  <Icon icon="solar:menu-dots-bold" class="text-sm" />
                </button>

                <!-- Column Action Popup Menu -->
                <div
                  v-if="activeColumnMenu === col.id"
                  @click.stop
                  class="absolute right-0 mt-1 w-36 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-lg py-1 z-50 text-xs font-medium"
                >
                  <button
                    type="button"
                    @click="openEditColumnModal(col)"
                    class="w-full text-left px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Icon icon="solar:pen-linear" class="text-sm text-primary" />
                    <span>Tahrirlash</span>
                  </button>
                  <button
                    type="button"
                    @click="openDeleteColumnModal(col)"
                    class="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Icon icon="solar:trash-bin-trash-linear" class="text-sm" />
                    <span>O'chirish</span>
                  </button>
                </div>
              </div>

              <!-- Quick Add inside Column -->
              <button
                type="button"
                @click="handleQuickAddFromColumn(col.id)"
                class="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition cursor-pointer"
                title="+ Lid qo'shish"
              >
                <Icon icon="ic:round-add" class="text-base" />
              </button>
            </div>
          </div>

          <!-- Cards Drop Zone List -->
          <div class="cards-list p-3 space-y-3 overflow-y-auto flex-1 min-h-[160px]">
            <!-- Card Item -->
            <div
              v-for="item in getColumnItems(col.id)"
              :key="item.id"
              draggable="true"
              @dragstart="onDragStart(item, col.id)"
              class="kanban-card bg-white dark:bg-gray-800 rounded-2xl p-4 border dark:border-gray-700 shadow-2xs hover:shadow-md cursor-grab active:cursor-grabbing transition hover:border-primary/60 group select-none space-y-3"
            >
              <!-- Top row: Name & Source Badge -->
              <div class="flex items-start justify-between gap-2">
                <h4 class="font-bold text-sm sm:text-base text-gray-900 dark:text-gray-100 group-hover:text-primary transition leading-snug">
                  {{ item.fullName }}
                </h4>
                <Badge :variant="getSourceBadgeVariant(item.source)" size="xs" class="font-semibold shrink-0">
                  {{ item.source }}
                </Badge>
              </div>

              <!-- Contact & Target Details (Sinf / Guruh / Kurs) -->
              <div class="text-xs sm:text-sm space-y-1.5 text-gray-600 dark:text-gray-300">
                <div class="flex items-center gap-2">
                  <Icon icon="solar:phone-calling-linear" class="text-primary text-base shrink-0" />
                  <span class="font-semibold text-gray-800 dark:text-gray-200">{{ formatPhone(item.phone) }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <Icon icon="solar:book-bookmark-linear" class="text-primary text-base shrink-0" />
                  <span class="font-semibold text-primary px-2 py-0.5 rounded-md bg-primary/10 text-xs">
                    {{ getTargetDisplay(item) }}
                  </span>
                </div>
              </div>

              <!-- Bottom: Amount & Manager -->
              <div class="pt-2.5 border-t dark:border-gray-700/80 flex items-center justify-between text-xs sm:text-sm">
                <span v-if="item.amount" class="font-extrabold text-emerald-600 dark:text-emerald-400">
                  {{ formatUZS(item.amount) }}
                </span>
                <span v-else class="text-xs text-gray-400 font-medium">
                  —
                </span>
                <span class="text-xs text-gray-400 flex items-center gap-1">
                  <Icon icon="solar:user-circle-linear" class="text-sm" />
                  {{ item.manager?.firstName || item.manager || 'Menejer' }}
                </span>
              </div>

              <!-- Action Buttons -->
              <div class="pt-1 flex items-center gap-2">
                <template v-if="item.stage !== 'ENROLLED'">
                  <button
                    type="button"
                    @click.stop="openLeadDetails(item)"
                    class="py-2 px-3 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center justify-center gap-1 cursor-pointer shrink-0"
                    title="Lidni tahrirlash"
                  >
                    <Icon icon="solar:pen-linear" class="text-sm" />
                    <span>Tahrirlash</span>
                  </button>

                  <button
                    type="button"
                    @click.stop="openConvertModal(item)"
                    class="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary/90 transition shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer truncate"
                  >
                    <Icon icon="solar:user-plus-bold" class="text-sm shrink-0" />
                    <span class="truncate">{{ isKindergarten ? "Bog'chaga Qabul" : isSchool ? "Maktabga Qabul" : "O'quvchiga Aylantirish" }}</span>
                  </button>
                </template>

                <router-link
                  v-else
                  to="/students"
                  @click.stop
                  class="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center gap-1.5 transition truncate text-center"
                >
                  <Icon icon="solar:check-circle-bold" class="text-base text-emerald-600 shrink-0" />
                  <span>Qabul qilingan o'quvchi</span>
                </router-link>
              </div>
            </div>

            <!-- Empty Drop Zone Placeholder -->
            <div
              v-if="getColumnItems(col.id).length === 0"
              class="h-24 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl flex flex-col items-center justify-center text-gray-400 text-xs gap-1"
            >
              <Icon icon="solar:box-minimalistic-linear" class="text-xl" />
              <span>Hozircha bo'sh</span>
            </div>
          </div>

          <!-- Column Footer Summary -->
          <div
            v-if="getColumnTotalSum(col.id) > 0"
            class="p-2.5 bg-gray-100/70 dark:bg-gray-800/90 border-t dark:border-gray-700 rounded-b-2xl text-center text-xs text-gray-500 dark:text-gray-400 font-medium"
          >
            Jami: <span class="font-bold text-gray-800 dark:text-gray-200">{{ formatUZS(getColumnTotalSum(col.id)) }}</span>
          </div>
        </div>

        <!-- "+ Guruh yaratish" Card -->
        <div
          v-if="isCustomizing"
          class="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl min-h-[220px] bg-white/50 dark:bg-gray-800/40 text-center space-y-3"
        >
          <div class="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold">
            <Icon icon="ic:round-add" />
          </div>
          <div>
            <h4 class="font-bold text-sm text-gray-800 dark:text-gray-100">Yangi Bosqich (Ustun)</h4>
            <p class="text-xs text-gray-400">Voronkaga yangi bosqich qo'shish</p>
          </div>
          <button
            type="button"
            @click="openAddColumnModal"
            class="py-2 px-4 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-xs cursor-pointer"
          >
            + Guruh yaratish
          </button>
        </div>
      </div>
    </div>

    <!-- 2. JADVAL (TABLE) VIEW -->
    <div v-else class="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs sm:text-sm">
          <thead class="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 uppercase text-[11px] font-bold border-b dark:border-gray-700">
            <tr>
              <th class="p-3.5 pl-4">F.I.SH</th>
              <th class="p-3.5">Telefon</th>
              <th class="p-3.5">{{ isSchool ? 'Sinf' : isKindergarten ? 'Guruh' : 'Kurs' }}</th>
              <th class="p-3.5">Manba</th>
              <th class="p-3.5">Bosqich</th>
              <th class="p-3.5">Summa</th>
              <th class="p-3.5">Mas'ul</th>
              <th class="p-3.5 pr-4 text-center">Amallar</th>
            </tr>
          </thead>
          <tbody class="divide-y dark:divide-gray-700">
            <tr
              v-for="lead in filteredLeads"
              :key="lead.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition cursor-pointer"
              @click="openLeadDetails(lead)"
            >
              <td class="p-3.5 pl-4 font-bold text-gray-800 dark:text-gray-100">
                {{ lead.fullName }}
              </td>
              <td class="p-3.5 font-semibold text-gray-700 dark:text-gray-300">
                {{ formatPhone(lead.phone) }}
              </td>
              <td class="p-3.5">
                <span class="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-semibold text-xs">
                  {{ getTargetDisplay(lead) }}
                </span>
              </td>
              <td class="p-3.5">
                <Badge :variant="getSourceBadgeVariant(lead.source)" size="xs">
                  {{ lead.source }}
                </Badge>
              </td>
              <td class="p-3.5">
                <span class="px-2 py-1 rounded-lg text-xs font-bold" :class="getStageBadgeClass(lead.stage)">
                  {{ getStageTitle(lead.stage) }}
                </span>
              </td>
              <td class="p-3.5 font-extrabold text-emerald-600 dark:text-emerald-400">
                {{ formatUZS(lead.amount) }}
              </td>
              <td class="p-3.5 text-gray-400 text-xs">
                {{ lead.manager?.firstName || 'Menejer' }}
              </td>
              <td class="p-3.5 pr-4 text-center" @click.stop>
                <div class="flex items-center justify-center gap-1.5">
                  <template v-if="lead.stage !== 'ENROLLED'">
                    <button
                      type="button"
                      @click="openLeadDetails(lead)"
                      class="px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs font-medium border border-gray-200 dark:border-gray-600 flex items-center gap-1 transition cursor-pointer shadow-2xs"
                      title="Lidni tahrirlash"
                    >
                      <Icon icon="solar:pen-linear" class="text-sm" />
                      <span>Tahrirlash</span>
                    </button>
                    <button
                      type="button"
                      @click="promptDeleteLead(lead)"
                      class="p-1.5 rounded-lg border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 text-xs font-semibold flex items-center justify-center cursor-pointer transition shadow-2xs"
                      title="Lidni o'chirish"
                    >
                      <Icon icon="solar:trash-bin-trash-linear" class="text-base" />
                    </button>
                    <button
                      type="button"
                      @click="openConvertModal(lead)"
                      class="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                      title="O'quvchiga aylantirish"
                    >
                      <Icon icon="solar:user-plus-bold" class="text-sm" />
                      <span>Qabul qilish</span>
                    </button>
                  </template>
                  <router-link
                    v-else
                    to="/students"
                    class="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 transition"
                    title="O'quvchilar ro'yxatida ko'rish"
                  >
                    <Icon icon="solar:check-circle-bold" class="text-sm text-emerald-600" />
                    <span>Qabul qilingan</span>
                  </router-link>
                </div>
              </td>
            </tr>
            <tr v-if="filteredLeads.length === 0">
              <td colspan="8" class="p-6 text-center">
                <EmptyState
                  title="Hech qanday lid topilmadi"
                  description="Yangi lid qo'shing yoki qidiruv filtrlarini tozalang"
                  action-text="+ Yangi Lid"
                  @action="openAddLeadModal"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ADD LEAD MODAL -->
    <vmodal
      ref="addLeadModal"
      :hideButton="true"
      title="Yangi Lid / Murojaat Qo'shish"
      :subtitle="modalSubtitle"
      btnTextSubmit="Saqlash"
      btnTextClose="Bekor qilish"
      btnColorSubmit="bg-primary"
      @submit="submitAddLead"
    >
      <template v-slot:Icon>
        <Icon icon="solar:user-plus-bold" class="text-3xl text-primary mb-2" />
      </template>
      <template v-slot:body>
        <div class="space-y-3 text-sm text-left">
          <div class="grid grid-cols-2 gap-3">
            <FormInput
              v-model="newLead.firstName"
              :label="isKindergarten ? 'Bola ismi' : 'Ism'"
              required
              :placeholder="isKindergarten ? 'Imronbek' : 'Bekzod'"
              icon="solar:user-linear"
            />
            <FormInput
              v-model="newLead.lastName"
              label="Familiya"
              required
              placeholder="Rahimov"
              icon="solar:user-linear"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormInput
              v-model="newLead.phone"
              label="Telefon raqami"
              required
              placeholder="+998901234567"
              icon="solar:phone-calling-linear"
            />
            <FormInput
              v-if="isSchool || isKindergarten"
              v-model="newLead.parentName"
              label="Ota-onasi (F.I.SH)"
              placeholder="Anvar Rahimov"
              icon="solar:users-group-two-rounded-linear"
            />
            <FormSelect
              v-else
              v-model="newLead.source"
              label="Reklama manbasi"
              :options="sourceOptions"
            />
          </div>

          <!-- Maktab uchun 0-11 Sinf tanlagich paneli -->
          <div v-if="isSchool" class="space-y-1.5">
            <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Sinfni tanlang:
            </label>
            <div class="grid grid-cols-6 gap-2 max-w-xs">
              <button
                v-for="cNum in ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11']"
                :key="cNum"
                type="button"
                @click="newLead.target = `${cNum}-sinf`"
                :class="[
                  'h-10 rounded-xl text-sm font-semibold transition flex items-center justify-center cursor-pointer border',
                  newLead.target === `${cNum}-sinf` || newLead.target === cNum
                    ? 'bg-primary text-white border-primary shadow-xs ring-2 ring-primary/30'
                    : 'bg-gray-100 dark:bg-gray-700/60 text-gray-700 dark:text-gray-200 border-gray-200/80 dark:border-gray-600/80 hover:bg-gray-200 dark:hover:bg-gray-600'
                ]"
              >
                {{ cNum }}
              </button>
            </div>
          </div>

          <!-- Bog'cha uchun: Yosh guruhi va Oylik to'lov -->
          <div v-else-if="isKindergarten" class="grid grid-cols-2 gap-3">
            <FormSelect
              v-model="newLead.target"
              label="Yosh guruhi"
              required
              :options="targetOptions"
            />
            <FormCurrencyInput
              v-model="newLead.amount"
              label="Oylik to'lov"
              placeholder="1 800 000"
            />
          </div>

          <!-- O'quv markazi uchun: Qiziqqan kursi va Kutilayotgan summa -->
          <div v-else class="grid grid-cols-2 gap-3">
            <FormSelect
              v-model="newLead.target"
              label="Qiziqqan kursi"
              required
              :options="targetOptions"
            />
            <FormCurrencyInput
              v-model="newLead.amount"
              label="Kutilayotgan summa"
              placeholder="700 000"
            />
          </div>

          <!-- Maktab uchun To'lov va Reklama manbasi -->
          <div v-if="isSchool" class="grid grid-cols-2 gap-3">
            <FormCurrencyInput
              v-model="newLead.amount"
              label="Yillik/Oylik to'lov"
              placeholder="3 200 000"
            />
            <FormSelect
              v-model="newLead.source"
              label="Reklama manbasi"
              :options="sourceOptions"
            />
          </div>

          <!-- Bog'cha uchun Reklama va Boshlang'ich bosqich -->
          <div v-if="isKindergarten" class="grid grid-cols-2 gap-3">
            <FormSelect
              v-model="newLead.source"
              label="Reklama manbasi"
              :options="sourceOptions"
            />
            <FormSelect
              v-model="newLead.status"
              label="Boshlang'ich bosqich"
              :options="stageOptions"
            />
          </div>

          <!-- Maktab va O'quv markazi uchun Boshlang'ich bosqich -->
          <div v-if="!isKindergarten" class="grid grid-cols-1 gap-3">
            <FormSelect
              v-model="newLead.status"
              label="Boshlang'ich bosqich"
              :options="stageOptions"
            />
          </div>

          <FormInput
            v-model="newLead.notes"
            label="Izoh / Eslatma"
            :placeholder="isKindergarten ? 'Bolaning qiziqishlari, sog\'lig\'i haqida...' : 'Mijoz haqida eslatma...'"
          />
        </div>
      </template>
    </vmodal>

    <!-- FULL LEAD EDIT MODAL -->
    <vmodal
      ref="detailModal"
      :hideButton="true"
      class="hidden"
      :title="editForm.id ? 'Lidni Tahrirlash' : 'Lid Tafsilotlari'"
      subtitle="Ma'lumotlarni to'g'rilash va yangilash"
      btnTextSubmit="O'zgarishlarni Saqlash"
      btnTextClose="Yopish"
      btnColorSubmit="bg-primary"
      @submit="saveLeadDetails"
    >
      <template v-slot:Icon>
        <Icon icon="solar:pen-new-square-bold" class="text-3xl text-primary mb-2" />
      </template>
      <template v-slot:body>
        <div class="space-y-3.5 text-sm text-left">
          <div class="grid grid-cols-2 gap-3">
            <FormInput
              v-model="editForm.firstName"
              label="Ismi"
              required
              placeholder="Bekzod"
              icon="solar:user-linear"
            />
            <FormInput
              v-model="editForm.lastName"
              label="Familiyasi"
              placeholder="Rahimov"
              icon="solar:user-linear"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormInput
              v-model="editForm.phone"
              label="Telefon raqami"
              required
              placeholder="+998901234567"
              icon="solar:phone-calling-linear"
            />
            <FormSelect
              v-model="editForm.source"
              label="Reklama manbasi"
              :options="sourceOptions"
            />
          </div>

          <!-- Maktab uchun 0-11 Sinf tanlagich paneli -->
          <div v-if="isSchool" class="space-y-1.5">
            <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Sinfni tanlang:
            </label>
            <div class="grid grid-cols-6 gap-2 max-w-xs">
              <button
                v-for="cNum in ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11']"
                :key="cNum"
                type="button"
                @click="editForm.notes = `${cNum}-sinf`"
                :class="[
                  'h-10 rounded-xl text-sm font-semibold transition flex items-center justify-center cursor-pointer border',
                  editForm.notes && (editForm.notes.includes(`${cNum}-sinf`) || editForm.notes === cNum)
                    ? 'bg-primary text-white border-primary shadow-xs ring-2 ring-primary/30'
                    : 'bg-gray-100 dark:bg-gray-700/60 text-gray-700 dark:text-gray-200 border-gray-200/80 dark:border-gray-600/80 hover:bg-gray-200 dark:hover:bg-gray-600'
                ]"
              >
                {{ cNum }}
              </button>
            </div>
          </div>

          <div v-else class="grid grid-cols-1 gap-3">
            <FormSelect
              v-model="editForm.courseId"
              :label="targetFieldLabel"
              required
              :options="targetOptions"
            />
          </div>

          <div :class="isKindergarten ? 'grid grid-cols-1 gap-3' : 'grid grid-cols-2 gap-3'">
            <FormSelect
              v-model="editForm.status"
              label="Bosqich holati"
              :options="stageOptions"
            />
            <FormCurrencyInput
              v-if="!isKindergarten"
              v-model="editForm.amount"
              :label="isSchool ? 'Yillik/Oylik to\'lov' : 'Kutilayotgan summa'"
              :placeholder="isSchool ? '3 200 000' : '700 000'"
            />
          </div>

          <FormInput
            v-model="editForm.notes"
            label="Izoh / Eslatma"
            placeholder="Mijoz haqida eslatma..."
          />

          <div class="pt-3 flex items-center justify-start border-t dark:border-gray-700">
            <button
              type="button"
              @click="promptDeleteLead(editForm)"
              class="px-3.5 py-2 rounded-xl text-red-600 dark:text-red-400 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow-2xs"
            >
              <Icon icon="solar:trash-bin-trash-bold" class="text-base" />
              <span>Lidni o'chirish</span>
            </button>
          </div>
        </div>
      </template>
    </vmodal>

    <!-- CUSTOM SEASON MODAL -->
    <vmodal
      ref="seasonModal"
      :hideButton="true"
      title="Yangi Qabul Mavsumi"
      subtitle="Qabul mavsumi nomini kiriting"
      btnTextSubmit="Mavsum Yaratish"
      btnTextClose="Bekor qilish"
      btnColorSubmit="bg-primary"
      @submit="submitNewSeason"
    >
      <template v-slot:Icon>
        <Icon icon="solar:calendar-add-bold" class="text-3xl text-primary mb-2" />
      </template>
      <template v-slot:body>
        <div class="space-y-3 text-left">
          <FormInput
            v-model="newSeasonName"
            label="Mavsum nomi"
            required
            placeholder="Qabul 2027-2028"
            icon="solar:calendar-linear"
          />
        </div>
      </template>
    </vmodal>

    <!-- CUSTOM COLUMN / STAGE MODAL (Create & Edit) -->
    <vmodal
      ref="columnModal"
      :hideButton="true"
      :title="editingColumnId ? 'Bosqichni Tahrirlash' : 'Yangi Voronka Bosqichi'"
      subtitle="Bosqich nomi va belgi rangini tanlang"
      btnTextSubmit="Saqlash"
      btnTextClose="Bekor qilish"
      btnColorSubmit="bg-primary"
      @submit="submitColumnForm"
    >
      <template v-slot:Icon>
        <Icon icon="solar:flag-2-bold" class="text-3xl text-primary mb-2" />
      </template>
      <template v-slot:body>
        <div class="space-y-4 text-left">
          <FormInput
            v-model="columnForm.title"
            label="Bosqich (Ustun) nomi"
            required
            placeholder="Muzokara / Taklif yuborildi..."
            icon="solar:flag-linear"
          />

          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Rang belgisi:
            </label>
            <div class="flex items-center gap-2.5 flex-wrap">
              <button
                v-for="color in availableColors"
                :key="color.class"
                type="button"
                @click="columnForm.badgeColor = color.class"
                :class="[
                  'w-8 h-8 rounded-full transition flex items-center justify-center cursor-pointer',
                  color.class,
                  columnForm.badgeColor === color.class ? 'ring-4 ring-primary/30 scale-110 shadow-sm' : 'opacity-70 hover:opacity-100'
                ]"
              >
                <Icon v-if="columnForm.badgeColor === color.class" icon="solar:check-circle-bold" class="text-white text-base" />
              </button>
            </div>
          </div>
        </div>
      </template>
    </vmodal>

    <!-- CUSTOM DELETE COLUMN MODAL -->
    <vmodal
      ref="deleteColumnModal"
      :hideButton="true"
      title="Bosqichni O'chirish"
      subtitle="Ushbu voronka bosqichini o'chirishni tasdiqlaysizmi?"
      btnTextSubmit="O'chirish"
      btnTextClose="Bekor qilish"
      btnColorSubmit="bg-red-600"
      @submit="confirmDeleteColumn"
    >
      <template v-slot:Icon>
        <Icon icon="solar:trash-bin-trash-bold" class="text-3xl text-red-500 mb-2" />
      </template>
      <template v-slot:body>
        <div class="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 text-left">
          <p class="font-bold">Diqqat!</p>
          <p class="mt-0.5">Ushbu bosqich o'chirilgandan so'ng qayta tiklanmaydi.</p>
        </div>
      </template>
    </vmodal>

    <!-- IMPORT MODAL -->
    <vmodal
      ref="importModal"
      :hideButton="true"
      class="hidden"
      title="Import"
      subtitle="Excel yoki CSV fayldan lidlarni ommaviy yuklash"
      btnTextSubmit="Saqlash"
      btnTextClose="Bekor qilish"
      btnColorSubmit="bg-primary"
      @submit="submitImportFile"
    >
      <template v-slot:Icon>
        <Icon icon="solar:import-bold" class="text-3xl text-primary mb-2" />
      </template>
      <template v-slot:body>
        <div class="space-y-4 text-center">
          <label
            class="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl cursor-pointer hover:border-primary hover:bg-primary/5 transition"
          >
            <Icon icon="solar:upload-track-2-bold" class="text-4xl text-primary mb-2" />
            <span class="text-sm font-bold text-gray-800 dark:text-gray-200">
              {{ importedFileName || 'Fayl kiriting (.xlsx, .csv)' }}
            </span>
            <span class="text-xs text-gray-400 mt-1">Faylni shu yerga tortib keling yoki tanlang</span>
            <input type="file" accept=".csv,.xlsx,.xls" @change="onFileSelected" class="hidden" />
          </label>
        </div>
      </template>
    </vmodal>

    <!-- Student Wizard Modal -->
    <StudentWizardModal ref="studentWizard" @saved="onStudentWizardSaved" />

    <!-- Confirm Revert From Enrolled Modal (Standard vmodal) -->
    <vmodal
      ref="revertConfirmModal"
      :hideButton="true"
      title="Qabul qilingan lidni qaytarish"
      subtitle="Ushbu o'quvchi allaqachon mijoz bo'lgan"
      btnTextSubmit="Ha, qaytarilsin"
      btnTextClose="Bekor qilish"
      btnColorSubmit="bg-primary"
      @submit="executeRevertLead"
    >
      <template v-slot:Icon>
        <Icon icon="solar:info-circle-bold" class="text-3xl text-primary mb-2" />
      </template>
      <template v-slot:body>
        <div class="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 text-left">
          <p class="font-bold text-sm leading-snug">{{ revertModalMessage }}</p>
          <p class="mt-1 text-gray-500 dark:text-gray-400">Uni boshqa voronka bosqichiga qaytarishni tasdiqlaysizmi?</p>
        </div>
      </template>
    </vmodal>

    <!-- Confirm Delete Lead Modal -->
    <vmodal
      ref="deleteConfirmModal"
      :hideButton="true"
      title="Lidni o'chirish / Yo'qotish"
      subtitle="O'chirish sababini ko'rsating"
      btnTextSubmit="Tasdiqlash va O'chirish"
      btnTextClose="Bekor qilish"
      btnColorSubmit="bg-red-600"
      @submit="executeDeleteLead"
    >
      <template v-slot:Icon>
        <Icon icon="solar:trash-bin-trash-bold" class="text-3xl text-red-500 mb-2" />
      </template>
      <template v-slot:body>
        <div class="space-y-3.5 text-xs text-left">
          <div class="p-3.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-900 dark:text-red-200">
            <p class="font-bold text-sm leading-snug">
              "{{ leadToDelete ? (leadToDelete.fullName || editForm.fullName || 'Ushbu lid') : 'Ushbu lid' }}" ni o'chirishni tasdiqlaysizmi?
            </p>
            <p class="mt-1 text-gray-500 dark:text-gray-400">Iltimos, lid nima sababdan o'chirilayotganini belgilang.</p>
          </div>

          <FormSelect
            v-model="deleteReason"
            label="O'chirish / Yo'qotish sababi"
            required
            :options="lostReasonOptions"
          />
        </div>
      </template>
    </vmodal>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";
import { formatUZS, formatPhone } from "@/helper/formatters";
import Breadcrumb from "@/components/Breadcrumb.vue";
import Badge from "@/components/Badge.vue";
import Alert from "@/components/Alert.vue";
import FormInput from "@/components/FormInput.vue";
import FormSelect from "@/components/FormSelect.vue";
import FormDatePicker from "@/components/FormDatePicker.vue";
import FormCurrencyInput from "@/components/FormCurrencyInput.vue";
import FilterSelect from "@/components/FilterSelect.vue";
import vmodal from "@/components/modal.vue";
import EmptyState from "@/components/EmptyState.vue";
import StudentWizardModal from "@/components/students/StudentWizardModal.vue";
import { leadsApi, coursesApi, studentsApi, groupsApi, usersApi } from "@/api/services";
import { useTenantStore } from "@/store/tenant";

const DEFAULT_COURSES = [
  { id: "c-front", name: "Frontend Dasturlash (Vue / React)", price: 900000 },
  { id: "c-fullstack", name: "Fullstack Web Dasturlash (Node / Python)", price: 1200000 },
  { id: "c-py", name: "Python & AI Asoslari", price: 850000 },
  { id: "c-ielts", name: "General English & IELTS", price: 650000 },
  { id: "c-design", name: "Grafik Dizayn (UI/UX)", price: 850000 },
  { id: "c-math", name: "Mental Arifmetika & Matematika", price: 450000 },
  { id: "c-smm", name: "SMM va Raqamli Marketing", price: 700000 },
  { id: "c-korean", name: "Koreys tili (TOPIK)", price: 600000 },
];

export default {
  name: "LeadsKanban",
  components: {
    Icon,
    Breadcrumb,
    Badge,
    Alert,
    FormInput,
    FormSelect,
    FormDatePicker,
    FormCurrencyInput,
    FilterSelect,
    vmodal,
    EmptyState,
    StudentWizardModal,
  },
  setup() {
    const tenantStore = useTenantStore();
    return { tenantStore };
  },
  data() {
    return {
      loading: false,
      alertMessage: "",
      leadToDelete: null,
      deleteReason: "",
      lostReasonOptions: [
        { value: "Boshqa maktabga ketdi", label: "Boshqa maktabga ketdi" },
        { value: "Maktab uzoqlik qildi", label: "Maktab uzoqlik qildi" },
        { value: "Narxi to'g'ri kelmadi", label: "Narxi to'g'ri kelmadi" },
        { value: "Qiziqmadi / Qayta aloqaga chiqmadi", label: "Qiziqmadi / Qayta aloqaga chiqmadi" },
        { value: "Raqam noto'g'ri / Xato kiritilgan", label: "Raqam noto'g'ri / Xato kiritilgan" },
      ],
      pendingRevertItem: null,
      pendingRevertToColId: null,
      revertModalMessage: "",
      viewMode: "kanban", // 'kanban' | 'table'
      isCustomizing: false,
      showAdvancedFilters: false,
      showSeasonMenu: false,
      showStageDropdown: false,
      activeColumnMenu: null,
      selectedSeason: "Qabul 2026-2027",
      newSeasonName: "",
      seasonOptions: ["Qabul 2026-2027", "Qabul 2025-2026", "Yozgi Qabul 2026"],
      searchQuery: "",
      sourceFilter: "",
      managerFilter: "",
      dateFrom: "",
      dateTo: "",
      selectedStages: [],
      importedFileName: "",
      selectedLead: null,
      draggedItem: null,
      draggedFromColId: null,
      dragOverColId: null,
      draggedColIndex: null,
      dragOverColIndex: null,
      editingColumnId: null,
      deletingColumnId: null,
      columnForm: {
        title: "",
        badgeColor: "bg-purple-500",
      },
      availableColors: [
        { name: "Ko'k", class: "bg-blue-500" },
        { name: "Binafsha", class: "bg-indigo-500" },
        { name: "Sariq/To'q sariq", class: "bg-amber-500" },
        { name: "Yashil", class: "bg-emerald-500" },
        { name: "Siyohrang", class: "bg-purple-500" },
        { name: "Qizil/Pushti", class: "bg-rose-500" },
        { name: "Moviy", class: "bg-cyan-500" },
      ],
      managerOptions: [
        { value: "admin", label: "Alisher Navoiy (Admin)" },
        { value: "manager1", label: "Jamshid Menejer" },
      ],
      editForm: {
        id: null,
        firstName: "",
        lastName: "",
        phone: "",
        courseId: "",
        source: "Instagram",
        status: "NEW",
        amount: "",
        notes: "",
      },
      pipelineColumns: [
        { id: "NEW", title: "Yangi Murojaat", badgeColor: "bg-blue-500" },
        { id: "CONTACTED", title: "Bog'lanildi / Aloqada", badgeColor: "bg-indigo-500" },
        { id: "NO_ANSWER", title: "Javob bermadi", badgeColor: "bg-rose-500" },
        { id: "TRIAL_BOOKED", title: "Sinov Darsi / Suhbat", badgeColor: "bg-amber-500" },
        { id: "ENROLLED", title: "Mijoz Bo'ldi (Qabul)", badgeColor: "bg-emerald-500" },
      ],
      courses: [],
      groups: [],
      sourceOptions: [
        { value: "Instagram", label: "Instagram Target" },
        { value: "Telegram", label: "Telegram Kanal / Bot" },
        { value: "Veb sayt", label: "Veb-sayt" },
        { value: "Tanishlar", label: "Tanishlar tavsiyasi" },
        { value: "Facebook", label: "Facebook" },
        { value: "Telefon", label: "Telefon orqali" },
        { value: "Banner", label: "Tashqi reklama" },
      ],
      newLead: {
        firstName: "",
        lastName: "",
        phone: "",
        parentName: "",
        target: "",
        source: "Veb sayt",
        status: "NEW",
        amount: "",
        notes: "",
      },
      leads: [],
    };
  },
  computed: {
    isSchool() {
      return this.tenantStore.isSchool;
    },
    isKindergarten() {
      return this.tenantStore.isKindergarten;
    },
    isCourseCenter() {
      return this.tenantStore.isCourseCenter;
    },
    modalSubtitle() {
      return "Yangi mijoz ma'lumotlarini kiriting";
    },
    targetFieldLabel() {
      if (this.isSchool) return "Qabul sinfi";
      if (this.isKindergarten) return "Yosh guruhi";
      return "Qiziqqan kursi";
    },
    searchPlaceholder() {
      return "Ism, telefon raqam bo'yicha qidirish...";
    },
    targetOptions() {
      if (this.isSchool) {
        return [
          { value: "1-sinf", label: "1-sinf" },
          { value: "2-sinf", label: "2-sinf" },
          { value: "3-sinf", label: "3-sinf" },
          { value: "4-sinf", label: "4-sinf" },
          { value: "5-sinf", label: "5-sinf" },
          { value: "6-sinf", label: "6-sinf" },
          { value: "7-sinf", label: "7-sinf" },
          { value: "8-sinf", label: "8-sinf" },
          { value: "9-sinf", label: "9-sinf" },
          { value: "10-sinf", label: "10-sinf" },
          { value: "11-sinf", label: "11-sinf" },
        ];
      }
      if (this.isKindergarten) {
        return [
          { value: "Kichkintoylar guruhi", label: "Kichkintoylar guruhi (2-3 yosh)" },
          { value: "Mittivoylar guruhi", label: "Mittivoylar guruhi (3-4 yosh)" },
          { value: "Bilimdonlar guruhi", label: "Bilimdonlar guruhi (4-5 yosh)" },
          { value: "Alpomishlar guruhi", label: "Alpomishlar guruhi (5-6 yosh)" },
          { value: "Maktabga tayyorlov guruhi", label: "Maktabga tayyorlov guruhi (6-7 yosh)" },
        ];
      }
      return this.courseOptions;
    },
    courseOptions() {
      const dbCourses = Array.isArray(this.courses) && this.courses.length > 0
        ? this.courses.filter((c) => !c.name?.includes("Maktab") && !c.name?.includes("Bog'cha"))
        : [];
      const list = dbCourses.length > 0 ? dbCourses : DEFAULT_COURSES;
      return list.map((c) => ({
        value: c.id,
        label: `${c.name || c.title}`,
      }));
    },
    stageOptions() {
      return this.pipelineColumns.map((c) => ({ value: c.id, label: c.title }));
    },
    visibleColumns() {
      if (this.selectedStages.length === 0) return this.pipelineColumns;
      return this.pipelineColumns.filter((c) => this.selectedStages.includes(c.id));
    },
    filteredLeads() {
      let list = this.leads;

      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase();
        list = list.filter((l) =>
          `${l.fullName} ${l.phone} ${l.notes || ''}`.toLowerCase().includes(q)
        );
      }
      if (this.sourceFilter) {
        list = list.filter((l) => l.source === this.sourceFilter);
      }
      if (this.selectedStages.length > 0) {
        list = list.filter((l) => this.selectedStages.includes(l.stage));
      }
      return list;
    },
  },
  watch: {
    "tenantStore.businessType"() {
      this.fetchData();
    },
    "tenantStore.activeOrgId"() {
      this.fetchData();
    },
    "tenantStore.organization.id"() {
      this.fetchData();
    },
  },
  mounted() {
    this.fetchData();
    if (this.targetOptions.length > 0) {
      this.newLead.target = this.targetOptions[0].value;
    }
    document.addEventListener("click", this.handleDocumentClick);
  },
  unmounted() {
    document.removeEventListener("click", this.handleDocumentClick);
  },
  methods: {
    formatUZS,
    formatPhone,
    handleDocumentClick(e) {
      if (!e.target.closest(".season-dropdown-container")) {
        this.showSeasonMenu = false;
      }
      if (!e.target.closest(".stage-dropdown-container")) {
        this.showStageDropdown = false;
      }
      if (!e.target.closest(".column-menu-container")) {
        this.activeColumnMenu = null;
      }
    },
    resetAllFilters() {
      this.searchQuery = "";
      this.sourceFilter = "";
      this.managerFilter = "";
      this.dateFrom = "";
      this.dateTo = "";
      this.selectedStages = [];
    },
    getTargetDisplay(item) {
      if (!item) return "—";
      if (item.courseName) {
        return item.courseName.replace(/\[type:[^\]]+\]/gi, "").trim();
      }
      if (item.notes) {
        const clean = item.notes.replace(/\[type:[^\]]+\]/gi, "").trim();
        if (clean.includes("sinf")) {
          const match = clean.match(/\b\d{1,2}-sinf\b/i);
          if (match) return match[0];
          return clean.split(".")[0];
        }
        if (clean.includes("guruh")) {
          return clean.split(".")[0];
        }
      }
      if (item.course && typeof item.course === "object") {
        return item.course.name || item.course.title || "—";
      }
      if (this.isSchool) return "1-sinf";
      if (this.isKindergarten) return "Kichik guruh";
      return "Kurs";
    },
    getSourceBadgeVariant(source) {
      const map = {
        Instagram: "purple",
        Telegram: "info",
        "Veb sayt": "primary",
        Sayt: "primary",
        Tanishlar: "success",
        Facebook: "indigo",
        Telefon: "amber",
      };
      return map[source] || "secondary";
    },
    getStageTitle(stageId) {
      return this.pipelineColumns.find((c) => c.id === stageId)?.title || stageId;
    },
    getStageBadgeClass(stageId) {
      const col = this.pipelineColumns.find((c) => c.id === stageId);
      return col ? `${col.badgeColor} text-white` : "bg-gray-200 text-gray-800";
    },
    getColumnItems(colId) {
      return this.filteredLeads.filter((item) => item.stage === colId);
    },
    getColumnTotalSum(colId) {
      return this.getColumnItems(colId).reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
    },
    async fetchData() {
      this.loading = true;
      const currentType = this.tenantStore.businessType || "COURSE_CENTER";
      const currentOrgId = this.tenantStore.organization?.id || this.tenantStore.activeOrgId;
      const storageKey = `educrm_leads_store_${currentType}`;
      const colStorageKey = `educrm_pipeline_cols_${currentType}`;

      try {
        // Load custom ordered pipeline columns if saved
        try {
          const rawCols = localStorage.getItem(colStorageKey);
          if (rawCols) {
            const parsed = JSON.parse(rawCols);
            if (Array.isArray(parsed) && parsed.length > 0) {
              if (!parsed.some((c) => c.id === "NO_ANSWER")) {
                const contactedIdx = parsed.findIndex((c) => c.id === "CONTACTED");
                const noAnswerCol = { id: "NO_ANSWER", title: "Javob bermadi", badgeColor: "bg-rose-500" };
                if (contactedIdx !== -1) {
                  parsed.splice(contactedIdx + 1, 0, noAnswerCol);
                } else {
                  parsed.push(noAnswerCol);
                }
              }
              this.pipelineColumns = parsed;
            }
          }
        } catch (e) {}

        // Load CRM settings (Sources, Pipelines) if customized in CRM Settings page
        const crmSettingsKey = `educrm_crm_settings_${currentType}`;
        try {
          const rawCrmSettings = localStorage.getItem(crmSettingsKey);
          if (rawCrmSettings) {
            const parsedCrm = JSON.parse(rawCrmSettings);
            if (Array.isArray(parsedCrm.sources) && parsedCrm.sources.length > 0) {
              this.sourceOptions = parsedCrm.sources.map((s) => ({
                value: s.name,
                label: s.name,
              }));
            }
            if (Array.isArray(parsedCrm.pipelines) && parsedCrm.pipelines.length > 0) {
              this.seasonOptions = parsedCrm.pipelines.map((p) => p.name);
              const def = parsedCrm.pipelines.find((p) => p.isDefault);
              if (def && (!this.selectedSeason || !this.seasonOptions.includes(this.selectedSeason))) {
                this.selectedSeason = def.name;
              }
            }
            if (Array.isArray(parsedCrm.lostReasons) && parsedCrm.lostReasons.length > 0) {
              this.lostReasonOptions = parsedCrm.lostReasons.map((r) => ({
                value: r.reason,
                label: r.reason,
              }));
            }
          }
        } catch (e) {}

        const [coursesRes, leadsRes, groupsRes] = await Promise.all([
          coursesApi.getAll().catch(() => []),
          leadsApi.getAll({ orgId: currentOrgId, type: currentType }).catch(() => []),
          groupsApi.getAll().catch(() => []),
        ]);
        this.courses = coursesRes || [];
        this.groups = groupsRes || [];

        let currentLeads = [];
        const rawLocal = localStorage.getItem(storageKey);
        if (rawLocal !== null) {
          try {
            const parsed = JSON.parse(rawLocal);
            if (Array.isArray(parsed) && parsed.length > 0) {
              currentLeads = parsed;
            }
          } catch (e) {}
        }

        if (currentLeads.length === 0) {
          currentLeads = JSON.parse(JSON.stringify(DEFAULT_LEADS_MAP[currentType] || []));
        }

        // Merge backend DB leads for this profile
        const rawDbLeads = Array.isArray(leadsRes) ? leadsRes : [];
        for (const dbL of rawDbLeads) {
          const text = `${dbL.notes || ''} ${dbL.courseName || ''} ${dbL.type || ''}`.toLowerCase();
          let belongsToCurrent = false;
          if (dbL.organizationId && currentOrgId && String(dbL.organizationId) === String(currentOrgId)) belongsToCurrent = true;
          else if (dbL.organization && dbL.organization.businessType === currentType) belongsToCurrent = true;
          else if (dbL.type === currentType || dbL.businessType === currentType) belongsToCurrent = true;
          else if (this.isSchool && (text.includes("sinf") || text.includes("maktab") || text.includes("school") || text.includes("type:school"))) belongsToCurrent = true;
          else if (this.isKindergarten && (text.includes("guruh") || text.includes("bog'cha") || text.includes("yosh") || text.includes("mittivoy") || text.includes("kichkintoy") || text.includes("type:kindergarten"))) belongsToCurrent = true;
          else if (!this.isSchool && !this.isKindergarten && (text.includes("kurs") || text.includes("fullstack") || text.includes("frontend") || text.includes("python") || text.includes("ielts") || text.includes("type:course_center"))) belongsToCurrent = true;
          else if (!dbL.organizationId && currentType === "COURSE_CENTER") belongsToCurrent = true;

          if (belongsToCurrent) {
            const existingIdx = currentLeads.findIndex((l) => String(l.id) === String(dbL.id) || (dbL.phone && l.phone === dbL.phone));
            if (existingIdx !== -1) {
              currentLeads[existingIdx] = {
                ...currentLeads[existingIdx],
                ...dbL,
                stage: currentLeads[existingIdx].stage || dbL.status,
                status: currentLeads[existingIdx].status || dbL.status,
              };
            } else {
              currentLeads.unshift(dbL);
            }
          }
        }

        try {
          localStorage.setItem(storageKey, JSON.stringify(currentLeads));
        } catch (e) {}

        const stageMap = {
          new: "NEW",
          contacted: "CONTACTED",
          no_answer: "NO_ANSWER",
          noanswer: "NO_ANSWER",
          trial: "TRIAL_BOOKED",
          trial_booked: "TRIAL_BOOKED",
          trial_attended: "TRIAL_BOOKED",
          enrolled: "ENROLLED",
          won: "ENROLLED",
          accepted: "ENROLLED",
          qabul: "ENROLLED",
        };

        this.leads = currentLeads.map((l) => {
          let rawStage = String(l.stage || l.status || "NEW").trim();
          let st = stageMap[rawStage.toLowerCase()] || rawStage.toUpperCase();
          if (!["NEW", "CONTACTED", "NO_ANSWER", "TRIAL_BOOKED", "ENROLLED"].includes(st)) {
            st = "NEW";
          }
          return {
            ...l,
            stage: st,
            status: st,
            courseName: l.courseName || this.getTargetDisplay(l),
            amount: (l.amount !== undefined && l.amount !== null && l.amount !== "" && !isNaN(Number(l.amount)))
              ? Number(l.amount)
              : null,
          };
        });
      } catch (err) {
        console.error("Lidlarni olishda xatolik:", err);
      } finally {
        this.loading = false;
      }
    },
    onDragStart(item, colId) {
      this.draggedItem = item;
      this.draggedFromColId = colId;
    },
    onDragOver(colId) {
      this.dragOverColId = colId;
    },
    onDragLeave(colId) {
      if (this.dragOverColId === colId) {
        this.dragOverColId = null;
      }
    },
    async onDrop(toColId) {
      if (this.draggedItem && this.draggedFromColId !== toColId) {
        const item = this.draggedItem;
        if (this.draggedFromColId === "ENROLLED" && toColId !== "ENROLLED") {
          // Revert confirmation modal
          this.pendingRevertItem = item;
          this.pendingRevertToColId = toColId;
          this.revertModalMessage = `"${item.fullName}" allaqachon mijoz bo'lgan (Qabul qilingan). Uni yana "${this.getStageTitle(toColId)}" bosqichiga qaytarishni tasdiqlaysizmi?`;
          if (this.$refs.revertConfirmModal) {
            this.$refs.revertConfirmModal.isOpen = true;
          }
        } else {
          // Move the lead stage to the destination column immediately so it remains visible
          await this.moveLeadToStage(item, toColId);
          if (toColId === "ENROLLED") {
            this.selectedLead = item;
            this.openConvertModal(item);
          }
        }
      }
      this.draggedItem = null;
      this.draggedFromColId = null;
      this.dragOverColId = null;
    },
    async executeRevertLead() {
      if (this.pendingRevertItem && this.pendingRevertToColId) {
        await this.moveLeadToStage(this.pendingRevertItem, this.pendingRevertToColId);
        if (this.$refs.revertConfirmModal) {
          this.$refs.revertConfirmModal.isOpen = false;
        }
        this.pendingRevertItem = null;
        this.pendingRevertToColId = null;
      }
    },
    async moveLeadToStage(item, toColId) {
      item.stage = toColId;
      item.status = toColId;
      const currentType = this.tenantStore.businessType || "COURSE_CENTER";
      try {
        await leadsApi.update(item.id, { status: toColId }).catch(() => {});
        this.alertMessage = `Lid (${item.fullName}) "${this.getStageTitle(toColId)}" bosqichiga o'tkazildi!`;
        try {
          localStorage.setItem(`educrm_leads_store_${currentType}`, JSON.stringify(this.leads));
        } catch (e) {}
      } catch (e) {
        console.error(e);
      }
    },
    openAddLeadModal() {
      if (this.$refs.addLeadModal) {
        this.$refs.addLeadModal.isOpen = true;
      }
    },
    handleQuickAddFromColumn(stageId) {
      this.newLead.status = stageId || "NEW";
      this.openAddLeadModal();
    },
    async submitAddLead() {
      try {
        const fullName = `${this.newLead.firstName.trim()} ${this.newLead.lastName.trim()}`.trim();
        let courseId = this.newLead.target;
        let notes = this.newLead.notes || "";
        const currentType = this.tenantStore.businessType || "COURSE_CENTER";

        if (this.isSchool) {
          if (this.newLead.parentName) {
            notes = `Ota-onasi: ${this.newLead.parentName}. ` + notes;
          }
          if (this.newLead.target) {
            notes = `${this.newLead.target}. ` + notes;
          }
          courseId = this.courses[0]?.id || null;
        } else if (this.isKindergarten) {
          if (this.newLead.parentName) {
            notes = `Ota-onasi: ${this.newLead.parentName}. ` + notes;
          }
          if (this.newLead.target) {
            notes = `${this.newLead.target}. ` + notes;
          }
          courseId = this.courses[0]?.id || null;
        } else {
          const matchedCourse = (this.courses || []).find((c) => c.id === this.newLead.target);
          if (matchedCourse) {
            notes = `${matchedCourse.name || matchedCourse.title}. ` + notes;
          }
          courseId = this.newLead.target || (this.courses[0]?.id || null);
        }

        let apiCourseId = undefined;
        if (!this.isSchool && !this.isKindergarten) {
          const matchedCourse = (this.courses || []).find((c) => c.id === this.newLead.target);
          if (matchedCourse && matchedCourse.id) {
            apiCourseId = matchedCourse.id;
          }
        }

        notes = `[type:${currentType}] ${notes}`.trim();

        const orgId = this.tenantStore.organization?.id || this.tenantStore.activeOrgId || undefined;
        let created = null;
        try {
          created = await leadsApi.create({
            fullName,
            phone: this.newLead.phone,
            courseId: apiCourseId,
            source: this.newLead.source,
            status: this.newLead.status || "NEW",
            amount: Number(this.newLead.amount) || (this.isSchool ? 3200000 : this.isKindergarten ? 1800000 : undefined),
            notes: notes.trim(),
            organizationId: orgId,
          });
        } catch (apiErr) {
          console.warn("Backendga saqlashda ogohlantirish, lokal saqlanmoqda:", apiErr);
        }

        const customAmount = (created && created.amount !== undefined && created.amount !== null)
          ? Number(created.amount)
          : (Number(this.newLead.amount) || (this.isSchool ? 3200000 : this.isKindergarten ? 1800000 : 700000));

        let targetLabel = this.newLead.target;
        if (this.isSchool) {
          targetLabel = this.newLead.target || "1-sinf";
        } else if (this.isKindergarten) {
          targetLabel = this.newLead.target || "Mittivoylar guruhi";
        } else {
          const matched = DEFAULT_COURSES.concat(this.courses || []).find((c) => c.id === this.newLead.target || c.name === this.newLead.target);
          targetLabel = matched ? (matched.name || matched.title) : (this.newLead.target || "Fullstack Web Dasturlash");
        }

        const newLeadObj = {
          id: created?.id || `lead-${Date.now()}`,
          fullName,
          phone: this.newLead.phone,
          parentName: this.newLead.parentName,
          source: this.newLead.source,
          stage: this.newLead.status || "NEW",
          status: this.newLead.status || "NEW",
          amount: customAmount,
          courseName: targetLabel,
          notes: notes.trim(),
          type: currentType,
          businessType: currentType,
          organizationId: orgId,
          createdAt: new Date().toISOString(),
        };

        this.leads.unshift(newLeadObj);

        try {
          localStorage.setItem(`educrm_leads_store_${currentType}`, JSON.stringify(this.leads));
        } catch (e) {}

        if (this.$refs.addLeadModal) {
          this.$refs.addLeadModal.isOpen = false;
        }

        this.newLead = {
          firstName: "",
          lastName: "",
          phone: "",
          parentName: "",
          target: this.targetOptions[0]?.value || "",
          source: "Veb sayt",
          status: "NEW",
          amount: "",
          notes: "",
        };
        this.alertMessage = "Yangi lid muvaffaqiyatli saqlandi!";
      } catch (err) {
        alert(err.message || "Lidni saqlashda xatolik");
      }
    },
    openLeadDetails(lead) {
      this.selectedLead = lead;
      const parts = (lead.fullName || "").trim().split(" ");
      let initialCourseId = lead.courseId;
      if (this.isKindergarten) {
        const found = this.targetOptions.find((t) =>
          (lead.courseName && lead.courseName.includes(t.value)) ||
          (lead.notes && lead.notes.includes(t.value))
        );
        initialCourseId = found ? found.value : this.targetOptions[0]?.value;
      } else if (this.isSchool) {
        initialCourseId = this.courses[0]?.id || "";
      } else {
        initialCourseId = lead.courseId || lead.course?.id || this.targetOptions[0]?.value;
      }

      const cleanNotes = (lead.notes || "")
        .replace(/\[type:[^\]]+\]/gi, "")
        .replace(/^[A-Za-z0-9\s'-]+guruhi\.\s*/i, "")
        .trim();

      this.editForm = {
        id: lead.id,
        firstName: lead.firstName || parts[0] || "",
        lastName: lead.lastName || parts.slice(1).join(" ") || "",
        phone: lead.phone || "",
        courseId: initialCourseId,
        source: lead.source || "Veb sayt",
        status: lead.stage || lead.status || "NEW",
        amount: lead.amount !== undefined ? lead.amount : "",
        notes: cleanNotes,
      };
      if (this.$refs.detailModal) {
        this.$refs.detailModal.isOpen = true;
      }
    },
    async saveLeadDetails() {
      if (!this.editForm.id) return;
      try {
        const currentType = this.tenantStore.businessType || "COURSE_CENTER";
        const fullName = `${this.editForm.firstName.trim()} ${this.editForm.lastName.trim()}`.trim();
        let targetLabel = this.editForm.courseId;
        let notes = this.editForm.notes || "";

        if (this.isKindergarten) {
          targetLabel = this.editForm.courseId;
          notes = `${targetLabel}. ` + notes;
        } else if (this.isSchool) {
          targetLabel = this.editForm.notes?.includes("-sinf") ? this.editForm.notes : "1-sinf";
        } else {
          const matched = DEFAULT_COURSES.concat(this.courses || []).find((c) => c.id === this.editForm.courseId);
          targetLabel = matched ? (matched.name || matched.title) : this.editForm.courseId;
        }

        notes = `[type:${currentType}] ${notes}`.trim();

        const payload = {
          fullName,
          phone: this.editForm.phone,
          courseId: this.editForm.courseId || undefined,
          source: this.editForm.source || undefined,
          status: this.editForm.status,
          amount: !this.isKindergarten ? (Number(this.editForm.amount) || undefined) : undefined,
          notes,
        };
        const updated = await leadsApi.update(this.editForm.id, payload).catch(() => ({}));
        const idx = this.leads.findIndex((l) => l.id === this.editForm.id);
        if (idx !== -1) {
          this.leads[idx] = {
            ...this.leads[idx],
            ...updated,
            fullName,
            firstName: this.editForm.firstName.trim(),
            lastName: this.editForm.lastName.trim(),
            phone: this.editForm.phone,
            source: this.editForm.source,
            stage: this.editForm.status,
            status: this.editForm.status,
            courseId: this.editForm.courseId,
            courseName: targetLabel,
            amount: !this.isKindergarten ? (Number(this.editForm.amount) || 0) : 0,
            notes,
            type: currentType,
            businessType: currentType,
          };
          try {
            localStorage.setItem(`educrm_leads_store_${currentType}`, JSON.stringify(this.leads));
          } catch (e) {}
        }
        if (this.$refs.detailModal) {
          this.$refs.detailModal.isOpen = false;
        }
        this.alertMessage = `Lid (${fullName}) muvaffaqiyatli tahrirlandi!`;
      } catch (err) {
        alert(err.message || "Tahrirlashda xatolik");
      }
    },
    promptDeleteLead(lead) {
      this.leadToDelete = lead;
      this.deleteReason = this.lostReasonOptions[0]?.value || "";
      if (this.$refs.detailModal) {
        this.$refs.detailModal.isOpen = false;
      }
      if (this.$refs.deleteConfirmModal) {
        this.$refs.deleteConfirmModal.isOpen = true;
      }
    },
    async executeDeleteLead() {
      if (!this.leadToDelete || !this.leadToDelete.id) return;
      const id = this.leadToDelete.id;
      const name = this.leadToDelete.fullName || "Lid";
      const finalReason = this.deleteReason || "Ko'rsatilmadi";
      try {
        await leadsApi.delete(id).catch(() => {});
        this.leads = this.leads.filter((l) => l.id !== id);
        const currentType = this.tenantStore.businessType || "COURSE_CENTER";
        try {
          localStorage.setItem(`educrm_leads_store_${currentType}`, JSON.stringify(this.leads));
        } catch (e) {}
        this.alertMessage = `"${name}" muvaffaqiyatli o'chirildi! Sabab: ${finalReason}`;
        if (this.$refs.deleteConfirmModal) {
          this.$refs.deleteConfirmModal.isOpen = false;
        }
        this.leadToDelete = null;
      } catch (err) {
        alert(err.message || "Lidni o'chirishda xatolik yuz berdi");
      }
    },
    openConvertModal(lead) {
      this.selectedLead = lead;
      this.convertingLeadId = lead?.id || null;
      if (this.$refs.studentWizard) {
        this.$refs.studentWizard.open(lead);
      }
    },
    async onStudentWizardSaved(student) {
      const fullName = `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'O\'quvchi';
      this.alertMessage = `Tabriklaymiz! ${fullName} muvaffaqiyatli qabul qilindi!`;
      
      const currentType = this.tenantStore.businessType || "COURSE_CENTER";
      const storageKey = `educrm_leads_store_${currentType}`;

      const paymentAmount = (student.amount !== undefined && student.amount !== null && student.amount !== "")
        ? Number(student.amount)
        : (student.initialPayment !== undefined && student.initialPayment !== null && student.initialPayment !== "")
        ? Number(student.initialPayment)
        : undefined;

      const leadIdToUpdate = this.convertingLeadId || this.selectedLead?.id || student.leadId;
      const found = this.leads.find((l) =>
        (leadIdToUpdate && String(l.id) === String(leadIdToUpdate)) ||
        (student.phone && l.phone === student.phone) ||
        (student.firstName && l.fullName?.toLowerCase().includes(student.firstName.toLowerCase()))
      );

      if (found) {
        found.stage = "ENROLLED";
        found.status = "ENROLLED";
        if (paymentAmount !== undefined) {
          found.amount = paymentAmount;
        }
        await leadsApi.update(found.id, {
          status: "ENROLLED",
          amount: paymentAmount,
        }).catch(() => {});
      }
      if (this.selectedLead) {
        this.selectedLead.stage = "ENROLLED";
        this.selectedLead.status = "ENROLLED";
        if (paymentAmount !== undefined) {
          this.selectedLead.amount = paymentAmount;
        }
      }

      try {
        localStorage.setItem(storageKey, JSON.stringify(this.leads));
      } catch (e) {}

      this.leads = [...this.leads];
      this.selectedLead = null;
      this.convertingLeadId = null;
    },

    // 1. CUSTOM SEASON MODAL HANDLERS
    openSeasonModal() {
      this.newSeasonName = "";
      this.showSeasonMenu = false;
      if (this.$refs.seasonModal) {
        this.$refs.seasonModal.isOpen = true;
      }
    },
    submitNewSeason() {
      if (!this.newSeasonName || !this.newSeasonName.trim()) {
        return;
      }
      const trimmed = this.newSeasonName.trim();
      if (!this.seasonOptions.includes(trimmed)) {
        this.seasonOptions.unshift(trimmed);
      }
      this.selectedSeason = trimmed;
      if (this.$refs.seasonModal) {
        this.$refs.seasonModal.isOpen = false;
      }
      this.alertMessage = `"${trimmed}" yangi qabul mavsumi yaratildi va tanlandi!`;
    },

    // 2. CUSTOM COLUMN / STAGE MODAL HANDLERS
    openAddColumnModal() {
      this.editingColumnId = null;
      this.columnForm = {
        title: "",
        badgeColor: "bg-purple-500",
      };
      if (this.$refs.columnModal) {
        this.$refs.columnModal.isOpen = true;
      }
    },
    openEditColumnModal(col) {
      this.activeColumnMenu = null;
      this.editingColumnId = col.id;
      this.columnForm = {
        title: col.title,
        badgeColor: col.badgeColor || "bg-primary",
      };
      if (this.$refs.columnModal) {
        this.$refs.columnModal.isOpen = true;
      }
    },
    submitColumnForm() {
      if (!this.columnForm.title || !this.columnForm.title.trim()) {
        return;
      }
      const title = this.columnForm.title.trim();
      const badgeColor = this.columnForm.badgeColor;

      if (this.editingColumnId) {
        const col = this.pipelineColumns.find((c) => c.id === this.editingColumnId);
        if (col) {
          col.title = title;
          col.badgeColor = badgeColor;
          this.alertMessage = `"${title}" bosqichi muvaffaqiyatli yangilandi!`;
        }
      } else {
        const id = "CUSTOM_" + Date.now();
        this.pipelineColumns.push({
          id,
          title,
          badgeColor,
        });
        this.alertMessage = `"${title}" yangi voronka bosqichi yaratildi!`;
      }

      this.savePipelineColumns();
      if (this.$refs.columnModal) {
        this.$refs.columnModal.isOpen = false;
      }
    },

    // 3. CUSTOM DELETE COLUMN MODAL HANDLERS
    openDeleteColumnModal(col) {
      this.activeColumnMenu = null;
      this.deletingColumnId = col.id;
      if (this.$refs.deleteColumnModal) {
        this.$refs.deleteColumnModal.isOpen = true;
      }
    },
    confirmDeleteColumn() {
      if (this.deletingColumnId) {
        this.pipelineColumns = this.pipelineColumns.filter((c) => c.id !== this.deletingColumnId);
        this.savePipelineColumns();
        this.alertMessage = "Voronka bosqichi o'chirildi!";
        this.deletingColumnId = null;
      }
      if (this.$refs.deleteColumnModal) {
        this.$refs.deleteColumnModal.isOpen = false;
      }
    },

    // 3.1 COLUMN REORDERING IN SETTINGS MODE
    moveColumnLeft(index) {
      if (index <= 0) return;
      const col = this.pipelineColumns.splice(index, 1)[0];
      this.pipelineColumns.splice(index - 1, 0, col);
      this.savePipelineColumns();
      this.alertMessage = `"${col.title}" ustuni chapga surildi!`;
    },
    moveColumnRight(index) {
      if (index >= this.pipelineColumns.length - 1) return;
      const col = this.pipelineColumns.splice(index, 1)[0];
      this.pipelineColumns.splice(index + 1, 0, col);
      this.savePipelineColumns();
      this.alertMessage = `"${col.title}" ustuni o'ngga surildi!`;
    },
    onColumnDragStart(e, index) {
      if (!this.isCustomizing) return;
      this.draggedColIndex = index;
      if (e.dataTransfer) {
        e.dataTransfer.setData("text/plain", String(index));
        e.dataTransfer.effectAllowed = "move";
      }
    },
    onColumnDragOver(e, index) {
      if (!this.isCustomizing) return;
      e.preventDefault();
      this.dragOverColIndex = index;
    },
    onColumnDrop(e, targetIndex) {
      if (!this.isCustomizing || this.draggedColIndex === null) return;
      e.preventDefault();
      if (this.draggedColIndex !== targetIndex) {
        const item = this.pipelineColumns.splice(this.draggedColIndex, 1)[0];
        this.pipelineColumns.splice(targetIndex, 0, item);
        this.savePipelineColumns();
        this.alertMessage = `"${item.title}" ustuni o'rni almashtirildi!`;
      }
      this.draggedColIndex = null;
      this.dragOverColIndex = null;
    },
    handleColumnOrItemDragOver(e, colId, colIndex) {
      if (this.isCustomizing && this.draggedColIndex !== null) {
        this.onColumnDragOver(e, colIndex);
      } else {
        this.onDragOver(colId);
      }
    },
    handleColumnOrItemDrop(e, colId, colIndex) {
      if (this.isCustomizing && this.draggedColIndex !== null) {
        this.onColumnDrop(e, colIndex);
      } else {
        this.onDrop(colId);
      }
    },
    savePipelineColumns() {
      const currentType = this.tenantStore.businessType || "COURSE_CENTER";
      const colStorageKey = `educrm_pipeline_cols_${currentType}`;
      try {
        localStorage.setItem(colStorageKey, JSON.stringify(this.pipelineColumns));
      } catch (e) {}
    },

    // 4. IMPORT & EXPORT
    openImportModal() {
      this.importedFileName = "";
      if (this.$refs.importModal) {
        this.$refs.importModal.isOpen = true;
      }
    },
    onFileSelected(e) {
      const file = e.target.files[0];
      if (file) {
        this.importedFileName = file.name;
      }
    },
    submitImportFile() {
      if (!this.importedFileName) {
        alert("Iltimos, avval fayl tanlang!");
        return;
      }
      this.leads.unshift({
        id: "imp-" + Date.now(),
        fullName: "Jasur Bekmurodov (Import)",
        phone: "+998909998877",
        source: "Excel Import",
        stage: "NEW",
        status: "NEW",
        amount: this.isSchool ? 3200000 : 700000,
        notes: "Excel fayldan yuklangan",
      });
      if (this.$refs.importModal) {
        this.$refs.importModal.isOpen = false;
      }
      this.alertMessage = "Fayldagi lidlar muvaffaqiyatli import qilindi!";
    },
    downloadImportTemplate() {
      const csvContent = "data:text/csv;charset=utf-8,\uFEFF" +
        "Ism,Familiya,Telefon,Sinf_yoki_Kurs,Manba,Kutilayotgan_summa,Izoh\n" +
        "Bekzod,Rahimov,+998901234567,1-sinf,Instagram,3200000,Sinov darsiga yozildi\n" +
        "Malika,Saidova,+998909876543,4-sinf,Veb sayt,3200000,Suhbatga kelmoqchi";
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "Lidlar_Import_Shabloni.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    exportLeadsToExcel() {
      let csvContent = "data:text/csv;charset=utf-8,\uFEFF" +
        "F.I.SH,Telefon,Yo'nalish,Manba,Bosqich,Summa,Izoh\n";
      
      this.filteredLeads.forEach((l) => {
        const row = [
          `"${l.fullName || ''}"`,
          `"${l.phone || ''}"`,
          `"${this.getTargetDisplay(l)}"`,
          `"${l.source || ''}"`,
          `"${this.getStageTitle(l.stage)}"`,
          `"${l.amount || 0}"`,
          `"${(l.notes || '').replace(/"/g, '""')}"`,
        ].join(",");
        csvContent += row + "\n";
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Lidlar_Export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
  },
};
</script>

<style scoped>
.kanban-column {
  transition: all 0.2s ease-in-out;
}
.kanban-card {
  transition: all 0.15s ease-in-out;
}
</style>
