<template>
  <div class="page-container">
    <div
      v-for="item in pageDetail.components"
      :key="`${item.componentName}-${item.dataSourceId}`"
    >
      <DataManage
        v-if="item.componentName === 'DataManage'"
        :key="item.dataSourceId"
        :dataSourceSchema="item.dataSourceSchema"
      />
      <DataVisual
        v-if="item.componentName === 'DataVisual'"
        :key="item.dataSourceId"
        :dataSourceSchema="item.dataSourceSchema"
      />
      <DataCard
        v-if="item.componentName === 'DataCard'"
        :key="item.dataSourceId"
        :dataSourceSchema="item.dataSourceSchema"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import DataManage from "../component-render/data-manage/index.vue";
import DataVisual from "../component-render/data-visual/index.vue";
import DataCard from "../component-render/data-card/index.vue";
import { PageComponentDetail } from "../../../../types/page";
import type { AppFullData } from "@/api/app";
import type { DataSourceItem as ApiDataSourceItem } from "@/api/dataSource";

// 定义 props
interface Props {
  appSchema: AppFullData;
  currentPageId: string;
}

const props = defineProps<Props>();

// 根据当前页面ID获取页面详情
const pageDetail = computed(() => {
  const currentPage = props.appSchema.pages.find(
    (page) => page.pageid === props.currentPageId
  );

  if (!currentPage) {
    return {
      pageName: "",
      pageid: "",
      description: "",
      components: [],
    };
  }

  return {
    pageName: currentPage.pageName,
    pageid: currentPage.pageid,
    description: currentPage.description,
    components: currentPage.components.map((component): PageComponentDetail => {
      const apiDataSource = props.appSchema.dataSource.find(
        (item: ApiDataSourceItem) =>
          item.datasourceid === component.dataSourceId
      );

      // 将API数据源格式转换为组件期望的格式
      const dataSourceSchema = apiDataSource
        ? {
            id: apiDataSource.datasourceid,
            title: apiDataSource.title,
            description: apiDataSource.description || "",
            dataSource: apiDataSource.dataSource,
            version: apiDataSource.version,
            createdAt: apiDataSource.createdAt,
            updatedAt: apiDataSource.updatedAt,
          }
        : {
            id: component.dataSourceId,
            title: "Unknown DataSource",
            description: "",
            dataSource: [],
          };

      return {
        ...component,
        dataSourceSchema,
      };
    }),
  };
});
</script>

<style scoped lang="scss">
.page-container {
  box-sizing: border-box;
}
</style>
