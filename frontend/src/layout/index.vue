<template>
    <div class="app">
        <!-- <navbar /> -->
        <app-main />
    </div>
</template>
  
<script setup lang="ts">
import Navbar from './components/Navbar.vue'
import AppMain from './components/AppMain.vue'
</script>
  
<style scoped>
.app {
    display: flex;
    width: 100%;
    position: relative;
    background: url(src/assets/workspace_bg.png) 0% 0% / 100% no-repeat;
}
</style>