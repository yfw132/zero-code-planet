import { createRouter, createWebHashHistory } from "vue-router";
import Layout from "../layout/index.vue";
import Workbench from "../layout/workbench/index.vue";

export const constantRoutes = [
  {
    path: "/",
    component: () => import("../pages/index/index.vue"),
    meta: { title: "首页", icon: "Money", roles: ["user"] },
    hidden: false,
  },
  {
    path: "/workbench",
    name: "Workbench",
    component: Workbench,
    children: [
      {
        path: "/workbench",
        component: () => import("../pages/workbench/index.vue"),
        meta: { title: "项目管理", icon: "Money", roles: ["user"] },
        hidden: false,
      },
      {
        path: "/workbench/config",
        component: () => import("../pages/workbench/config/index.vue"),
        meta: { title: "项目配置", icon: "Money", roles: ["user"] },
        hidden: false,
      },
      {
        path: "/workbench/preview",
        component: () => import("../pages/preview/index.vue"),
        meta: { title: "页面预览", icon: "Money", roles: ["user"] },
        hidden: false,
      },
    ],
  },
  {
    path: "/*",
    redirect: "/Login",
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes: constantRoutes,
});

// router.beforeEach((to: any, from: any, next: any) => {
//   if (to.matched.length === 0) {
//     router.push('/')
//   }
//   else if (to.name === 'Login' && localStorage.getItem('token')) {
//     router.push('/document')
//   }
//   else if (!localStorage.getItem('token') && (to.name !== 'Register' && to.name !== 'Login')) {
//     router.push('/')
//   }
//   else {
//     next()
//   }
// })

export default router;
