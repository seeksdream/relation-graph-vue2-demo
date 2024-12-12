<template>
  <div>
    <div style="height: calc(100vh - 50px)">
      <RelationGraph
        ref="seeksRelationGraph"
        :options="graphOptions"
        :on-node-click="onNodeClick"
        :on-line-click="onLineClick"
      />
    </div>
  </div>
</template>

<script>
// 如果您没有在main.js文件中使用Vue.use(RelationGraph); 就需要使用下面这一行代码来引入relation-graph
import RelationGraph from "relation-graph";
export default {
  name: "Demo",
  components: { RelationGraph },
  data() {
    return {
      isShowCodePanel: false,
      graphOptions: {
        moveToCenterWhenRefresh: false,
        zoomToFitWhenRefresh: false,
        useAnimationWhenRefresh: true,
        defaultFocusRootNode: true,
        disableNodeClickEffect: false,
        disableLineClickEffect: false,
        backgrounImageNoRepeat: false,
        isMoveByParentNode: false,
        defaultExpandHolderPosition: "hide",
        defaultNodeColor: "rgba(238, 178, 94, 1)",
        checkedLineColor: "#FD8B37",
        defaultNodeFontColor: "#ffffff",
        defaultNodeBorderColor: "#90EE90",
        defaultNodeBorderWidth: 0,
        defaultLineColor: "#dddddd",
        defaultLineWidth: 1,
        defaultLineShape: 1,
        defaultNodeShape: 0,
        defaultShowLineLabel: true,
        hideNodeContentByZoom: false,
        defaultJunctionPoint: "border",
        disableDragCanvas: false,
        lineUseTextPath: false,
        layout:{
          label: "自动布局",
          layoutName: "force",
          layoutClassName: "seeks-layout-force",
            layoutTimes: 9999999
        },
        isNeedShowAutoLayoutButton: true,
        showSingleNode: true,
        showNodeLabel: true,
        showNodeShortLabel: true,
      },
    };
  },
  mounted() {
    this.showSeeksGraph();
  },
  methods: {
    showSeeksGraph() {
      const __graph_json_data = {
        rootId: "N3",
        nodes: [
          { id: "N4", text: "Node 4" },
          { id: "N5", text: "Node 5" },
          { id: "N6", text: "Node 6" },
          { id: "N7", text: "Node 7" },
          { id: "N3", text: "Node 三" },
          { id: "N9", text: "152****3393" },
        ],
        lines: [
          { from: "N3", to: "N9", text: "Text 1" },
          { from: "N3", to: "N4", text: "Text 2" },
          { from: "N3", to: "N5", text: "Text 3" },
          { from: "N3", to: "N6", text: "Text 4" },
          { from: "N3", to: "N7", text: "Text 5" },
          { from: "N9", to: "N4", text: "Text 6" }
        ],
      };
      this.$refs.seeksRelationGraph.setJsonData(
        __graph_json_data,
        (graphInstance) => {
          // 这些写上当图谱初始化完成后需要执行的代码
        }
      );
    },
    onNodeClick(nodeObject, $event) {
      console.log("onNodeClick:", nodeObject);
    },
    onLineClick(lineObject, $event) {
      console.log("onLineClick:", lineObject);
    },
  },
};
</script>

<style lang="scss"></style>

<style lang="scss" scoped></style>
