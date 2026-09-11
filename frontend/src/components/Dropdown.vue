<template>
  <div class="relative">
    <button
      class="z-10 relative flex items-center focus:outline-none select-none"
      @click="open = true"
    >
      <slot name="button"></slot>
    </button>

    <!-- to close when clicked on space around it-->
    <button
      v-if="open"
      class="fixed inset-0 h-full w-full cursor-default focus:outline-none"
      tabindex="-1"
      @click="open = false"
    ></button>

    <!--dropdown menu-->
    <div v-if="placement == 'right'" @click="open = false">
      <Transition name="fade">
        <div
          v-show="open"
          :class="[
            'absolute right-0 shadow-lg rounded-md border dark:border-gray-600 text-sm mt-2 bg-white dark:bg-gray-800 dark:text-white z-50',
            width || 'w-auto min-w-max',
          ]"
          @blur="close"
        >
          <slot name="content"></slot>
        </div>
      </Transition>
    </div>
    <div v-else @click="open = false">
      <Transition name="fade">
        <div
          v-show="open"
          :class="[
            'absolute left-0 shadow-lg rounded-md border dark:border-gray-600 text-sm mt-2 bg-white dark:bg-gray-800 dark:text-white z-50',
            width || 'w-auto min-w-max',
          ]"
          @blur="close"
        >
          <slot name="content"></slot>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    placement: String,
    dropdown: Boolean,
    width: {
      type: String,
      default: "w-auto min-w-max",
    },
  },
  data() {
    return {
      open: false,
    };
  },
  mounted() {},
  methods: {
    toggle() {
      this.open = !this.open;
    },
  },
};
</script>
