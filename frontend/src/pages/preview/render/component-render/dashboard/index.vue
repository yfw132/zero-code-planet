<template>
  <div class="dashboard-home">
    <!-- 欢迎横幅 -->
    <WelcomeBanner @refresh-data="refreshData" />

    <!-- 主要内容区域 - 左右布局 -->
    <div class="dashboard-cards-section">
      <!-- 左侧：核心业务指标和数据趋势 -->
      <div style="display: flex; flex-direction: column; gap: 24px">
        <MetricsCards :app-schema="props.appSchema" />
        <ChartsSection ref="chartsSectionRef" />
      </div>
      <!-- 右侧：快速访问和运营概览 -->
      <div style="display: flex; flex-direction: column; gap: 24px">
        <QuickAccess :app-schema="props.appSchema" />
        <OperationalOverview ref="operationalOverviewRef" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import type { PageComponentDetail } from "@/types/frontend";
import type { AppFullData } from "@/api/app";

// 导入dashboard组件
import WelcomeBanner from "./components/WelcomeBanner.vue";
import QuickAccess from "./components/QuickAccess.vue";
import MetricsCards from "./components/MetricsCards.vue";
import ChartsSection from "./components/ChartsSection.vue";
import OperationalOverview from "./components/OperationalOverview.vue";

// Props定义
const props = defineProps<{
  appSchema: AppFullData;
  schema: PageComponentDetail;
}>();

// 响应式数据
const loading = ref(false);

// 子组件引用
const chartsSectionRef = ref();
const infoPanelRef = ref();
const dataOverviewRef = ref();
const operationalOverviewRef = ref();

// 方法
const refreshData = () => {
  // 刷新数据时重新初始化所有图表
  nextTick(() => {
    initCharts();
  });
};

// 初始化所有图表
const initCharts = () => {
  nextTick(() => {
    // 调用各个子组件的初始化方法
    chartsSectionRef.value?.initCharts();
    infoPanelRef.value?.initMiniCharts();
    dataOverviewRef.value?.initOverviewChart();
    operationalOverviewRef.value?.initMiniCharts();
  });
};

// 生命周期
onMounted(async () => {
  try {
    loading.value = true;
    await nextTick();
    setTimeout(() => {
      initCharts();
    }, 100);
  } catch (error) {
    console.error("组件初始化失败:", error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped lang="scss">
@import "./styles/dashboard.scss";
</style>
