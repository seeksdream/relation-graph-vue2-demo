relation-graph组件新老版本存在差异：
老版本的包名叫`relation-graph-vue2`
新版本的包名叫`@relation-graph/vue2`

~/WebstormProjects/relation-graph-site-react/ai-prompts/relation-graph-guide.md这个文档是最新版本的`@relation-graph/vue2`的使用文档，
mix-layout-8是一个使用新版本开发的混合布局（混合树状布局，从上到下）的示例：~/WebstormProjects/relation-graph-site-vue2/src/v3-examples/mix-layout-8

现在，这里有一个旧版本的应用`src/demo/SimpleV3.vue`，请将它迁移到新版本`@relation-graph/vue2`，也实现这种混合布局。
同时，忽略`src/demo/case20260316-V3.x/TreeXMind.vue`中`getPointClassificationTree`方法原先的数据格式，直接让他使用`src/demo/case20260316-V3.x/technical-shelves.js`中的树状数据`myTreeJsonData`
同时，它里面有一个'切换布局'的功能，当它是纵向时，让他使用（混合树状布局，从上到下）；当它是横向时，让他使用普通的树状布局；

