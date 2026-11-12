export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxtjs/google-fonts", "@nuxtjs/tailwindcss", "nuxt-lottie"],
  tailwindcss: {
    cssPath: "~/assets/css/tailwind.css",
  },
  // Nuxt 4.6 起以 ESM 規則解析 PostCSS 外掛，@nuxtjs/tailwindcss 自動加入的
  // 目錄形式 `tailwindcss/nesting` 無法被載入（會被略過並出現 NUXT_B7027 警告），
  // 因此關閉該項，改用明確的檔案路徑載入同一個外掛（需排在 tailwindcss 之前）
  postcss: {
    plugins: {
      "tailwindcss/nesting": false,
      "tailwindcss/nesting/index.js": {},
    },
  },
  app: {
    head: {
      title: "健康生活 OFFWORK APP",
      htmlAttrs: {
        lang: "zh-Hant",
      },
      meta: [
        {
          name: "description",
          content: `丟掉煩惱，讓腦袋準時下班。用 OFFWORK 啟動你的下班人生。`,
        },
        {
          property: "og:title",
          content: "健康生活 OFFWORK APP",
        },
        {
          property: "og:description",
          content: `丟掉煩惱，讓腦袋準時下班。用 OFFWORK 啟動你的下班人生。`,
        },
        {
          property: "og:image",
          content: "/ogImage.webp",
        },
        { property: "og:type", content: "website" },
        { property: "og:locale", content: "zh_TW" },
        { name: "twitter:card", content: "/ogImage.webp" },
        {
          name: "twitter:image",
          content: "/ogImage.webp",
        },
      ],
    },
  },

  lottie: {
    componentName: "Lottie",
    lottieFolder: "/assets/lottie",
  },

  googleFonts: {
    families: {
      "Noto+Sans+TC": [400, 500, 700],
    },
    download: true,
    inject: true,
    display: "swap",
  },

  css: ["~/assets/css/global.css"],
});
