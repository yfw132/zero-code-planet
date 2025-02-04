<template>
  <div class="index">
    <div class="main">
      <section class="welcome">
        <h2>欢迎来到<span class="title">零码星球</span>: 让创意触手可及</h2>
        <p>零码星球是一款革命性的零代码平台，旨在让每个人都能轻松构建强大的应用程序，无需编写任何代码。无论您是企业家、业务人员还是创意爱好者，零码星球都能帮助您将想法快速变为现实。</p>
      </section>
      <section class="projects">
        <div class="prpject-header">
          <span>我的项目</span>
          <el-button type="primary" :icon="Promotion">创建项目</el-button>
        </div>
        <div class="project-cards">
          <el-card class="project-card" v-for="project in projects" :key="project.id">
            <div class="project-header">
              <img src="https://chat.deepseek.com/favicon.svg" alt="Project Image" class="project-image" />
              <div class="project-name">{{ project.name }}</div>
              <!-- <span class="project-status">{{ project.status === '进行中' ? '🔴' : project.status === '已完成' ? '🟢' :
                '⚪' }}</span> -->
            </div>
            <div class="project-description">{{ project.description }}</div>
            <div class="project-footer">
              <el-tag>2024-04-23</el-tag>
              <el-button size="small">编辑项目</el-button>
            </div>
          </el-card>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Promotion } from '@element-plus/icons-vue'
import { ref, onMounted } from "vue";

const projects = ref([
  { id: 1, name: '项目A', description: '这是项目A的描述', status: '进行中' },
  { id: 2, name: '项目B用于测试文本溢出效果。', description: '这是项目B的描述同时也是一个很长的描述，用于测试文本溢出效果。', status: '已完成' },
  { id: 3, name: '项目C', description: '这是项目C的描述', status: '未开始' },
  { id: 3, name: '项目C', description: '这是项目C的描述', status: '未开始' },
  { id: 3, name: '项目C', description: '这是项目C的描述', status: '未开始' },
  { id: 3, name: '项目C', description: '这是项目C的描述', status: '未开始' },
]);
</script>

<style scoped lang="scss">
.index {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100vh;
  overflow: hidden;
  width: 100%;


  .main {
    max-width: 1200px;
    padding: 24px 48px;
    width: calc(100% - 96px);
  }

  .welcome {
    text-align: left;


    .title {
      color: #409eff;
      letter-spacing: 2px;
      margin: 0 4px;
    }
  }

  .projects {
    .prpject-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;

      span {
        font-size: 18px;
        font-weight: bold;
      }
    }

    .project-cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 16px;

      .project-header {
        display: flex;
        gap: 12px;

        .project-image {
          width: 48px;
          height: 48px;
          border-radius: 6px;
        }

        .project-name {
          padding: 4px 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }

      .project-description {
        margin: 8px 0 16px 0;
        font-size: 14px;
        color: #666;
        width: auto;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .project-footer {
        display: flex;
        justify-content: space-between;
      }
    }
  }
}
</style>
