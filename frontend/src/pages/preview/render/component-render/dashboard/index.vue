<template>
  <div class="dashboard-home">
    <!-- 欢迎横幅 -->
    <div class="welcome-banner">
      <div class="banner-content">
        <div class="welcome-text">
          <h1>欢迎回来！</h1>
          <p>今天是 {{ currentDate }}，{{ welcomeMessage }}</p>
        </div>
        <div class="banner-actions">
          <el-button type="primary" size="large" @click="refreshData">
            <el-icon><Refresh /></el-icon>
            刷新数据
          </el-button>
          <el-button size="large">
            <el-icon><Download /></el-icon>
            导出报告
          </el-button>
        </div>
      </div>
      <div class="banner-decoration">
        <div class="decoration-circle decoration-circle-1"></div>
        <div class="decoration-circle decoration-circle-2"></div>
        <div class="decoration-wave"></div>
      </div>
    </div>

    <!-- 快捷访问 -->
    <div class="quick-access-section">
      <div class="section-title">
        <h2>快捷访问</h2>
        <span class="section-subtitle">常用功能与快速入口</span>
      </div>
      <div class="quick-access-grid">
        <div
          v-for="item in quickAccessItems"
          :key="item.id"
          class="quick-access-item"
          @click="item.action"
        >
          <div class="access-icon" :style="{ background: item.gradient }">
            <component :is="item.icon" />
          </div>
          <div class="access-content">
            <div class="access-title">{{ item.title }}</div>
            <div class="access-description">{{ item.description }}</div>
          </div>
          <div class="access-arrow">
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>
      </div>
    </div>

    <!-- 核心指标卡片 -->
    <div class="metrics-section">
      <div class="section-title">
        <h2>核心业务指标</h2>
        <span class="section-subtitle">关键数据概览与趋势分析</span>
      </div>
      <div class="metrics-grid">
        <div
          v-for="(metric, index) in coreMetrics"
          :key="metric.id"
          class="metric-card"
          :class="`metric-${index + 1}`"
          @click="metric.action"
        >
          <div class="metric-header">
            <div class="metric-icon" :style="{ background: metric.gradient }">
              <component :is="metric.icon" />
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

    <!-- 主要内容区域 -->
    <div class="main-dashboard">
      <!-- 左侧图表区域 -->
      <div class="chart-section">
        <!-- 数据趋势图 -->
        <div class="chart-card trend-card">
          <div class="card-header">
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
            <div
              ref="trendChart"
              class="chart"
              :style="{ height: '320px' }"
            ></div>
          </div>
        </div>

        <!-- 数据分布图表 -->
        <div class="charts-row">
          <div class="chart-card distribution-card">
            <div class="card-header">
              <h3>用户地域分布</h3>
              <el-dropdown @command="handleDistributionCommand">
                <el-button text>
                  更多选项<el-icon><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="export"
                      >导出数据</el-dropdown-item
                    >
                    <el-dropdown-item command="detail"
                      >查看详情</el-dropdown-item
                    >
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
            <div class="chart-container">
              <div
                ref="distributionChart"
                class="chart"
                :style="{ height: '280px' }"
              ></div>
            </div>
          </div>

          <div class="chart-card category-card">
            <div class="card-header">
              <h3>内容类型占比</h3>
              <div class="legend-dots">
                <span class="legend-dot" style="background: #5b8ff9"></span>
                <span class="legend-dot" style="background: #5ad8a6"></span>
                <span class="legend-dot" style="background: #5d7092"></span>
              </div>
            </div>
            <div class="chart-container">
              <div
                ref="categoryChart"
                class="chart"
                :style="{ height: '280px' }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧信息面板 -->
      <div class="info-panel">
        <!-- 实时活动 -->
        <div class="panel-card activity-card">
          <div class="card-header">
            <h3>实时系统动态</h3>
            <el-badge :value="newActivities" class="activity-badge">
              <el-icon><Bell /></el-icon>
            </el-badge>
          </div>
          <div class="activity-list">
            <div
              v-for="activity in recentActivities"
              :key="activity.id"
              class="activity-item"
            >
              <div
                class="activity-avatar"
                :style="{ background: activity.color }"
              >
                <component :is="activity.icon" />
              </div>
              <div class="activity-content">
                <div class="activity-title">{{ activity.title }}</div>
                <div class="activity-time">{{ activity.time }}</div>
              </div>
              <div class="activity-status" :class="activity.status">
                {{ activity.statusText }}
              </div>
            </div>
          </div>
        </div>

        <!-- 快速统计 -->
        <div class="panel-card stats-card">
          <div class="card-header">
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

        <!-- 热门内容排行 -->
        <div class="panel-card ranking-card">
          <div class="card-header">
            <h3>热门内容排行榜</h3>
            <div class="ranking-tabs">
              <span class="tab active">今日</span>
              <span class="tab">本周</span>
              <span class="tab">本月</span>
            </div>
          </div>
          <div class="ranking-list">
            <div
              v-for="(item, index) in topContent"
              :key="index"
              class="ranking-item"
            >
              <div class="rank-number" :class="{ 'top-three': index < 3 }">
                {{ index + 1 }}
              </div>
              <div class="content-info">
                <div class="content-title">{{ item.title }}</div>
                <div class="content-meta">
                  <span class="views">{{ item.views }} 浏览</span>
                  <span
                    class="trend"
                    :class="{
                      positive: item.trend > 0,
                      negative: item.trend < 0,
                    }"
                  >
                    {{ item.trend > 0 ? "+" : "" }}{{ item.trend }}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部数据概览 -->
    <div class="data-overview">
      <div class="overview-card">
        <div class="overview-header">
          <div class="header-left">
            <h3>数据总览与分析</h3>
            <span class="subtitle">全方位数据监控与智能分析</span>
          </div>
          <div class="overview-filters">
            <el-select
              v-model="overviewFilter"
              size="small"
              style="width: 120px"
            >
              <el-option label="全部数据" value="all" />
              <el-option label="用户数据" value="user" />
              <el-option label="产品数据" value="product" />
            </el-select>
          </div>
        </div>
        <div class="overview-content">
          <div class="overview-chart">
            <div
              ref="overviewChart"
              class="chart"
              :style="{ height: '200px' }"
            ></div>
          </div>
          <div class="overview-summary">
            <div class="summary-item">
              <div class="summary-label">总计</div>
              <div class="summary-value">{{ totalCount }}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">增长率</div>
              <div class="summary-value positive">+12.5%</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">活跃度</div>
              <div class="summary-value">85.2%</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">满意度</div>
              <div class="summary-value positive">92.8%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import * as echarts from "echarts";
import {
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Document,
  PieChart,
  TrendCharts,
  View,
  Refresh,
  Download,
  Bell,
  User,
  ShoppingBag,
  ChatLineRound,
  DataAnalysis,
  Setting,
  Files,
  Monitor,
  Management,
} from "@element-plus/icons-vue";
import type { DataSourceItem } from "../../../../../types/dataSource";
import { getMockData } from "./mock";

// Props定义
const props = defineProps<{
  dataSourceSchema: DataSourceItem;
}>();

// 响应式数据
const loading = ref(false);
const trendChart = ref<HTMLElement>();
const distributionChart = ref<HTMLElement>();
const categoryChart = ref<HTMLElement>();
const overviewChart = ref<HTMLElement>();
const chartInstances = ref<Record<string, echarts.ECharts>>({});
const mockData = ref<any[]>([]);
const trendPeriod = ref("30d");
const overviewFilter = ref("all");
const newActivities = ref(3);

// 计算属性
const currentDate = computed(() => {
  return new Date().toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
});

const welcomeMessage = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return "早上好，开始美好的一天吧！";
  if (hour < 18) return "下午好，继续保持高效工作！";
  return "晚上好，今天辛苦了！";
});

const totalCount = computed(() => mockData.value.length);

// 快捷访问数据
const quickAccessItems = ref([
  {
    id: "data-manage",
    title: "数据管理",
    description: "数据源配置与管理",
    icon: DataAnalysis,
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    action: () => console.log("数据管理"),
  },
  {
    id: "user-center",
    title: "用户中心",
    description: "用户信息与权限管理",
    icon: User,
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    action: () => console.log("用户中心"),
  },
  {
    id: "system-monitor",
    title: "系统监控",
    description: "实时监控系统状态",
    icon: Monitor,
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    action: () => console.log("系统监控"),
  },
  {
    id: "content-manage",
    title: "内容管理",
    description: "内容发布与编辑",
    icon: Files,
    gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    action: () => console.log("内容管理"),
  },
  {
    id: "report-center",
    title: "报表中心",
    description: "数据报表生成与分析",
    icon: TrendCharts,
    gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    action: () => console.log("报表中心"),
  },
  {
    id: "system-setting",
    title: "系统设置",
    description: "系统参数配置",
    icon: Setting,
    gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    action: () => console.log("系统设置"),
  },
]);

// 核心指标数据
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

// 实时活动数据
const recentActivities = ref([
  {
    id: 1,
    title: "新用户注册",
    time: "2分钟前",
    icon: User,
    color: "#5B8FF9",
    status: "success",
    statusText: "已完成",
  },
  {
    id: 2,
    title: "订单支付成功",
    time: "5分钟前",
    icon: ShoppingBag,
    color: "#5AD8A6",
    status: "success",
    statusText: "已完成",
  },
  {
    id: 3,
    title: "数据备份",
    time: "10分钟前",
    icon: DataAnalysis,
    color: "#5D7092",
    status: "processing",
    statusText: "进行中",
  },
  {
    id: 4,
    title: "系统更新",
    time: "1小时前",
    icon: Refresh,
    color: "#FF6B6B",
    status: "success",
    statusText: "已完成",
  },
]);

// 快速统计数据
const quickStats = ref([
  { id: "pv", label: "页面浏览量", value: "12,847" },
  { id: "uv", label: "独立访客", value: "3,241" },
  { id: "bounce", label: "跳出率", value: "23.6%" },
  { id: "duration", label: "平均停留", value: "4m32s" },
]);

// 热门内容数据
const topContent = ref([
  { title: "数据分析报告Q4", views: "12.5K", trend: 25.6 },
  { title: "用户行为洞察", views: "8.7K", trend: 18.2 },
  { title: "市场趋势预测", views: "6.3K", trend: -2.1 },
  { title: "产品优化建议", views: "5.9K", trend: 12.8 },
  { title: "技术架构升级", views: "4.2K", trend: 8.5 },
]);

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

const handleDistributionCommand = (command: string) => {
  console.log("Distribution command:", command);
};

const setMiniChartRef = (el: any, chartId: string) => {
  if (el && el instanceof HTMLElement) {
    el.setAttribute("data-chart-id", chartId);
  }
};

// 初始化所有图表
const initCharts = () => {
  nextTick(() => {
    initTrendChart();
    initDistributionChart();
    initCategoryChart();
    initOverviewChart();
    initMiniCharts();
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
      {
        name: "活跃度",
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
              { offset: 0, color: "#4facfe" },
              { offset: 1, color: "#00f2fe" },
            ],
          },
        },
        data: [
          680, 785, 842, 923, 1052, 1186, 1203, 1289, 1356, 1429, 1512, 1580,
        ],
      },
    ],
  };

  chart.setOption(option);

  const resizeHandler = () => chart.resize();
  window.addEventListener("resize", resizeHandler);
  (chart as any).resizeHandler = resizeHandler;
};

// 分布图表
const initDistributionChart = () => {
  if (!distributionChart.value) return;

  if (chartInstances.value.distribution) {
    chartInstances.value.distribution.dispose();
  }

  const chart = echarts.init(distributionChart.value);
  chartInstances.value.distribution = chart;

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
      data: ["一线城市", "二线城市", "三线城市", "四线城市", "其他"],
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
        name: "用户分布",
        type: "bar",
        barWidth: "50%",
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "#5B8FF9" },
              { offset: 1, color: "#5B8FF9" },
            ],
          },
        },
        data: [425, 356, 298, 189, 132],
      },
    ],
  };

  chart.setOption(option);

  const resizeHandler = () => chart.resize();
  window.addEventListener("resize", resizeHandler);
  (chart as any).resizeHandler = resizeHandler;
};

// 分类图表
const initCategoryChart = () => {
  if (!categoryChart.value) return;

  if (chartInstances.value.category) {
    chartInstances.value.category.dispose();
  }

  const chart = echarts.init(categoryChart.value);
  chartInstances.value.category = chart;

  const option = {
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(50, 50, 50, 0.8)",
      borderColor: "transparent",
      textStyle: { color: "#fff" },
    },
    legend: {
      show: false,
    },
    series: [
      {
        name: "类型分布",
        type: "pie",
        radius: ["40%", "70%"],
        center: ["50%", "50%"],
        avoidLabelOverlap: false,
        label: {
          show: true,
          position: "outside",
          formatter: "{b}: {c}%",
        },
        labelLine: {
          show: true,
        },
        data: [
          { value: 48, name: "文本内容", itemStyle: { color: "#5B8FF9" } },
          { value: 32, name: "图片内容", itemStyle: { color: "#5AD8A6" } },
          { value: 20, name: "视频内容", itemStyle: { color: "#5D7092" } },
        ],
      },
    ],
  };

  chart.setOption(option);

  const resizeHandler = () => chart.resize();
  window.addEventListener("resize", resizeHandler);
  (chart as any).resizeHandler = resizeHandler;
};

// 概览图表
const initOverviewChart = () => {
  if (!overviewChart.value) return;

  if (chartInstances.value.overview) {
    chartInstances.value.overview.dispose();
  }

  const chart = echarts.init(overviewChart.value);
  chartInstances.value.overview = chart;

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
      top: "5%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: "#8c8c8c",
        fontSize: 11,
      },
    },
    yAxis: {
      type: "value",
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: "#8c8c8c",
        fontSize: 11,
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
        name: "数据概览",
        type: "bar",
        barWidth: "60%",
        itemStyle: {
          borderRadius: [2, 2, 0, 0],
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "#667eea" },
              { offset: 1, color: "#764ba2" },
            ],
          },
        },
        data: [120, 200, 150, 80, 170, 110, 200],
      },
    ],
  };

  chart.setOption(option);

  const resizeHandler = () => chart.resize();
  window.addEventListener("resize", resizeHandler);
  (chart as any).resizeHandler = resizeHandler;
};

// 初始化小型图表
const initMiniCharts = () => {
  // 指标卡片的迷你图表
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

  // 快速统计的迷你图表
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
.dashboard-home {
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

// 通用标题样式
.section-title {
  margin-bottom: 24px;

  h2 {
    font-size: 28px;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0 0 8px 0;
    letter-spacing: -0.5px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .section-subtitle {
    font-size: 14px;
    color: #666;
    font-weight: 500;
  }
}

// 欢迎横幅
.welcome-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 40px;
  margin-bottom: 32px;
  position: relative;
  overflow: hidden;
  color: white;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);

  .banner-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    z-index: 2;

    .welcome-text {
      h1 {
        font-size: 36px;
        font-weight: 800;
        margin: 0 0 12px 0;
        letter-spacing: -1px;
      }

      p {
        font-size: 16px;
        margin: 0;
        opacity: 0.95;
        font-weight: 500;
      }
    }

    .banner-actions {
      display: flex;
      gap: 16px;

      .el-button {
        height: 48px;
        padding: 0 28px;
        font-weight: 600;
        border-radius: 12px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
        }
      }
    }
  }

  .banner-decoration {
    position: absolute;
    top: 0;
    right: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;

    .decoration-circle-1 {
      position: absolute;
      top: -30px;
      right: -30px;
      width: 150px;
      height: 150px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      animation: float 6s ease-in-out infinite;
    }

    .decoration-circle-2 {
      position: absolute;
      top: 20px;
      right: 120px;
      width: 80px;
      height: 80px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 50%;
      animation: float 4s ease-in-out infinite reverse;
    }

    .decoration-wave {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 100%;
      height: 80px;
      background: rgba(255, 255, 255, 0.06);
      border-radius: 50% 50% 0 0 / 100% 100% 0 0;
    }
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

// 快捷访问
.quick-access-section {
  margin-bottom: 40px;

  .quick-access-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;

    .quick-access-item {
      background: white;
      border-radius: 16px;
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 16px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.8);

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
        border-color: rgba(102, 126, 234, 0.3);
      }

      .access-icon {
        width: 52px;
        height: 52px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 24px;
        flex-shrink: 0;
      }

      .access-content {
        flex: 1;

        .access-title {
          font-size: 16px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 4px;
        }

        .access-description {
          font-size: 13px;
          color: #666;
        }
      }

      .access-arrow {
        color: #999;
        font-size: 16px;
        transition: all 0.3s ease;
      }

      &:hover .access-arrow {
        color: #667eea;
        transform: translateX(4px);
      }
    }
  }
}

// 核心指标区域
.metrics-section {
  margin-bottom: 40px;

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;

    .metric-card {
      background: white;
      border-radius: 20px;
      padding: 28px;
      box-shadow: 0 6px 28px rgba(0, 0, 0, 0.08);
      transition: all 0.3s ease;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.8);

      &:hover {
        transform: translateY(-6px);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
      }

      &.metric-1:hover {
        box-shadow: 0 12px 40px rgba(102, 126, 234, 0.25);
      }
      &.metric-2:hover {
        box-shadow: 0 12px 40px rgba(240, 147, 251, 0.25);
      }
      &.metric-3:hover {
        box-shadow: 0 12px 40px rgba(79, 172, 254, 0.25);
      }
      &.metric-4:hover {
        box-shadow: 0 12px 40px rgba(67, 233, 123, 0.25);
      }

      .metric-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;

        .metric-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 26px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }

        .metric-trend {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 700;
          padding: 6px 12px;
          border-radius: 8px;

          &.positive {
            color: #52c41a;
            background: rgba(82, 196, 26, 0.12);
          }

          &.negative {
            color: #ff4d4f;
            background: rgba(255, 77, 79, 0.12);
          }
        }
      }

      .metric-content {
        margin-bottom: 20px;

        .metric-value {
          font-size: 36px;
          font-weight: 800;
          color: #1a1a1a;
          line-height: 1;
          margin-bottom: 6px;
          letter-spacing: -1px;
        }

        .metric-label {
          font-size: 16px;
          color: #333;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .metric-sublabel {
          font-size: 13px;
          color: #999;
          font-weight: 500;
        }
      }

      .metric-chart {
        height: 64px;

        .mini-chart {
          width: 100%;
          height: 100%;
        }
      }
    }
  }
}

// 主仪表板区域
.main-dashboard {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 32px;
  margin-bottom: 40px;

  .chart-section {
    .chart-card {
      background: white;
      border-radius: 20px;
      padding: 28px;
      box-shadow: 0 6px 28px rgba(0, 0, 0, 0.08);
      margin-bottom: 24px;
      border: 1px solid rgba(255, 255, 255, 0.8);

      &.trend-card {
        .card-header {
          margin-bottom: 28px;
        }
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;

        .header-left {
          h3 {
            font-size: 22px;
            font-weight: 700;
            color: #1a1a1a;
            margin: 0 0 6px 0;
            letter-spacing: -0.3px;
          }

          .subtitle {
            font-size: 14px;
            color: #666;
            font-weight: 500;
          }
        }

        .header-actions {
          .el-radio-group {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 3px;
            border: 1px solid #e9ecef;
          }
        }

        .legend-dots {
          display: flex;
          gap: 10px;

          .legend-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          }
        }
      }

      .chart-container {
        .chart {
          width: 100%;
        }
      }
    }

    .charts-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }
  }

  .info-panel {
    display: flex;
    flex-direction: column;
    gap: 24px;

    .panel-card {
      background: white;
      border-radius: 20px;
      padding: 28px;
      box-shadow: 0 6px 28px rgba(0, 0, 0, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.8);

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;

        h3 {
          font-size: 20px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0;
          letter-spacing: -0.3px;
        }

        .activity-badge {
          .el-icon {
            font-size: 20px;
            color: #666;
          }
        }

        .ranking-tabs {
          display: flex;
          gap: 20px;

          .tab {
            font-size: 14px;
            color: #999;
            cursor: pointer;
            padding: 6px 0;
            transition: all 0.3s ease;
            font-weight: 500;

            &.active {
              color: #667eea;
              border-bottom: 2px solid #667eea;
              font-weight: 600;
            }

            &:hover {
              color: #667eea;
            }
          }
        }
      }

      &.activity-card {
        .activity-list {
          .activity-item {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 16px 0;
            border-bottom: 1px solid #f5f5f5;
            transition: all 0.3s ease;

            &:hover {
              background: rgba(102, 126, 234, 0.02);
              border-radius: 8px;
              margin: 0 -8px;
              padding-left: 24px;
              padding-right: 24px;
            }

            &:last-child {
              border-bottom: none;
            }

            .activity-avatar {
              width: 42px;
              height: 42px;
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 18px;
              box-shadow: 0 3px 12px rgba(0, 0, 0, 0.15);
            }

            .activity-content {
              flex: 1;

              .activity-title {
                font-size: 15px;
                font-weight: 600;
                color: #333;
                margin-bottom: 4px;
              }

              .activity-time {
                font-size: 12px;
                color: #999;
                font-weight: 500;
              }
            }

            .activity-status {
              font-size: 12px;
              padding: 4px 10px;
              border-radius: 6px;
              font-weight: 600;

              &.success {
                color: #52c41a;
                background: rgba(82, 196, 26, 0.12);
              }

              &.processing {
                color: #1890ff;
                background: rgba(24, 144, 255, 0.12);
              }
            }
          }
        }
      }

      &.stats-card {
        .stats-list {
          .stat-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 0;
            border-bottom: 1px solid #f5f5f5;

            &:last-child {
              border-bottom: none;
            }

            .stat-info {
              .stat-label {
                font-size: 14px;
                color: #666;
                margin-bottom: 6px;
                font-weight: 500;
              }

              .stat-value {
                font-size: 22px;
                font-weight: 700;
                color: #333;
              }
            }

            .stat-chart {
              width: 70px;
              height: 45px;

              .mini-spark-chart {
                width: 100%;
                height: 100%;
              }
            }
          }
        }
      }

      &.ranking-card {
        .ranking-list {
          .ranking-item {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 16px 0;
            border-bottom: 1px solid #f5f5f5;
            transition: all 0.3s ease;

            &:hover {
              background: rgba(102, 126, 234, 0.02);
              border-radius: 8px;
              margin: 0 -8px;
              padding-left: 24px;
              padding-right: 24px;
            }

            &:last-child {
              border-bottom: none;
            }

            .rank-number {
              width: 28px;
              height: 28px;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 13px;
              font-weight: 700;
              background: #f5f5f5;
              color: #999;

              &.top-three {
                background: linear-gradient(135deg, #ffd700, #ffed4e);
                color: #fff;
                box-shadow: 0 3px 12px rgba(255, 215, 0, 0.3);
              }
            }

            .content-info {
              flex: 1;

              .content-title {
                font-size: 14px;
                font-weight: 600;
                color: #333;
                margin-bottom: 6px;
              }

              .content-meta {
                display: flex;
                gap: 16px;
                font-size: 12px;

                .views {
                  color: #999;
                  font-weight: 500;
                }

                .trend {
                  font-weight: 600;

                  &.positive {
                    color: #52c41a;
                  }

                  &.negative {
                    color: #ff4d4f;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

// 数据概览
.data-overview {
  .overview-card {
    background: white;
    border-radius: 20px;
    padding: 32px;
    box-shadow: 0 6px 28px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.8);

    .overview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 28px;

      .header-left {
        h3 {
          font-size: 24px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 6px 0;
          letter-spacing: -0.4px;
        }

        .subtitle {
          font-size: 14px;
          color: #666;
          font-weight: 500;
        }
      }
    }

    .overview-content {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 40px;
      align-items: center;

      .overview-chart {
        .chart {
          width: 100%;
        }
      }

      .overview-summary {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 28px;

        .summary-item {
          text-align: center;

          .summary-label {
            font-size: 14px;
            color: #999;
            margin-bottom: 10px;
            font-weight: 500;
          }

          .summary-value {
            font-size: 26px;
            font-weight: 800;
            color: #333;
            letter-spacing: -0.5px;

            &.positive {
              color: #52c41a;
            }
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 1400px) {
  .main-dashboard {
    grid-template-columns: 1fr;
  }

  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .quick-access-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .dashboard-home {
    padding: 16px;
  }

  .welcome-banner {
    padding: 28px 20px;

    .banner-content {
      flex-direction: column;
      gap: 24px;
      text-align: center;

      .welcome-text h1 {
        font-size: 28px;
      }

      .banner-actions {
        justify-content: center;
      }
    }
  }

  .metrics-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .quick-access-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .chart-section .charts-row {
    grid-template-columns: 1fr;
  }

  .data-overview .overview-content {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .section-title h2 {
    font-size: 24px;
  }
}
</style>
