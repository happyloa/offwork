<script setup>
const props = defineProps({
  activeView: {
    type: String,
    default: "day",
  },
  /** 有大吼的時段 [欄, 小時(0–23), 次數]，由 summarizeYelling 算出 */
  slots: {
    type: Array,
    default: () => [],
  },
  /** 日檢視時欄位下方的文字（今天是 Today，其他日期顯示日期） */
  dayLabel: {
    type: String,
    default: "Today",
  },
});

// 各檢視的欄位：日 1 欄、週 7 欄（日～六）、月 5 欄（每 7 天一欄）、年 12 欄（1～12 月）
const columnLabels = computed(() => ({
  day: [props.dayLabel],
  week: ["S", "M", "T", "W", "T", "F", "S"],
  month: ["1", "8", "15", "22", "29"],
  year: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
}));

// 縱軸由下到上是 24:00 → 0:00；第 h 點的資料畫在索引 24 - h 的那一列
const HOUR_LABELS = Array.from({ length: 25 }, (_, i) => `${24 - i}:00`);

// 熱力圖的色階是 0～10 的連續值；三個級距取 3／7／10，
// 顏色深淺剛好對應圖例的 30%／70%／100%
const LEVEL_VALUES = [0, 3, 7, 10];

const generateChartGridData = (columnCount, slots) => {
  const valueMap = new Map(
    slots.map(([column, hour, count]) => [
      `${column},${24 - hour}`,
      LEVEL_VALUES[yellingCountLevel(props.activeView, count)],
    ]),
  );

  const gridData = [];
  for (let x = 0; x < columnCount; x++) {
    for (let y = 1; y <= 24; y++) {
      gridData.push([x, y, valueMap.get(`${x},${y}`) ?? 0]);
    }
  }
  return gridData;
};
const chartLabel = {
  day: {
    title: "",
    items: [
      { label: "1-2", color: "#A4CD444D" },
      { label: "3-4", color: "#A4CD44B2" },
      { label: ">5", color: "#A4CD44" },
    ],
  },
  week: {
    title: "週均次數",
    items: [
      { label: "1-14", color: "#A4CD444D" },
      { label: "15-24", color: "#A4CD44B2" },
      { label: ">25", color: "#A4CD44" },
    ],
  },
  month: {
    title: "月均次數",
    items: [
      { label: "1-14", color: "#A4CD444D" },
      { label: "15-24", color: "#A4CD44B2" },
      { label: ">25", color: "#A4CD44" },
    ],
  },
  year: {
    title: "年均次數",
    items: [
      { label: "1-59", color: "#A4CD444D" },
      { label: "60-119", color: "#A4CD44B2" },
      { label: ">120", color: "#A4CD44" },
    ],
  },
};
const chartData = computed(() => {
  const labels = columnLabels.value[props.activeView];
  return {
    labels,
    yLabels: HOUR_LABELS,
    data: generateChartGridData(labels.length, props.slots),
  };
});
</script>
<template>
  <div
    class="border-gradient gradient-card-border rounded-[32px] bg-neutral-900 px-6 py-5"
  >
    <p class="text-xl font-bold text-white">大吼時段</p>
    <div v-if="!chartData" class="py-2 text-xs text-neutral-300">
      資料載入中…
    </div>
    <ChartsTimelineChart v-else :chart-data="chartData" />
    <p class="mb-4 pt-0 text-end text-[11px]" v-if="chartData === 'today'">
      today
    </p>
    <ul class="mt-4 flex items-center justify-end gap-4">
      <p class="text-end text-[11px] text-neutral-300">
        {{ chartLabel[props.activeView].title }}
      </p>
      <li
        v-for="{ label, color } in chartLabel[props.activeView].items"
        :key="index"
        class="flex items-center gap-1"
      >
        <span
          class="block h-[12px] w-[12px] rounded-sm"
          :style="{ backgroundColor: color }"
        ></span
        ><span class="font-xxs text-[11px] text-neutral-300"
          >{{ label }}次</span
        >
      </li>
    </ul>
  </div>
</template>
<style scoped></style>
