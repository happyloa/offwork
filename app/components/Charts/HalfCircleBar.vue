<script setup>
import { gsap } from "gsap";
const props = defineProps({
  chartTitle: {
    type: String,
    required: true,
  },
  /** 指數（0–100） */
  value: {
    type: Number,
    default: 70,
  },
});
const progress = ref(0);
const config = {
  cx: 50,
  cy: 52.5,
  r: 44.5,
  strokeWidth: 15,
};
const displayedProgress = computed(() => {
  return progress.value.toFixed(0);
});
const pathLength = computed(() => Math.PI * config.r);
const strokeDashoffset = computed(() => {
  const progressValue = Math.max(0, Math.min(100, progress.value)) / 100;
  return pathLength.value * (1 - progressValue);
});
const pathD = computed(() => {
  return `M ${config.cx - config.r} ${config.cy} A ${config.r} ${config.r} 0 0 1 ${config.cx + config.r} ${config.cy}`;
});

let timeline = null;
let isIntroPlaying = false;

// 進場動畫：先衝到 100，再彈回實際數值
function playIntro() {
  timeline?.kill();
  progress.value = 0;
  isIntroPlaying = true;
  timeline = gsap.timeline({
    onComplete: () => {
      isIntroPlaying = false;
    },
  });

  timeline.to(progress, {
    value: 100,
    duration: 0.7,
    ease: "power2.inOut",
  });

  timeline.to(progress, {
    value: props.value,
    duration: 1,
    ease: "bounce.out",
  });
}

onMounted(playIntro);

// 數值改變（切換日期、資料載入完成）：進場動畫還在跑就以新數值重播，
// 否則直接滑到新數值
watch(
  () => props.value,
  (value) => {
    if (isIntroPlaying) {
      playIntro();
      return;
    }
    timeline?.kill();
    timeline = gsap.timeline();
    timeline.to(progress, { value, duration: 0.6, ease: "power2.out" });
  },
);

onUnmounted(() => {
  timeline?.kill();
});
</script>
<template>
  <div class="relative z-0 my-5 flex flex-col items-center">
    <svg viewBox="0 0 100 60" class="z-0 h-[142px] w-[250px]">
      <path
        :d="pathD"
        fill="transparent"
        stroke="#44434A"
        :stroke-width="config.strokeWidth"
        stroke-linecap="round"
      />
      <path
        :d="pathD"
        fill="transparent"
        stroke="#F15A3C"
        :stroke-width="config.strokeWidth"
        :stroke-dasharray="pathLength"
        :stroke-dashoffset="strokeDashoffset"
        stroke-linecap="round"
        class="transisiton-all duration-700"
      />
    </svg>
    <div class="absolute -bottom-2 mt-2 flex flex-col items-center">
      <span class="my-1 font-bold">{{ chartTitle }}</span>
      <span class="text-[28px] font-bold">{{ displayedProgress }}%</span>
    </div>
  </div>
</template>
