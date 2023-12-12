import Vue from "vue";
import App from "./App.vue";

import RelationGraph from "relation-graph";
Vue.use(RelationGraph);
Vue.config.productionTip = false;
new Vue({
  render: (h) => h(App)
}).$mount("#app");
