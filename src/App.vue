<template>
  <div>
    <CurrentDemo />
  </div>
</template>

<script>
// 所有的demo都在../demo文件中，你想要使用哪个，像上面一样引入即可
// import CurrentDemo from './demo/Simple'; // 简单示例
import CurrentDemo from './demo/case20231212/Test.vue'; // 自定义连线插槽的示例
export default {
  name: "App",
  components: { CurrentDemo },
  data() {
    return {
    };
  },
  mounted() {
  },
  methods: {
  }
};
</script>
