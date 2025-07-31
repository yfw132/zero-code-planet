<template>
  <div class="dashboard-home">
    <!-- 欢迎横幅 -->
    <WelcomeBanner @refresh-data="refreshData" />

    <!-- 主要内容区域 - 左右布局 -->
    <div class="dashboard-cards-section">
      <!-- 左侧：核心业务指标和数据趋势 -->
      <div style="display: flex; flex-direction: column; gap: 24px">
        <MetricsCards :mock-data="mockData" />
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
import type { DataSourceItem } from "@/types/frontend";
import type { AppFullData } from "@/api/app";
import { getMockData } from "./mock";

// 导入dashboard组件
import WelcomeBanner from "./components/WelcomeBanner.vue";
import QuickAccess from "./components/QuickAccess.vue";
import MetricsCards from "./components/MetricsCards.vue";
import ChartsSection from "./components/ChartsSection.vue";
import OperationalOverview from "./components/OperationalOverview.vue";

// Props定义
const props = defineProps<{
  dataSourceSchema: DataSourceItem;
  appSchema: AppFullData;
}>();

// 响应式数据
const loading = ref(false);
const mockData = ref<any[]>([]);

// 子组件引用
const chartsSectionRef = ref();
const infoPanelRef = ref();
const dataOverviewRef = ref();
const operationalOverviewRef = ref();

// 方法
const loadData = async () => {
  loading.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 300));
    mockData.value = getMockData(props.dataSourceSchema.datasourceid);
  } catch (error) {
    console.error("加载数据失败:", error);
  } finally {
    loading.value = false;
  }
};

const refreshData = () => {
  loadData();
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
    await loadData();
    await nextTick();
    setTimeout(() => {
      initCharts();
    }, 100);
  } catch (error) {
    console.error("组件初始化失败:", error);
  }
});
</script>

<style scoped lang="scss">
@import "./styles/dashboard.scss";
</style>
