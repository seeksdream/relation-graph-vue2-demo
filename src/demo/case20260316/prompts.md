relation-graph组件新老版本存在差异：
老版本的包名叫`relation-graph-vue2`
新版本的包名叫`@relation-graph/vue2`

~/WebstormProjects/relation-graph-site-react/ai-prompts/relation-graph-guide.md这个文档是最新版本的`@relation-graph/vue2`的使用文档，
mix-layout-8是一个使用新版本开发的混合布局（混合树状布局，从上到下）的示例：~/WebstormProjects/relation-graph-site-vue2/src/v3-examples/mix-layout-8

现在，这里有一个旧版本的应用`src/demo/SimpleV2.vue`，也需要使用这种混合布局，但不能为它升级到`@relation-graph/vue2`，它必须使用`relation-graph-vue2`。
同时，它里面有一个'切换布局'的功能，当它是纵向时，让他使用（混合树状布局，从上到下）；当它是横向时，让他使用（混合树状布局，从左到右）；

