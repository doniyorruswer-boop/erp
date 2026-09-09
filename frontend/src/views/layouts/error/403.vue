<template>
  <div class="container lg:max-w-7xl mx-auto text-center mt-40">
    <div class="space-y-8">
      <h1 class="text-9xl dark:text-white text-gray-800 font-bold">403</h1>
      <h2 class="text-4xl dark:text-white text-gray-800">Ruxsat Berilmagan</h2>
      <p class="dark:text-gray-400 text-gray-600 max-w-md mx-auto">
        Ushbu modul sizning tashkilotingiz uchun faollashtirilmagan yoki unga kirish huquqingiz
        cheklangan.
      </p>
      <button class="bg-primary rounded text-white py-3 px-5" @click="$router.push('/')">
        Bosh sahifaga qaytish
      </button>
    </div>
  </div>
</template>

<script setup>
defineOptions({
  name: "ForbiddenErrorView",
});
</script>
