// 「我的 → 目標 → 睡眠時長」。存在 localStorage，只能在瀏覽器端（onMounted 之後）讀寫。

export interface SleepTarget {
  hours: number;
  minutes: number;
}

export const DEFAULT_SLEEP_TARGET: SleepTarget = { hours: 8, minutes: 0 };

const STORAGE_KEY = "sleepTarget";

const isInRange = (value: unknown, max: number) =>
  Number.isInteger(value) && (value as number) >= 0 && (value as number) <= max;

// 瀏覽器封鎖儲存空間或資料不合法時，退回預設值
export function readSleepTarget(): SleepTarget {
  if (typeof localStorage === "undefined") return DEFAULT_SLEEP_TARGET;
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    return isInRange(saved?.hours, 23) && isInRange(saved?.minutes, 59)
      ? { hours: saved.hours, minutes: saved.minutes }
      : DEFAULT_SLEEP_TARGET;
  } catch {
    return DEFAULT_SLEEP_TARGET;
  }
}

export function saveSleepTarget(target: SleepTarget) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(target));
  } catch {
    // 無法儲存時只影響「記住設定」，不影響當下操作
  }
}

/** 換算成小時（取到小數一位），例如 7 時 30 分 → 7.5 */
export function sleepTargetInHours(target: SleepTarget) {
  return Math.round((target.hours + target.minutes / 60) * 10) / 10;
}
