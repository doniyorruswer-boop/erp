<template>
  <nav class="breadcrumb-component flex mb-4 font-lexend" aria-label="Breadcrumb">
    <ol class="inline-flex items-center space-x-1 md:space-x-2">
      <!-- Home Link -->
      <li class="inline-flex items-center">
        <router-link
          to="/"
          class="inline-flex items-center text-xs font-medium text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-white"
        >
          <Icon icon="bxs:dashboard" class="mr-1.5 text-sm" />
          Dashboard
        </router-link>
      </li>

      <!-- Dynamic Items -->
      <li
        v-for="(item, index) in items"
        :key="index"
        class="inline-flex items-center"
      >
        <Icon icon="ic:round-navigate-next" class="text-gray-400 text-base mx-1" />
        <router-link
          v-if="item.to"
          :to="item.to"
          class="text-xs font-medium text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-white inline-flex items-center"
        >
          <Icon v-if="item.icon" :icon="item.icon" class="mr-1 text-sm" />
          {{ item.title }}
        </router-link>
        <span
          v-else
          class="text-xs font-semibold text-gray-700 dark:text-gray-200 inline-flex items-center"
        >
          <Icon v-if="item.icon" :icon="item.icon" class="mr-1 text-sm" />
          {{ item.title }}
        </span>
      </li>
    </ol>
  </nav>
</template>

<script>
import { Icon } from "@iconify/vue";

export default {
  name: "Breadcrumb",
  components: { Icon },
  props: {
    items: {
      type: Array,
      default: () => [],
      // e.g. [{ title: "O'quvchilar", to: '/students' }, { title: "O'quvchi Profili" }]
    },
  },
};
</script>
