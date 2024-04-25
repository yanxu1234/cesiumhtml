import { createRouter, createWebHistory } from 'vue-router'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/threedmap",
      name: "threedmap",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("../views/threedmap.vue"),
    },
    {
      path: "/Datamanage",
      name: "Datamanage",
      children: [
        {
          path: "/Home",
          name: "Home",
          // route level code-splitting
          // this generates a separate chunk (About.[hash].js) for this route
          // which is lazy-loaded when the route is visited.
          component: () => import("../views/Home.vue"),
        },
        {
          path: "/radar",
          name: "radar",
          // route level code-splitting
          // this generates a separate chunk (About.[hash].js) for this route
          // which is lazy-loaded when the route is visited.
          component: () => import("../views/radar.vue"),
        },
        {
          path: "/satellite",
          name: "satellite",
          // route level code-splitting
          // this generates a separate chunk (About.[hash].js) for this route
          // which is lazy-loaded when the route is visited.
          component: () => import("../views/satellite.vue"),
        },
        {
          path: "/echarts",
          name: "echarts",
          // route level code-splitting
          // this generates a separate chunk (About.[hash].js) for this route
          // which is lazy-loaded when the route is visited.
          component: () => import("../views/echarts.vue"),
        },
      ],
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("../views/Datamanage.vue"),
    },
  ],
});

export default router
