// ECharts 按需引入：只註冊專案實際用到的圖表與元件，避免整包打進 bundle。
// 新增其他圖表類型時，記得在這裡補上對應的 Chart / Component。
import * as echarts from "echarts/core";
import { HeatmapChart } from "echarts/charts";
import {
  GridComponent,
  VisualMapContinuousComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([
  HeatmapChart,
  GridComponent,
  VisualMapContinuousComponent,
  CanvasRenderer,
]);

export { echarts };
