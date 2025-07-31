<template>
  <div class="chart-section">
    <!-- 数据趋势图 -->
    <div class="dashboard-card dashboard-card--primary">
      <div class="dashboard-card-header">
        <div class="header-left">
          <h3>数据趋势分析</h3>
          <span class="subtitle">近期数据变化趋势与预测分析</span>
        </div>
        <div class="header-actions">
          <el-radio-group v-model="trendPeriod" size="small">
            <el-radio-button value="7d">7天</el-radio-button>
            <el-radio-button value="30d">30天</el-radio-button>
            <el-radio-button value="90d">90天</el-radio-button>
          </el-radio-group>
        </div>
      </div>
      <div class="chart-container">
        <div ref="trendChart" class="chart" :style="{ height: '320px' }"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import * as echarts from "echarts";

// 响应式数据
const trendChart = ref<HTMLElement>();
const chartInstances = ref<Record<string, echarts.ECharts>>({});
const trendPeriod = ref("30d");

// 初始化所有图表
const initCharts = () => {
  nextTick(() => {
    initTrendChart();
  });
};

// 主趋势图
const initTrendChart = () => {
  if (!trendChart.value) return;

  if (chartInstances.value.trend) {
    chartInstances.value.trend.dispose();
  }

  const chart = echarts.init(trendChart.value);
  chartInstances.value.trend = chart;

  const option = {
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(50, 50, 50, 0.8)",
      borderColor: "transparent",
      textStyle: { color: "#fff" },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      top: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: [
        "01",
        "02",
        "03",
        "04",
        "05",
        "06",
        "07",
        "08",
        "09",
        "10",
        "11",
        "12",
      ],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: "#8c8c8c",
        fontSize: 12,
      },
    },
    yAxis: {
      type: "value",
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: "#8c8c8c",
        fontSize: 12,
      },
      splitLine: {
        lineStyle: {
          color: "#f0f0f0",
          type: "dashed",
        },
      },
    },
    series: [
      {
        name: "数据量",
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        lineStyle: {
          width: 3,
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              { offset: 0, color: "#667eea" },
              { offset: 1, color: "#764ba2" },
            ],
          },
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(102, 126, 234, 0.3)" },
              { offset: 1, color: "rgba(102, 126, 234, 0.05)" },
            ],
          },
        },
        data: [
          820, 932, 901, 934, 1290, 1330, 1320, 1450, 1200, 1380, 1500, 1600,
        ],
      },
    ],
  };

  chart.setOption(option);

  const resizeHandler = () => chart.resize();
  window.addEventListener("resize", resizeHandler);
  (chart as any).resizeHandler = resizeHandler;
};

// 对外暴露方法
defineExpose({
  initCharts,
});

// 生命周期
onMounted(() => {
  setTimeout(() => {
    initCharts();
  }, 100);
});

onUnmounted(() => {
  Object.values(chartInstances.value).forEach((chart) => {
    try {
      if ((chart as any).resizeHandler) {
        window.removeEventListener("resize", (chart as any).resizeHandler);
      }
      chart.dispose();
    } catch (error) {
      console.error("销毁图表实例失败:", error);
    }
  });
});
</script>

<style scoped lang="scss">
@import "../styles/charts-section.scss";
@import "../styles/index.scss";
</style>
