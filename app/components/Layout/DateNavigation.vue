<script setup>
const props = defineProps({
  dateText: {
    type: String,
    required: true,
  },
  /** 是否還能往後一段時間（已經在最新的日期時為 false，右箭頭顯示為灰色） */
  canGoNext: {
    type: Boolean,
    default: false,
  },
});
const emits = defineEmits(["openModal", "prev", "next"]);
const handleDateClick = () => {
  emits("openModal");
};
</script>
<template>
  <section class="flex items-center justify-between">
    <button
      type="button"
      class="rounded-full bg-neutral-900 p-2 text-center transition"
      aria-label="上一個"
      @click="emits('prev')"
    >
      <img
        src="/icons/white-left-arrow.svg"
        width="24"
        height="24"
        alt="左箭頭"
        loading="lazy"
      />
    </button>
    <button
      class="rounded-full bg-neutral-900 px-4 py-2 text-center"
      @click="handleDateClick"
    >
      <p class="text-[14px] font-bold leading-relaxed">{{ dateText }}</p>
    </button>
    <button
      type="button"
      class="rounded-full bg-neutral-900 p-2 text-center"
      aria-label="下一個"
      :disabled="!canGoNext"
      @click="emits('next')"
    >
      <!-- 可以往後時用白色箭頭（左箭頭轉 180 度），否則維持設計稿的灰色箭頭 -->
      <img
        v-if="canGoNext"
        src="/icons/white-left-arrow.svg"
        width="24"
        height="24"
        alt="右箭頭"
        class="rotate-180"
        loading="lazy"
      />
      <img
        v-else
        src="/icons/right-arrow.svg"
        width="24"
        height="24"
        alt="右箭頭"
        loading="lazy"
      />
    </button>
  </section>
</template>
<style scoped></style>
