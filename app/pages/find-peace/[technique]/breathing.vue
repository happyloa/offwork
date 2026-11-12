<script setup>
definePageMeta({
  shell: { scrollable: false, statusBar: "transparent" },
});

/* ──────────────────────────────────────────────
 * 基本：路由、呼吸法、SEO
 * ────────────────────────────────────────────── */
const route = useRoute();
const router = useRouter();

// 依路由參數取得呼吸法；不存在就顯示 404（fatal 的說明見同資料夾 index.vue）
const technique = getBreathingTechnique(route.params.technique);
if (!technique) {
  throw createError({
    statusCode: 404,
    statusMessage: "Page Not Found",
    fatal: import.meta.client,
  });
}

useSeoMeta({
  title: `${technique.name}呼吸中 | 健康生活 OFFWORK APP`,
  ogTitle: `${technique.name}呼吸中 | 健康生活 OFFWORK APP`,
});

/* ──────────────────────────────────────────────
 * UI 互動（行為層）：模擬 group-hover，點下畫面顯示標題、操作按鈕
 * ────────────────────────────────────────────── */
const isGroupHover = ref(false);

/* ──────────────────────────────────────────────
 * 呼吸分鐘數（query；無效時 fallback 預設分鐘數）
 * ────────────────────────────────────────────── */
const queryMinutes = Number(route.query.minutes);
const breathingMinutes =
  Number.isFinite(queryMinutes) && queryMinutes >= 1
    ? Math.floor(queryMinutes)
    : DEFAULT_BREATHING_MINUTES;

/* ──────────────────────────────────────────────
 * 呼吸練習：倒數、吸／憋／吐階段、暫停、時長紀錄
 *  - 倒數歸零後導向 /?openFeelingCalm
 * ────────────────────────────────────────────── */
const {
  remainingSec,
  phase,
  phaseIndex,
  phaseRemainingSec,
  transitionSec,
  isLungsFull,
  isRunning,
  isPaused,
  start: startSession,
  togglePause,
  stop: stopSession,
} = useBreathingSession(technique, breathingMinutes * 60, () => {
  router.replace("/?openFeelingCalm");
});

// 格式化 MM:SS（分鐘至少 2 位）
const displayTime = computed(() => {
  const mm = String(Math.floor(remainingSec.value / 60)).padStart(2, "0");
  const ss = String(remainingSec.value % 60).padStart(2, "0");
  return `${mm}:${ss}`;
});

const phaseLabel = computed(() => BREATH_PHASE_LABELS[phase.value.type]);

// 遮罩中心的偏移（相對於畫面中央 50%/50%）
const revealOffsetX = ref("0px"); // 例：'16px' 或 '2vw'
const revealOffsetY = ref("0px"); // 例：'24px' 或 '10vh'

/* ──────────────────────────────────────────────
 * 前置倒數（3 → 2 → 1 → 揭露 → 開始）
 * ────────────────────────────────────────────── */
const showReveal = ref(true); // 是否顯示遮罩＋文案
const preSec = ref(3); // 倒數數字
const expandMask = ref(false); // 最後 1 秒啟動擴張動畫
let preTimer = null;

function startPreRoll() {
  // 若已經在跑，避免重複啟動
  if (preTimer) return;

  // 明確重置前置狀態
  preSec.value = 3;
  expandMask.value = false;
  showReveal.value = true;

  preTimer = setInterval(() => {
    preSec.value -= 1;

    // 剩 1 秒：標題淡出+放大圓洞＋文案往下消失（動畫時間 1s）
    if (preSec.value === 1) {
      expandMask.value = true;
    }

    // 結束：關閉遮罩，主畫面動畫與呼吸倒數正式開始
    if (preSec.value <= 0) {
      clearInterval(preTimer);
      preTimer = null;

      preSec.value = 0; // 夾住，避免負數閃爍
      showReveal.value = false;

      startSession();
    }
  }, 1000);
}

/* ──────────────────────────────────────────────
 * 生命週期：掛載/卸載
 * ────────────────────────────────────────────── */
onMounted(() => {
  startPreRoll();
});

onUnmounted(() => {
  if (preTimer) {
    clearInterval(preTimer);
    preTimer = null;
  }
});
</script>

<template>
  <!-- 倒數時顯示的呼吸法標題，會隨著 expandMask 淡出 -->
  <NuxtLink
    :to="`/find-peace/${technique.id}`"
    class="absolute top-0 z-20 block w-full py-2.5 text-center text-xl font-bold text-white transition duration-1000 sm:top-14"
    :class="{ 'pointer-events-none opacity-0': expandMask }"
  >
    <button
      type="button"
      class="absolute left-0 top-1/2 block -translate-y-1/2 py-2 pl-4 pr-2"
    >
      <img
        src="/icons/white-left-arrow.svg"
        width="24"
        height="24"
        alt="返回箭頭"
      />
    </button>
    {{ technique.name }}
  </NuxtLink>
  <!-- 一開始的倒數、mask 動畫 -->
  <div
    v-if="showReveal"
    class="reveal-mask | pointer-events-none absolute inset-0 z-10 bg-neutral-950"
    :class="{ 'reveal-expand': expandMask }"
    :style="{ '--dx': revealOffsetX, '--dy': revealOffsetY }"
  ></div>
  <!-- 標題（永遠在洞口下方 20px） -->
  <h3
    v-if="showReveal"
    class="reveal-title pointer-events-none absolute left-1/2 z-20 -translate-x-1/2 text-center text-h4 font-bold text-white transition-transform duration-1000 ease-[cubic-bezier(0.6,0,0.4,1)]"
    :class="{ 'reveal-slide': expandMask }"
    :style="{ '--dx': revealOffsetX, '--dy': revealOffsetY }"
  >
    準備開始囉
  </h3>
  <!-- 倒數數字（永遠在 h3 下方 20px） -->
  <p
    v-if="showReveal"
    class="reveal-count pointer-events-none absolute left-1/2 z-20 -translate-x-1/2 text-center text-h1 font-bold text-alert-success transition-transform duration-1000 ease-[cubic-bezier(0.6,0,0.4,1)]"
    :class="{ 'reveal-slide': expandMask }"
    :style="{ '--dx': revealOffsetX, '--dy': revealOffsetY }"
  >
    {{ preSec }}
  </p>
  <!-- 呼吸中內容（--breath-duration：目前階段的動畫秒數，由子元素的 transition 讀取） -->
  <section
    class="content-origin h-full transform-gpu bg-secondary transition-transform duration-500 ease-[cubic-bezier(0.6,0,0.4,1)] sm:-mt-14 sm:pt-14"
    :class="[
      expandMask ? 'scale-100' : 'scale-[0.7]',
      { 'is-still': !isRunning },
    ]"
    :style="{
      '--dx': revealOffsetX,
      '--dy': revealOffsetY,
      '--breath-duration': `${transitionSec}s`,
    }"
    @click.self="isGroupHover = !isGroupHover"
  >
    <h1
      class="pointer-events-none relative z-10 mb-6 py-2.5 text-center text-xl font-bold text-white opacity-0 transition"
      :class="{ 'opacity-100': isGroupHover }"
    >
      {{ technique.name }}
    </h1>
    <!-- 倒數分鐘數 -->
    <p
      class="pointer-events-none relative z-20 text-center text-h2 font-bold text-white"
    >
      {{ displayTime }}
    </p>
    <main>
      <!-- 呼吸火山君 -->
      <img
        src="/images/find-peace/calm-breathe/breathing-green-volcano.webp"
        width="1125"
        height="1710"
        alt="呼吸綠色火山君"
        class="breathing-volcano | pointer-events-none absolute bottom-[102px] left-1/2 z-10 w-full max-w-[391px] -translate-x-1/2"
        :class="{ 'is-full': isLungsFull }"
      />
      <!-- 背景呼吸圓圈 -->
      <div
        class="breathing-circle | pointer-events-none absolute bottom-[290px] left-1/2 z-0 rounded-full bg-secondary-300"
        :class="[
          expandMask ? 'size-[231px]' : 'size-0',
          { 'is-full': isLungsFull },
        ]"
      ></div>
      <!-- 漸層色塊容器 -->
      <div
        class="pointer-events-none absolute bottom-0 z-10 h-[320px] w-full bg-gradient-to-t from-secondary from-50% to-[#5AB3D200] sm:rounded-b-[50px]"
      >
        <!-- 吸氣吐氣容器 -->
        <div
          class="pointer-events-none absolute left-1/2 top-[131px] w-full max-w-[200px] -translate-x-1/2 text-center transition-all duration-300"
          :class="{ 'top-[46px]': isGroupHover && expandMask }"
        >
          <!-- 吸氣吐氣 -->
          <div class="mb-6 h-6 rounded-full bg-white/20">
            <div
              class="breathing-bar | mx-auto h-6 rounded-full bg-white"
              :class="{ 'is-full': isLungsFull }"
            ></div>
          </div>
          <h2 class="text-h4 font-bold text-white">
            <Transition name="breath-label" mode="out-in">
              <span :key="phaseIndex">
                {{ phaseLabel }}
                <!-- 該階段剩餘秒數（有憋氣或吸吐不等長的呼吸法才顯示）。
                     放在同一個過渡元素內，換階段時文字與秒數才會一起切換 -->
                <span
                  v-if="technique.showPhaseSeconds"
                  class="ml-1 inline-block min-w-[1ch] tabular-nums text-white/70"
                >
                  {{ phaseRemainingSec }}
                </span>
              </span>
            </Transition>
          </h2>
        </div>
        <!-- 暫停、停止容器 -->
        <div
          class="pointer-events-none absolute top-40 flex w-full items-center justify-center gap-8 opacity-0 transition duration-300"
          :class="{
            'pointer-events-auto opacity-100': isGroupHover && expandMask,
          }"
        >
          <img
            src="/icons/find-peace/calm-breathe/music.svg"
            width="53"
            height="53"
            alt="音樂開關"
          />
          <!-- 暫停按鈕 -->
          <div class="rounded-full border-[11px] border-[#C0C7DC33]">
            <button
              type="button"
              class="rounded-full bg-white p-6"
              @click="togglePause"
            >
              <img
                :src="
                  isPaused
                    ? '/icons/play-fill.svg'
                    : '/icons/find-peace/calm-breathe/pause.svg'
                "
                :alt="isPaused ? '繼續 icon' : '暫停 icon'"
                class="size-8"
              />
            </button>
          </div>
          <!-- 停止（直接結束並回到首頁） -->
          <NuxtLink to="/?openFeelingCalm" @click="stopSession()">
            <img
              src="/icons/find-peace/calm-breathe/stop.svg"
              width="53"
              height="53"
              alt="停止 icon"
            />
          </NuxtLink>
        </div>
        <LayoutBottomBar
          class="absolute bottom-0 left-1/2 mb-2 mt-[27px] -translate-x-1/2"
        />
      </div>
    </main>
  </section>
</template>

<style scoped>
/* 讓自訂屬性可動畫（Chromium / Safari 皆支援；Firefox 不支援時會跳變但仍正確） */
@property --hole {
  syntax: "<length>";
  inherits: false;
  initial-value: 120px;
}

/* ===== 位置統一：以畫面中心為基準，允許偏移 =====
   --dx / --dy：洞口中心相對「畫面正中央(50%/50%)」的偏移量
   預設 0px；可在 template 的 :style 綁定自由調整。 */
.reveal-mask {
  --hole: 120px;
  --dx: 0px;
  --dy: 0px;

  -webkit-mask-image: radial-gradient(
    circle at calc(50% + var(--dx)) calc(50% + var(--dy)),
    transparent var(--hole),
    #000 calc(var(--hole) + 1px)
  );
  mask-image: radial-gradient(
    circle at calc(50% + var(--dx)) calc(50% + var(--dy)),
    transparent var(--hole),
    #000 calc(var(--hole) + 1px)
  );
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  transition: --hole 1s cubic-bezier(0.6, 0, 0.4, 1);
}

/* 洞口擴張（你原本的數值可依需求微調） */
.reveal-expand {
  --hole: 650px;
}

/* ===== 內容縮放的原點：跟洞口中心一致 ===== */
.content-origin {
  --dx: 0px;
  --dy: 0px;
  transform-origin: calc(50% + var(--dx)) calc(50% + var(--dy));
}

/* ===== 兩段文字：永遠相對於洞口定位 ===== */
.reveal-title {
  left: calc(50% + var(--dx));
  top: calc(50% + var(--dy) + 160px);
}

.reveal-count {
  left: calc(50% + var(--dx));
  top: calc(50% + var(--dy) + 220px);
}

/* 文字的滑出動畫（保留你原來的 transform 視覺效果） */
.reveal-slide {
  transform: translate(-50%, 550px); /* 僅作離場位移，不影響定位邏輯 */
}

/* ===== 呼吸動畫 =====
   三個元素都只有「吐完」與「吸飽（.is-full）」兩種狀態，
   吸氣 / 吐氣時在兩者之間過渡，過渡秒數由 --breath-duration 決定；
   憋氣、暫停、尚未開始時秒數為 0，畫面停在原地。 */

/* 火山君 */
.breathing-volcano {
  transition: bottom var(--breath-duration, 0s) cubic-bezier(0.6, 0, 0.4, 1);
}
.breathing-volcano.is-full {
  bottom: 85px;
}

/* 背景呼吸圓圈（寬高的過渡是進場時圓圈長出來的效果） */
.breathing-circle {
  transform: translateX(-50%) scale(1);
  transition:
    width 0.5s cubic-bezier(0.6, 0, 0.4, 1),
    height 0.5s cubic-bezier(0.6, 0, 0.4, 1),
    transform var(--breath-duration, 0s) cubic-bezier(0.6, 0, 0.4, 1);
}
.breathing-circle.is-full {
  transform: translateX(-50%) scale(5);
}

/* 吸氣吐氣白色條 */
.breathing-bar {
  width: 24px;
  transition: width var(--breath-duration, 0s) cubic-bezier(0.6, 0, 0.4, 1);
}
.breathing-bar.is-full {
  width: 100%;
}

/* 沒有在進行（倒數前、暫停、結束）時關掉呼吸動畫的過渡，畫面立刻回到起點並停住。
   只把秒數設成 0 不夠：吐氣途中暫停時目標狀態沒有變，進行到一半的過渡會繼續跑完 */
.is-still .breathing-volcano,
.is-still .breathing-bar {
  transition: none;
}
.is-still .breathing-circle {
  transition:
    width 0.5s cubic-bezier(0.6, 0, 0.4, 1),
    height 0.5s cubic-bezier(0.6, 0, 0.4, 1);
}

/* 吸/吐文字過渡 */
.breath-label-enter-active,
.breath-label-leave-active {
  transition: opacity 0.2s ease;
}
.breath-label-enter-from,
.breath-label-leave-to {
  opacity: 0.3;
}
.breath-label-enter-to,
.breath-label-leave-from {
  opacity: 1;
}
</style>
