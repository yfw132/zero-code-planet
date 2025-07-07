<template>
  <div class="ai-homepage">
    <!-- 主要内容区域 -->
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">
            <span class="gradient-text">AI 智能生成</span>
            <br />让创意瞬间成真
          </h1>
          <p class="hero-description">
            基于先进的人工智能技术，只需描述您的想法，我们就能为您生成完整的项目方案。
            从概念到实现，让AI成为您的创意伙伴。
          </p>
          <div class="hero-actions">
            <el-button
              type="primary"
              size="large"
              class="create-btn"
              @click="startAiGeneration"
            >
              <el-icon><MagicStick /></el-icon>
              开始AI生成
            </el-button>
            <el-button size="large" class="demo-btn" @click="viewDemo">
              <el-icon><VideoPlay /></el-icon>
              观看演示
            </el-button>
          </div>
        </div>
        <div class="hero-visual">
          <div class="ai-brain-container">
            <div class="ai-brain">
              <div class="brain-core"></div>
              <div class="brain-wave wave-1"></div>
              <div class="brain-wave wave-2"></div>
              <div class="brain-wave wave-3"></div>
            </div>
            <div class="floating-elements">
              <div
                class="float-item"
                v-for="item in floatingItems"
                :key="item.id"
                :style="item.style"
              >
                <el-icon :size="item.size"
                  ><component :is="item.icon"
                /></el-icon>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- AI能力展示区域 -->
    <div class="capabilities-section">
      <div class="section-header">
        <h2>AI 核心能力</h2>
        <p>强大的AI算法，为您提供智能化的项目生成体验</p>
      </div>
      <div class="capabilities-grid">
        <div
          class="capability-card"
          v-for="capability in capabilities"
          :key="capability.id"
        >
          <div class="capability-icon">
            <el-icon :size="32"><component :is="capability.icon" /></el-icon>
          </div>
          <h3>{{ capability.title }}</h3>
          <p>{{ capability.description }}</p>
        </div>
      </div>
    </div>

    <!-- 项目展示区域 -->
    <div class="projects-section">
      <div class="section-header">
        <h2>最近生成的项目</h2>
        <p>查看AI为其他用户生成的精彩项目</p>
      </div>
      <div class="projects-grid">
        <div
          class="project-card"
          v-for="project in recentProjects"
          :key="project.id"
        >
          <div class="project-image">
            <img :src="project.image" :alt="project.name" />
            <div class="project-overlay">
              <el-button
                type="primary"
                size="small"
                @click="viewProject(project)"
              >
                查看详情
              </el-button>
            </div>
          </div>
          <div class="project-info">
            <h3>{{ project.name }}</h3>
            <p>{{ project.description }}</p>
            <div class="project-meta">
              <el-tag size="small" type="info">{{ project.category }}</el-tag>
              <span class="project-time">{{ project.createdAt }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 快速开始区域 -->
    <div class="quick-start-section">
      <div class="quick-start-content">
        <h2>准备好开始了吗？</h2>
        <p>只需三步，让AI为您生成专属项目</p>
        <div class="steps">
          <div class="step" v-for="(step, index) in quickSteps" :key="step.id">
            <div class="step-number">{{ index + 1 }}</div>
            <div class="step-content">
              <h4>{{ step.title }}</h4>
              <p>{{ step.description }}</p>
            </div>
          </div>
        </div>
        <el-button
          type="primary"
          size="large"
          class="start-now-btn"
          @click="startAiGeneration"
        >
          立即开始
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { MagicStick, VideoPlay } from "@element-plus/icons-vue";

const router = useRouter();

// 浮动元素数据
const floatingItems = ref([
  {
    id: 1,
    icon: "Lightning",
    size: 20,
    style: { top: "20%", left: "10%", animationDelay: "0s" },
  },
  {
    id: 2,
    icon: "Cpu",
    size: 16,
    style: { top: "60%", left: "15%", animationDelay: "1s" },
  },
  {
    id: 3,
    icon: "DataAnalysis",
    size: 18,
    style: { top: "30%", right: "20%", animationDelay: "2s" },
  },
  {
    id: 4,
    icon: "Setting",
    size: 14,
    style: { top: "70%", right: "10%", animationDelay: "3s" },
  },
]);

// AI能力数据
const capabilities = ref([
  {
    id: 1,
    icon: "Lightning",
    title: "闪电生成",
    description: "基于先进的GPT模型，几秒钟内生成完整项目架构和代码结构",
  },
  {
    id: 2,
    icon: "Cpu",
    title: "智能分析",
    description: "深度理解需求，自动选择最适合的技术栈和设计模式",
  },
  {
    id: 3,
    icon: "DataAnalysis",
    title: "数据驱动",
    description: "基于海量项目数据训练，确保生成方案的可行性和最佳实践",
  },
  {
    id: 4,
    icon: "Setting",
    title: "个性定制",
    description: "根据您的偏好和需求，提供高度个性化的项目生成方案",
  },
]);

// 最近项目数据
const recentProjects = ref([
  {
    id: 1,
    name: "智能电商平台",
    description:
      "AI生成的现代化电商解决方案，包含用户管理、商品展示、订单处理等完整功能",
    category: "电商",
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
    createdAt: "2小时前",
  },
  {
    id: 2,
    name: "企业管理系统",
    description:
      "面向中小企业的综合管理平台，涵盖人事、财务、项目管理等核心业务",
    category: "企业管理",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
    createdAt: "1天前",
  },
  {
    id: 3,
    name: "在线教育平台",
    description: "功能完善的在线学习系统，支持视频课程、在线测试、学习进度跟踪",
    category: "教育",
    image:
      "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400&h=300&fit=crop",
    createdAt: "3天前",
  },
]);

// 快速开始步骤
const quickSteps = ref([
  {
    id: 1,
    title: "描述需求",
    description: "用自然语言描述您的项目想法和需求",
  },
  {
    id: 2,
    title: "AI分析",
    description: "AI智能分析并生成最佳的项目方案",
  },
  {
    id: 3,
    title: "获取项目",
    description: "获得完整的项目代码和部署方案",
  },
]);

// 方法
const startAiGeneration = () => {
  router.push("/workbench");
};

const viewDemo = () => {
  router.push("/workbench");
};

const viewProject = (project: any) => {
  router.push(`/preview?id=${project.id}`);
};

onMounted(() => {
  // 添加入场动画
  document.querySelector(".hero-section")?.classList.add("animate-in");
});
</script>

<style scoped lang="scss">
.ai-homepage {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow-x: hidden;
}

// 英雄区域
.hero-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 0 48px;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(
        circle at 20% 20%,
        rgba(255, 255, 255, 0.1) 0%,
        transparent 50%
      ),
      radial-gradient(
        circle at 80% 80%,
        rgba(255, 255, 255, 0.1) 0%,
        transparent 50%
      );
    pointer-events: none;
  }
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
  z-index: 1;
  position: relative;
}

.hero-text {
  color: white;

  .hero-title {
    font-size: 3.5rem;
    font-weight: 700;
    line-height: 1.2;
    margin-bottom: 24px;

    .gradient-text {
      background: linear-gradient(45deg, #ffd700, #ffb347);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }

  .hero-description {
    font-size: 1.2rem;
    line-height: 1.8;
    opacity: 0.9;
    margin-bottom: 40px;
  }

  .hero-actions {
    display: flex;
    gap: 16px;

    .create-btn {
      background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
      border: none;
      padding: 16px 32px;
      font-size: 1.1rem;
      font-weight: 600;
      border-radius: 12px;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
      }
    }

    .demo-btn {
      background: rgba(255, 255, 255, 0.1);
      border: 2px solid rgba(255, 255, 255, 0.3);
      color: white;
      padding: 14px 32px;
      font-size: 1.1rem;
      font-weight: 600;
      border-radius: 12px;
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateY(-2px);
      }
    }
  }
}

// AI大脑动画
.hero-visual {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 500px;
  position: relative;
}

.ai-brain-container {
  position: relative;
  width: 300px;
  height: 300px;
}

.ai-brain {
  position: absolute;
  width: 200px;
  height: 200px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  .brain-core {
    width: 100%;
    height: 100%;
    background: linear-gradient(45deg, #667eea, #764ba2);
    border-radius: 50%;
    box-shadow: 0 0 50px rgba(102, 126, 234, 0.6);
    animation: pulse 2s ease-in-out infinite alternate;
  }

  .brain-wave {
    position: absolute;
    top: 50%;
    left: 50%;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    animation: wave 3s ease-in-out infinite;

    &.wave-1 {
      width: 120%;
      height: 120%;
      animation-delay: 0s;
    }

    &.wave-2 {
      width: 140%;
      height: 140%;
      animation-delay: 1s;
    }

    &.wave-3 {
      width: 160%;
      height: 160%;
      animation-delay: 2s;
    }
  }
}

.floating-elements {
  position: absolute;
  width: 100%;
  height: 100%;

  .float-item {
    position: absolute;
    color: rgba(255, 255, 255, 0.8);
    animation: float 4s ease-in-out infinite;
  }
}

// 内容区域
.capabilities-section,
.projects-section {
  padding: 100px 48px;
  background: white;
  position: relative;
  z-index: 1;
}

.quick-start-section {
  padding: 100px 48px;
  background: linear-gradient(135deg, #2c3e50, #3498db);
  color: white;
  text-align: center;
}

.section-header {
  text-align: center;
  margin-bottom: 60px;

  h2 {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 16px;
    color: #2c3e50;
  }

  p {
    font-size: 1.2rem;
    color: #7f8c8d;
  }
}

.capabilities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 32px;
  max-width: 1200px;
  margin: 0 auto;
}

.capability-card {
  background: white;
  padding: 40px 32px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-8px);
  }

  .capability-icon {
    color: #667eea;
    margin-bottom: 24px;
  }

  h3 {
    font-size: 1.4rem;
    font-weight: 600;
    margin-bottom: 16px;
    color: #2c3e50;
  }

  p {
    color: #7f8c8d;
    line-height: 1.6;
  }
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 32px;
  max-width: 1200px;
  margin: 0 auto;
}

.project-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-8px);

    .project-overlay {
      opacity: 1;
    }
  }

  .project-image {
    position: relative;
    overflow: hidden;

    img {
      width: 100%;
      height: 200px;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .project-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
  }

  .project-info {
    padding: 24px;

    h3 {
      font-size: 1.3rem;
      font-weight: 600;
      margin-bottom: 12px;
      color: #2c3e50;
    }

    p {
      color: #7f8c8d;
      line-height: 1.6;
      margin-bottom: 16px;
    }

    .project-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .project-time {
        color: #95a5a6;
        font-size: 0.9rem;
      }
    }
  }
}

// 快速开始区域
.quick-start-content {
  max-width: 800px;
  margin: 0 auto;

  h2 {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 16px;
  }

  > p {
    font-size: 1.2rem;
    margin-bottom: 60px;
    opacity: 0.9;
  }
}

.steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 40px;
  margin-bottom: 60px;
}

.step {
  text-align: center;

  .step-number {
    width: 60px;
    height: 60px;
    background: linear-gradient(45deg, #ffd700, #ffb347);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: 700;
    color: #2c3e50;
    margin: 0 auto 24px;
  }

  .step-content {
    h4 {
      font-size: 1.3rem;
      font-weight: 600;
      margin-bottom: 12px;
    }

    p {
      opacity: 0.9;
      line-height: 1.6;
    }
  }
}

.start-now-btn {
  background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
  border: none;
  padding: 16px 48px;
  font-size: 1.2rem;
  font-weight: 600;
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
  }
}

// 动画
@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 50px rgba(102, 126, 234, 0.6);
  }
  100% {
    transform: scale(1.05);
    box-shadow: 0 0 70px rgba(102, 126, 234, 0.8);
  }
}

@keyframes wave {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0;
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .hero-content {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 40px;
  }

  .hero-title {
    font-size: 2.5rem !important;
  }

  .hero-actions {
    justify-content: center;
  }

  .capabilities-grid,
  .projects-grid {
    grid-template-columns: 1fr;
  }

  .steps {
    grid-template-columns: 1fr;
  }
}
</style>
