<script setup>
const props = defineProps({
  dateText: {
    type: String,
    required: true,
  },
});
const emits = defineEmits(["openModal"]);
const handleDateClick = () => {
  emits("openModal");
};
</script>
<template>
  <section class="flex items-center justify-between">
    <NuxtLink
      to="#"
      class="rounded-full bg-neutral-900 p-2 text-center transition"
    >
      <img src="/icons/white-left-arrow.svg" alt="左箭頭" loading="lazy" />
    </NuxtLink>
    <button
      class="rounded-full bg-neutral-900 px-4 py-2 text-center"
      @click="handleDateClick"
    >
      <p class="text-[14px] font-bold leading-relaxed">{{ dateText }}</p>
    </button>
    <NuxtLink to="#" class="rounded-full bg-neutral-900 p-2 text-center">
      <img src="/icons/right-arrow.svg" alt="右箭頭" loading="lazy" />
    </NuxtLink>
  </section>
</template>
<style scoped></style>
