<script setup>
// 即時音量計：外觀沿用大吼頁的音量動畫（assets/lottie/yelling/volume.json）——
// 20 根直條、30／80／120 的刻度——差別只在亮到第幾根是由實際音量決定。
// 尺寸與位置都取自原動畫，換上去不會讓版面位移。
const props = defineProps({
  /** 目前的估算分貝 */
  db: {
    type: Number,
    required: true,
  },
});

const BAR_COUNT = 20;
const BAR_WIDTH = 6;
const BAR_GAP = 12; // 相鄰兩根直條左緣的距離
const FIRST_BAR_X = 12;
const BAR_CENTER_Y = 22;
const BAR_HEIGHT = 28;
// 亮著的最右邊兩根會比較高，做出音量在跳動的感覺
const EDGE_BAR_HEIGHT = 44;
const NEAR_EDGE_BAR_HEIGHT = 34;

// 刻度「80」畫在正中間（第 10、11 根之間），所以 30～80 與 80～120 各佔一半
const MID_DB = 80;
const MID_POSITION = (BAR_COUNT - 1) / 2;

/** 亮幾根直條 */
const litCount = computed(() => {
  if (props.db <= VOLUME_MIN_DB) return 0;
  const position =
    props.db <= MID_DB
      ? ((props.db - VOLUME_MIN_DB) / (MID_DB - VOLUME_MIN_DB)) * MID_POSITION
      : MID_POSITION +
        ((props.db - MID_DB) / (VOLUME_MAX_DB - MID_DB)) * MID_POSITION;
  return Math.min(BAR_COUNT, Math.floor(position) + 1);
});

const bars = computed(() =>
  Array.from({ length: BAR_COUNT }, (_, index) => {
    const isLit = index < litCount.value;
    const distanceFromEdge = litCount.value - 1 - index;
    let height = BAR_HEIGHT;
    if (isLit && distanceFromEdge === 0) height = EDGE_BAR_HEIGHT;
    if (isLit && distanceFromEdge === 1) height = NEAR_EDGE_BAR_HEIGHT;
    return {
      x: FIRST_BAR_X + index * BAR_GAP,
      y: BAR_CENTER_Y - height / 2,
      height,
      isLit,
    };
  }),
);

// 刻度文字的中心點：對齊第 1 根、正中間、第 20 根
const labels = [
  { text: VOLUME_MIN_DB, x: FIRST_BAR_X + BAR_WIDTH / 2 },
  { text: MID_DB, x: FIRST_BAR_X + MID_POSITION * BAR_GAP + BAR_WIDTH / 2 },
  {
    text: VOLUME_MAX_DB,
    x: FIRST_BAR_X + (BAR_COUNT - 1) * BAR_GAP + BAR_WIDTH / 2,
  },
];
</script>

<template>
  <svg
    viewBox="0 0 258 67"
    width="258"
    height="67"
    class="block max-w-full"
    aria-hidden="true"
  >
    <rect
      v-for="bar in bars"
      :key="bar.x"
      :x="bar.x"
      :y="bar.y"
      :width="BAR_WIDTH"
      :height="bar.height"
      :rx="BAR_WIDTH / 2"
      fill="#fff"
      :opacity="bar.isLit ? 1 : 0.2"
    />
    <text
      v-for="label in labels"
      :key="label.text"
      :x="label.x"
      y="63"
      text-anchor="middle"
      fill="#fff"
      font-size="12"
    >
      {{ label.text }}
    </text>
  </svg>
</template>
