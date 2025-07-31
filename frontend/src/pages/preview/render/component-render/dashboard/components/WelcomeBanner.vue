<template>
  <div class="welcome-banner">
    <div class="banner-content">
      <div class="welcome-text">
        <h1>欢迎回来！</h1>
        <p>今天是 {{ currentDate }}，{{ welcomeMessage }}</p>
      </div>
      <div class="banner-actions">
        <el-button type="primary" size="large" @click="handleRefreshData">
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
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Refresh, Download } from "@element-plus/icons-vue";

// 定义emit事件
const emit = defineEmits<{
  refreshData: [];
}>();

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

// 方法
const handleRefreshData = () => {
  emit("refreshData");
};
</script>

<style scoped lang="scss">
@import "../styles/welcome-banner.scss";
</style>
