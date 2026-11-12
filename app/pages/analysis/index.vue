<script setup>
useSeoMeta({
  title: "大吼分析 | 健康生活 OFFWORK APP",
  ogTitle: "大吼分析 | 健康生活 OFFWORK APP",
});
const views = [
  { key: "day", label: "日" },
  { key: "week", label: "週" },
  { key: "month", label: "月" },
  { key: "year", label: "年" },
];
const openModal = ref(false);
const chartTitle = ref("大吼指數");
const currentPage = ref("大吼");
const activeViewKey = ref("day");
const showDemoBottomSheet = ref(false);
const handleViewChange = (newKey) => {
  activeViewKey.value = newKey;
};
const isOpen = ref(false);

/* ──────────────────────────────────────────────
 * 日期：預設今天；從分析總覽點進來時沿用該頁選的日期（?date=YYYY-MM-DD）。
 * 左右箭頭依目前檢視一次移動一天／一週／一個月／一年，不能移到未來
 * ────────────────────────────────────────────── */
const route = useRoute();
const today = startOfDay(new Date());
const dateFromQuery = fromDateParam(route.query.date);
const selectedDate = ref(
  dateFromQuery && dateFromQuery <= today ? dateFromQuery : today,
);
const isToday = computed(() => isSameDay(selectedDate.value, today));

// 日期列文字，格式沿用設計稿（07/17、07/13 - 07/19、2025/07、2024/08 - 2025/07）
const currentDate = computed(() =>
  formatViewLabel(activeViewKey.value, selectedDate.value),
);
const canGoNext = computed(() => {
  const next = shiftViewDate(activeViewKey.value, selectedDate.value, 1);
  return getViewRange(activeViewKey.value, next).start <= today;
});
const shiftDate = (step) => {
  if (step > 0 && !canGoNext.value) return;
  const next = shiftViewDate(activeViewKey.value, selectedDate.value, step);
  selectedDate.value = next > today ? today : next;
};
const handleCalendarSelect = (date) => {
  selectedDate.value = date;
  openModal.value = false;
};

/* ──────────────────────────────────────────────
 * 大吼統計（來自存在瀏覽器的練習紀錄）
 * ────────────────────────────────────────────── */
const { records } = usePracticeRecords();
const summary = computed(() =>
  summarizeYelling(records.value, activeViewKey.value, selectedDate.value),
);
const dataCard = computed(() => [
  {
    id: 1,
    title: "最大分貝",
    // 沒有大吼，或都沒有收到麥克風音量時沒有數值
    data: summary.value.peakDb ?? "--",
    unit: "dB",
  },
  {
    id: 2,
    title: "累積次數",
    data: formatYellingCount(activeViewKey.value, summary.value.count),
    unit: "次",
  },
]);
</script>
<template>
  <div class="sticky top-0 z-50 sm:top-[56px]">
    <!-- 功能列 -->
    <section
      class="flex items-center justify-between bg-[#29292DCC] px-4 py-[10px] backdrop-blur-lg"
    >
      <NuxtLink to="/analyze">
        <img src="/icons/my/arrow-left-s-line.svg" alt="返回"
      /></NuxtLink>

      <h1 class="text-xl font-bold text-white">大吼</h1>
      <button @click="isOpen = true">
        <img src="/icons/my/arrow-up-down-fill.svg" alt="設定" />
      </button>
    </section>
    <!-- 視圖切換 -->
    <div class="inset-x-0 pt-4">
      <CommonViewSwitcher :views="views" @update:view="handleViewChange" />
    </div>
  </div>
  <!-- 日期與統計都依使用者的當地時間與瀏覽器裡的紀錄計算，只在瀏覽器端渲染 -->
  <ClientOnly>
    <main class="grid gap-4 p-4 text-white">
      <!-- 日期及日曆 -->
      <LayoutDateNavigation
        :dateText="currentDate"
        :can-go-next="canGoNext"
        @open-modal="openModal = true"
        @prev="shiftDate(-1)"
        @next="shiftDate(1)"
      />
      <CommonModal v-model:show="openModal">
        <CommonCalendar
          :selected="selectedDate"
          :max="today"
          @select-day="handleCalendarSelect"
        />
      </CommonModal>
      <!-- 大吼指數 -->
      <ChartsHalfCircleBar :chartTitle="chartTitle" :value="summary.index" />
      <!-- 綠色火山君 -->
      <CardVolcanokun v-if="activeViewKey !== 'day'" />
      <!-- 數據 -->
      <CardDataCard :dataCard="dataCard" />
      <!-- 大吼時段 -->
      <section>
        <CardTimeline
          :activeView="activeViewKey"
          :slots="summary.slots"
          :dayLabel="isToday ? 'Today' : currentDate"
        />
      </section>
      <!-- 大吼關鍵字 -->
      <CardAnalyzeCard title="大吼關鍵字" charts="bubble" />
      <!-- nav -->
      <div class="sticky inset-x-0 bottom-2">
        <LayoutBottomBar class="mb-2 mt-[27px]" />
      </div>
      <!-- bottomSheet -->
      <LayoutBottomSheet
        handleMarginBottom="mb-5"
        v-model="isOpen"
        :threshold="0.3"
        :backdrop-fade="0.6"
      >
        <ul class="text-md text-white">
          <li>
            <NuxtLink
              :class="`block w-full rounded-xl px-6 py-4 text-center font-bold ${currentPage == '大吼' ? 'bg-neutral-900 text-primary' : ''}`"
              to="#"
              @click="isOpen = true"
            >
              大吼
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              :class="`block w-full rounded-xl px-6 py-4 text-center font-bold ${currentPage == 'sleep' ? 'bg-neutral-900 text-primary' : ''}`"
              @click="isOpen = false"
            >
              呼吸
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              :class="`block w-full rounded-xl px-6 py-4 text-center font-bold ${currentPage == 'sleep' ? 'bg-neutral-900 text-primary' : ''}`"
              @click="isOpen = false"
            >
              冥想
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              :class="`block w-full rounded-xl px-6 py-4 text-center font-bold ${currentPage == 'sleep' ? 'bg-neutral-900 text-primary' : ''}`"
              @click="isOpen = false"
            >
              睡眠
            </NuxtLink>
          </li>
        </ul>
      </LayoutBottomSheet>
    </main>
  </ClientOnly>
</template>
<style scoped></style>
