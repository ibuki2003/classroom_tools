import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: "/",
    name: "Home",
    component: () => import(/* webpackChunkName: "Home" */ "@/views/Home.vue")
  },
  {
    path: "/authed",
    name: "authed",
    component: () =>
      import(/* webpackChunkName: "authed" */ "@/views/authed.vue")
  },
  {
    path: "/timeline",
    name: "timeline",
    component: () =>
      import(/*webpackChunkName: "timeline" */ "@/views/timeline.vue")
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
