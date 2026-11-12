/** 音量計的刻度範圍（與大吼頁的 30／80／120 刻度一致） */
export const VOLUME_MIN_DB = 30;
export const VOLUME_MAX_DB = 120;

/**
 * 把麥克風訊號的相對音量（dBFS，0 為最大聲）換算成估算分貝的位移量。
 * 瀏覽器拿不到校正過的聲壓值，這裡只是讓一般說話落在 60～70、
 * 大吼落在 90～100 左右的經驗值，不是真正的分貝計。
 */
const DBFS_TO_DB_OFFSET = 100;

/** 音量上升時跟得快、下降時慢慢掉，畫面才不會抖 */
const ATTACK = 0.5;
const RELEASE = 0.12;

type MicrophoneStatus = "idle" | "requesting" | "active" | "unavailable";

/**
 * 讀取麥克風音量，換算成估算分貝。
 *
 * 沒有麥克風、使用者拒絕授權、瀏覽器不支援或不是安全連線（HTTPS）時，
 * status 會變成 "unavailable"，呼叫端應退回不需要音量的顯示方式。
 */
export function useMicrophoneLevel() {
  const status = ref<MicrophoneStatus>("idle");
  /** 目前的估算分貝（平滑後） */
  const db = ref(VOLUME_MIN_DB);
  /** 啟用以來的最大估算分貝；還沒收到音量時為 null */
  const peakDb = ref<number | null>(null);

  let stream: MediaStream | null = null;
  let audioContext: AudioContext | null = null;
  let analyser: AnalyserNode | null = null;
  let samples = new Float32Array(0);
  let frameId = 0;
  let isStopped = false;

  function release() {
    cancelAnimationFrame(frameId);
    stream?.getTracks().forEach((track) => track.stop());
    audioContext?.close().catch(() => {});
    stream = null;
    audioContext = null;
    analyser = null;
  }

  function measure() {
    if (!analyser) return;
    analyser.getFloatTimeDomainData(samples);
    let sumOfSquares = 0;
    for (const sample of samples) sumOfSquares += sample * sample;
    const rms = Math.sqrt(sumOfSquares / samples.length);
    // 完全無聲時 rms 為 0，log 會是 -Infinity，用極小值墊底
    const dbfs = 20 * Math.log10(Math.max(rms, 1e-6));
    const target = Math.min(
      VOLUME_MAX_DB,
      Math.max(VOLUME_MIN_DB, dbfs + DBFS_TO_DB_OFFSET),
    );

    db.value += (target - db.value) * (target > db.value ? ATTACK : RELEASE);
    peakDb.value = Math.max(peakDb.value ?? VOLUME_MIN_DB, db.value);
    frameId = requestAnimationFrame(measure);
  }

  /** 要求麥克風權限並開始量測；必須在使用者點擊的事件處理中呼叫 */
  async function start() {
    if (status.value !== "idle" || !import.meta.client) return;

    const AudioContextClass =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!navigator.mediaDevices?.getUserMedia || !AudioContextClass) {
      status.value = "unavailable";
      return;
    }

    status.value = "requesting";
    isStopped = false;
    try {
      // iOS Safari 只允許在使用者手勢內建立 AudioContext，所以先建立再等授權
      audioContext = new AudioContextClass();
      // 關掉瀏覽器的自動增益與降噪，音量才會跟實際大小聲有關
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
    } catch {
      release();
      status.value = "unavailable";
      return;
    }

    // 等授權的期間使用者已經離開或按了停止
    if (isStopped) {
      release();
      return;
    }

    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    audioContext.createMediaStreamSource(stream).connect(analyser);
    await audioContext.resume().catch(() => {});
    samples = new Float32Array(analyser.fftSize);
    status.value = "active";
    measure();
  }

  function stop() {
    isStopped = true;
    release();
    if (status.value === "requesting" || status.value === "active") {
      status.value = "idle";
    }
  }

  onUnmounted(stop);

  return { status, db, peakDb, start, stop };
}
