<template>
  <div class="metrics-section">
    <div class="metrics-grid">
      <div
        v-for="(metric, index) in dynamicMetrics"
        :key="metric.id"
        class="metric-card dashboard-card"
        :class="`metric-${index + 1}`"
        @click="metric.action"
      >
        <div class="metric-header">
          <div class="metric-icon" :style="{ background: metric.gradient }">
            <component style="width: 24px; height: 24px" :is="metric.icon" />
          </div>
          <div class="metric-trend positive">
            <el-icon>
              <Grid />
            </el-icon>
            <span>{{ metric.dataSourceValue }}字段</span>
          </div>
        </div>
        <div class="metric-content">
          <div class="metric-value">{{ metric.value }} 条</div>
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
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import * as echarts from "echarts";
import {
  Document,
  Briefcase,
  DataAnalysis,
  Grid,
} from "@element-plus/icons-vue";
import { getRecordList } from "@/api/crud";
import type { AppFullData } from "@/api/app";
import { ElMessage } from "element-plus";

// Props定义
const props = defineProps<{
  appSchema: AppFullData;
}>();

// 响应式数据
const chartInstances = ref<Record<string, echarts.ECharts>>({});
const resizeTimeoutId = ref<number | null>(null);
const dataSourceCounts = ref<Record<string, number>>({});
const loading = ref(false);

// 通用图标数组，循环使用
const iconArray = [Document, Briefcase, DataAnalysis, Grid];

// 渐变色映射（只需要4个）
const gradientMap = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
];

// 动态生成指标数据（只取前4个数据源）
const dynamicMetrics = computed(() => {
  if (!props.appSchema?.dataSource) {
    return [];
  }

  // 只取前4个数据源
  const limitedDataSources = props.appSchema.dataSource.slice(0, 4);

  return limitedDataSources.map((ds, index) => {
    const count = dataSourceCounts.value[ds.datasourceid] || 0;

    return {
      id: ds.datasourceid,
      label: ds.title,
      sublabel: ds.description,
      value: count.toLocaleString(),
      gradient: gradientMap[index],
      icon: iconArray[index],
      dataSourceValue: ds.dataSource.length || 0,
      action: () => {
        console.log(`查看${ds.title}详情`, ds.datasourceid);
        // 这里可以添加跳转到具体数据源页面的逻辑
      },
    };
  });
});

// 获取数据源记录总数（只获取前4个）
const fetchDataSourceCounts = async () => {
  if (!props.appSchema?.dataSource) {
    return;
  }

  // 只取前4个数据源
  const limitedDataSources = props.appSchema.dataSource.slice(0, 4);

  loading.value = true;
  try {
    // 并发获取前4个数据源的第一页数据（只为了获取总数）
    const promises = limitedDataSources.map(async (ds) => {
      try {
        const response = await getRecordList(ds.datasourceid, {
          page: 1,
          limit: 1, // 只获取1条记录，主要为了获取总数信息
        });
        return {
          datasourceid: ds.datasourceid,
          count: response.pagination.total,
        };
      } catch (error) {
        console.warn(`获取数据源 ${ds.datasourceid} 的数据失败:`, error);
        return {
          datasourceid: ds.datasourceid,
          count: 0,
        };
      }
    });

    const results = await Promise.all(promises);

    // 更新数据源计数
    const newCounts: Record<string, number> = {};
    results.forEach((result) => {
      newCounts[result.datasourceid] = result.count;
    });
    dataSourceCounts.value = newCounts;
  } catch (error) {
    console.error("获取数据源统计失败:", error);
    ElMessage.error("获取数据统计失败");
  } finally {
    loading.value = false;
  }
};

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
  // 清理旧的图表实例
  Object.values(chartInstances.value).forEach((chart) => {
    try {
      chart.dispose();
    } catch (error) {
      console.error("销毁旧图表实例失败:", error);
    }
  });
  chartInstances.value = {};

  dynamicMetrics.value.forEach((metric, index) => {
    const container = document.querySelector(
      `[data-chart-id="mini-${metric.id}"]`
    ) as HTMLElement;
    if (container) {
      const chart = echarts.init(container);
      chartInstances.value[`mini-${metric.id}`] = chart;

      const isPositive = index !== 3;

      const option = {
        grid: { left: -20, right: -20, top: 0, bottom: 0 },
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
              color: isPositive ? "#52c41a" : "#ff4d4f",
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
                    color: isPositive
                      ? "rgba(82, 196, 26, 0.3)"
                      : "rgba(255, 77, 79, 0.3)",
                  },
                  { offset: 1, color: "rgba(255, 255, 255, 0)" },
                ],
              },
            },
            data: isPositive
              ? [20, 25, 22, 28, 32, 35, 40]
              : [40, 35, 32, 28, 22, 25, 20],
          },
        ],
      };

      chart.setOption(option);
    }
  });
};

// 监听数据变化，重新初始化图表
watch(
  () => dataSourceCounts.value,
  () => {
    // 等待DOM更新后初始化图表
    setTimeout(() => {
      initMiniCharts();
    }, 100);
  },
  { deep: true }
);

// 监听appSchema变化
watch(
  () => props.appSchema,
  (newSchema) => {
    if (newSchema?.dataSource) {
      fetchDataSourceCounts();
    }
  },
  { immediate: true, deep: true }
);

// 生命周期
onMounted(async () => {
  // 延迟初始化图表
  setTimeout(() => {
    initMiniCharts();
  }, 200);

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
