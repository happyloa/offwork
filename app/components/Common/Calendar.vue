<script setup>
const weeklyData = ref(["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]);
const firstDayIndex = ref(2);
const activeDay = ref(17);
const days = computed(() => {
  const blanks = Array.from({ length: firstDayIndex.value }, () => null);
  const dayArray = Array.from({ length: 30 }, (_, i) => i + 1);
  return [...blanks, ...dayArray];
});
const isDayActive = (day) => {
  return day === activeDay.value;
};
const emit = defineEmits(["selectDay"]);
const handleDayClick = (day) => {
  if (isDayActive(day)) {
    emit("selectDay", day);
  }
};
</script>
<template>
  <div class="size-auto bg-[#242426] p-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center py-1">
        <p class="text-nowrap text-[17px] font-semibold text-white">
          July 2025
        </p>
        <img
          src="/icons/analyze/green-next.svg"
          alt="green-next-button"
          class="ms-1 h-[20px] p-1"
          loading="lazy"
        />
      </div>
      <div class="flex items-center">
        <img
          src="/icons/analyze/green-previous.svg"
          alt="green-previous-button"
          class="p-1"
          loading="lazy"
        />
        <img
          src="/icons/analyze/green-next.svg"
          alt="green-next-button"
          class="ms-7 p-1"
          loading="lazy"
        />
      </div>
    </div>
    <div class="flex grid-cols-7 gap-x-[15px]">
      <div
        v-for="day in weeklyData"
        :key="day"
        class="text-center font-semibold leading-snug text-[#EBEBF58C]"
      >
        {{ day }}
      </div>
    </div>
    <div class="grid grid-cols-7 gap-x-[1px] gap-y-2">
      <div
        v-for="day in days"
        :key="day"
        class="grid size-11 place-items-center"
        :class="{
          'rounded-full bg-[#A4CD441F]': isDayActive(day),
          'cursor-pointer': isDayActive(day),
        }"
        @click="handleDayClick(day)"
      >
        <p
          class="text-center text-xl leading-5"
          :class="isDayActive(day) ? 'text-primary' : 'text-white'"
        >
          {{ day }}
        </p>
      </div>
    </div>
  </div>
</template>
<style scoped></style>
