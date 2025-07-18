<template>
  <el-scrollbar ref="scrollbarRef" height="calc(100vh - 75px)">
    <section class="workbench-content">
      <router-view />
    </section>
  </el-scrollbar>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import type { ElScrollbar } from "element-plus";

const route = useRoute();
const scrollbarRef = ref<InstanceType<typeof ElScrollbar>>();

// 监听路由变化，自动滚动到顶部
watch(
  () => route.path,
  () => {
    if (scrollbarRef.value) {
      scrollbarRef.value.setScrollTop(0);
    }
  },
  { immediate: false }
);
</script>

<style scoped>
.workbench-content {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
  width: 100%;
  box-sizing: border-box;
}
@media (max-width: 768px) {
  .workbench-content {
    padding: 24px 16px;
  }
}
</style>
