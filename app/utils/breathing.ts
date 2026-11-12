// 呼吸法定義：列表頁、介紹頁與呼吸中頁面都由這份資料產生。
// 新增呼吸法只要在 BREATHING_TECHNIQUES 加一筆，路由為 /find-peace/<id>。

/** 一個呼吸階段：吸氣、吸飽後憋氣、吐氣、吐完後憋氣 */
export type BreathPhaseType = "inhale" | "holdIn" | "exhale" | "holdOut";

export interface BreathPhase {
  type: BreathPhaseType;
  seconds: number;
}

export interface BreathingTechnique {
  /** 路由參數，同時是這個呼吸法的識別碼 */
  id: string;
  name: string;
  /** 列表卡片上的一句話 */
  summary: string;
  /** 介紹頁的說明 */
  description: string;
  /** 列表卡片縮圖 */
  image: string;
  /** 一次呼吸循環的各階段，結束後從頭重複 */
  phases: BreathPhase[];
  /** 是否在「吸氣／吐氣」文字旁顯示該階段的剩餘秒數 */
  showPhaseSeconds: boolean;
}

export const BREATH_PHASE_LABELS: Record<BreathPhaseType, string> = {
  inhale: "吸氣",
  holdIn: "憋氣",
  exhale: "吐氣",
  holdOut: "憋氣",
};

export const BREATHING_TECHNIQUES: BreathingTechnique[] = [
  {
    id: "calm-breathe",
    name: "平穩呼吸法",
    summary: "慢慢吸，輕輕吐，讓節奏帶你回到平靜。",
    description:
      "這個呼吸法可以幫助你降低心跳與緊張感，讓身體慢慢鬆下來，穩定情緒、幫助你從混亂中重新找回節奏。",
    image: "/images/find-peace/breathe1.webp",
    phases: [
      { type: "inhale", seconds: 2 },
      { type: "exhale", seconds: 2 },
    ],
    showPhaseSeconds: false,
  },
  {
    id: "belly-breathe",
    name: "腹式呼吸法",
    summary: "感受腹部起伏，深呼吸讓身體鬆開一點。",
    description:
      "用鼻子吸氣 4 秒讓腹部鼓起，再用 6 秒慢慢吐氣讓腹部沉下。拉長的吐氣能幫身體放鬆，釋放一整天累積的緊繃。",
    image: "/images/find-peace/breathe2.webp",
    phases: [
      { type: "inhale", seconds: 4 },
      { type: "exhale", seconds: 6 },
    ],
    showPhaseSeconds: true,
  },
  {
    id: "4-7-8",
    name: "4-7-8 呼吸",
    summary: "吸 4 秒，憋氣 7 秒，吐氣 8 秒，進入休息。",
    description:
      "吸氣 4 秒、憋氣 7 秒，再用 8 秒慢慢吐氣，讓心跳慢下來，適合睡前或思緒停不下來時。若感到頭暈，請恢復自然呼吸。",
    image: "/images/find-peace/breathe3.webp",
    phases: [
      { type: "inhale", seconds: 4 },
      { type: "holdIn", seconds: 7 },
      { type: "exhale", seconds: 8 },
    ],
    showPhaseSeconds: true,
  },
  {
    id: "box-breathe",
    name: "4-4-4-4 方格呼吸",
    summary: "用呼吸畫出方形，節奏讓心穩定下來。",
    description:
      "吸氣、憋氣、吐氣、憋氣各 4 秒，像沿著方形的四個邊走一圈。規律的節奏能讓注意力回到當下。若感到頭暈，請恢復自然呼吸。",
    image: "/images/find-peace/breathe4.webp",
    phases: [
      { type: "inhale", seconds: 4 },
      { type: "holdIn", seconds: 4 },
      { type: "exhale", seconds: 4 },
      { type: "holdOut", seconds: 4 },
    ],
    showPhaseSeconds: true,
  },
];

export function getBreathingTechnique(id: unknown) {
  return BREATHING_TECHNIQUES.find((technique) => technique.id === id);
}

/** 可選的呼吸時長（分鐘） */
export const BREATHING_MINUTE_OPTIONS = [1, 3, 5, 10, 15];
export const DEFAULT_BREATHING_MINUTES = 3;

// 「我的 → 目標 → 呼吸進行時長」，同時是各呼吸法介紹頁的預設時長。
// 存在 localStorage，只能在瀏覽器端（onMounted 之後）讀寫。
const TARGET_MINUTES_STORAGE_KEY = "breathingTargetMinutes";

// 瀏覽器封鎖儲存空間（例如某些隱私模式）時 localStorage 會丟例外，
// 這時退回預設值、不儲存，功能照常運作。
export function readBreathingTargetMinutes() {
  if (!import.meta.client) return DEFAULT_BREATHING_MINUTES;
  try {
    const saved = Number(localStorage.getItem(TARGET_MINUTES_STORAGE_KEY));
    return BREATHING_MINUTE_OPTIONS.includes(saved)
      ? saved
      : DEFAULT_BREATHING_MINUTES;
  } catch {
    return DEFAULT_BREATHING_MINUTES;
  }
}

export function saveBreathingTargetMinutes(minutes: number) {
  if (!import.meta.client) return;
  try {
    localStorage.setItem(TARGET_MINUTES_STORAGE_KEY, String(minutes));
  } catch {
    // 無法儲存時只影響「記住設定」，不影響當下操作
  }
}
