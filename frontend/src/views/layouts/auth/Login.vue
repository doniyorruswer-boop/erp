<template>
  <div class="w-full h-screen">
    <div class="flex shadow rounded-md h-screen">
      <div class="bg-white dark:bg-gray-900 w-full overflow-y-auto">
        <form @submit.prevent="handleLogin">
          <div
            class="form-body lg:max-w-xl mx-auto lg:p-20 p-8 lg:mt-20 mt-5 space-y-8"
          >
            <div
              class="form-head cursor-pointer"
              @click="$router.push('/')"
            >
              <img
                src="../../../assets/logo/logo.svg"
                :alt="$brand.name"
                class="w-10"
              />
            </div>
            <div class="space-y-3">
              <h2 class="dark:text-white font-semibold text-gray-800 text-4xl">
                {{ $brand.prefix }}<span class="text-primary">{{ $brand.suffix }}.</span>
              </h2>
              <p class="dark:text-gray-400 text-gray-700">
                Tizimga kirish uchun email va parolingizni kiriting.
              </p>
            </div>

            <!-- Error Banner with Unlock Option -->
            <div
              v-if="errorMessage"
              class="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-3"
            >
              <Icon icon="solar:danger-circle-bold" class="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
              <div class="flex-1">
                <div class="font-bold">Kirish rad etildi</div>
                <div class="mt-0.5 leading-relaxed">{{ errorMessage }}</div>
                <button
                  v-if="errorMessage.includes('bloklangan') || errorMessage.includes('bloklandi') || errorMessage.includes('vaqtincha')"
                  type="button"
                  @click="unlockAccount"
                  :disabled="unlocking"
                  class="mt-2.5 inline-flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition disabled:opacity-50"
                >
                  <Icon icon="solar:lock-unlocked-bold" class="w-3.5 h-3.5" />
                  {{ unlocking ? "Chiqarilmoqda..." : "Hisobni hoziroq blokdan chiqarish" }}
                </button>
              </div>
            </div>

            <div class="space-y-5">
              <div class="relative z-0 w-full mb-6 group">
                <input
                  v-model="email"
                  type="text"
                  name="floating_email"
                  id="floating_email"
                  class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-primary focus:outline-none focus:ring-0 focus:border-primary peer"
                  placeholder=" "
                  required
                />
                <label
                  for="floating_email"
                  class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-primary peer-focus:dark:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >Email, login yoki telefon</label
                >
              </div>
              <div class="relative z-0 w-full mb-6 group">
                <input
                  v-model="password"
                  type="password"
                  name="floating_password"
                  id="floating_password"
                  class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-primary focus:outline-none focus:ring-0 focus:border-primary peer"
                  placeholder=" "
                  required
                />
                <label
                  for="floating_password"
                  class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-primary peer-focus:dark:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >Parol</label
                >
              </div>
            </div>
            <div class="flex justify-between">
              <div class="flex items-start">
                <div class="flex items-center h-5">
                  <input
                    id="remember"
                    v-model="rememberMe"
                    type="checkbox"
                    value=""
                    autocomplete="off"
                    class="accent-primary focus:ring-4 cursor-pointer w-4 h-4 border border-gray-300 rounded dark:bg-gray-700 bg-gray-50 focus:ring-3 focus:ring-primary/30"
                  />
                </div>
                <label
                  for="remember"
                  class="ml-2 text-sm cursor-pointer font-normal dark:text-white text-gray-500"
                  >30 kunga eslab qolish</label
                >
              </div>
              <button
                type="button"
                @click="$router.push('/auth/forgot-password')"
                class="text-sm dark:text-white hover:text-primary text-gray-700"
              >
                Parolni unutdingizmi?
              </button>
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="text-white bg-primary hover:bg-primary/80 p-3 w-full rounded-md cursor-pointer disabled:opacity-60"
            >
              {{ loading ? "Kirilmoqda..." : "Tizimga kirish" }}
            </button>
            <p class="dark:text-white text-center text-gray-700">
              Profilingiz yo'qmi?<button
                type="button"
                @click="$router.push('/auth/register')"
                class="ml-2 text-primary"
              >
                Ro'yxatdan o'tish
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { Icon } from "@iconify/vue";
import { authApi } from "@/api/services";
import api from "@/api/client";
import BRAND_CONFIG from "@/config/brand.config";
import { authenticateParent } from "@/api/schoolParentsData";

export default {
  name: "Login",
  components: { Icon },
  data() {
    return {
      email: BRAND_CONFIG.adminEmail,
      password: "admin123",
      rememberMe: true,
      loading: false,
      unlocking: false,
      errorMessage: "",
    };
  },
  methods: {
    async handleLogin() {
      this.loading = true;
      this.errorMessage = "";
      try {
        const cleanEmail = (this.email || "").trim();
        const cleanPassword = (this.password || "").trim();

        // 1. Ota-onalar hisobi orqali kirish tekshiruvi (Faollik/blok holati)
        const parentAuth = authenticateParent(cleanEmail, cleanPassword);
        if (parentAuth && parentAuth.found) {
          if (parentAuth.isBlocked) {
            this.errorMessage = parentAuth.message;
            if (this.$toast) {
              this.$toast.error(parentAuth.message, "Kirish rad etildi");
            }
            return;
          }

          // Faol ota-ona profiliga muvaffaqiyatli kirish
          localStorage.setItem("userRole", "PARENT");
          localStorage.setItem("parentUser", JSON.stringify(parentAuth.parent));
          if (this.$toast) {
            this.$toast.success(
              `Xush kelibsiz, ${parentAuth.parent.fullName}!`,
              "Shaxsiy kabinet"
            );
          }
          this.$router.push("/school/parents");
          return;
        }

        // 2. Tizim xodimlari va administratorlar kirishi
        const res = await authApi.login(cleanEmail, cleanPassword);
        if (res && res.accessToken) {
          localStorage.setItem("token", res.accessToken);
          if (res.refreshToken) {
            localStorage.setItem("refreshToken", res.refreshToken);
          }
          if (res.user) {
            localStorage.setItem("user", JSON.stringify(res.user));
            if (res.user.organization) {
              localStorage.setItem("organization", JSON.stringify(res.user.organization));
              localStorage.setItem("businessType", res.user.organization.businessType || "COURSE_CENTER");
            }
          }
          this.$toast.success("Tizimga muvaffaqiyatli kirdingiz!", "Xush kelibsiz!");
          this.$router.push("/");
        }
      } catch (err) {
        const msg = err.response?.data?.message || err.message || "Email yoki parol noto'g'ri";
        this.errorMessage = msg;
        this.$toast.error(msg, "Kirish rad etildi");
      } finally {
        this.loading = false;
      }
    },
    async unlockAccount() {
      this.unlocking = true;
      try {
        const res = await api.post("/auth/unlock", { identifier: this.email });
        this.errorMessage = "";
        this.$toast.success(res?.message || "Hisobingiz blokdan chiqarildi! Endi qayta kirishingiz mumkin.", "Blokdan chiqarildi");
      } catch (err) {
        const msg = err.response?.data?.message || "Blokdan chiqarishda xatolik yuz berdi";
        this.$toast.error(msg);
      } finally {
        this.unlocking = false;
      }
    },
  },
};
</script>
