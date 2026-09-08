<template>
  <div
    class="flex items-center gap-2.5 min-w-0 select-none"
    :class="[
      isClickable ? 'cursor-pointer group' : ''
    ]"
    @click="handleClick"
  >
    <!-- Avatar (Rasm yoki Bosh harflar) -->
    <div
      :class="[
        sizeClasses.avatar,
        'rounded-full flex items-center justify-center font-bold uppercase shrink-0 overflow-hidden transition-transform',
        isClickable ? 'group-hover:scale-105' : '',
        image && !imageError
          ? 'bg-gray-100 dark:bg-gray-800'
          : 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
      ]"
    >
      <img
        v-if="image && !imageError"
        :src="image"
        :alt="name"
        class="w-full h-full object-cover"
        @error="imageError = true"
      />
      <span v-else>{{ initials }}</span>
    </div>

    <!-- Ism va ixtiyoriy subtitr / badge -->
    <div class="min-w-0 flex-1 leading-tight">
      <div class="flex items-center gap-1.5 flex-wrap">
        <!-- Agar to prop berilgan bo'lsa router-link -->
        <router-link
          v-if="to"
          :to="to"
          class="font-semibold text-gray-900 dark:text-gray-100 hover:text-primary transition-colors line-clamp-1"
          :class="sizeClasses.name"
          @click.stop
        >
          {{ displayName }}
        </router-link>

        <!-- Oddiy matn yoki bosiladigan nom -->
        <span
          v-else
          class="font-semibold transition-colors line-clamp-1"
          :class="[
            sizeClasses.name,
            isClickable
              ? 'text-gray-900 dark:text-gray-100 group-hover:text-primary'
              : 'text-gray-900 dark:text-gray-100'
          ]"
        >
          {{ displayName }}
        </span>

        <!-- Ixtiyoriy status badge (masalan: Nofaol, Arxiv) -->
        <span
          v-if="badge"
          :class="[
            'px-1.5 py-0.5 rounded text-[10px] font-bold border shrink-0',
            badgeClasses
          ]"
        >
          {{ badge }}
        </span>
      </div>

      <!-- Ixtiyoriy subtitr (ID, telefon, lavozim va h.k.) -->
      <div
        v-if="subtitle || $slots.subtitle"
        class="text-[11px] text-gray-400 dark:text-gray-400 font-normal truncate mt-0.5"
      >
        <slot name="subtitle">
          {{ subtitle }}
        </slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "AppUserCell",
  props: {
    // Foydalanuvchi to'liq F.I.SH
    name: {
      type: String,
      default: ""
    },
    // Rasm URL manzili
    image: {
      type: String,
      default: ""
    },
    // Qo'shimcha matn (ID, telefon, lavozim)
    subtitle: {
      type: String,
      default: ""
    },
    // router-link yo'nalishi
    to: {
      type: [String, Object],
      default: null
    },
    // O'lchami: 'sm' | 'md' | 'lg'
    size: {
      type: String,
      default: "md",
      validator: (val) => ["sm", "md", "lg"].includes(val)
    },
    // Status badge matni
    badge: {
      type: String,
      default: ""
    },
    // Badge turi
    badgeVariant: {
      type: String,
      default: "neutral",
      validator: (val) => ["danger", "warning", "success", "info", "neutral"].includes(val)
    },
    // Bosiluvchanlik (kursorni pointer qilish)
    clickable: {
      type: Boolean,
      default: null
    }
  },
  emits: ["click"],
  data() {
    return {
      imageError: false
    };
  },
  computed: {
    displayName() {
      return this.name || "—";
    },
    isClickable() {
      if (this.clickable !== null) return this.clickable;
      return Boolean(this.to || this.$attrs.onClick);
    },
    initials() {
      if (!this.name) return "??";
      const parts = this.name.trim().split(/\s+/);
      if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
      }
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    },
    sizeClasses() {
      switch (this.size) {
        case "sm":
          return {
            avatar: "w-7 h-7 text-[11px]",
            name: "text-xs"
          };
        case "lg":
          return {
            avatar: "w-10 h-10 text-sm",
            name: "text-base"
          };
        case "md":
        default:
          return {
            avatar: "w-8 h-8 text-xs",
            name: "text-xs sm:text-sm"
          };
      }
    },
    badgeClasses() {
      switch (this.badgeVariant) {
        case "danger":
          return "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800";
        case "warning":
          return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800";
        case "success":
          return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800";
        case "info":
          return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800";
        case "neutral":
        default:
          return "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
      }
    }
  },
  methods: {
    handleClick(event) {
      if (this.isClickable) {
        this.$emit("click", event);
      }
    }
  }
};
</script>
