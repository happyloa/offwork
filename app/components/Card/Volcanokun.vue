<script setup></script>
<template>
  <section>
    <div class="grid grid-cols-4 gap-2 pb-4">
      <div class="size-[80px] rounded-full">
        <div class="h-full w-full overflow-hidden rounded-full bg-secondary">
          <img
            src="/images/home/normal-circle.webp"
            alt="綠色火山君"
            class="scale-100 object-top"
            loading="lazy"
          />
        </div>
      </div>
      <div class="col-span-3 rounded-3xl bg-primary">
        <p
          class="relative px-5 py-4 text-[#27292B] before:absolute before:left-[-15px] before:top-1/3 before:z-10 before:h-[15px] before:w-[20px] before:-translate-y-1/2 before:bg-[url(/images/home/triangle.svg)] before:bg-contain before:bg-center before:bg-no-repeat before:content-['']"
        >
          <span class="font-medium"
            >還好嗎？你似乎壓力很大，吼一吼有沒有比較舒服啊～</span
          >
        </p>
      </div>
    </div>
  </section>
</template>
<style scoped></style>
