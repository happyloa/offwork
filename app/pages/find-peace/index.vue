<script setup>
useSeoMeta({
  title: "找回平靜 | 健康生活 OFFWORK APP",
  ogTitle: "找回平靜 | 健康生活 OFFWORK APP",
});

definePageMeta({
  header: {
    backTo: { path: "/", query: { openCeremony: "true" } },
    title: "找回平靜",
  },
});
</script>

<template>
  <!-- 內容不滿一頁時撐滿剩餘高度，讓底部橫杠貼齊畫面底部
       （扣掉 HeaderBar 48px；sm 以上再扣狀態列 56px） -->
  <main
    class="flex min-h-[calc(100%-48px)] flex-col bg-neutral-950 px-4 pt-4 sm:min-h-[calc(100%-104px)]"
  >
    <!-- Tab -->
    <nav
      class="mb-4 grid grid-cols-2 rounded-full bg-neutral-900 p-1 text-center"
    >
      <!-- 呼吸 -->
      <NuxtLink
        to="/find-peace"
        class="block rounded-full py-1 text-md font-bold transition hover:text-white"
        :class="
          $route.path === '/find-peace'
            ? 'bg-neutral text-white shadow-tab'
            : 'bg-transparent text-neutral-500'
        "
        >呼吸
      </NuxtLink>
      <!-- 冥想（沒有頁面純裝飾） -->
      <NuxtLink
        to="#"
        class="block rounded-full py-1 text-md font-bold transition hover:text-white"
        :class="
          $route.path === '#'
            ? 'bg-neutral text-white shadow-tab'
            : 'bg-transparent text-neutral-500'
        "
        >冥想
      </NuxtLink>
    </nav>
    <!-- 各種呼吸法連結 -->
    <nav>
      <ul class="space-y-4">
        <li v-for="technique in BREATHING_TECHNIQUES" :key="technique.id">
          <NuxtLink
            :to="`/find-peace/${technique.id}`"
            class="gradient-card-border rounded-[32px]"
          >
            <article
              class="flex items-center gap-5 rounded-[32px] bg-neutral-900 p-5"
            >
              <img
                :src="technique.image"
                :alt="technique.name"
                width="360"
                height="301"
                class="w-[120px]"
              />
              <div>
                <h2 class="mb-1 text-md font-bold text-white">
                  {{ technique.name }}
                </h2>
                <p class="text-md text-neutral-300">
                  {{ technique.summary }}
                </p>
              </div>
            </article>
          </NuxtLink>
        </li>
      </ul>
    </nav>
    <div class="sticky bottom-0 mt-auto pb-2 pt-[27px]">
      <LayoutBottomBar />
    </div>
  </main>
</template>
