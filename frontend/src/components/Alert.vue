<template>
  <teleport to="body">
    <transition name="toast-smooth">
      <div
        v-if="!isClosed"
        class="clean-toast-wrap font-lexend"
      >
        <div class="clean-toast-card">
          <!-- Animated green icon -->
          <div class="clean-toast-icon">
            <Icon icon="solar:check-circle-bold" />
          </div>

          <!-- Message content -->
          <div class="clean-toast-body">
            <h4 v-if="heading && $slots.heading" class="clean-toast-heading">
              <slot name="heading">{{ heading }}</slot>
            </h4>
            <div class="clean-toast-message">
              <slot name="content">
                <slot>{{ message }}</slot>
              </slot>
            </div>
          </div>

          <!-- Subtle close button -->
          <button
            type="button"
            class="clean-toast-close"
            @click="dismiss"
          >
            <Icon icon="mdi:close" />
          </button>

          <!-- Smooth Thin Progress Bar -->
          <div
            v-if="duration > 0"
            class="clean-toast-bar"
            :style="{ animationDuration: `${duration}ms` }"
          ></div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script>
import { Icon } from "@iconify/vue";

export default {
  name: "Alert",
  components: { Icon },
  props: {
    message: {
      type: String,
      default: "",
    },
    heading: {
      type: String,
      default: "",
    },
    duration: {
      type: Number,
      default: 3000,
    },
  },
  emits: ["close"],
  data() {
    return {
      isClosed: false,
      timeoutId: null,
    };
  },
  mounted() {
    this.isClosed = false;
    if (this.duration > 0) {
      this.timeoutId = setTimeout(() => {
        this.dismiss();
      }, this.duration);
    }
  },
  beforeUnmount() {
    if (this.timeoutId) clearTimeout(this.timeoutId);
  },
  methods: {
    dismiss() {
      this.isClosed = true;
      this.$emit("close");
    },
  },
};
</script>

<style scoped>
.clean-toast-wrap {
  position: fixed;
  top: 22px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 999999;
  min-width: 290px;
  max-width: 450px;
  pointer-events: auto;
}

.clean-toast-card {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: #ffffff;
  color: #1f2937;
  padding: 12px 18px 15px 18px;
  border-radius: 10px;
  box-shadow: 0 12px 30px -4px rgba(16, 185, 129, 0.15), 0 4px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(16, 185, 129, 0.25);
  animation: cardFloat 3s ease-in-out infinite alternate;
}

.dark .clean-toast-card {
  background-color: #1e293b;
  color: #f8fafc;
  border-color: rgba(16, 185, 129, 0.35);
  box-shadow: 0 12px 30px -4px rgba(0, 0, 0, 0.5);
}

.clean-toast-icon {
  color: #10b981;
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  animation: iconSpringPop 0.8s cubic-bezier(0.25, 1, 0.5, 1) both 0.1s;
}

.clean-toast-body {
  flex: 1;
}

.clean-toast-heading {
  font-size: 13px;
  font-weight: 600;
  margin: 0 0 2px 0;
  color: #111827;
}

.dark .clean-toast-heading {
  color: #ffffff;
}

.clean-toast-message {
  font-size: 13px;
  font-weight: 500;
  color: #334155;
  line-height: 1.35;
}

.dark .clean-toast-message {
  color: #e2e8f0;
}

.clean-toast-close {
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 17px;
  cursor: pointer;
  padding: 4px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s, background-color 0.15s, transform 0.15s;
}

.clean-toast-close:hover {
  color: #1e293b;
  background-color: #f1f5f9;
  transform: scale(1.08);
}

.dark .clean-toast-close:hover {
  color: #ffffff;
  background-color: #334155;
}

/* Thin Elegant Green Progress Bar */
.clean-toast-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2.5px;
  background: linear-gradient(90deg, #10b981, #34d399);
  width: 100%;
  animation: cleanProgress linear forwards;
}

@keyframes cleanProgress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

/* Slower, elegant icon spring pop animation */
@keyframes iconSpringPop {
  0% {
    transform: scale(0.2) rotate(-45deg);
    opacity: 0;
  }
  65% {
    transform: scale(1.18) rotate(8deg);
    opacity: 1;
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

/* Toast Entrance and Exit Animation */
.toast-smooth-enter-active {
  animation: toastSlideBounce 0.38s cubic-bezier(0.34, 1.45, 0.64, 1) forwards;
}

.toast-smooth-leave-active {
  animation: toastSlideOut 0.22s cubic-bezier(0.4, 0, 1, 1) forwards;
}

@keyframes toastSlideBounce {
  0% {
    opacity: 0;
    transform: translate(-50%, -24px) scale(0.92);
  }
  70% {
    opacity: 1;
    transform: translate(-50%, 2px) scale(1.015);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, 0) scale(1);
  }
}

@keyframes toastSlideOut {
  0% {
    opacity: 1;
    transform: translate(-50%, 0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -18px) scale(0.94);
  }
}
</style>
