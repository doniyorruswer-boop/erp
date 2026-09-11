<template>
  <Vmodal
    v-model="isOpen"
    title="Dars Jadvali Shablonlari"
    :subtitle="modalSubtitle"
    icon="solar:document-medicine-bold"
    icon-bg-class="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary"
    max-width="max-w-2xl"
  >
    <div class="space-y-4 font-lexend text-xs sm:text-sm">
      <!-- 1. Sinf haqida qisqacha ma'lumot (Class Summary Card) -->
      <div
        v-if="targetClass?.name"
        class="p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-850/80 flex items-center justify-between flex-wrap gap-3"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-11 h-9 rounded-xl flex items-center justify-center font-bold text-white text-sm shadow-xs shrink-0 select-none tracking-tight bg-primary"
          >
            {{ targetClass.name }}
          </div>
          <div>
            <div class="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <span>{{ targetClass.name }} sinf</span>
              <span class="text-xs font-medium text-gray-500 dark:text-gray-400">
                ({{ targetClass.stageLabel || targetClass.parallel + "-bosqich" }})
              </span>
            </div>
            <div
              class="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-3 mt-0.5 flex-wrap"
            >
              <span>
                <strong class="text-gray-700 dark:text-gray-300">Sinf rahbari:</strong>
                {{ targetClass.teacherName || "Belgilanmagan" }}
              </span>
              <span>•</span>
              <span>
                <strong class="text-gray-700 dark:text-gray-300">O'quvchilar:</strong>
                {{ targetClass.studentsCount || 0 }} / {{ targetClass.capacity || 25 }}
              </span>
            </div>
          </div>
        </div>

        <span
          class="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20"
        >
          {{ activeQuarter?.name || "1-Chorak" }} dars jadvali
        </span>
      </div>

      <!-- 2. Shablonlar ro'yxati (Interactive Template Cards) -->
      <div class="space-y-2.5">
        <label class="block text-xs font-bold text-gray-700 dark:text-gray-300">
          O'quv dasturi andozasini tanlang:
        </label>

        <div class="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          <div
            v-for="tpl in templates"
            :key="tpl.id"
            class="p-3.5 rounded-xl border-2 transition-all cursor-pointer select-none"
            :class="
              selectedTemplateId === tpl.id
                ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-xs ring-1 ring-primary/20'
                : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-900'
            "
            @click="selectedTemplateId = tpl.id"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="space-y-1.5 flex-1 min-w-0">
                <!-- Badges & Title -->
                <div class="flex items-center gap-2 flex-wrap">
                  <span
                    class="w-6 h-6 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 shrink-0"
                  >
                    <Icon :icon="tpl.icon || 'solar:document-text-bold'" class="text-sm" />
                  </span>
                  <h4 class="font-bold text-sm text-gray-900 dark:text-gray-100">
                    {{ tpl.name }}
                  </h4>
                  <span
                    class="px-2 py-0.5 rounded-md text-[10px] font-bold"
                    :class="tpl.tagColor || 'bg-gray-100 text-gray-600'"
                  >
                    {{ tpl.tag }}
                  </span>
                  <span
                    v-if="isRecommended(tpl)"
                    class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1"
                  >
                    <Icon icon="solar:star-bold" class="text-xs" />
                    Tavsiya etiladi
                  </span>
                </div>

                <!-- Description -->
                <p class="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                  {{ tpl.description }}
                </p>

                <!-- Specs row -->
                <div
                  class="flex items-center gap-3 pt-0.5 text-[11px] text-gray-500 dark:text-gray-400 flex-wrap"
                >
                  <span class="flex items-center gap-1 font-medium">
                    <Icon icon="solar:calendar-linear" class="text-xs text-primary" />
                    {{ tpl.daysCount }} kunlik ta'lim
                  </span>
                  <span>•</span>
                  <span class="flex items-center gap-1 font-medium">
                    <Icon icon="solar:clock-circle-linear" class="text-xs text-primary" />
                    Kuniga {{ tpl.lessonsPerDay }} ta dars
                  </span>
                  <span>•</span>
                  <span class="flex items-center gap-1 font-medium">
                    <Icon icon="solar:book-bookmark-linear" class="text-xs text-primary" />
                    Haftasiga {{ tpl.hoursPerWeek }} soat
                  </span>
                </div>
              </div>

              <!-- Radio Indicator -->
              <div
                class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 transition-colors"
                :class="
                  selectedTemplateId === tpl.id
                    ? 'border-primary bg-primary text-white'
                    : 'border-gray-300 dark:border-gray-600'
                "
              >
                <Icon
                  v-if="selectedTemplateId === tpl.id"
                  icon="solar:check-read-linear"
                  class="text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Tanlangan shablon fani va tarkibi (Selected Template Preview Panel) -->
      <div
        v-if="selectedTemplate"
        class="p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-850/50 space-y-2.5"
      >
        <div class="flex items-center justify-between">
          <span
            class="font-bold text-xs text-gray-800 dark:text-gray-200 flex items-center gap-1.5"
          >
            <Icon icon="solar:checklist-minimalistic-bold" class="text-primary text-sm" />
            Shablon tarkibidagi fanlar ({{ selectedTemplate.subjects?.length || 0 }} ta):
          </span>
          <span class="text-[11px] text-gray-400"> Avtomatik dars soatlari taqsimlanadi </span>
        </div>

        <div class="flex items-center gap-1.5 flex-wrap">
          <span
            v-for="(subj, sIdx) in selectedTemplate.subjects"
            :key="sIdx"
            class="px-2.5 py-1 rounded-lg text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 shadow-2xs"
          >
            {{ subj }}
          </span>
        </div>

        <div
          class="text-[11px] text-gray-500 dark:text-gray-400 pt-1 border-t border-gray-200 dark:border-gray-800 flex items-center gap-1.5"
        >
          <Icon icon="solar:info-circle-linear" class="text-xs text-primary shrink-0" />
          <span>
            Sinf rahbari asosiy fanlarga, ixtisoslashtirilgan fanlar esa mos fan o'qituvchilari va
            xonalariga (IT-Lab, Fizika, Kimyo, Sport) taqsimlanadi.
          </span>
        </div>
      </div>

      <!-- 4. Qo'llash sozlamalari (Options) -->
      <div class="space-y-2 pt-1 border-t border-gray-200 dark:border-gray-800">
        <label class="flex items-center gap-2 cursor-pointer select-none">
          <input
            v-model="options.overwrite"
            type="checkbox"
            class="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
          />
          <span class="text-xs text-gray-700 dark:text-gray-300 font-medium">
            Mavjud darslarni tozalab, tanlangan shablon bilan to'ldirish
          </span>
        </label>

        <label class="flex items-center gap-2 cursor-pointer select-none">
          <input
            v-model="options.navigateToClass"
            type="checkbox"
            class="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
          />
          <span class="text-xs text-gray-700 dark:text-gray-300 font-medium">
            Shablon qo'llangach, to'g'ridan-to'g'ri dars jadvali sahifasiga o'tish
          </span>
        </label>
      </div>
    </div>

    <!-- 5. Modal Footer Slot -->
    <template #footer="{ close: closeModal }">
      <div class="flex items-center justify-between gap-3 w-full flex-wrap">
        <span class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
          <Icon icon="solar:shield-check-linear" class="text-sm text-emerald-500" />
          Darslar {{ activeQuarter?.name || "1-Chorak" }}ning barcha {{ weeksCount || 10 }} haftalik
          matritsasiga to'liq joylashtiriladi
        </span>

        <div class="flex items-center gap-2 ml-auto">
          <AppButton variant="outline" size="sm" @click="closeModal"> Bekor qilish </AppButton>
          <AppButton
            variant="primary"
            size="sm"
            icon="solar:check-read-linear"
            @click="applyTemplate"
          >
            Shablonni qo'llash
          </AppButton>
        </div>
      </div>
    </template>
  </Vmodal>
</template>

<script>
import { Icon } from "@iconify/vue";

import { applyTemplateToDatedSchedule, SCHEDULE_TEMPLATES } from "@/api/scheduleData";
import AppButton from "@/components/common/AppButton.vue";
import toast from "@/utils/toast";

export default {
  name: "ScheduleTemplateModal",
  components: {
    Icon,
    AppButton,
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    targetClass: {
      type: Object,
      default: () => ({}),
    },
    activeQuarterId: {
      type: String,
      default: "1",
    },
    activeQuarter: {
      type: Object,
      default: () => ({}),
    },
    weeksCount: {
      type: Number,
      default: 0,
    },
  },
  emits: ["update:modelValue", "applied"],
  data() {
    return {
      templates: SCHEDULE_TEMPLATES,
      selectedTemplateId: "tpl-primary",
      options: {
        overwrite: true,
        navigateToClass: true,
      },
    };
  },
  computed: {
    isOpen: {
      get() {
        return this.modelValue;
      },
      set(val) {
        this.$emit("update:modelValue", val);
      },
    },
    modalSubtitle() {
      if (this.targetClass?.name) {
        return `${this.targetClass.name} (${this.targetClass.stageLabel || this.targetClass.parallel + "-bosqich"}) uchun tayyor o'quv reja va andoza tanlang`;
      }
      return "Sinf uchun dars jadvali andozasini tanlang";
    },
    selectedTemplate() {
      return this.templates.find((t) => t.id === this.selectedTemplateId) || this.templates[0];
    },
  },
  watch: {
    targetClass: {
      immediate: true,
      handler(cls) {
        if (!cls) return;
        const parallelNum = parseInt(cls.parallel, 10) || 1;
        if (parallelNum <= 4) {
          this.selectedTemplateId = "tpl-primary";
        } else if (parallelNum <= 9) {
          this.selectedTemplateId = "tpl-middle";
        } else {
          this.selectedTemplateId = "tpl-high";
        }
      },
    },
  },
  methods: {
    isRecommended(tpl) {
      if (!this.targetClass?.parallel) return false;
      return tpl.recommendedStages?.includes(String(this.targetClass.parallel));
    },
    close() {
      this.isOpen = false;
    },
    applyTemplate() {
      if (!this.targetClass?.id) return;

      const quarterId = this.activeQuarterId || "1";
      const generated = applyTemplateToDatedSchedule(this.targetClass.id, this.selectedTemplateId, {
        overwrite: this.options.overwrite,
        quarterId,
      });

      toast.success(
        `«${this.targetClass.name}» sinfiga ${this.activeQuarter?.name || "1-Chorak"} uchun «${this.selectedTemplate.name}» shabloni muvaffaqiyatli qo'llandi!`
      );

      this.$emit("applied", {
        classId: this.targetClass.id,
        templateId: this.selectedTemplateId,
        quarterId,
        schedule: generated,
        navigateToClass: this.options.navigateToClass,
      });

      this.close();

      if (
        this.options.navigateToClass &&
        this.$route.path !== `/education/schedule/class/${this.targetClass.id}`
      ) {
        this.$router.push(`/education/schedule/class/${this.targetClass.id}`);
      }
    },
  },
};
</script>
