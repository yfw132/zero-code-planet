<template>
  <div class="workbench">
    <!-- AI项目生成区域 -->
    <div class="ai-generation-section">
      <div class="generation-card">
        <div class="card-header">
          <div class="header-icon">
            <el-icon><MagicStick /></el-icon>
          </div>
          <div class="header-text">
            <h3>AI 智能项目生成</h3>
            <p>描述您的项目需求，AI将为您生成完整的项目方案</p>
          </div>
        </div>

        <div class="generation-form">
          <div class="input-group">
            <label class="input-label">项目名称</label>
            <el-input
              v-model="projectName"
              placeholder="请输入您想要创建的项目名称，例如：智能电商平台、企业管理系统..."
              class="project-input"
              size="large"
            >
              <template #prefix>
                <el-icon><Edit /></el-icon>
              </template>
            </el-input>
          </div>

          <div class="input-group">
            <label class="input-label">项目描述 (可选)</label>
            <el-input
              v-model="projectDescription"
              type="textarea"
              :rows="3"
              placeholder="详细描述您的项目需求和功能..."
              class="project-description"
            />
          </div>

          <div class="generation-actions">
            <el-button
              type="primary"
              size="large"
              @click="generateProject"
              :loading="isGenerating"
              class="generate-btn"
              :disabled="isGenerating"
            >
              <el-icon><MagicStick /></el-icon>
              {{ isGenerating ? "AI正在生成中..." : "开始AI生成" }}
            </el-button>
            <el-button
              size="large"
              @click="showQuickStart = true"
              class="demo-btn"
              :disabled="isGenerating"
            >
              <el-icon><VideoPlay /></el-icon>
              查看演示
            </el-button>
          </div>

          <!-- 生成进度展示 -->
          <div v-if="isGenerating" class="generation-progress">
            <div class="progress-header">
              <h4>AI正在为您生成项目</h4>
              <p>预计总耗时：1-2分钟</p>
            </div>

            <div class="steps-container">
              <div
                v-for="(step, index) in generationSteps"
                :key="step.id"
                class="step-item"
                :class="{
                  'step-active': currentStep === step.id,
                  'step-completed': currentStep > step.id,
                  'step-pending': currentStep < step.id,
                }"
              >
                <div class="step-icon">
                  <el-icon v-if="currentStep > step.id"><Check /></el-icon>
                  <el-icon v-else-if="currentStep === step.id"
                    ><Loading
                  /></el-icon>
                  <span v-else>{{ step.id }}</span>
                </div>
                <div class="step-content">
                  <div class="step-name">{{ step.name }}</div>
                  <div class="step-description">{{ step.description }}</div>
                  <div class="step-duration">{{ step.duration }}</div>
                </div>
                <div v-if="currentStep === step.id" class="step-loading">
                  <el-progress
                    type="circle"
                    :percentage="100"
                    :width="20"
                    :show-text="false"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 项目列表区域 -->
    <div class="projects-section">
      <div class="section-header">
        <div class="header-left">
          <h2>我的项目</h2>
          <span class="project-count">共 {{ projects.length }} 个项目</span>
        </div>
        <div class="header-right">
          <el-select
            v-model="projectFilter"
            placeholder="筛选状态"
            style="width: 120px; margin-right: 12px"
          >
            <el-option label="全部" value="all"></el-option>
            <el-option label="进行中" value="active"></el-option>
            <el-option label="已完成" value="completed"></el-option>
            <el-option label="未开始" value="pending"></el-option>
          </el-select>
          <el-button
            type="primary"
            :icon="Plus"
            @click="showCreateDialog = true"
          >
            新建项目
          </el-button>
        </div>
      </div>

      <div v-loading="loading" class="projects-grid">
        <el-card
          v-for="project in filteredProjects"
          :key="project.id"
          class="project-card"
          @click="openProject(project)"
        >
          <div class="project-header">
            <div class="project-icon">
              <el-icon><component :is="project.icon" /></el-icon>
            </div>
            <div class="project-name">{{ project.name }}</div>
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
                    <el-dropdown-item @click="deleteProject(project)" divided>
                      <el-icon><Delete /></el-icon>
                      删除
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>

          <div class="project-description">{{ project.description }}</div>

          <div class="project-footer">
            <div class="project-meta">
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
              <span class="project-date">{{
                formatDate(project.updatedAt)
              }}</span>
            </div>
            <div class="project-progress">
              <div class="progress-info">
                <span class="progress-text">{{ project.progress }}%</span>
                <el-progress
                  :percentage="project.progress"
                  :show-text="false"
                  :stroke-width="4"
                  class="progress-bar"
                />
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 创建项目对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="手动创建项目"
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

    <!-- 快速开始指导 -->
    <el-dialog v-model="showQuickStart" title="快速开始指导" width="800px">
      <div class="quick-start-content">
        <div class="steps">
          <div class="step">
            <div class="step-icon">
              <el-icon><Edit /></el-icon>
            </div>
            <div class="step-content">
              <h4>1. 输入项目名称</h4>
              <p>在输入框中描述您想要创建的项目</p>
            </div>
          </div>
          <div class="step">
            <div class="step-icon">
              <el-icon><MagicStick /></el-icon>
            </div>
            <div class="step-content">
              <h4>2. AI智能生成</h4>
              <p>点击生成按钮，AI会为您创建完整的项目方案</p>
            </div>
          </div>
          <div class="step">
            <div class="step-icon">
              <el-icon><Check /></el-icon>
            </div>
            <div class="step-content">
              <h4>3. 获取项目</h4>
              <p>获得完整的项目代码和部署方案</p>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="showQuickStart = false"
            >我知道了</el-button
          >
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import {
  Plus,
  MagicStick,
  Edit,
  VideoPlay,
  MoreFilled,
  CopyDocument,
  Delete,
  Check,
  Loading,
} from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getAppList,
  createApp,
  deleteApp,
  cloneApp,
  type AppItem,
} from "@/api/app";

import { AppGenerator } from "@/utils/model-talk";

// 前端项目显示类型
interface ProjectItem {
  id: string; // 对应后端的appid
  name: string; // 对应后端的appName
  description: string;
  status: "进行中" | "已完成" | "未开始";
  progress: number;
  icon: string;
  updatedAt: Date;
  createdAt: Date;
  appid: string; // 保留原始appid
}

// 状态映射
const statusMap = {
  draft: "未开始",
  published: "已完成",
  archived: "进行中",
} as const;

// 数据转换函数
const convertAppToProject = (app: AppItem): ProjectItem => {
  return {
    id: app.appid,
    name: app.appName,
    description: app.description || "",
    status: statusMap[app.status] || "未开始",
    progress:
      app.status === "published" ? 100 : app.status === "archived" ? 75 : 0,
    icon: "Monitor",
    updatedAt: new Date(app.updatedAt),
    createdAt: new Date(app.createdAt),
    appid: app.appid,
  };
};

// AI生成相关
const projectName = ref("");
const projectDescription = ref("");
const isGenerating = ref(false);
const showQuickStart = ref(false);

// 新增：生成步骤相关
const currentStep = ref(0);
const generationSteps = ref([
  {
    id: 1,
    name: "创建应用基础",
    description: "正在创建项目基础信息...",
    duration: "约10秒",
  },
  {
    id: 2,
    name: "生成数据源",
    description: "AI正在分析需求并生成数据源...",
    duration: "45-90秒",
  },
  {
    id: 3,
    name: "生成页面",
    description: "AI正在生成页面布局和组件...",
    duration: "30-60秒",
  },
  { id: 4, name: "完成创建", description: "项目创建完成！", duration: "约3秒" },
]);

// 项目相关
const projects = ref<ProjectItem[]>([]);
const loading = ref(false);

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
    if (projectFilter.value === "pending") return p.status === "未开始";
    return true;
  });
});

// 加载项目列表
const loadProjects = async () => {
  try {
    loading.value = true;
    const response = await getAppList();
    projects.value = response.apps.map(convertAppToProject);
  } catch (error) {
    ElMessage.error("加载项目列表失败");
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// AI生成项目
const generateProject = async () => {
  if (!projectName.value.trim()) {
    ElMessage.warning("请输入项目名称");
    return;
  }

  isGenerating.value = true;
  currentStep.value = 0;

  try {
    const appConfig = {
      appName: projectName.value,
      description:
        projectDescription.value || `AI生成的${projectName.value}项目`,
      dataSourceCount: 6,
      pageCount: 6,
    };
    const newApp = new AppGenerator();

    // 步骤1: 创建应用
    currentStep.value = 1;
    await newApp.createApp(appConfig);

    // 步骤2: 生成并创建数据源
    setTimeout(() => {
      // 不阻塞实际的AI任务，假装过了十秒再进行下一步
      currentStep.value = 2;
    }, 10000);
    await newApp.generateAndCreateDataSources(appConfig);

    // 步骤3: 生成并创建页面
    currentStep.value = 3;
    await newApp.generateAndCreatePages(appConfig);

    // 步骤4: 完成
    currentStep.value = 4;
    ElMessage.success("项目创建成功，请在项目列表中查看");
    // 加载项目列表
    loadProjects();
  } catch (error) {
    ElMessage.error("项目生成失败");
    console.error(error);
  } finally {
    // 等待3秒重置状态
    await new Promise((resolve) => setTimeout(resolve, 3000));
    isGenerating.value = false;
    currentStep.value = 0;
  }
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString("zh-CN");
};

const openProject = (project: ProjectItem) => {
  // 使用真实的appid打开项目
  window.open(`/preview/${project.appid}`, "_blank");
};

const editProject = (project: ProjectItem) => {
  console.log(project);
  ElMessage.success("编辑项目功能开发中...");
};

const duplicateProject = async (project: ProjectItem) => {
  try {
    const clonedApp = await cloneApp(project.appid, {
      newAppName: `${project.name} (副本)`,
    });

    const clonedProject = convertAppToProject(clonedApp);
    projects.value.unshift(clonedProject);
    ElMessage.success("项目复制成功");
  } catch (error) {
    ElMessage.error("复制项目失败");
    console.error(error);
  }
};

const deleteProject = (project: ProjectItem) => {
  ElMessageBox.confirm("确定要删除这个项目吗？", "删除确认", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    try {
      await deleteApp(project.appid);
      const index = projects.value.findIndex((p) => p.id === project.id);
      if (index > -1) {
        projects.value.splice(index, 1);
        ElMessage.success("项目已删除");
      }
    } catch (error) {
      ElMessage.error("删除项目失败");
      console.error(error);
    }
  });
};

const createProject = async () => {
  if (!newProject.value.name.trim()) {
    ElMessage.warning("请输入项目名称");
    return;
  }

  try {
    const newApp = await createApp({
      appName: newProject.value.name,
      description: newProject.value.description,
    });

    const project = convertAppToProject(newApp);
    projects.value.unshift(project);
    showCreateDialog.value = false;
    newProject.value = { name: "", description: "", type: "" };
    ElMessage.success("项目创建成功");
  } catch (error) {
    ElMessage.error("创建项目失败");
    console.error(error);
  }
};

const handleDialogClose = () => {
  showCreateDialog.value = false;
};

onMounted(() => {
  // 加载项目列表
  loadProjects();
});
</script>

<style scoped lang="scss">
// AI生成区域
.ai-generation-section {
  margin-bottom: 48px;

  .generation-card {
    background: white;
    border-radius: 12px;
    padding: 32px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: 1px solid #e9ecef;

    .card-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 32px;

      .header-icon {
        width: 48px;
        height: 48px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 24px;
      }

      .header-text {
        h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #2c3e50;
          margin: 0 0 8px 0;
        }

        p {
          color: #6c757d;
          margin: 0;
          font-size: 0.95rem;
        }
      }
    }

    .generation-form {
      .input-group {
        margin-bottom: 24px;

        .input-label {
          display: block;
          font-weight: 600;
          color: #495057;
          margin-bottom: 8px;
          font-size: 0.95rem;
        }

        .project-input {
          :deep(.el-input__inner) {
            height: 48px;
            // border-radius: 8px;
            // border: 2px solid #e9ecef;
            font-size: 1rem;

            &:focus {
              border-color: #667eea;
              // box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
            }
          }
        }

        .project-description {
          :deep(.el-textarea__inner) {
            border-radius: 8px;
            border: 2px solid #e9ecef;
            font-size: 0.95rem;

            &:focus {
              border-color: #667eea;
              box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
            }
          }
        }
      }

      .generation-actions {
        display: flex;
        gap: 16px;

        .generate-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          padding: 12px 32px;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 8px;
          transition: all 0.3s ease;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
          }
        }

        .demo-btn {
          background: rgba(102, 126, 234, 0.1);
          border: 2px solid rgba(102, 126, 234, 0.3);
          color: #667eea;
          padding: 10px 32px;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 8px;
          transition: all 0.3s ease;

          &:hover {
            background: rgba(102, 126, 234, 0.2);
            transform: translateY(-2px);
          }
        }
      }

      // 生成进度展示样式
      .generation-progress {
        margin-top: 32px;
        padding: 24px;
        background: linear-gradient(
          135deg,
          rgba(102, 126, 234, 0.05) 0%,
          rgba(118, 75, 162, 0.05) 100%
        );
        border-radius: 12px;
        border: 1px solid rgba(102, 126, 234, 0.1);

        .progress-header {
          text-align: center;
          margin-bottom: 24px;

          h4 {
            font-size: 1.2rem;
            font-weight: 600;
            color: #2c3e50;
            margin: 0 0 8px 0;
          }

          p {
            color: #6c757d;
            margin: 0;
            font-size: 0.9rem;
          }
        }

        .steps-container {
          display: flex;
          flex-direction: column;
          gap: 16px;

          .step-item {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 16px;
            border-radius: 8px;
            transition: all 0.3s ease;
            position: relative;

            &.step-pending {
              background: rgba(255, 255, 255, 0.5);
              opacity: 0.6;

              .step-icon {
                background: #e9ecef;
                color: #6c757d;
              }

              .step-content {
                .step-name {
                  color: #6c757d;
                }

                .step-description {
                  color: #adb5bd;
                }

                .step-duration {
                  color: #adb5bd;
                }
              }
            }

            &.step-active {
              background: rgba(102, 126, 234, 0.1);
              border: 1px solid rgba(102, 126, 234, 0.2);

              .step-icon {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                animation: pulse 2s infinite;
              }

              .step-content {
                .step-name {
                  color: #667eea;
                  font-weight: 600;
                }

                .step-description {
                  color: #495057;
                }

                .step-duration {
                  color: #667eea;
                  font-weight: 500;
                }
              }
            }

            &.step-completed {
              background: rgba(40, 167, 69, 0.1);
              border: 1px solid rgba(40, 167, 69, 0.2);

              .step-icon {
                background: #28a745;
                color: white;
              }

              .step-content {
                .step-name {
                  color: #28a745;
                  font-weight: 600;
                }

                .step-description {
                  color: #495057;
                }

                .step-duration {
                  color: #28a745;
                  font-weight: 500;
                }
              }
            }

            .step-icon {
              width: 32px;
              height: 32px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 14px;
              font-weight: 600;
              flex-shrink: 0;
              transition: all 0.3s ease;
            }

            .step-content {
              flex: 1;

              .step-name {
                font-size: 1rem;
                font-weight: 600;
                margin-bottom: 4px;
                transition: color 0.3s ease;
              }

              .step-description {
                font-size: 0.9rem;
                color: #6c757d;
                margin-bottom: 4px;
                transition: color 0.3s ease;
              }

              .step-duration {
                font-size: 0.8rem;
                color: #adb5bd;
                transition: color 0.3s ease;
              }
            }

            .step-loading {
              flex-shrink: 0;
            }
          }
        }
      }
    }
  }
}

// 脉冲动画
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(102, 126, 234, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(102, 126, 234, 0);
  }
}

// 项目列表区域
.projects-section {
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;

      h2 {
        font-size: 1.5rem;
        font-weight: 600;
        color: #2c3e50;
        margin: 0;
      }

      .project-count {
        background: #e9ecef;
        color: #6c757d;
        padding: 4px 12px;
        border-radius: 16px;
        font-size: 0.85rem;
        font-weight: 500;
      }
    }

    .header-right {
      display: flex;
      align-items: center;
    }
  }

  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 24px;

    .project-card {
      cursor: pointer;
      transition: all 0.3s ease;
      border: 1px solid #e9ecef;
      border-radius: 12px;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        border-color: #667eea;

        .project-actions {
          opacity: 1;
        }
      }

      .project-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;

        .project-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 20px;
          flex-shrink: 0;
        }

        .project-name {
          flex: 1;
          font-size: 1.1rem;
          font-weight: 600;
          color: #2c3e50;
          line-height: 1.4;
        }

        .project-actions {
          opacity: 0;
          transition: opacity 0.3s ease;
        }
      }

      .project-description {
        color: #6c757d;
        font-size: 0.9rem;
        line-height: 1.5;
        margin-bottom: 20px;
        display: -webkit-box;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .project-footer {
        .project-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;

          .project-date {
            color: #adb5bd;
            font-size: 0.85rem;
          }
        }

        .project-progress {
          .progress-info {
            display: flex;
            align-items: center;
            gap: 12px;

            .progress-text {
              font-size: 0.85rem;
              color: #6c757d;
              font-weight: 500;
              min-width: 35px;
            }

            .progress-bar {
              flex: 1;
            }
          }
        }
      }
    }
  }
}

// 快速开始指导样式
.quick-start-content {
  .steps {
    display: flex;
    flex-direction: column;
    gap: 24px;

    .step {
      display: flex;
      align-items: center;
      gap: 16px;

      .step-icon {
        width: 48px;
        height: 48px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 20px;
        flex-shrink: 0;
      }

      .step-content {
        h4 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #2c3e50;
          margin: 0 0 8px 0;
        }

        p {
          color: #6c757d;
          margin: 0;
          font-size: 0.9rem;
        }
      }
    }
  }
}
</style>
