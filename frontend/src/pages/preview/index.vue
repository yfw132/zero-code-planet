<template>
  <!-- 这里是通用的页头组件，用element-plus的组件 -->
  <div class="main-container">
    <div v-for="item in pageDetail.components" :key="item.componentName">
      <DataManage
        v-if="item.componentName === 'DataManage'"
        :dataSourceSchema="item.dataSourceSchema"
      />
      <DataVisual
        v-if="item.componentName === 'DataVisual'"
        :dataSourceSchema="item.dataSourceSchema"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, Ref } from "vue";
import DataManage from "./template/data-manage/index.vue";
import DataVisual from "./template/data-visual/index.vue";
import { schema } from "./schema/dataSource";

const pageDetail: Ref<any> = ref({
  pageName: "用户数据管理",
  pageDescription: "这是一个用户数据管理页面",
  components: [
    {
      componentName: "DataManage",
      dataSourceId: "user",
    },
  ],
});

pageDetail.value.components.forEach((component: any) => {
  component.dataSourceSchema = schema.find(
    (item) => item.id === component.dataSourceId
  );
});

console.log(pageDetail.value);
</script>

<style scoped lang="scss">
.main-container {
  min-height: 100vh;
  background: #f5f7fa;
  box-sizing: border-box;
}
</style>
