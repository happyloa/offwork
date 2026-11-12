import type { PracticeRecord } from "~/utils/practiceRecords";

/**
 * 練習紀錄的共用狀態：整個 App 共用同一份，新增後各頁面會即時更新。
 *
 * 伺服器端沒有 localStorage，所以初始一律是空的，等元件掛載後才讀取；
 * 這樣伺服器渲染與瀏覽器第一次渲染的畫面才會一致。
 */
export function usePracticeRecords() {
  const records = useState<PracticeRecord[]>("practiceRecords", () => []);
  const isLoaded = useState("practiceRecordsLoaded", () => false);

  function load() {
    if (isLoaded.value || !import.meta.client) return;
    records.value = readPracticeRecords();
    isLoaded.value = true;
  }

  function add(record: PracticeRecord) {
    load();
    records.value = [...records.value, record];
    writePracticeRecords(records.value);
  }

  if (getCurrentInstance()) onMounted(load);

  return { records, isLoaded, add };
}
