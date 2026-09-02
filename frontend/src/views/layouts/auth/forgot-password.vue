<template>
  <div class="w-full h-screen">
    <div class="flex shadow rounded-md h-screen">
      <div class="bg-white dark:bg-gray-900 w-full overflow-y-auto">
        <form @submit.prevent="handleForgot">
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
                Parolni tiklash uchun email manzilingizni kiriting.
              </p>
            </div>

            <!-- Message if sent -->
            <div
              v-if="infoMessage"
              class="p-3.5 text-sm text-green-700 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800"
            >
              {{ infoMessage }}
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
            </div>

            <button
              type="submit"
              class="text-white bg-primary hover:bg-primary/80 p-3 w-full rounded-md font-medium cursor-pointer transition shadow-sm"
            >
              Tiklash kodini yuborish
            </button>
            <p class="dark:text-white text-center text-gray-700 text-sm">
              Profilingiz bormi?<button
                type="button"
                @click="$router.push('/auth/login')"
                class="ml-2 text-primary font-bold hover:underline"
              >
                Tizimga kirish
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ForgotPassword",
  data() {
    return {
      email: "",
      infoMessage: null,
    };
  },
  methods: {
    handleForgot() {
      this.infoMessage = `Email manzilingizga (${this.email}) parolni tiklash ko'rsatmasi yuborildi (Demo).`;
    },
  },
};
</script>
