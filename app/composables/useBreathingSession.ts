import type { BreathingTechnique } from "~/utils/breathing";

type SessionStatus = "idle" | "running" | "paused" | "finished";

/** 首頁「平靜點了嗎？」讀取的呼吸時長（秒） */
const ELAPSED_STORAGE_KEY = "breathingTimeElapsed";
const TICK_MS = 100;

/**
 * 一次呼吸練習的計時與階段切換。
 *
 * 全部以時間戳計算而不是累加 setInterval 次數，分頁切到背景、
 * 計時器被瀏覽器降頻時，倒數與階段仍然正確。
 *
 * - 倒數：總時長扣掉「實際進行」的時間，暫停期間不計
 * - 階段：依呼吸法的 phases 循環；暫停後繼續會從吸氣重新開始
 * - 時長紀錄：每秒寫入 sessionStorage，結束／離開頁面時再補寫一次
 * - 練習紀錄：結束／離開頁面時存一筆到 localStorage（見 usePracticeRecords）
 */
export function useBreathingSession(
  technique: BreathingTechnique,
  totalSeconds: number,
  onFinish: () => void,
) {
  const { phases } = technique;
  const cycleMs = phases.reduce((sum, phase) => sum + phase.seconds * 1000, 0);

  const status = ref<SessionStatus>("idle");
  const remainingSec = ref(totalSeconds);
  const phaseIndex = ref(0);
  const phaseRemainingSec = ref(phases[0]!.seconds);
  /** 畫面過渡到目前階段目標狀態所需的秒數；憋氣或靜止時為 0 */
  const transitionSec = ref(0);

  let activeBeforeMs = 0; // 這一段開始前已累積的進行時間（不含暫停）
  let segmentStartMs = 0; // 這一段的起點，呼吸循環也從這裡起算
  let lastPhaseId = -1;
  let lastWrittenSec = -1;
  let timer: ReturnType<typeof setInterval> | null = null;
  let startedAt = 0; // 練習開始的時間戳，存紀錄用

  const { add: addPracticeRecord } = usePracticeRecords();

  const phase = computed(() => phases[phaseIndex.value]!);
  const isRunning = computed(() => status.value === "running");
  const isPaused = computed(() => status.value === "paused");
  /** 肺部是否處於「吸飽」的一側：吸氣中與吸飽後憋氣 */
  const isLungsFull = computed(
    () =>
      isRunning.value &&
      (phase.value.type === "inhale" || phase.value.type === "holdIn"),
  );

  function activeMs() {
    return isRunning.value
      ? activeBeforeMs + (performance.now() - segmentStartMs)
      : activeBeforeMs;
  }

  function writeElapsed() {
    if (!import.meta.client) return;
    const sec = Math.min(totalSeconds, Math.floor(activeMs() / 1000));
    if (sec === lastWrittenSec) return;
    lastWrittenSec = sec;
    sessionStorage.setItem(ELAPSED_STORAGE_KEY, String(sec));
  }

  function resetPhase() {
    lastPhaseId = -1;
    phaseIndex.value = 0;
    phaseRemainingSec.value = phases[0]!.seconds;
    transitionSec.value = 0;
  }

  function tick() {
    const segmentMs = performance.now() - segmentStartMs;
    const elapsedSec = Math.floor((activeBeforeMs + segmentMs) / 1000);
    remainingSec.value = Math.max(0, totalSeconds - elapsedSec);
    writeElapsed();

    if (remainingSec.value <= 0) {
      finish();
      return;
    }

    // 找出目前落在循環中的哪個階段，以及該階段還剩多久
    const cycleCount = Math.floor(segmentMs / cycleMs);
    let offsetMs = segmentMs - cycleCount * cycleMs;
    let index = 0;
    while (
      index < phases.length - 1 &&
      offsetMs >= phases[index]!.seconds * 1000
    ) {
      offsetMs -= phases[index]!.seconds * 1000;
      index += 1;
    }
    const current = phases[index]!;
    const phaseLeftMs = Math.max(0, current.seconds * 1000 - offsetMs);

    const phaseId = cycleCount * phases.length + index;
    if (phaseId !== lastPhaseId) {
      lastPhaseId = phaseId;
      phaseIndex.value = index;
      // 用「剩餘時間」當過渡時間：即使晚了一點才切換（例如分頁剛從背景回來），
      // 動畫的結束點仍會對齊階段結束
      const isMoving = current.type === "inhale" || current.type === "exhale";
      transitionSec.value = isMoving ? phaseLeftMs / 1000 : 0;
    }
    phaseRemainingSec.value = Math.max(1, Math.ceil(phaseLeftMs / 1000));
  }

  function run() {
    segmentStartMs = performance.now();
    lastPhaseId = -1;
    status.value = "running";
    tick();
    if (status.value === "running") {
      timer = setInterval(tick, TICK_MS);
    }
  }

  /** 停表並把這一段的時間累加起來 */
  function halt(next: SessionStatus) {
    if (isRunning.value) {
      activeBeforeMs += performance.now() - segmentStartMs;
    }
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    status.value = next;
    writeElapsed();
    if (next === "finished") saveRecord();
  }

  /** 練習結束時存一筆紀錄（不滿 1 秒不算） */
  function saveRecord() {
    const seconds = Math.min(totalSeconds, Math.floor(activeBeforeMs / 1000));
    if (seconds < 1) return;
    addPracticeRecord({
      type: "breathing",
      startedAt,
      seconds,
      techniqueId: technique.id,
    });
  }

  function start() {
    if (status.value !== "idle") return;
    activeBeforeMs = 0;
    startedAt = Date.now();
    run();
  }

  function togglePause() {
    if (isRunning.value) {
      halt("paused");
      resetPhase(); // 動畫歸零停住、狀態回到吸氣
    } else if (isPaused.value) {
      run();
    }
  }

  function finish() {
    halt("finished");
    onFinish();
  }

  /** 使用者提前結束或離開頁面：只收尾，不觸發 onFinish */
  function stop() {
    if (status.value === "finished") return;
    halt("finished");
  }

  onUnmounted(stop);

  return {
    remainingSec,
    phase,
    phaseIndex,
    phaseRemainingSec,
    transitionSec,
    isLungsFull,
    isRunning,
    isPaused,
    start,
    togglePause,
    stop,
  };
}
