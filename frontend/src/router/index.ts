import { createRouter, createWebHashHistory } from "vue-router";
import Layout from "../layout/index.vue";

export const constantRoutes = [
  {
    path: "/",
    name: "Layout",
    redirect: "/index",
    component: Layout,
    children: [
      {
        path: "/index",
        component: () => import("../pages/index/index.vue"),
        meta: { title: "项目管理", icon: "Money", roles: ["user"] },
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
