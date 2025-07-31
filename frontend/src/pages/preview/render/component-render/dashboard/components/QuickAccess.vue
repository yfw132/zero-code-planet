<template>
  <div class="dashboard-card dashboard-card--success">
    <div class="dashboard-card-header">
      <h3>快速访问</h3>
      <el-badge :value="pageCount" class="activity-badge">
        <el-icon><Link /></el-icon>
      </el-badge>
    </div>
    <div class="activity-list">
      <div
        v-for="(page, index) in quickAccessPages"
        :key="(page as any).pageid"
        class="activity-item page-item"
        @click="navigateToPage(page)"
      >
        <div
          class="activity-avatar"
          :style="{ background: getPageColor(index) }"
        >
          <component
            style="width: 24px; height: 24px"
            :is="getPageIcon(index)"
          />
        </div>
        <div class="activity-content">
          <div class="activity-title">{{ page.pageName }}</div>
          <div class="activity-time">{{ page.description }}</div>
        </div>
        <div class="activity-status">
          <el-icon class="arrow-icon"><ArrowRight /></el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  Link,
  ArrowRight,
  PieChart,
  Shop,
  ShoppingCart,
  EditPen,
  Avatar,
  Document,
} from "@element-plus/icons-vue";
import type { AppFullData } from "@/api/app";
import { DEFAULT_APP_ID } from "../../../../test/index";

// Props定义
const props = defineProps<{
  appSchema: AppFullData;
}>();

const route = useRoute();
const router = useRouter();

// 计算属性
const quickAccessPages = computed(() => {
  return props.appSchema?.pages || [];
});

const pageCount = computed(() => {
  return quickAccessPages.value.length;
});

// 页面图标映射
const getPageIcon = (index: number) => {
  const icons = [PieChart, Shop, ShoppingCart, EditPen, Avatar];
  return icons[index] || Document;
};

// 页面颜色映射
const getPageColor = (index: number) => {
  const colors = [
    "#5B8FF9", // 蓝色 - 仪表盘
    "#5AD8A6", // 绿色 - 客户管理
    "#5D7092", // 紫色 - 销售机会
    "#FF6B6B", // 红色 - 编辑
    "#FFD93D", // 黄色 - 用户
  ];
  return colors[index] || "#909399";
};

// 导航到页面
const navigateToPage = (page: any) => {
  const appId = (route.params.appId as string) || DEFAULT_APP_ID;
  router.push({
    path: `/preview/${appId}/${(page as any).pageid}`,
  });
};
</script>

<style scoped lang="scss">
@import "../styles/quick-access.scss";
@import "../styles/index.scss";
</style>
