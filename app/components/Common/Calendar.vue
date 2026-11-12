<script setup>
const props = defineProps({
  /** 目前選取的日期 */
  selected: {
    type: Date,
    required: true,
  },
  /** 可以選的最後一天（通常是今天）；之後的日期顯示為灰色且不能點 */
  max: {
    type: Date,
    default: () => new Date(),
  },
});
const emit = defineEmits(["selectDay"]);

const weeklyData = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const firstDayOfMonth = (date) =>
  new Date(date.getFullYear(), date.getMonth(), 1);

// 目前顯示的月份（以該月 1 日表示）；選取的日期改變時跳到它所在的月份
const viewMonth = ref(firstDayOfMonth(props.selected));
watch(
  () => props.selected,
  (date) => {
    viewMonth.value = firstDayOfMonth(date);
  },
);

const title = computed(
  () =>
    `${MONTH_NAMES[viewMonth.value.getMonth()]} ${viewMonth.value.getFullYear()}`,
);

// 月曆格子：1 日之前補空格，之後是當月每一天
const days = computed(() => {
  const year = viewMonth.value.getFullYear();
  const month = viewMonth.value.getMonth();
  const blanks = Array.from({ length: viewMonth.value.getDay() }, () => null);
  const dayCount = new Date(year, month + 1, 0).getDate();
  const dayArray = Array.from(
    { length: dayCount },
    (_, i) => new Date(year, month, i + 1),
  );
  return [...blanks, ...dayArray];
});

const isDayActive = (day) => !!day && isSameDay(day, props.selected);
const isDaySelectable = (day) =>
  !!day && startOfDay(day) <= startOfDay(props.max);

const canGoNextMonth = computed(
  () => addMonths(viewMonth.value, 1) <= startOfDay(props.max),
);
const changeMonth = (step) => {
  if (step > 0 && !canGoNextMonth.value) return;
  viewMonth.value = addMonths(viewMonth.value, step);
};

const handleDayClick = (day) => {
  if (isDaySelectable(day)) {
    emit("selectDay", day);
  }
};
</script>
<template>
  <div class="size-auto bg-[#242426] p-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center py-1">
        <p class="text-nowrap text-[17px] font-semibold text-white">
          {{ title }}
        </p>
        <img
          src="/icons/analyze/green-next.svg"
          alt="green-next-button"
          class="ms-1 h-[20px] p-1"
          loading="lazy"
        />
      </div>
      <div class="flex items-center">
        <button type="button" aria-label="上個月" @click="changeMonth(-1)">
          <img
            src="/icons/analyze/green-previous.svg"
            alt="green-previous-button"
            class="p-1"
            loading="lazy"
          />
        </button>
        <button
          type="button"
          class="ms-7"
          :class="{ 'opacity-40': !canGoNextMonth }"
          aria-label="下個月"
          :disabled="!canGoNextMonth"
          @click="changeMonth(1)"
        >
          <img
            src="/icons/analyze/green-next.svg"
            alt="green-next-button"
            class="p-1"
            loading="lazy"
          />
        </button>
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
        v-for="(day, index) in days"
        :key="index"
        class="grid size-11 place-items-center"
        :class="{
          'rounded-full bg-[#A4CD441F]': isDayActive(day),
          'cursor-pointer': isDaySelectable(day),
        }"
        @click="handleDayClick(day)"
      >
        <p
          v-if="day"
          class="text-center text-xl leading-5"
          :class="
            isDayActive(day)
              ? 'text-primary'
              : isDaySelectable(day)
                ? 'text-white'
                : 'text-[#EBEBF58C]'
          "
        >
          {{ day.getDate() }}
        </p>
      </div>
    </div>
  </div>
</template>
<style scoped></style>
