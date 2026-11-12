<script setup>
useSeoMeta({
  title: "分析 | 健康生活 OFFWORK APP",
  ogTitle: "分析 | 健康生活 OFFWORK APP",
});
definePageMeta({
  header: {
    title: "分析",
  },
});

/* ──────────────────────────────────────────────
 * 日期：預設今天，可用左右箭頭或月曆切換，不能選未來
 * ────────────────────────────────────────────── */
const today = startOfDay(new Date());
const selectedDate = ref(today);
const isToday = computed(() => isSameDay(selectedDate.value, today));
// 沿用設計稿的「7/17」格式
const currentDate = computed(
  () => `${selectedDate.value.getMonth() + 1}/${selectedDate.value.getDate()}`,
);

const openModal = ref(false);
const shiftDate = (days) => {
  const next = addDays(selectedDate.value, days);
  if (next <= today) selectedDate.value = next;
};
const handleCalendarSelect = (date) => {
  selectedDate.value = date;
  openModal.value = false;
};

/* ──────────────────────────────────────────────
 * 當天的練習摘要（來自存在瀏覽器的練習紀錄）
 * ────────────────────────────────────────────── */
const { records } = usePracticeRecords();
const summary = computed(() => summarizeDay(records.value, selectedDate.value));

// 呼吸目標：「我的 → 目標」設定的呼吸時長
const breathingTargetMinutes = ref(DEFAULT_BREATHING_MINUTES);
onMounted(() => {
  breathingTargetMinutes.value = readBreathingTargetMinutes();
});

// 爆發指數與火山君的話：當天有練習就降溫
const chartTitle = ref("爆發指數");
const burstIndex = computed(() => burstIndexOf(summary.value));
const volcanoMessage = computed(() =>
  summary.value.hasPractice
    ? "有好好釋放壓力，火山降溫囉，繼續保持～"
    : undefined,
);

// 大吼：最大分貝、次數（8 格進度條），超過每日上限標示「過多」
const yellingCard = computed(() => {
  const { yellingCount, yellingPeakDb } = summary.value;
  if (!yellingCount) {
    return { id: 1, title: "大吼", comment: "尚無紀錄", url: "/analysis" };
  }
  return {
    id: 1,
    title: "大吼",
    // 沒有麥克風或沒開權限時量不到分貝
    data: yellingPeakDb ?? "--",
    unit: "dB",
    comment: "最大分貝",
    url: isToday.value
      ? "/analysis"
      : `/analysis?date=${toDateParam(selectedDate.value)}`,
    charts: "progress",
    chartProps: { level: Math.min(YELLING_INDEX_FULL_COUNT, yellingCount) },
    isUpStandard: yellingCount <= YELLING_DAILY_LIMIT,
  };
});

// 呼吸：當天分鐘數 / 目標分鐘數，達標才顯示「尚可」
const breathingCard = computed(() => {
  const minutes = toDisplayMinutes(summary.value.breathingSeconds);
  if (!minutes) {
    return { id: 4, title: "呼吸", comment: "尚無紀錄", url: "#" };
  }
  const target = breathingTargetMinutes.value;
  return {
    id: 4,
    title: "呼吸",
    data: minutes,
    unit: `分鐘 / ${target}分鐘`,
    comment: isToday.value ? "今日 / 目標" : "當日 / 目標",
    url: "#",
    charts: "doughnut",
    chartProps: {
      percentage: Math.min(100, Math.round((minutes / target) * 100)),
    },
    isUpStandard: minutes >= target ? true : undefined,
  };
});

// 心情關鍵字、睡眠、冥想尚未有對應功能，維持示意資料
const analyzeData = computed(() => [
  yellingCard.value,
  {
    id: 2,
    title: "心情關鍵字",
    charts: "bubble",
  },
  {
    id: 3,
    title: "睡眠",
    data: 6.5,
    unit: "小時 / 8小時",
    comment: "今日 / 目標",
    url: "#",
    charts: "doughnut",
    isUpStandard: true,
  },
  breathingCard.value,
  {
    id: 5,
    title: "冥想",
    comment: "尚無紀錄",
    url: "#",
  },
]);
</script>
<template>
  <ClientOnly>
    <main class="bg-neutral-950 px-4">
      <div class="grid gap-4 py-4 text-white">
        <!-- 日期及日曆 -->
        <LayoutDateNavigation
          :dateText="currentDate"
          :can-go-next="!isToday"
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
        <!-- 爆發指數 -->
        <section>
          <ChartsHalfCircleBar :chartTitle="chartTitle" :value="burstIndex" />
        </section>
        <!-- 火山君關心你 -->
        <CardVolcanokun :message="volcanoMessage" />
        <!-- 分析圖卡 -->
        <template v-for="item in analyzeData" :key="item.id">
          <CardAnalyzeCard
            :title="item.title"
            :data="item.data"
            :unit="item.unit"
            :comment="item.comment"
            :url="item.url"
            :charts="item.charts"
            :chartProps="item.chartProps"
            :isUpStandard="item.isUpStandard"
          />
        </template>
      </div>
      <!-- nav -->
      <div class="sticky inset-x-0 bottom-2">
        <LayoutNavBar />
        <LayoutBottomBar class="mb-2 mt-[27px]" />
      </div>
    </main>
  </ClientOnly>
</template>
