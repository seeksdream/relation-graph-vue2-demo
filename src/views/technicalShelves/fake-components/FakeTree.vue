<template>
  <div class="fake-tree">
    <div class="panel-title">Fake Tree</div>
    <div class="panel-subtitle">最小替代版树组件，用来驱动 `relationGraph.vue` 的切换逻辑。</div>
    <button
      v-for="item in flatNodes"
      :key="item.id"
      class="tree-item"
      :class="{ active: item.id === currentNodeId }"
      :style="{ paddingLeft: `${12 + item.depth * 18}px` }"
      @click="selectNode(item)"
    >
      <span class="tree-item-text">{{ item.text }}</span>
    </button>
  </div>
</template>

<script>
export default {
  name: 'FakeTree',
  props: {
    treeData: {
      type: Object,
      default: null
    },
    currentNodeId: {
      type: String,
      default: ''
    }
  },
  computed: {
    flatNodes() {
      const rows = [];
      const walk = (node, depth) => {
        if (!node) {
          return;
        }
        rows.push({
          id: node.id,
          text: node.text,
          depth
        });
        const children = Array.isArray(node.children) ? node.children : [];
        children.forEach(child => walk(child, depth + 1));
      };
      walk(this.treeData, 0);
      return rows;
    }
  },
  methods: {
    selectNode(item) {
      this.$emit('nodeClickItem', {
        row: {
          key: item.id,
          pointCode: item.id,
          title: item.text,
          classification: {
            cid: item.id,
            rootId: this.treeData ? this.treeData.id : item.id
          }
        }
      });
    }
  }
};
</script>

<style scoped>
.fake-tree {
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid #d9e1ec;
  padding: 12px;
}

.panel-title {
  font-size: 15px;
  font-weight: 600;
  color: #243042;
}

.panel-subtitle {
  margin-top: 4px;
  margin-bottom: 10px;
  font-size: 12px;
  line-height: 1.5;
  color: #6b7280;
}

.tree-item {
  width: 100%;
  display: block;
  text-align: left;
  border: 0;
  background: transparent;
  border-radius: 8px;
  padding-top: 8px;
  padding-bottom: 8px;
  cursor: pointer;
  color: #334155;
}

.tree-item:hover {
  background: #eef4ff;
}

.tree-item.active {
  background: #dbeafe;
  color: #1d4ed8;
  font-weight: 600;
}

.tree-item-text {
  display: inline-block;
  line-height: 1.4;
}
</style>
