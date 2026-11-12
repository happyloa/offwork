<script setup>
const isOpen = ref(false);
// 呼吸進行時長：存在 localStorage，並作為各呼吸法介紹頁的預設時長
const currentMin = ref(DEFAULT_BREATHING_MINUTES);
const timeList = BREATHING_MINUTE_OPTIONS;
const changeMin = (min) => {
  currentMin.value = min;
  saveBreathingTargetMinutes(min);
  isOpen.value = false;
};
onMounted(() => {
  currentMin.value = readBreathingTargetMinutes();
});
useSeoMeta({
  title: "我的 | 健康生活 OFFWORK APP",
  ogTitle: "我的 | 健康生活 OFFWORK APP",
});
</script>
<template>
  <section class="px-4">
    <button
      class="gradient-card-border w-full rounded-3xl bg-neutral-900 px-6 py-5"
      @click.stop="isOpen = true"
    >
      <div class="mb-3 flex items-center justify-between gap-1">
        <div class="flex items-baseline gap-1 text-alert-success">
          <p class="text-h5 font-bold">
            {{ currentMin }}
          </p>
          <p class="text-sm font-normal">分</p>
        </div>
        <img
          src="/icons/my/arrow-left-s-line.svg"
          width="24"
          height="24"
          alt="睡眠"
          class="rotate-180"
        />
      </div>
      <p class="text-start text-sm font-normal text-neutral-300">
        呼吸進行時長
      </p>
    </button>
  </section>
  <!-- 時間設定bar -->
  <div class="sticky inset-x-0 bottom-2 mt-auto">
    <LayoutBottomBar class="mt-[27px]" v-if="!isOpen" />
    <LayoutBottomSheet
      handleMarginBottom="mb-5"
      v-model="isOpen"
      :threshold="0.3"
      :backdrop-fade="0.6"
    >
      <ul class="text-md text-white">
        <li v-for="value in timeList">
          <button
            :class="`w-full rounded-xl px-6 py-4 text-center ${value == currentMin ? 'bg-neutral-900 text-primary' : ''}`"
            @click="() => changeMin(value)"
          >
            {{ value }} 分鐘
          </button>
        </li>
      </ul>
    </LayoutBottomSheet>
  </div>
</template>
