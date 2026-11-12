export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  // 中文字型被切成 100 多段 unicode-range，@font-face 規則約 114KB。
  // 預設會被內嵌進每一頁的 HTML，關閉後改放在可長期快取的 CSS 檔，只需下載一次
  features: {
    inlineStyles: false,
  },
  modules: ["@nuxt/fonts", "@nuxtjs/tailwindcss", "nuxt-lottie"],
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

  // 字型於建置時下載並自架（不會在執行期連到 Google），
  // 由 CSS 內的 font-family 宣告自動偵測並產生 @font-face
  fonts: {
    families: [
      {
        name: "Noto Sans TC",
        provider: "google",
        weights: ["400 700"],
        styles: ["normal"],
      },
    ],
  },

  css: ["~/assets/css/global.css"],
});
