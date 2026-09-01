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
                alt=""
                class="w-10"
              />
            </div>
            <div class="space-y-3">
              <h2 class="dark:text-white font-semibold text-gray-800 text-4xl">
                Edu<span class="text-primary">HUB.</span>
              </h2>
              <p class="dark:text-gray-400 text-gray-700">
                Tizimga kirish uchun email va parolingizni kiriting.
              </p>
            </div>
            <div class="space-y-5">
              <div class="relative z-0 w-full mb-6 group">
                <input
                  v-model="email"
                  type="email"
                  name="floating_email"
                  id="floating_email"
                  class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-primary focus:outline-none focus:ring-0 focus:border-primary peer"
                  placeholder=" "
                  required
                />
                <label
                  for="floating_email"
                  class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-primary peer-focus:dark:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >Email manzil</label
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
import { authApi } from "@/api/services";

export default {
  name: "Login",
  data() {
    return {
      email: "admin@educrm.uz",
      password: "admin123",
      rememberMe: true,
      loading: false,
    };
  },
  methods: {
    async handleLogin() {
      this.loading = true;
      try {
        const res = await authApi.login(this.email, this.password);
        if (res && res.accessToken) {
          localStorage.setItem("token", res.accessToken);
          if (res.user) {
            localStorage.setItem("user", JSON.stringify(res.user));
          }
          this.$router.push("/");
        }
      } catch (err) {
        alert(err.response?.data?.message || "Email yoki parol noto'g'ri");
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
