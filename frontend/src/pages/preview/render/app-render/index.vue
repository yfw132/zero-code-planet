<template>
  <div class="admin-layout" :class="{ 'dark-mode': isDarkMode }">
    <!-- 顶部Header -->
    <el-header class="admin-header">
      <div class="header-left">
        <div class="logo">
          <el-icon class="logo-icon">
            <Platform />
          </el-icon>
          <span class="logo-text">{{ appSchema.appName }}</span>
        </div>
        <div class="breadcrumb-container">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item>首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentPageName }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
      </div>
      <div class="header-right">
        <el-tooltip content="主题切换" placement="bottom">
          <el-switch
            v-model="isDarkMode"
            class="theme-switch"
            :active-icon="Moon"
            :inactive-icon="Sunny"
            @change="toggleTheme"
          />
        </el-tooltip>
        <el-dropdown class="user-dropdown">
          <span class="user-info">
            <el-avatar :size="32" :src="userAvatar" />
            <span class="username">管理员</span>
            <el-icon class="arrow-down">
              <ArrowDown />
            </el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item :icon="User">个人中心</el-dropdown-item>
              <el-dropdown-item :icon="Setting">系统设置</el-dropdown-item>
              <el-dropdown-item divided :icon="SwitchButton"
                >退出登录</el-dropdown-item
              >
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>

    <!-- 主体容器 -->
    <el-container class="main-container">
      <!-- 左侧导航 -->
      <el-aside class="admin-sidebar" :width="sidebarWidth">
        <el-scrollbar class="sidebar-scrollbar">
          <el-menu
            :default-active="activeMenuIndex"
            :collapse="isCollapsed"
            :unique-opened="true"
            class="sidebar-menu"
            @select="handleMenuSelect"
          >
            <el-menu-item
              v-for="(page, index) in appSchema.pages"
              :key="page.pageName"
              :index="index.toString()"
            >
              <el-icon>
                <Document v-if="page.pageName.includes('用户')" />
                <Shop v-else-if="page.pageName.includes('产品')" />
                <ShoppingCart v-else-if="page.pageName.includes('订单')" />
                <EditPen v-else-if="page.pageName.includes('文章')" />
                <Avatar v-else-if="page.pageName.includes('员工')" />
                <PieChart v-else />
              </el-icon>
              <template #title>{{ page.pageName }}</template>
            </el-menu-item>
          </el-menu>
        </el-scrollbar>
        <div class="sidebar-footer">
          <el-button
            class="collapse-btn"
            :icon="isCollapsed ? Expand : Fold"
            @click="toggleSidebar"
            link
          />
        </div>
      </el-aside>

      <!-- 右侧主内容 -->
      <el-main class="admin-main">
        <div class="main-header">
          <div class="page-title">
            <h2>{{ currentPageName }}</h2>
            <p class="page-description">{{ currentPageDescription }}</p>
          </div>
          <div class="page-actions">
            <el-button :icon="Refresh" @click="refreshPage" circle />
            <el-button :icon="FullScreen" @click="toggleFullscreen" circle />
          </div>
        </div>

        <!-- 页面内容区域 -->
        <div class="page-content">
          <PageRender />
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  Platform,
  ArrowDown,
  User,
  Setting,
  SwitchButton,
  Document,
  PieChart,
  Refresh,
  FullScreen,
  Expand,
  Fold,
  Moon,
  Sunny,
  Shop,
  ShoppingCart,
  EditPen,
  Avatar,
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

import PageRender from "../page-render/index.vue";
import { testAppSchema, DEFAULT_APP_ID, DEFAULT_PAGE_ID } from "../../test";

const route = useRoute();
const router = useRouter();

// 应用数据
const appSchema = testAppSchema;

// 响应式状态
const isDarkMode = ref(false);
const isCollapsed = ref(false);
const userAvatar = ref(
  "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
);

// 计算属性
const currentPageName = computed(() => {
  const pageId = (route.params.pageId as string) || DEFAULT_PAGE_ID;

  // 根据pageId找到对应的页面名称
  const page = appSchema.pages.find((p) => p.pageid === pageId);
  return page ? page.pageName : appSchema.pages[0].pageName;
});

const currentPageDescription = computed(() => {
  const currentPage = appSchema.pages.find(
    (page) => page.pageName === currentPageName.value
  );
  return currentPage?.description || "";
});

const activeMenuIndex = computed(() => {
  const pageId = (route.params.pageId as string) || DEFAULT_PAGE_ID;
  const index = appSchema.pages.findIndex((page) => page.pageid === pageId);
  return index >= 0 ? index.toString() : "0";
});

const sidebarWidth = computed(() => {
  return isCollapsed.value ? "64px" : "200px";
});

// 方法
const toggleTheme = (isInit = false) => {
  document.documentElement.classList.toggle("dark", isDarkMode.value);
  saveTheme();
  if (!isInit) {
    ElMessage.success(
      isDarkMode.value ? "已切换到暗黑主题" : "已切换到明亮主题"
    );
  }
};

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};

const handleMenuSelect = (index: string) => {
  const selectedPage = appSchema.pages[parseInt(index)];
  if (selectedPage) {
    const appId = (route.params.appId as string) || DEFAULT_APP_ID;
    router.push({
      path: `/preview/${appId}/${selectedPage.pageid}`,
    });
  }
};

const refreshPage = () => {
  ElMessage.success("页面已刷新");
  // 这里可以添加刷新逻辑
};

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
};

// 初始化主题
onMounted(() => {
  // 检查本地存储的主题设置
  const savedTheme = localStorage.getItem("admin-theme");
  if (savedTheme === "dark") {
    isDarkMode.value = true;
    toggleTheme(true);
  }
});

// 监听主题变化并保存到本地存储
const saveTheme = () => {
  localStorage.setItem("admin-theme", isDarkMode.value ? "dark" : "light");
};
</script>

<style scoped lang="scss">
.admin-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;

  &.dark-mode {
    --el-bg-color: #1f2937;
    --el-text-color-primary: #f3f4f6;
    --el-border-color: #374151;
  }
}

.admin-header {
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 64px;

  .header-left {
    display: flex;
    align-items: center;
    gap: 32px;

    .logo {
      display: flex;
      align-items: center;
      gap: 8px;

      .logo-icon {
        font-size: 24px;
        color: var(--el-color-primary);
      }

      .logo-text {
        font-size: 18px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }
    }

    .breadcrumb-container {
      .el-breadcrumb {
        font-size: 14px;
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;

    .theme-switch {
      --el-switch-on-color: var(--el-color-primary);
    }

    .user-dropdown {
      cursor: pointer;

      .user-info {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border-radius: 8px;
        transition: all 0.3s;

        &:hover {
          background: var(--el-fill-color-light);
        }

        .username {
          font-size: 14px;
          color: var(--el-text-color-primary);
        }

        .arrow-down {
          font-size: 12px;
          color: var(--el-text-color-secondary);
        }
      }
    }
  }
}

.main-container {
  flex: 1;
  height: calc(100vh - 64px);
}

.admin-sidebar {
  background: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color);
  transition: width 0.3s;
  display: flex;
  flex-direction: column;

  .sidebar-scrollbar {
    flex: 1;
    overflow-y: auto;

    .sidebar-menu {
      border-right: none;

      .el-menu-item {
        height: 48px;
        line-height: 48px;

        &:hover {
          background: var(--el-color-primary-light-9);
        }

        &.is-active {
          background: var(--el-color-primary-light-8);
          color: var(--el-color-primary);
          border-right: 2px solid var(--el-color-primary);
        }
      }
    }
  }

  .sidebar-footer {
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 16px;
    border-top: 1px solid var(--el-border-color-lighter);
    flex-shrink: 0;

    .collapse-btn {
      color: var(--el-text-color-secondary);

      &:hover {
        color: var(--el-color-primary);
      }
    }
  }
}

.admin-main {
  padding: 0;
  background: #f5f7fa;
  overflow: hidden;

  .main-header {
    background: white;
    padding: 16px 24px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    display: flex;
    align-items: center;
    justify-content: space-between;

    .page-title {
      display: flex;
      align-items: center;
      gap: 4px;
      height: 48px;

      h2 {
        margin: 0 0 4px 0;
        font-size: 20px;
        color: var(--el-text-color-primary);
      }

      .page-description {
        margin: 0;
        font-size: 14px;
        color: var(--el-text-color-secondary);
      }
    }

    .page-actions {
      display: flex;
      gap: 8px;

      .el-button {
        color: var(--el-text-color-secondary);

        &:hover {
          color: var(--el-color-primary);
        }
      }
    }
  }

  .page-content {
    height: calc(100% - 80px);
    overflow-y: auto;
  }
}

// 暗黑主题样式
.dark-mode {
  .admin-main {
    background: #111827;

    .main-header {
      background: var(--el-bg-color);
      border-bottom-color: var(--el-border-color);
    }
  }

  .page-content {
    background: #111827;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .admin-header {
    padding: 0 16px;

    .header-left {
      gap: 16px;

      .breadcrumb-container {
        display: none;
      }
    }
  }

  .admin-sidebar {
    position: fixed;
    top: 64px;
    left: 0;
    height: calc(100vh - 64px);
    z-index: 1000;
    transform: translateX(-100%);
    transition: transform 0.3s;

    &.mobile-open {
      transform: translateX(0);
    }
  }

  .admin-main {
    margin-left: 0;
    width: 100%;
  }
}
</style>
