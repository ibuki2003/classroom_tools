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
    redirect: { name: "all_posts" }
  },
  {
    path: "/all_posts",
    name: "all_posts",
    component: () =>
      import(/*webpackChunkName: "all_posts" */ "@/views/all_posts.vue")
  },
  {
    path: "/terms",
    name: "terms",
    component: () => import(/*webpackChunkName: "terms" */ "@/views/terms.vue")
  },
  {
    path: "/privacy_policy",
    name: "privacy_policy",
    component: () =>
      import(
        /*webpackChunkName: "privacy_policy" */ "@/views/privacy_policy.vue"
      )
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
