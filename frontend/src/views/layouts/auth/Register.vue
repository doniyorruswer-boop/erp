<template>
  <div class="w-full h-screen">
    <div class="flex shadow bg-waves rounded-md h-screen">
      <div class="bg-white dark:bg-gray-900 w-full">
        <form novalidate @submit.prevent="handleRegister">
          <div class="form-body max-w-xl mx-auto lg:p-20 p-8 lg:mt-10 mt-5 space-y-8">
            <div class="form-head cursor-pointer" @click="$router.push('/')">
              <img src="../../../assets/logo/logo.svg" alt="" class="w-10" />
            </div>
            <div class="space-y-3">
              <h2 class="dark:text-white font-semibold text-gray-800 text-4xl">
                Edu<span class="text-primary">HUB.</span>
              </h2>
              <p class="dark:text-gray-400 text-gray-700">
                Tizimda yangi hisob ochish uchun ma'lumotlaringizni kiriting.
              </p>
            </div>
            <div class="space-y-5">
              <div class="relative z-0 w-full mb-6 group">
                <input
                  id="floating_text"
                  v-model="firstName"
                  type="text"
                  name="floating_text"
                  :class="[
                    'block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 appearance-none dark:text-white focus:outline-none focus:ring-0 peer transition',
                    formErrors.firstName
                      ? 'border-rose-500 focus:border-rose-500'
                      : 'border-gray-300 dark:border-gray-600 dark:focus:border-primary focus:border-primary',
                  ]"
                  placeholder=" "
                  @input="clearFieldError('firstName')"
                />
                <label
                  for="floating_text"
                  class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-primary peer-focus:dark:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >Ism</label
                >
                <FormFieldError :error="formErrors.firstName" />
              </div>
              <div class="relative z-0 w-full mb-6 group">
                <input
                  id="floating_last"
                  v-model="lastName"
                  type="text"
                  name="floating_last"
                  :class="[
                    'block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 appearance-none dark:text-white focus:outline-none focus:ring-0 peer transition',
                    formErrors.lastName
                      ? 'border-rose-500 focus:border-rose-500'
                      : 'border-gray-300 dark:border-gray-600 dark:focus:border-primary focus:border-primary',
                  ]"
                  placeholder=" "
                  @input="clearFieldError('lastName')"
                />
                <label
                  for="floating_last"
                  class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-primary peer-focus:dark:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >Familiya</label
                >
                <FormFieldError :error="formErrors.lastName" />
              </div>
              <div class="relative z-0 w-full mb-6 group">
                <input
                  id="floating_phone"
                  v-model="phone"
                  type="text"
                  name="floating_phone"
                  :class="[
                    'block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 appearance-none dark:text-white focus:outline-none focus:ring-0 peer transition',
                    formErrors.phone
                      ? 'border-rose-500 focus:border-rose-500'
                      : 'border-gray-300 dark:border-gray-600 dark:focus:border-primary focus:border-primary',
                  ]"
                  placeholder=" "
                  @input="onPhoneInput"
                />
                <label
                  for="floating_phone"
                  class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-primary peer-focus:dark:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >Telefon raqam</label
                >
                <FormFieldError :error="formErrors.phone" />
              </div>
              <div class="relative z-0 w-full mb-6 group">
                <input
                  id="floating_org"
                  v-model="orgName"
                  type="text"
                  name="floating_org"
                  :class="[
                    'block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 appearance-none dark:text-white focus:outline-none focus:ring-0 peer transition',
                    formErrors.orgName
                      ? 'border-rose-500 focus:border-rose-500'
                      : 'border-gray-300 dark:border-gray-600 dark:focus:border-primary focus:border-primary',
                  ]"
                  placeholder=" "
                  @input="clearFieldError('orgName')"
                />
                <label
                  for="floating_org"
                  class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-primary peer-focus:dark:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >O'quv markazi nomi</label
                >
                <FormFieldError :error="formErrors.orgName" />
              </div>
              <div class="relative z-0 w-full mb-6 group">
                <input
                  id="floating_password"
                  v-model="password"
                  type="password"
                  name="floating_password"
                  :class="[
                    'block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 appearance-none dark:text-white focus:outline-none focus:ring-0 peer transition',
                    formErrors.password
                      ? 'border-rose-500 focus:border-rose-500'
                      : 'border-gray-300 dark:border-gray-600 dark:focus:border-primary focus:border-primary',
                  ]"
                  placeholder=" "
                  @input="clearFieldError('password')"
                />
                <label
                  for="floating_password"
                  class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-primary peer-focus:dark:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >Parol</label
                >
                <FormFieldError :error="formErrors.password" />
              </div>
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="text-white bg-primary hover:bg-primary/80 p-3 w-full rounded-md font-semibold cursor-pointer transition shadow-sm"
            >
              {{ loading ? "Ro'yxatdan o'tkazilmoqda..." : "Ro'yxatdan o'tish" }}
            </button>
            <p class="dark:text-white text-center text-gray-700">
              Profilingiz bormi?<button
                type="button"
                class="ml-2 text-primary hover:underline font-bold"
                @click="$router.push('/auth/login')"
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
import { authApi } from "@/api/services";
import { formatPhone, registerFormRules, validateForm } from "@/utils/validators";

export default {
  name: "Register",
  data() {
    return {
      firstName: "",
      lastName: "",
      phone: "+998 ",
      orgName: "",
      password: "",
      loading: false,
      formErrors: {},
    };
  },
  methods: {
    clearFieldError(field) {
      if (this.formErrors && this.formErrors[field]) {
        delete this.formErrors[field];
      }
    },
    onPhoneInput() {
      this.phone = formatPhone(this.phone);
      this.clearFieldError("phone");
    },
    async handleRegister() {
      const formData = {
        firstName: this.firstName,
        lastName: this.lastName,
        phone: this.phone,
        orgName: this.orgName,
        password: this.password,
      };

      const validation = validateForm(formData, registerFormRules);
      if (!validation.isValid) {
        this.formErrors = validation.errors;
        this.$toast.error(validation.firstError || "Iltimos, maydonlarni to'g'ri to'ldiring");
        return;
      }
      this.formErrors = {};

      this.loading = true;
      try {
        const res = await authApi.register({
          firstName: this.firstName,
          lastName: this.lastName,
          phone: this.phone,
          orgName: this.orgName,
          password: this.password,
        });

        if (res && res.accessToken) {
          localStorage.setItem("token", res.accessToken);
          if (res.user) {
            localStorage.setItem("user", JSON.stringify(res.user));
          }
          this.$toast.success("Muvaffaqiyatli ro'yxatdan o'tdingiz!", "Xush kelibsiz!");
          this.$router.push("/");
        }
      } catch (err) {
        this.$toast.error(err.response?.data?.message || "Ro'yxatdan o'tishda xatolik yuz berdi");
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
