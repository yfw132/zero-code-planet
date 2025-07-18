<template>
  <div class="preview">
    <div class="page-list">
      <div :class="pageKey === item.key ? 'page-item clicked' : 'page-item'" v-for="item in schema.pages"
        :key="item.key" @click="chosePage(item)">
        <el-icon>
          <Document />
        </el-icon>
        {{ item.title }}
      </div>
    </div>
    <div class="page-config">
      <div class="page-header">
        <el-page-header :title="schema.config.title" :icon="Document" @back="() => console.log('back')">
          <template #content>
            <div class="page-header-title">
              <span class="text-large font-600 mr-3">{{ pageInfo?.title }}</span>
              <el-tag>/{{ pageInfo?.key }}</el-tag>
            </div>
          </template>
          <template #extra>
            <div class="flex items-center">
              <el-button>预览</el-button>
              <el-button type="primary" class="ml-2">保存</el-button>
            </div>
          </template>
        </el-page-header>
      </div>
      <div class="page-main" v-if="pageInfo">
        <el-form :model="pageInfo" label-width="60px">
          <el-form-item label="标题">
            <el-input v-model="pageInfo.title"></el-input>
          </el-form-item>
          <el-form-item label="列配置">
            <draggable style="width: 100%;" v-model="pageInfo.columns" item-key="key">
              <template #item="{ element, index }">
                <div class="column-item">
                  <el-form-item label="名称">
                    <el-input v-model="element.name"></el-input>
                  </el-form-item>
                  <el-form-item label="类型">
                    <el-select v-model="element.type">
                      <el-option label="字符串" value="varchar"></el-option>
                      <el-option label="浮点数" value="float"></el-option>
                      <el-option label="日期时间" value="datetime"></el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item label="非空">
                    <el-switch v-model="element.not_null"></el-switch>
                  </el-form-item>
                  <el-form-item label="设置器">
                    <el-input v-model="element.setter"></el-input>
                  </el-form-item>
                  <el-button type="danger" @click="removeColumn(index)">删除</el-button>
                </div>
              </template>
            </draggable>
          </el-form-item>
          <el-button type="primary" @click="addColumn">添加列</el-button>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { mockSchema, PageItem } from '@/utils/schema'
import { Document } from '@element-plus/icons-vue'
import draggable from 'vuedraggable'

const schema = ref(mockSchema)
const pageKey = ref('')
const pageInfo = ref<PageItem>()

const chosePage = (info: PageItem) => {
  pageKey.value = info.key
  pageInfo.value = info
}

const addColumn = () => {
  pageInfo.value?.columns.push({
    key: '',
    type: 'varchar',
    not_null: false,
    name: '',
    setter: 'input',
    setter_props: {}
  })
}

const removeColumn = (index: number) => {
  pageInfo.value?.columns.splice(index, 1)
}

onMounted(() => {
  console.log(schema.value)
})
</script>

<style scoped lang="scss">
@import "./index.scss";
</style>