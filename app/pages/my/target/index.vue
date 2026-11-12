<script setup>
// /my/target 沒有自己的內容，直接轉到呼吸目標。
// 用路由層的 redirect：不會先渲染空白頁，也不會在瀏覽紀錄留下一筆，按返回才不會又被轉回來
definePageMeta({
  redirect: "/my/target/breath",
});
</script>

<template>
  <div></div>
</template>
