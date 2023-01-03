import Vue from "vue";
import App from "./App.vue";
import "element-ui/lib/theme-chalk/index.css";
import Element from "element-ui";

import RelationGraph from "relation-graph";
Vue.config.productionTip = false;
Vue.use(Element, {
  // size: Cookies.get('size') || 'medium' // set element-ui default size
  size: "medium" // set element-ui default size
});
Vue.use(RelationGraph);
new Vue({
  render: (h) => h(App)
}).$mount("#app");
