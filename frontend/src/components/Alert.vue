<template>
  <div v-if="false" />
</template>

<script>
import toast from "@/utils/toast";

export default {
  name: "AppAlert",
  props: {
    message: {
      type: String,
      default: "",
    },
    heading: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      default: "success",
    },
    duration: {
      type: Number,
      default: 4000,
    },
    floating: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["close"],
  watch: {
    message: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.triggerToast(newVal);
        }
      },
    },
  },
  methods: {
    triggerToast(msg) {
      if (!msg) return;
      const t = this.type === "error" ? "error" : this.type === "warning" ? "warning" : "success";
      toast[t](msg, this.heading || (t === "error" ? "Xatolik" : "Muvaffaqiyatli"), this.duration);
      this.$emit("close");
    },
  },
};
</script>
