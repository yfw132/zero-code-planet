<template>
  <div class="preview-container">
    <AppRender />
  </div>
</template>

<script setup lang="ts">
import AppRender from "./render/app-render/index.vue";
</script>

<style scoped lang="scss">
.preview-container {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}
</style>
