<script setup>
useSeoMeta({
  title: "大吼 | 健康生活 OFFWORK APP",
  ogTitle: "大吼 | 健康生活 OFFWORK APP",
});

definePageMeta({
  shell: { scrollable: false },
});

const isYelling = ref(false);

// 麥克風音量：拿得到就顯示即時音量計並記錄最大分貝；
// 沒有麥克風或使用者沒開權限時，維持原本單純播放動畫的方式
const {
  status: micStatus,
  db: micDb,
  peakDb: micPeakDb,
  start: startMic,
  stop: stopMic,
} = useMicrophoneLevel();

// 新增：大吼開始時間與計時器
const yellingStartMs = ref(null);
let yellingTimer = null;

// 把「已經過秒數」寫入 sessionStorage
function writeYellingElapsed() {
  if (!import.meta.client || yellingStartMs.value === null) return;
  const elapsed = Math.max(
    0,
    Math.floor((Date.now() - yellingStartMs.value) / 1000),
  );
  sessionStorage.setItem("yellingTimeElapsed", String(elapsed));
}

const startYelling = () => {
  isYelling.value = true;
  if (!import.meta.client) return;

  // 初始化大吼計時
  yellingStartMs.value = Date.now();
  sessionStorage.setItem("yellingTimeElapsed", "0"); // 先清成 0
  sessionStorage.removeItem("yellingPeakDb");

  // 每秒更新一次
  if (yellingTimer) clearInterval(yellingTimer);
  yellingTimer = window.setInterval(writeYellingElapsed, 1000);

  // 要求麥克風權限（瀏覽器規定要在點擊事件內呼叫）
  startMic();
};

// 結束大吼：補記時長，並存一筆練習紀錄。
// 按停止與離開頁面都會呼叫，只處理第一次。
const { add: addPracticeRecord } = usePracticeRecords();
let hasFinished = false;

function finishYelling() {
  if (yellingTimer) {
    clearInterval(yellingTimer);
    yellingTimer = null;
  }
  if (yellingStartMs.value === null || hasFinished) return;
  hasFinished = true;

  writeYellingElapsed();

  // 最大分貝：沒有收到麥克風音量時不記錄，首頁會顯示「--」
  const hasPeak = micPeakDb.value !== null;
  const peakDb = hasPeak ? Math.round(micPeakDb.value) : undefined;
  if (hasPeak) sessionStorage.setItem("yellingPeakDb", String(peakDb));
  stopMic();

  const seconds = Math.floor((Date.now() - yellingStartMs.value) / 1000);
  // 不滿 1 秒不算一次練習
  if (seconds >= 1) {
    addPracticeRecord({
      type: "yelling",
      startedAt: yellingStartMs.value,
      seconds,
      ...(hasPeak && { peakDb }),
    });
  }
}

onUnmounted(finishYelling);
</script>

<template>
  <h1 class="relative z-10 py-2.5 text-center text-xl font-bold text-white">
    <NuxtLink
      v-if="!isYelling"
      :to="{ path: '/', query: { openCeremony: 'true' } }"
      class="absolute left-0 top-1/2 block -translate-y-1/2 py-2 pl-4 pr-2"
    >
      <img src="/icons/white-left-arrow.svg" alt="返回箭頭" />
    </NuxtLink>
    放聲大吼吧
  </h1>
  <!-- 大吼中 -->
  <main v-if="isYelling">
    <img
      src="/images/yelling/yelling-red-volcano.gif"
      alt="大吼中紅色火山君"
      class="pointer-events-none absolute bottom-[104px] left-1/2 z-0 w-full max-w-[375px] -translate-x-1/2"
    />
    <!-- 音量 Lottie、停止按鈕 -->
    <div
      class="absolute bottom-0 left-1/2 z-10 flex w-full -translate-x-1/2 flex-col items-center bg-gradient-to-t from-neutral-950 from-40% to-[#29292D00] pt-8"
    >
      <div class="mb-8 max-w-[259px]">
        <!-- 拿不到麥克風（沒有裝置、沒開權限、瀏覽器不支援）時播放原本的音量動畫；
             其餘情況顯示即時音量計，等待授權期間直條全暗，與開始前的畫面一致 -->
        <Lottie v-if="micStatus === 'unavailable'" name="yelling/volume" />
        <YellingVolumeMeter v-else :db="micDb" />
      </div>
      <!-- 停止按鈕 -->
      <div class="mb-10 rounded-full border-[11px] border-[#C0C7DC33]">
        <NuxtLink
          :to="{ path: '/', query: { openFeelingBetter: 'true' } }"
          class="block rounded-full bg-neutral-950 p-6"
          @click="finishYelling()"
        >
          <img src="/icons/yelling/stop-fill.svg" alt="停止 icon" />
        </NuxtLink>
      </div>
      <LayoutBottomBar class="mb-2 mt-[27px]" />
    </div>
  </main>
  <!-- 準備大吼 -->
  <main v-else>
    <img
      src="/images/yelling/before-yelling-red-volcano.webp"
      alt="準備大吼紅色火山君"
      class="pointer-events-none absolute bottom-[104px] left-1/2 z-0 w-full max-w-[375px] -translate-x-1/2"
    />
    <!-- 靜態音量圖片、開始按鈕 -->
    <div
      class="absolute bottom-0 left-1/2 z-10 flex w-full -translate-x-1/2 flex-col items-center bg-gradient-to-t from-neutral-950 from-50% to-[#29292D00] pt-8"
    >
      <img src="/images/yelling/volume.webp" alt="音量圖片" class="mb-8" />
      <!-- 開始按鈕 -->
      <div class="mb-10 rounded-full border-[11px] border-[#C0C7DC33]">
        <button
          type="button"
          class="rounded-full bg-white p-6"
          @click="startYelling"
        >
          <img src="/icons/yelling/mic.svg" alt="麥克風 icon" />
        </button>
      </div>
      <LayoutBottomBar class="mb-2 mt-[27px]" />
    </div>
  </main>
</template>
