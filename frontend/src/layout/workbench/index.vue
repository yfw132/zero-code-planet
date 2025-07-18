<template>
  <div class="workbench">
    <navbar />
    <app-main />
  </div>
</template>

<script setup lang="ts">
import Navbar from "./Navbar.vue";
import AppMain from "./AppMain.vue";
</script>

<style scoped>
.workbench {
  height: 100vh;
  display: flex;
  flex-direction: column;
  width: 100%;
  background: url(src/assets/workspace_bg.png) 0% 0% / 100% no-repeat;
}
</style>
