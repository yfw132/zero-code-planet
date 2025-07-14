<template>
  <div class="preview-container">
    <AppRender />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import AppRender from "./render/app-render/index.vue";
import { DEFAULT_APP_ID, DEFAULT_PAGE_ID } from "./test";

const route = useRoute();
const router = useRouter();

// 检查路由参数，如果缺少则重定向到默认值
onMounted(() => {
  const appId = route.params.appId as string;
  const pageId = route.params.pageId as string;

  if (!appId || !pageId) {
    router.replace(`/preview/${DEFAULT_APP_ID}/${DEFAULT_PAGE_ID}`);
  }
});
</script>

<style scoped lang="scss">
.preview-container {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}
</style>
