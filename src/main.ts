import Vue from "vue";
import Vuex from "vuex";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import App from "./App.vue";

Vue.use(Vuex);
Vue.use(ElementUI);
Vue.config.productionTip = false;

const store = new Vuex.Store({
  state: {
    user: {
      roles: [],
      btnPermission: {}
    }
  }
});

Vue.prototype.$t = function translate(key: string) {
  return key;
};

new Vue({
  store,
  render: (h) => h(App)
}).$mount("#app");
