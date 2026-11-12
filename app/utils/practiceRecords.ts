// 練習紀錄：每次呼吸、大吼結束時存一筆在瀏覽器（localStorage），
// 首頁、分析頁、「我的」頁面的數字都從這裡算出來。
// 沒有後端，資料只存在這台裝置的這個瀏覽器，清除瀏覽資料就會消失。

export interface PracticeRecord {
  type: "breathing" | "yelling";
  /** 開始時間（毫秒時間戳） */
  startedAt: number;
  /** 實際進行的秒數 */
  seconds: number;
  /** 呼吸法 id（type 為 breathing 時） */
  techniqueId?: string;
  /** 估算的最大分貝（type 為 yelling 且有收到麥克風音量時） */
  peakDb?: number;
}

const STORAGE_KEY = "practiceRecords";
/** 最多保留幾筆，超過時丟掉最舊的 */
const MAX_RECORDS = 2000;

function isPracticeRecord(value: unknown): value is PracticeRecord {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    (record.type === "breathing" || record.type === "yelling") &&
    Number.isFinite(record.startedAt) &&
    Number.isFinite(record.seconds)
  );
}

// 瀏覽器封鎖儲存空間（例如某些隱私模式）或資料損毀時，當作沒有紀錄
export function readPracticeRecords(): PracticeRecord[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter(isPracticeRecord) : [];
  } catch {
    return [];
  }
}

export function writePracticeRecords(records: PracticeRecord[]) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(records.slice(-MAX_RECORDS)),
    );
  } catch {
    // 無法儲存時只影響「記住紀錄」，不影響當下操作
  }
}

/* ──────────────────────────────────────────────
 * 日期工具（一律用使用者的本地時間）
 * ────────────────────────────────────────────── */
export function startOfDay(date: Date | number) {
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  return day;
}

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** 加減月份；目標月份沒有這一天時（例如 31 日）退到該月最後一天 */
export function addMonths(date: Date, months: number) {
  const next = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(
    next.getFullYear(),
    next.getMonth() + 1,
    0,
  ).getDate();
  next.setDate(Math.min(date.getDate(), lastDay));
  return next;
}

export function isSameDay(a: Date | number, b: Date | number) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

const pad = (value: number) => String(value).padStart(2, "0");

/** 轉成網址參數用的 YYYY-MM-DD */
export function toDateParam(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** 解析 YYYY-MM-DD；格式不對或不是真實日期時回傳 null */
export function fromDateParam(value: unknown) {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
  );
  return toDateParam(date) === value ? date : null;
}

/* ──────────────────────────────────────────────
 * 單日摘要（首頁、分析總覽、「我的」）
 * ────────────────────────────────────────────── */

/** 一天大吼超過這個次數，分析卡片標示為「過多」 */
export const YELLING_DAILY_LIMIT = 5;
/** 大吼指數滿格的次數：一天 8 次＝100%，對應分析卡片的 8 格進度條 */
export const YELLING_INDEX_FULL_COUNT = 8;

export interface DaySummary {
  /** 當天是否做過任何練習 */
  hasPractice: boolean;
  breathingSeconds: number;
  yellingCount: number;
  /** 當天量到的最大分貝；沒有大吼或都沒收到麥克風音量時為 null */
  yellingPeakDb: number | null;
}

function maxPeakDb(records: PracticeRecord[]) {
  const peaks = records
    .map((record) => record.peakDb)
    .filter((peak): peak is number => Number.isFinite(peak));
  return peaks.length ? Math.max(...peaks) : null;
}

export function summarizeDay(
  records: PracticeRecord[],
  date: Date,
): DaySummary {
  const ofDay = records.filter((record) => isSameDay(record.startedAt, date));
  const yelling = ofDay.filter((record) => record.type === "yelling");
  return {
    hasPractice: ofDay.length > 0,
    breathingSeconds: ofDay
      .filter((record) => record.type === "breathing")
      .reduce((sum, record) => sum + record.seconds, 0),
    yellingCount: yelling.length,
    yellingPeakDb: maxPeakDb(yelling),
  };
}

/** 爆發指數（首頁與分析頁共用）：當天做過練習就降溫到 30％，否則 70％ */
export function burstIndexOf(summary: DaySummary) {
  return summary.hasPractice ? 30 : 70;
}

/** 秒數轉成顯示用的分鐘數：取到小數一位，有練習但不到 0.1 分鐘時顯示 0.1 */
export function toDisplayMinutes(seconds: number) {
  if (seconds <= 0) return 0;
  return Math.max(0.1, Math.round(seconds / 6) / 10);
}

/** 大吼指數（0–100）：當天次數相對於滿格次數的比例 */
export function yellingIndexOfCount(count: number) {
  return Math.min(100, Math.round((count / YELLING_INDEX_FULL_COUNT) * 100));
}

/* ──────────────────────────────────────────────
 * 大吼分析（日／週／月／年）
 * ────────────────────────────────────────────── */
export type AnalysisView = "day" | "week" | "month" | "year";

/** 檢視涵蓋的時間範圍 [start, end)。週從週日開始；年是到選取月份為止的 12 個月 */
export function getViewRange(view: AnalysisView, date: Date) {
  const day = startOfDay(date);
  switch (view) {
    case "day":
      return { start: day, end: addDays(day, 1) };
    case "week": {
      const start = addDays(day, -day.getDay());
      return { start, end: addDays(start, 7) };
    }
    case "month":
      return {
        start: new Date(day.getFullYear(), day.getMonth(), 1),
        end: new Date(day.getFullYear(), day.getMonth() + 1, 1),
      };
    case "year":
      return {
        start: new Date(day.getFullYear(), day.getMonth() - 11, 1),
        end: new Date(day.getFullYear(), day.getMonth() + 1, 1),
      };
  }
}

/** 往前（-1）或往後（1）一個檢視單位 */
export function shiftViewDate(view: AnalysisView, date: Date, step: 1 | -1) {
  switch (view) {
    case "day":
      return addDays(date, step);
    case "week":
      return addDays(date, step * 7);
    case "month":
      return addMonths(date, step);
    case "year":
      return addMonths(date, step * 12);
  }
}

/** 日期列上顯示的文字，格式沿用設計稿 */
export function formatViewLabel(view: AnalysisView, date: Date) {
  const { start, end } = getViewRange(view, date);
  const last = addDays(end, -1);
  const monthDay = (d: Date) => `${pad(d.getMonth() + 1)}/${pad(d.getDate())}`;
  const yearMonth = (d: Date) => `${d.getFullYear()}/${pad(d.getMonth() + 1)}`;
  switch (view) {
    case "day":
      return monthDay(start);
    case "week":
      return `${monthDay(start)} - ${monthDay(last)}`;
    case "month":
      return yearMonth(start);
    case "year":
      return `${yearMonth(start)} - ${yearMonth(last)}`;
  }
}

/**
 * 大吼次數的三個級距下限，各檢視不同，沿用設計稿「大吼時段」圖例的數字
 * （日：1-2／3-4／>5，週、月：1-14／15-24／>25，年：1-59／60-119／>120）。
 */
export const YELLING_COUNT_STEPS: Record<
  AnalysisView,
  [low: number, mid: number, high: number]
> = {
  day: [1, 3, 5],
  week: [1, 15, 25],
  month: [1, 15, 25],
  year: [1, 60, 120],
};

/** 次數落在第幾個級距：0 表示沒有，1～3 對應圖例由淺到深 */
export function yellingCountLevel(view: AnalysisView, count: number) {
  const [low, mid, high] = YELLING_COUNT_STEPS[view];
  if (count >= high) return 3;
  if (count >= mid) return 2;
  return count >= low ? 1 : 0;
}

/** 「累積次數」的顯示文字：超過最高級距時沿用設計稿的「> 5」寫法 */
export function formatYellingCount(view: AnalysisView, count: number) {
  const high = YELLING_COUNT_STEPS[view][2];
  return count > high ? `> ${high}` : String(count);
}

export interface YellingSummary {
  count: number;
  peakDb: number | null;
  /** 大吼指數（0–100）：範圍內「有大吼的日子」各自指數的平均 */
  index: number;
  /** 大吼時段圖的資料點 [欄, 小時, 次數]，只包含有大吼的格子 */
  slots: [column: number, hour: number, count: number][];
}

/** 大吼時段圖的欄位：日 1 欄、週 7 欄（日～六）、月 5 欄（每 7 天一欄）、年 12 欄（1～12 月） */
function timelineColumn(view: AnalysisView, date: Date) {
  switch (view) {
    case "day":
      return 0;
    case "week":
      return date.getDay();
    case "month":
      return Math.floor((date.getDate() - 1) / 7);
    case "year":
      return date.getMonth();
  }
}

export function summarizeYelling(
  records: PracticeRecord[],
  view: AnalysisView,
  date: Date,
): YellingSummary {
  const { start, end } = getViewRange(view, date);
  const inRange = records.filter(
    (record) =>
      record.type === "yelling" &&
      record.startedAt >= start.getTime() &&
      record.startedAt < end.getTime(),
  );

  const countByDay = new Map<number, number>();
  const countBySlot = new Map<string, number>();
  for (const record of inRange) {
    const startedAt = new Date(record.startedAt);
    const dayKey = startOfDay(startedAt).getTime();
    countByDay.set(dayKey, (countByDay.get(dayKey) ?? 0) + 1);
    const slotKey = `${timelineColumn(view, startedAt)},${startedAt.getHours()}`;
    countBySlot.set(slotKey, (countBySlot.get(slotKey) ?? 0) + 1);
  }

  const dailyIndexes = [...countByDay.values()].map(yellingIndexOfCount);
  const index = dailyIndexes.length
    ? Math.round(
        dailyIndexes.reduce((sum, value) => sum + value, 0) /
          dailyIndexes.length,
      )
    : 0;

  return {
    count: inRange.length,
    peakDb: maxPeakDb(inRange),
    index,
    slots: [...countBySlot].map(([key, count]) => {
      const [column, hour] = key.split(",").map(Number);
      return [column!, hour!, count];
    }),
  };
}
