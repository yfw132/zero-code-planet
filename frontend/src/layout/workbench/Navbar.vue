<template>
  <!-- 工作台头部 -->
  <div class="workbench-header">
    <div class="header-content">
      <div class="header-left">
        <h1 class="workspace-title" @click="goHome">
          <el-icon class="title-icon"><Cpu /></el-icon>
          零码星球 - 工作台
        </h1>
        <p class="workspace-subtitle">让AI助力您的创意实现，一键生成专业项目</p>
      </div>
      <div class="header-right">
        <el-dropdown>
          <el-button circle :icon="User" class="user-avatar"></el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>个人设置</el-dropdown-item>
              <el-dropdown-item>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { User, Cpu } from "@element-plus/icons-vue";
import { useRouter } from "vue-router";
const router = useRouter();
const goHome = () => {
  router.push("/workbench");
};
</script>

<style lang="scss" scoped>
// 头部样式
.workbench-header {
  height: 75px;
  background: rgba(255, 255, 255, 0.2);
  padding: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;

    .workspace-title {
      font-size: 24px;
      cursor: pointer;
      line-height: 35px;
      font-weight: 700;
      color: #2c3e50;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 12px;

      .title-icon {
        font-size: 1.8rem;
        color: #667eea;
      }
    }

    .workspace-title:hover {
      color: #667eea;
    }

    .workspace-subtitle {
      color: #6c757d;
      margin: 0;
      font-size: 0.95rem;
    }
  }

  .header-right {
    .user-avatar {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
      }
    }
  }
}

@media (max-width: 768px) {
  .workbench-header {
    .header-content {
      flex-direction: column;
      gap: 16px;
      text-align: center;
    }
  }
}
</style>
