<script setup>
import { ref, onMounted, watch } from "vue";

// 畫布的邏輯尺寸（CSS px）
const CANVAS_WIDTH = 98;
const CANVAS_HEIGHT = 60;

const props = defineProps({
  totalSegments: {
    type: Number,
    default: 8,
  },
  level: {
    type: Number,
    default: 6,
  },
});

const progressBarCanvas = ref(null);

const config = {
  segmentWidth: 7,
  segmentHeight: 24,
  spacing: 6,
  activeColor: "#F15A3C",
  inactiveColor: "#44434A",
  cornerRadius: 10,
};

const drawRoundedRect = (ctx, x, y, width, height, radius) => {
  if (width < 2 * radius) radius = width / 2;
  if (height < 2 * radius) radius = height / 2;

  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
  ctx.fill();
};

const drawProgressBar = () => {
  const canvas = progressBarCanvas.value;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  // 用固定的邏輯尺寸，重畫時才不會被上一次乘過 dpr 的寬高越放越大
  const dpr = window.devicePixelRatio || 1;
  const width = CANVAS_WIDTH;
  const height = CANVAS_HEIGHT;

  canvas.style.width = width + "px";
  canvas.style.height = height + "px";

  canvas.width = width * dpr;
  canvas.height = height * dpr;

  ctx.scale(dpr, dpr);

  ctx.clearRect(0, 0, width, height);

  const totalWidth =
    props.totalSegments * (config.segmentWidth + config.spacing) -
    config.spacing;
  const startX = (width - totalWidth) / 2;
  const startY = (height - config.segmentHeight) / 2;

  for (let i = 0; i < props.totalSegments; i++) {
    const x = startX + i * (config.segmentWidth + config.spacing);

    ctx.fillStyle = i < props.level ? config.activeColor : config.inactiveColor;

    drawRoundedRect(
      ctx,
      x,
      startY,
      config.segmentWidth,
      config.segmentHeight,
      config.cornerRadius,
    );
  }
};

onMounted(() => {
  drawProgressBar();
});

// 資料改變時重畫
watch(() => [props.level, props.totalSegments], drawProgressBar);
</script>
<template>
  <div class="py-4.5 h-[60px] w-[98px]">
    <canvas
      ref="progressBarCanvas"
      :width="CANVAS_WIDTH"
      :height="CANVAS_HEIGHT"
    ></canvas>
  </div>
</template>
