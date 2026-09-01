<template>
  <div class="calendar-page p-4 font-lexend space-y-4">
    <!-- Breadcrumb Header -->
    <Breadcrumb :items="[{ title: 'Dashboard', to: '/' }, { title: 'Taqvim' }]" />

    <!-- Reusable Calendar Board Component -->
    <CalendarBoard
      title="Taqvim va Tadbirlar"
      subtitle="Barcha o'quv jarayonlari, imtihonlar va oylik vazifalar rejasi"
    />
  </div>
</template>

<script>
import Breadcrumb from "@/components/Breadcrumb.vue";
import CalendarBoard from "@/components/calendar/CalendarBoard.vue";

export default {
  name: "CalendarView",
  components: {
    Breadcrumb,
    CalendarBoard,
  },
};
</script>
