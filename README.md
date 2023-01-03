# Vue 2 example

## Installation

```sh
yarn
```
## Start

```sh
yarn start 
```

## Usage 

打开并按照如下代码注释说明修改 src/App.vue

```diff
// 

<template>
  <div>
    <CurrentDemo />
  </div>
</template>

<script>
// 以下，你想使用哪个demo，打开对应的注释即可
import CurrentDemo from './demo/Simple';
// import CurrentDemo from './demo/Layout-force';
// import CurrentDemo from './demo/Demo4AdvLineSlot';
// 所有的demo都在../demo文件中，你想要使用哪个，像上面一样引入即可

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


```
