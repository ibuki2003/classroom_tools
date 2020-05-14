import Vue from "vue";
import App from "./App.vue";
import router from "./router";

import { BootstrapVue, BootstrapVueIcons } from "bootstrap-vue";
Vue.use(BootstrapVue);
Vue.use(BootstrapVueIcons);

import "@/assets/sass/main.scss";

import titleMixin from "@/titleMixin";
Vue.mixin(titleMixin);

Vue.config.productionTip = false;

new Vue({
  router,
  render: h => h(App)
}).$mount("#app");
