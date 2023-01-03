<template>
  <div>
    <CurrentDemo />
  </div>
</template>

<script>
// 以下，你想使用哪个demo，打开对应的注释即可
// import CurrentDemo from './demo/Simple';
// import CurrentDemo from './demo/Layout-force';
import CurrentDemo from './demo/Demo4AdvLineSlot';
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
