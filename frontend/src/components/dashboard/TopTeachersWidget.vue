<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700 shadow-2xs space-y-4 font-lexend">
    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-2">
      <div>
        <h3 class="text-base font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <Icon icon="solar:users-group-rounded-bold" class="text-primary text-lg" />
          <span>O'qituvchilar / Tarbiyachilar</span>
        </h3>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          O'qituvchi va murabbiylarning o'quv yuklamasi va guruhlari soni
        </p>
      </div>

      <div class="flex items-center gap-2">
        <span class="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
          {{ teachers.length }} nafar
        </span>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="teachers.length === 0"
      class="py-8 text-center text-gray-400 dark:text-gray-500 text-xs"
    >
      O'qituvchilar ro'yxati mavjud emas
    </div>

    <!-- Teachers List -->
    <div v-else class="space-y-2.5">
      <div
        v-for="t in teachers"
        :key="t.id"
        class="p-3 rounded-lg bg-gray-50/80 dark:bg-gray-700/30 border border-gray-200/80 dark:border-gray-700/60 flex items-center justify-between gap-3 hover:border-primary/40 transition"
      >
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-xs shrink-0">
            {{ getInitial(t.name) }}
          </div>
          <div class="min-w-0">
            <div class="text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-100 truncate" :title="t.name">
              {{ t.name }}
            </div>
            <div class="text-[11px] text-gray-500 dark:text-gray-400">
              {{ t.groupsCount || 0 }} ta guruh &bull; {{ t.studentsCount || 0 }} ta o'quvchi
            </div>
          </div>
        </div>

        <div class="shrink-0">
          <span class="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
            Faol
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";

export default {
  name: "TopTeachersWidget",
  components: {
    Icon,
  },
  props: {
    teachers: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    getInitial(name) {
      if (!name) return "O";
      return name.trim().charAt(0).toUpperCase();
    },
  },
};
</script>
