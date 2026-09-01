<template>
  <div class="empty-state-component font-lexend flex flex-col items-center justify-center p-6 sm:p-10 text-center w-full select-none">
    <!-- Main Illustration Canvas: 100% Crisp & Instantly Understandable Magnifying Glass & Document -->
    <div class="relative w-52 h-38 sm:w-60 sm:h-42 flex items-center justify-center mb-2">
      <svg
        class="w-full h-full"
        viewBox="0 0 240 170"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <!-- 1. Soft Asymmetric Organic Backdrop Blob -->
        <path
          d="M70 45C115 26 170 32 195 56C220 80 216 120 188 138C160 155 90 159 58 140C26 120 30 63 70 45Z"
          class="fill-gray-100 dark:fill-gray-800"
        />

        <!-- 2. Floating Sparkles (+) and Dots -->
        <path d="M44 38V46M40 42H48" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" opacity="0.6" />
        <circle cx="196" cy="42" r="2" fill="#94a3b8" opacity="0.6" />
        <path d="M48 124V132M44 128H52" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" opacity="0.6" />
        <path d="M204 90V98M200 94H208" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" opacity="0.6" />

        <!-- 3. Crisp Clear Document Sheet -->
        <g transform="translate(68, 30)">
          <!-- Main Document Sheet -->
          <rect
            x="0"
            y="0"
            width="80"
            height="96"
            rx="10"
            class="fill-white dark:fill-gray-850 stroke-slate-400 dark:stroke-slate-500"
            stroke-width="2.5"
          />

          <!-- Folded Top-Right Corner -->
          <path
            d="M56 0L80 24H66C60.4772 24 56 19.5228 56 14V0Z"
            class="fill-slate-200 dark:fill-slate-700 stroke-slate-400 dark:stroke-slate-500"
            stroke-width="2"
          />

          <!-- Text lines on Document -->
          <rect x="14" y="36" width="38" height="4" rx="2" class="fill-slate-300 dark:fill-slate-600" />
          <rect x="14" y="46" width="52" height="4" rx="2" class="fill-slate-200 dark:fill-slate-700" />
          <rect x="14" y="56" width="44" height="4" rx="2" class="fill-slate-200 dark:fill-slate-700" />
          <rect x="14" y="66" width="28" height="4" rx="2" class="fill-slate-200 dark:fill-slate-700" />

          <!-- 4. Prominent Magnifying Glass with Cross Badge inspecting the document -->
          <g transform="translate(42, 38)">
            <!-- Glass Circle -->
            <circle
              cx="26"
              cy="26"
              r="24"
              class="fill-white/90 dark:fill-gray-800/90 stroke-slate-600 dark:stroke-slate-300"
              stroke-width="3"
            />
            <!-- Glass Reflection Highlight -->
            <path
              d="M12 26C12 18.268 18.268 12 26 12"
              class="stroke-slate-200 dark:stroke-slate-600"
              stroke-width="2.5"
              stroke-linecap="round"
            />
            <!-- Glass Handle -->
            <path
              d="M44 44L62 62"
              class="stroke-slate-600 dark:stroke-slate-300"
              stroke-width="4.5"
              stroke-linecap="round"
            />
            <!-- Subtle Cross / Minus icon inside glass -->
            <path
              d="M20 26H32"
              class="stroke-slate-400 dark:stroke-slate-400"
              stroke-width="2.5"
              stroke-linecap="round"
            />
          </g>
        </g>

        <!-- 5. Ground Shadow Line Underneath -->
        <ellipse cx="120" cy="146" rx="60" ry="4" class="fill-gray-200/90 dark:fill-gray-700/60" />
      </svg>
    </div>

    <!-- Crisp Bold Title Text -->
    <h3 class="text-sm sm:text-base font-bold text-gray-700 dark:text-gray-200 tracking-tight">
      {{ title || "Hech qanday ma'lumot topilmadi" }}
    </h3>
  </div>
</template>

<script>
export default {
  name: "EmptyState",
  props: {
    title: {
      type: String,
      default: "Hech qanday ma'lumot topilmadi",
    },
  },
};
</script>
