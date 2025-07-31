<template>
  <div class="operational-overview">
    <!-- 运营数据概览 -->
    <div class="dashboard-card dashboard-card--secondary">
      <div class="dashboard-card-header">
        <h3>运营数据概览</h3>
        <el-button text size="small">查看全部</el-button>
      </div>
      <div class="stats-list">
        <div v-for="stat in quickStats" :key="stat.label" class="stat-item">
          <div class="stat-info">
            <div class="stat-label">{{ stat.label }}</div>
            <div class="stat-value">{{ stat.value }}</div>
          </div>
          <div class="stat-chart">
            <div
              :ref="(el) => setMiniChartRef(el, `stat-${stat.id}`)"
              class="mini-spark-chart"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import * as echarts from "echarts";

// 响应式数据
const chartInstances = ref<Record<string, echarts.ECharts>>({});

// 快速统计数据
const quickStats = ref([
  { id: "pv", label: "页面浏览量", value: "12,847" },
  { id: "uv", label: "独立访客", value: "3,241" },
  { id: "bounce", label: "跳出率", value: "23.6%" },
  { id: "duration", label: "平均停留", value: "4m32s" },
]);

// 方法
const setMiniChartRef = (el: any, chartId: string) => {
  if (el && el instanceof HTMLElement) {
    el.setAttribute("data-chart-id", chartId);
  }
};

// 初始化小型图表
const initMiniCharts = () => {
  quickStats.value.forEach((stat) => {
    const container = document.querySelector(
      `[data-chart-id="stat-${stat.id}"]`
    ) as HTMLElement;
    if (container) {
      const chart = echarts.init(container);
      chartInstances.value[`stat-${stat.id}`] = chart;

      const option = {
        grid: { left: 0, right: 0, top: 0, bottom: 0 },
        xAxis: {
          type: "category",
          show: false,
          data: ["", "", "", "", ""],
        },
        yAxis: { type: "value", show: false },
        series: [
          {
            type: "bar",
            barWidth: "80%",
            itemStyle: {
              color: "#E5E7EB",
              borderRadius: [1, 1, 0, 0],
            },
            data: [12, 18, 15, 22, 20],
          },
        ],
      };

      chart.setOption(option);
    }
  });
};

// 对外暴露方法
defineExpose({
  initMiniCharts,
});

// 生命周期
onMounted(() => {
  setTimeout(() => {
    initMiniCharts();
  }, 100);
});

onUnmounted(() => {
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
@import "../styles/operational-overview.scss";
@import "../styles/index.scss";
</style>
