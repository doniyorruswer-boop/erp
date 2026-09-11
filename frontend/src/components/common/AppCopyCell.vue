<template>
  <div
    class="inline-flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300 whitespace-nowrap select-none group"
  >
    <span :class="{ 'truncate max-w-[160px]': truncate }">{{ text || "—" }}</span>
    <button
      v-if="text"
      type="button"
      class="text-gray-400 hover:text-primary transition-colors cursor-pointer p-0.5 rounded opacity-70 group-hover:opacity-100"
      :title="title"
      @click.stop="copyText"
    >
      <Icon
        :icon="copied ? 'solar:check-circle-bold' : 'solar:copy-linear'"
        :class="copied ? 'text-emerald-500' : ''"
        class="text-xs"
      />
    </button>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";

import toast from "@/utils/toast";

export default {
  name: "AppCopyCell",
  components: {
    Icon,
  },
  props: {
    text: {
      type: [String, Number],
      default: "",
    },
    title: {
      type: String,
      default: "Nusxa olish",
    },
    truncate: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      copied: false,
    };
  },
  methods: {
    async copyText() {
      if (!this.text) return;
      try {
        await navigator.clipboard.writeText(String(this.text));
        this.copied = true;
        toast.success("Nusxa olindi");
        setTimeout(() => {
          this.copied = false;
        }, 1800);
      } catch (err) {
        toast.error("Nusxa olib bo'lmadi");
      }
    },
  },
};
</script>
