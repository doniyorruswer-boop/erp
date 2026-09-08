<template>
  <div
    class="class-schedule-cell flex items-stretch min-h-[68px] relative group font-lexend select-none"
    :class="isOffDay ? 'bg-gray-50/40 dark:bg-gray-800/20 opacity-30 cursor-not-allowed' : ''"
  >
    <!-- Off-day bo'lsa: Ta'lim kuni emas (Chorakdan tashqari sana) -->
    <div
      v-if="isOffDay"
      class="flex-1 p-2 flex items-center justify-center text-gray-300 dark:text-gray-600 text-sm font-semibold select-none"
      title="Chorak doirasida emas"
    >
      —
    </div>

    <!-- Normal dars katakchasi -->
    <template v-else>
      <div
        class="flex-1 p-2 flex flex-col justify-between relative transition-colors cursor-pointer"
        :class="
          hasLesson
            ? 'bg-white dark:bg-gray-900 group-hover:bg-primary/5 dark:group-hover:bg-primary/10'
            : 'bg-white/60 dark:bg-gray-900/60 hover:bg-gray-50 dark:hover:bg-gray-800/40'
        "
        @click="$emit('click')"
      >
        <!-- Vaqt va Xona -->
        <div class="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
          {{ period.time }}
          <span v-if="lesson?.room" class="font-semibold text-gray-700 dark:text-gray-300">
            | {{ lesson.room }}
          </span>
        </div>

        <!-- Fan nomi -->
        <div class="font-bold text-xs text-gray-900 dark:text-gray-100 mt-0.5 truncate">
          <span v-if="lesson?.subject">
            {{ lesson.subject }}
          </span>
          <span v-else class="text-gray-300 dark:text-gray-600 font-normal">—</span>
        </div>

        <!-- O'qituvchi F.I.Sh -->
        <div class="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
          <span v-if="lesson?.teacher">
            {{ lesson.teacher }}
          </span>
          <span v-else class="text-gray-300 dark:text-gray-600 font-normal">—</span>
        </div>

        <!-- Hover Harakatlar Paneli (4-rasm yangilangan chiroyli ikonkalari) -->
        <div
          v-if="hasLesson"
          class="absolute inset-0 bg-white/95 dark:bg-gray-900/95 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 p-1"
          @click.stop
        >
          <!-- Ko'rish (solar:eye-linear) -->
          <button
            type="button"
            @click.stop="$emit('view')"
            class="w-7 h-7 rounded-lg inline-flex items-center justify-center bg-blue-50/90 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition cursor-pointer shadow-2xs active:scale-95"
            title="Ko'rish va Davomat"
          >
            <Icon icon="solar:eye-linear" class="text-base" />
          </button>

          <!-- Tahrirlash (solar:pen-new-square-linear) -->
          <button
            type="button"
            @click.stop="$emit('edit')"
            class="w-7 h-7 rounded-lg inline-flex items-center justify-center bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:text-primary border border-primary/30 transition cursor-pointer shadow-2xs active:scale-95"
            title="Tahrirlash"
          >
            <Icon icon="solar:pen-new-square-linear" class="text-base" />
          </button>

          <!-- O'chirish (solar:trash-bin-trash-linear) -->
          <button
            type="button"
            @click.stop="$emit('delete')"
            class="w-7 h-7 rounded-lg inline-flex items-center justify-center bg-rose-50/90 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800 transition cursor-pointer shadow-2xs active:scale-95"
            title="Darsni o'chirish"
          >
            <Icon icon="solar:trash-bin-trash-linear" class="text-base" />
          </button>
        </div>
      </div>

      <!-- O'ng tomondagi vertikal [+] qo'shish tugmasi (1 va 2-rasm) -->
      <div
        class="w-6 border-l border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition cursor-pointer font-bold text-sm select-none"
        title="Dars qo'shish"
        @click.stop="$emit('add')"
      >
        +
      </div>
    </template>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";

export default {
  name: "ClassScheduleCell",
  components: {
    Icon,
  },
  props: {
    day: {
      type: Object,
      required: true,
    },
    period: {
      type: Object,
      required: true,
    },
    lesson: {
      type: Object,
      default: null,
    },
  },
  emits: ["click", "view", "edit", "delete", "add"],
  computed: {
    isOffDay() {
      return this.day.dateLabel === "—" || this.day.inQuarter === false;
    },
    hasLesson() {
      return !this.isOffDay && !!this.lesson && !!this.lesson.subject;
    },
  },
};
</script>
