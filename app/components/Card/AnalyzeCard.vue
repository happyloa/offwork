<script setup>
import { ChartsBubbleChart } from "#components";
import { ChartsProgressBar } from "#components";
import { ChartsDoughnutChart } from "#components";
import { shallowRef } from "vue";
const props = defineProps({
  title: String,
  // 數字，或尚未量到時的 "--"
  data: [Number, String],
  unit: String,
  comment: String,
  color: String,
  url: String,
  charts: String,
  /** 傳給圖表元件的 props（例如 { percentage: 60 }），不傳則用圖表自己的預設值 */
  chartProps: {
    type: Object,
    default: () => ({}),
  },
  isUpStandard: {
    type: Boolean,
    default: undefined,
  },
});
const ChartTypes = {
  doughnut: ChartsDoughnutChart,
  progress: ChartsProgressBar,
  bubble: ChartsBubbleChart,
};
const currentChartType = shallowRef(ChartTypes[""]);
watch(
  () => props.charts,
  (newChartType) => {
    if (ChartTypes[newChartType]) {
      currentChartType.value = ChartTypes[newChartType];
    } else {
      currentChartType.value = null;
    }
  },
  { immediate: true },
);
</script>
<template>
  <NuxtLink
    :to="data ? url : ''"
    :class="{ 'pointer-events-none': !data }"
    class="border-gradient gradient-card-border block min-w-[136px] rounded-[32px] bg-neutral-900 px-6 py-5 active:bg-neutral-1000"
    @click.prevent="!data"
  >
    <div>
      <div class="mb-3 flex items-center justify-between">
        <div class="flex items-center">
          <p class="text-xl font-bold text-white">
            {{ title }}
          </p>
          <div v-if="isUpStandard != undefined" class="ms-4 flex items-center">
            <div
              :class="`me-1 ${isUpStandard ? 'bg-alert-success' : 'bg-accent'} size-[10px] rounded-full`"
            ></div>
            <p
              :class="`text-sm font-bold leading-[1.6] ${isUpStandard ? 'text-alert-success' : 'text-accent'} `"
            >
              {{ isUpStandard ? "尚可" : "過多" }}
            </p>
          </div>
        </div>
        <div v-if="url" class="self-center px-2 py-[6px]">
          <img
            src="/icons/white-right-arrow.svg"
            width="8"
            height="13"
            alt="右箭頭"
          />
        </div>
      </div>
      <div :class="['flex', comment ? 'justify-between' : 'justify-center']">
        <div>
          <div class="flex" v-if="data !== undefined">
            <p class="text-h5 font-bold">
              {{ data }}
            </p>
            <p class="ms-1 mt-3 text-xs">
              {{ unit }}
            </p>
          </div>
          <div>
            <p class="text-xs text-neutral-300">{{ comment }}</p>
          </div>
        </div>
        <div>
          <component
            :is="currentChartType"
            v-if="currentChartType"
            v-bind="chartProps"
          />
        </div>
      </div>
    </div>
  </NuxtLink>
</template>
