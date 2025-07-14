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
import { ref, Ref, computed, watch } from "vue";
import { useRoute } from "vue-router";

import DataManage from "../component-render/data-manage/index.vue";
import DataVisual from "../component-render/data-visual/index.vue";
import DataCard from "../component-render/data-card/index.vue";
import { testAppSchema, DEFAULT_PAGE_ID } from "../../test";
import { PageComponentDetail, PageItem } from "../../types/page";

const route = useRoute();

// 根据url参数获取当前页面
const currentPageName = computed(() => {
  const pageId = (route.params.pageId as string) || DEFAULT_PAGE_ID;

  // 根据pageId找到对应的页面名称
  const page = testAppSchema.pages.find((p) => p.pageid === pageId);
  return page ? page.pageName : testAppSchema.pages[0].pageName;
});

// 根据当前页面名称获取页面详情
const pageDetail: Ref<PageItem & { components: PageComponentDetail[] }> = ref({
  pageName: "",
  pageid: "",
  description: "",
  components: [],
});

// 更新页面详情
const updatePageDetail = () => {
  const currentPage = testAppSchema.pages.find(
    (page) => page.pageName === currentPageName.value
  );

  if (currentPage) {
    pageDetail.value = {
      pageName: currentPage.pageName,
      pageid: currentPage.pageid,
      description: currentPage.description,
      components: currentPage.components.map((component) => {
        const dataSourceSchema = testAppSchema.dataSource.find(
          (item) => item.id === component.dataSourceId
        );
        return {
          ...component,
          dataSourceSchema: dataSourceSchema!,
        };
      }),
    };
  }
};

// 监听页面变化
watch(currentPageName, updatePageDetail, { immediate: true });

console.log("Page Detail:", pageDetail.value);
</script>

<style scoped lang="scss">
.page-container {
  box-sizing: border-box;
}
</style>
