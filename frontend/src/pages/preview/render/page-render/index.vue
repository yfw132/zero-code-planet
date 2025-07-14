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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, computed, watch } from "vue";
import { useRoute } from "vue-router";

import DataManage from "../component-render/data-manage/index.vue";
import DataVisual from "../component-render/data-visual/index.vue";
import { testAppSchema } from "../../test";
import { PageComponentDetail, PageItem } from "../../types/page";

const route = useRoute();

// 根据url参数获取当前页面
const currentPageName = computed(() => {
  return (route.query.page as string) || testAppSchema.pages[0].pageName;
});

// 根据当前页面名称获取页面详情
const pageDetail: Ref<PageItem & { components: PageComponentDetail[] }> = ref({
  pageName: "",
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
