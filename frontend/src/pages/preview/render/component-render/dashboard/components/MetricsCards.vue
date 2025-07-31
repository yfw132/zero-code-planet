<template>
  <div class="metrics-section">
    <div class="metrics-grid">
      <div
        v-for="(metric, index) in coreMetrics"
        :key="metric.id"
        class="metric-card dashboard-card"
        :class="`metric-${index + 1}`"
        @click="metric.action"
      >
        <div class="metric-header">
          <div class="metric-icon" :style="{ background: metric.gradient }">
            <component style="width: 24px; height: 24px" :is="metric.icon" />
          </div>
          <div class="metric-trend" :class="metric.trendClass">
            <el-icon>
              <component :is="metric.trendIcon" />
            </el-icon>
            <span>{{ metric.trendValue }}%</span>
          </div>
        </div>
        <div class="metric-content">
          <div class="metric-value">{{ metric.value }}</div>
          <div class="metric-label">{{ metric.label }}</div>
          <div class="metric-sublabel">{{ metric.sublabel }}</div>
        </div>
        <div class="metric-chart">
          <div
            :ref="(el) => setMiniChartRef(el, `mini-${metric.id}`)"
            class="mini-chart"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import * as echarts from "echarts";
import {
  ArrowUp,
  ArrowDown,
  User,
  ShoppingBag,
  TrendCharts,
  ChatLineRound,
} from "@element-plus/icons-vue";

// 响应式数据
const chartInstances = ref<Record<string, echarts.ECharts>>({});
const resizeTimeoutId = ref<number | null>(null);

// 计算属性
const coreMetrics = computed(() => [
  {
    id: "users",
    label: "总用户数",
    sublabel: "较昨日 +2.5%",
    value: "126,560",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    icon: User,
    trendIcon: ArrowUp,
    trendClass: "positive",
    trendValue: 12.5,
    action: () => console.log("查看用户详情"),
  },
  {
    id: "orders",
    label: "订单总数",
    sublabel: "较昨日 +8.2%",
    value: "8,249",
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    icon: ShoppingBag,
    trendIcon: ArrowUp,
    trendClass: "positive",
    trendValue: 8.2,
    action: () => console.log("查看订单详情"),
  },
  {
    id: "revenue",
    label: "营收金额",
    sublabel: "较昨日 +15.3%",
    value: "¥2,847,239",
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    icon: TrendCharts,
    trendIcon: ArrowUp,
    trendClass: "positive",
    trendValue: 15.3,
    action: () => console.log("查看营收详情"),
  },
  {
    id: "satisfaction",
    label: "客户满意度",
    sublabel: "较昨日 -0.8%",
    value: "94.2%",
    gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    icon: ChatLineRound,
    trendIcon: ArrowDown,
    trendClass: "negative",
    trendValue: 0.8,
    action: () => console.log("查看满意度详情"),
  },
]);

// 方法
const setMiniChartRef = (el: any, chartId: string) => {
  if (el && el instanceof HTMLElement) {
    el.setAttribute("data-chart-id", chartId);
  }
};

// 处理窗口大小变化
const handleResize = () => {
  // 使用防抖处理，避免频繁触发
  if (resizeTimeoutId.value) {
    clearTimeout(resizeTimeoutId.value);
  }
  resizeTimeoutId.value = setTimeout(() => {
    Object.values(chartInstances.value).forEach((chart) => {
      try {
        // 重新计算并调整图表大小
        chart.resize();
      } catch (error) {
        console.error("调整图表大小失败:", error);
      }
    });
  }, 150);
};

// 初始化小型图表
const initMiniCharts = () => {
  coreMetrics.value.forEach((metric) => {
    const container = document.querySelector(
      `[data-chart-id="mini-${metric.id}"]`
    ) as HTMLElement;
    if (container) {
      const chart = echarts.init(container);
      chartInstances.value[`mini-${metric.id}`] = chart;

      const option = {
        grid: { left: 0, right: 0, top: 0, bottom: 0 },
        xAxis: {
          type: "category",
          show: false,
          data: ["", "", "", "", "", "", ""],
        },
        yAxis: { type: "value", show: false },
        series: [
          {
            type: "line",
            smooth: true,
            symbol: "none",
            lineStyle: {
              width: 2,
              color: metric.trendClass === "positive" ? "#52c41a" : "#ff4d4f",
            },
            areaStyle: {
              color: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color:
                      metric.trendClass === "positive"
                        ? "rgba(82, 196, 26, 0.3)"
                        : "rgba(255, 77, 79, 0.3)",
                  },
                  { offset: 1, color: "rgba(255, 255, 255, 0)" },
                ],
              },
            },
            data:
              metric.trendClass === "positive"
                ? [20, 25, 22, 28, 32, 35, 40]
                : [40, 35, 32, 28, 22, 25, 20],
          },
        ],
      };

      chart.setOption(option);
    }
  });
};

// 生命周期
onMounted(() => {
  setTimeout(() => {
    initMiniCharts();
  }, 100);

  // 添加resize事件监听器
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  // 清理resize事件监听器
  window.removeEventListener("resize", handleResize);

  // 清理防抖定时器
  if (resizeTimeoutId.value) {
    clearTimeout(resizeTimeoutId.value);
  }

  // 销毁图表实例
  Object.values(chartInstances.value).forEach((chart) => {
    try {
      chart.dispose();
    } catch (error) {
      console.error("销毁图表实例失败:", error);
    }
  });
});
</script>

<style scoped lang="scss">
@import "../styles/metrics-cards.scss";
@import "../styles/index.scss";
</style>
