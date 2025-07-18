<template>
  <div class="preview-container">
    <AppRender />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import AppRender from "./render/app-render/index.vue";

const route = useRoute();
const router = useRouter();

// 检查路由参数，只有在完全没有appId时才重定向
onMounted(() => {
  const appId = route.params.appId as string;
  // 只有在没有appId时才重定向到默认应用
  // pageId可以由app-render组件自动处理
  if (!appId) {
    console.log("preview/index.vue - No appId found, redirecting to default");
    router.replace(`/workbench`);
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
