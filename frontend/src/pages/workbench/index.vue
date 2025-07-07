<template>
  <div class="workbench">
    <!-- 工作台头部 -->
    <div class="workbench-header">
      <div class="header-left">
        <h1 class="workspace-title">
          <el-icon><Cpu /></el-icon>
          AI 工作台
        </h1>
        <p class="workspace-subtitle">让AI助力您的创意实现</p>
      </div>
      <div class="header-right">
        <el-button type="primary" :icon="Plus" @click="showCreateDialog = true">
          新建项目
        </el-button>
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

    <!-- 主要工作区域 -->
    <div class="workbench-content">
      <!-- 左侧 - AI对话区域 -->
      <div class="chat-panel">
        <div class="panel-header">
          <h3>
            <el-icon><ChatRound /></el-icon>
            AI 助手
          </h3>
          <div class="panel-actions">
            <el-button text @click="clearChat">
              <el-icon><Delete /></el-icon>
              清空对话
            </el-button>
          </div>
        </div>

        <div class="chat-container">
          <div class="chat-messages" ref="chatMessages">
            <!-- 欢迎消息 -->
            <div
              class="message-item assistant-message"
              v-if="chatMessages.length === 0"
            >
              <div class="message-avatar">
                <el-icon><Cpu /></el-icon>
              </div>
              <div class="message-content">
                <div class="message-text">
                  👋
                  您好！我是AI助手，请描述您想要创建的应用程序，我会为您智能生成项目方案。
                </div>
              </div>
            </div>

            <!-- 对话消息 -->
            <div
              v-for="message in chatMessages"
              :key="message.id"
              class="message-item"
              :class="
                message.type === 'user' ? 'user-message' : 'assistant-message'
              "
            >
              <div class="message-avatar">
                <el-icon v-if="message.type === 'user'"><User /></el-icon>
                <el-icon v-else><Cpu /></el-icon>
              </div>
              <div class="message-content">
                <div class="message-text">{{ message.content }}</div>
                <div class="message-time">{{ message.timestamp }}</div>
              </div>
            </div>

            <!-- 加载状态 -->
            <div v-if="isGenerating" class="message-item assistant-message">
              <div class="message-avatar">
                <el-icon><Cpu /></el-icon>
              </div>
              <div class="message-content">
                <div class="message-text">
                  <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  AI正在为您生成项目方案...
                </div>
              </div>
            </div>
          </div>

          <div class="chat-input-area">
            <div class="input-container">
              <el-input
                v-model="inputMessage"
                type="textarea"
                :rows="3"
                placeholder="请详细描述您想要创建的应用程序，例如：我想创建一个在线电商平台，包含商品展示、购物车、用户管理等功能..."
                @keydown.ctrl.enter="sendMessage"
                class="message-input"
              />
              <div class="input-actions">
                <div class="input-tips">
                  <el-icon><InfoFilled /></el-icon>
                  Ctrl + Enter 发送
                </div>
                <el-button
                  type="primary"
                  @click="sendMessage"
                  :loading="isGenerating"
                  :disabled="!inputMessage.trim()"
                >
                  <el-icon><Position /></el-icon>
                  发送
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧 - 项目管理区域 -->
      <div class="projects-panel">
        <div class="panel-header">
          <h3>
            <el-icon><FolderOpened /></el-icon>
            我的项目
          </h3>
          <div class="panel-actions">
            <el-select
              v-model="projectFilter"
              placeholder="筛选状态"
              style="width: 120px"
            >
              <el-option label="全部" value="all"></el-option>
              <el-option label="进行中" value="active"></el-option>
              <el-option label="已完成" value="completed"></el-option>
            </el-select>
          </div>
        </div>

        <div class="projects-container">
          <div class="projects-grid">
            <div
              v-for="project in filteredProjects"
              :key="project.id"
              class="project-card"
              @click="openProject(project)"
            >
              <div class="project-header">
                <div class="project-icon">
                  <el-icon><component :is="project.icon" /></el-icon>
                </div>
                <div class="project-actions">
                  <el-dropdown @click.stop>
                    <el-button text :icon="MoreFilled" size="small"></el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item @click="editProject(project)">
                          <el-icon><Edit /></el-icon>
                          编辑
                        </el-dropdown-item>
                        <el-dropdown-item @click="duplicateProject(project)">
                          <el-icon><CopyDocument /></el-icon>
                          复制
                        </el-dropdown-item>
                        <el-dropdown-item
                          @click="deleteProject(project)"
                          divided
                        >
                          <el-icon><Delete /></el-icon>
                          删除
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </div>

              <div class="project-info">
                <h4 class="project-name">{{ project.name }}</h4>
                <p class="project-description">{{ project.description }}</p>

                <div class="project-meta">
                  <div class="project-status">
                    <el-tag
                      :type="
                        project.status === '已完成'
                          ? 'success'
                          : project.status === '进行中'
                          ? 'warning'
                          : 'info'
                      "
                      size="small"
                    >
                      {{ project.status }}
                    </el-tag>
                  </div>
                  <div class="project-date">
                    {{ formatDate(project.updatedAt) }}
                  </div>
                </div>

                <div class="project-progress">
                  <div class="progress-label">
                    <span>完成度</span>
                    <span>{{ project.progress }}%</span>
                  </div>
                  <el-progress
                    :percentage="project.progress"
                    :show-text="false"
                    :stroke-width="4"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建项目对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="创建新项目"
      width="600px"
      :before-close="handleDialogClose"
    >
      <el-form :model="newProject" label-width="100px">
        <el-form-item label="项目名称">
          <el-input
            v-model="newProject.name"
            placeholder="请输入项目名称"
          ></el-input>
        </el-form-item>
        <el-form-item label="项目描述">
          <el-input
            v-model="newProject.description"
            type="textarea"
            :rows="4"
            placeholder="请详细描述您的项目需求..."
          ></el-input>
        </el-form-item>
        <el-form-item label="项目类型">
          <el-select v-model="newProject.type" placeholder="选择项目类型">
            <el-option label="Web应用" value="web"></el-option>
            <el-option label="移动应用" value="mobile"></el-option>
            <el-option label="桌面应用" value="desktop"></el-option>
            <el-option label="API服务" value="api"></el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button type="primary" @click="createProject">创建项目</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  Cpu,
  Plus,
  User,
  ChatRound,
  Delete,
  Position,
  InfoFilled,
  FolderOpened,
  MoreFilled,
  Edit,
  CopyDocument,
  Monitor,
  Phone,
  TakeawayBox,
  Connection,
} from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";

const router = useRouter();

// 聊天相关
const chatMessages = ref<any[]>([]);
const inputMessage = ref("");
const isGenerating = ref(false);
const chatMessages_ref = ref();

// 项目相关
const projects = ref([
  {
    id: 1,
    name: "智能电商平台",
    description:
      "AI生成的现代化电商解决方案，包含用户管理、商品展示、订单处理等完整功能",
    status: "进行中",
    progress: 75,
    icon: "Monitor",
    updatedAt: new Date("2024-01-15"),
    createdAt: new Date("2024-01-10"),
  },
  {
    id: 2,
    name: "企业管理系统",
    description:
      "面向中小企业的综合管理平台，涵盖人事、财务、项目管理等核心业务",
    status: "已完成",
    progress: 100,
    icon: "TakeawayBox",
    updatedAt: new Date("2024-01-12"),
    createdAt: new Date("2024-01-05"),
  },
  {
    id: 3,
    name: "在线教育平台",
    description: "功能完善的在线学习系统，支持视频课程、在线测试、学习进度跟踪",
    status: "未开始",
    progress: 0,
    icon: "Phone",
    updatedAt: new Date("2024-01-08"),
    createdAt: new Date("2024-01-08"),
  },
]);

const projectFilter = ref("all");
const showCreateDialog = ref(false);
const newProject = ref({
  name: "",
  description: "",
  type: "",
});

// 计算属性
const filteredProjects = computed(() => {
  if (projectFilter.value === "all") return projects.value;
  return projects.value.filter((p) => {
    if (projectFilter.value === "active") return p.status === "进行中";
    if (projectFilter.value === "completed") return p.status === "已完成";
    return true;
  });
});

// 方法
const sendMessage = async () => {
  if (!inputMessage.value.trim()) return;

  const userMessage = {
    id: Date.now(),
    type: "user",
    content: inputMessage.value,
    timestamp: new Date().toLocaleTimeString(),
  };

  chatMessages.value.push(userMessage);
  const userInput = inputMessage.value;
  inputMessage.value = "";

  // 模拟AI回复
  isGenerating.value = true;
  await nextTick();
  scrollToBottom();

  setTimeout(() => {
    const aiMessage = {
      id: Date.now() + 1,
      type: "assistant",
      content: `我理解您想要创建"${userInput}"。基于您的描述，我建议使用以下技术栈：前端使用Vue.js + Element Plus，后端使用Node.js + Express，数据库使用MongoDB。项目将包含用户认证、数据管理、响应式设计等功能。是否需要我为您生成完整的项目代码？`,
      timestamp: new Date().toLocaleTimeString(),
    };
    chatMessages.value.push(aiMessage);
    isGenerating.value = false;
    scrollToBottom();
  }, 2000);
};

const clearChat = () => {
  chatMessages.value = [];
};

const scrollToBottom = () => {
  nextTick(() => {
    if (chatMessages_ref.value) {
      chatMessages_ref.value.scrollTop = chatMessages_ref.value.scrollHeight;
    }
  });
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString("zh-CN");
};

const openProject = (project: any) => {
  router.push(`/workbench/config?id=${project.id}`);
};

const editProject = (project: any) => {
  ElMessage.success("编辑项目功能开发中...");
};

const duplicateProject = (project: any) => {
  ElMessage.success("复制项目功能开发中...");
};

const deleteProject = (project: any) => {
  ElMessageBox.confirm("确定要删除这个项目吗？", "删除确认", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    const index = projects.value.findIndex((p) => p.id === project.id);
    if (index > -1) {
      projects.value.splice(index, 1);
      ElMessage.success("项目已删除");
    }
  });
};

const createProject = () => {
  if (!newProject.value.name.trim()) {
    ElMessage.warning("请输入项目名称");
    return;
  }

  const project = {
    id: Date.now(),
    name: newProject.value.name,
    description: newProject.value.description,
    status: "未开始",
    progress: 0,
    icon: "Monitor",
    updatedAt: new Date(),
    createdAt: new Date(),
  };

  projects.value.unshift(project);
  showCreateDialog.value = false;
  newProject.value = { name: "", description: "", type: "" };
  ElMessage.success("项目创建成功");
};

const handleDialogClose = () => {
  showCreateDialog.value = false;
};

onMounted(() => {
  // 初始化
});
</script>

<style scoped lang="scss">
.workbench {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

// 头部样式
.workbench-header {
  height: 64px;
  background: white;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;

    .workspace-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #2c3e50;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;

      .el-icon {
        color: #667eea;
      }
    }

    .workspace-subtitle {
      color: #7f8c8d;
      margin: 0;
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;

    .user-avatar {
      background: #667eea;
      color: white;
      border: none;

      &:hover {
        background: #5a6fd8;
      }
    }
  }
}

// 主要内容区域
.workbench-content {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  padding: 24px;
  overflow: hidden;
}

// 面板通用样式
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;

  h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: #2c3e50;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .panel-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

// 左侧聊天面板
.chat-panel {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  height: calc(100vh - 136px);

  .chat-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0;

    .message-item {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;

      .message-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .message-content {
        flex: 1;
        max-width: calc(100% - 48px);

        .message-text {
          background: #f8f9fa;
          padding: 12px 16px;
          border-radius: 12px;
          line-height: 1.5;
          word-wrap: break-word;
        }

        .message-time {
          font-size: 0.75rem;
          color: #95a5a6;
          margin-top: 4px;
        }
      }

      &.user-message {
        flex-direction: row-reverse;

        .message-avatar {
          background: #667eea;
          color: white;
        }

        .message-content .message-text {
          background: #667eea;
          color: white;
        }
      }

      &.assistant-message {
        .message-avatar {
          background: #e8f4fd;
          color: #409eff;
        }
      }
    }
  }

  .chat-input-area {
    border-top: 1px solid #e4e7ed;
    padding-top: 16px;

    .input-container {
      .message-input {
        margin-bottom: 12px;

        :deep(.el-textarea__inner) {
          border-radius: 8px;
          font-size: 14px;
          line-height: 1.5;
        }
      }

      .input-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .input-tips {
          font-size: 0.75rem;
          color: #95a5a6;
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }
    }
  }
}

// 右侧项目面板
.projects-panel {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  height: calc(100vh - 136px);

  .projects-container {
    flex: 1;
    overflow-y: auto;
  }

  .projects-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;

    .project-card {
      border: 1px solid #e4e7ed;
      border-radius: 8px;
      padding: 16px;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        border-color: #667eea;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
      }

      .project-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .project-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: linear-gradient(45deg, #667eea, #764ba2);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }

        .project-actions {
          opacity: 0;
          transition: opacity 0.3s ease;
        }
      }

      &:hover .project-actions {
        opacity: 1;
      }

      .project-info {
        .project-name {
          font-size: 1.1rem;
          font-weight: 600;
          color: #2c3e50;
          margin: 0 0 8px 0;
        }

        .project-description {
          color: #7f8c8d;
          font-size: 0.9rem;
          line-height: 1.4;
          margin: 0 0 12px 0;
        }

        .project-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;

          .project-date {
            font-size: 0.8rem;
            color: #95a5a6;
          }
        }

        .project-progress {
          .progress-label {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 4px;
            font-size: 0.8rem;
            color: #7f8c8d;
          }
        }
      }
    }
  }
}

// 打字动画
.typing-indicator {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-right: 8px;

  span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #409eff;
    animation: typing 1.4s infinite ease-in-out;

    &:nth-child(1) {
      animation-delay: -0.32s;
    }
    &:nth-child(2) {
      animation-delay: -0.16s;
    }
    &:nth-child(3) {
      animation-delay: 0s;
    }
  }
}

@keyframes typing {
  0%,
  80%,
  100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

// 响应式设计
@media (max-width: 1024px) {
  .workbench-content {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .chat-panel,
  .projects-panel {
    height: auto;
    min-height: 400px;
  }
}

@media (max-width: 768px) {
  .workbench-header {
    padding: 0 16px;

    .header-left {
      .workspace-title {
        font-size: 1.2rem;
      }

      .workspace-subtitle {
        display: none;
      }
    }
  }

  .workbench-content {
    padding: 16px;
  }

  .chat-panel,
  .projects-panel {
    padding: 16px;
  }
}
</style>
