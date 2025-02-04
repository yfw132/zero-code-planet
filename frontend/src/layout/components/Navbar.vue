<template>
  <div class="menu" @mouseenter="expandMenu" @mouseleave="shrinkMenu">
    <div style="display: flex;" :class="activeIndex === item.path ? 'menu-item selected' : 'menu-item unselected'"
      v-for="(item, index) in routerList" :key="index" @click="goUrl(item)">
      <el-icon class="icon">
        <component :is="item.meta.icon" />
      </el-icon>
      <div class="title" v-if="isExpanded">{{ item.meta.title }}</div>
    </div>
    <!-- 底部退出登录按钮 -->
    <div style="display: flex;" class="logout-item menu-item unselected " @click="getOut">
      <el-icon class="icon">
        <CloseBold />
      </el-icon>
      <div class="title" v-if="isExpanded" style="white-space: nowrap;">退出登录</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { constantRoutes } from '../../router'

const isExpanded = ref(false);

const expandMenu = () => {
  isExpanded.value = true;
};

const shrinkMenu = () => {
  isExpanded.value = false;
  // 待动画结束后，触发窗口resize事件，使图表页面重新渲染
  setTimeout(() => {
    const event = new Event('resize');
    window.dispatchEvent(event);
  }, 500)
};

type route = {
  path: string,
  name: string,
  meta: JSON,
  hidden: boolean
}

const router = useRouter()
const activeIndex = ref(router.currentRoute.value.path.toLocaleLowerCase())

const routerList: any = ref([])
const list: any = constantRoutes
list[0].children.forEach((item: any) => {
  if (!item.hidden) {
    routerList.value.push(item)
  }
})

const goUrl = (item: route) => {
  activeIndex.value = item.path
  router.push(item.path)
}

const getOut = () => {
  localStorage.clear()
  router.push('/')
}
</script>

<style lang="scss" scoped>
.logout-item {
  position: absolute;
  bottom: 20px;
}

.logout {
  width: 50px;
  height: 40px;
  border-radius: 1rem;
  margin: 1rem;
  cursor: pointer;
  position: absolute;
  bottom: 10px;
  background-color: #E6E6E6;
}

.menu {
  background-color: #F3F3F3;
  margin: 0.5rem;
  width: 80px;
  height: calc(100vh - 1rem);
  border-radius: 1rem;
  transition: width 0.5s;

  .selected {
    background-color: #A8ABCC;

    .title {
      color: var(--el-bg-color);
    }
  }

  .unselected {
    background-color: #E6E6E6;
  }

  .unselected:hover {
    background-color: #D8D8D8;
  }

  .menu-item {
    width: 50px;
    height: 50px;
    border-radius: 25px;
    margin: 1rem;
    text-align: center;
    cursor: pointer;
    transition: width 0.5s;

    .icon {
      margin: 14px;
      font-size: 25px;
      color: rgb(23, 131, 239);
    }

    .title {
      position: absolute;
      line-height: 50px;
      font-size: 13px;
      margin-left: 60px;
    }
  }
}

.menu:hover {
  width: 220px;

  .menu-item {
    width: 180px;
    border-radius: 1rem;
  }
}
</style>