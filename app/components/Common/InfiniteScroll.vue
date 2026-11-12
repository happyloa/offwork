<script setup>
const props = defineProps({
  itemHeight: { type: Number, required: true },
  scrollName: { type: String, required: true },
  itemCounts: { type: Number, required: true },
  defaultValue: { type: Number, default: 0 },
  scrollStyle: String,
  itemStyle: String,
  isNumberFormat: { type: Boolean, default: true },
  isRotate: { type: Boolean, default: false },
  /** 數值 0 要顯示成什麼（例如 12 小時制的 0 點顯示為 12）；不設定就照數字顯示 */
  zeroLabel: { type: String, default: "" },
});
// 每一格顯示的文字
const formatValue = (value) => {
  if (value === 0 && props.zeroLabel) return props.zeroLabel;
  return value >= 10 ? value : `${props.isNumberFormat ? "0" : ""}${value}`;
};
const emit = defineEmits(["changeValue"]);
const tempValue = ref(0);
const scrollbar = useTemplateRef("scroll");
const position = ref(0);
// 定位
function anchor() {
  // 滾動區所有的元素數量
  const itemCount = scrollbar.value.childElementCount;
  // 可視範圍的高度
  const viewHeight = scrollbar.value.clientHeight;
  const interval = props.itemHeight;
  // (可視範圍的高度/元素區間高度)顯示區會有n個數
  const viewItemCount = viewHeight / interval;
  if (props.defaultValue <= Math.round(viewItemCount / 2)) {
    scrollbar.value.scrollTop =
      (itemCount / 3 + props.defaultValue - 2) * interval;
  } else {
    scrollbar.value.scrollTop = (props.defaultValue - 2) * interval;
  }
}
function handleHourScroll() {
  // 當前滾動區頂端位置
  const top = scrollbar.value.scrollTop;
  // 元素區間高度 = 整個滾動區的高度 / 滾動區的元素數量
  const interval = props.itemHeight;

  // 滾動區所有的元素數量
  const itemCount = scrollbar.value.childElementCount;
  // 整個滾動區的高度
  const scrollHeight = interval * itemCount;
  // 可視範圍的高度
  const viewHeight = scrollbar.value.clientHeight;
  const viewItemCount = Math.floor(viewHeight / interval);
  // 捲到最上或最下時跳回中間那一組，做出無限捲動的效果
  if (top <= 0) {
    scrollbar.value.scrollTop = scrollHeight / 3 + top;
  }
  if (scrollHeight - top - viewHeight <= 0) {
    scrollbar.value.scrollTop = top - (itemCount / 3) * 2 * interval;
  }
  position.value = Math.floor(top / interval + viewItemCount / 2);
  tempValue.value = Math.floor(
    (top / interval + viewItemCount / 2) % (itemCount / 3),
  );

  emit("changeValue", tempValue.value);
}
onMounted(() => {
  anchor();
});
</script>
<template>
  <ul
    :ref="'scroll'"
    @scroll="handleHourScroll"
    :class="`scrollbar-hide flex snap-y flex-col overflow-scroll ${scrollStyle} ${isRotate && 'rotate-box'}`"
  >
    <li
      v-for="value in itemCounts"
      :key="`1-${value}`"
      :class="`flex ${itemStyle} snap-center items-center justify-center text-h5 font-medium ${tempValue == value - 1 ? 'text-primary' : ''} ${isRotate && position == value - 1 ? 'rotate' : ''}`"
    >
      {{ formatValue(value - 1) }}
    </li>
    <li
      v-for="value in itemCounts"
      :key="`2-${value}`"
      :class="`flex snap-center ${itemStyle} items-center justify-center text-h5 font-medium ${tempValue == value - 1 ? 'text-primary' : ''} ${isRotate && position == value - 1 + itemCounts ? 'rotate' : ''}`"
    >
      {{ formatValue(value - 1) }}
    </li>
    <li
      v-for="value in itemCounts"
      :key="`3-${value}`"
      :class="`flex snap-center ${itemStyle} items-center justify-center text-h5 font-medium ${tempValue == value - 1 ? 'text-primary' : ''} ${isRotate && position == value - 1 + itemCounts * 2 ? 'rotate' : ''}`"
    >
      {{ formatValue(value - 1) }}
    </li>
  </ul>
</template>
<style>
.rotate-box li {
  transform: rotateX(-30deg);
  /* transform-origin: bottom; */
}
.rotate ~ li {
  transform: rotateX(30deg);
  /* transform-origin: top; */
}
.rotate-box .rotate {
  transform: rotateX(0);
}
</style>
