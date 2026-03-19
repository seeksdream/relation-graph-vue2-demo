<template>
  <div class="technical-page">
    <div class="page-toolbar">
      <div class="toolbar-left">
        <el-button size="small" @click="switchLayout">
          切换布局: {{ active === '2' ? '纵向混合布局' : '横向树布局' }}
        </el-button>
        <el-button size="small" @click="refreshGraph">刷新图谱</el-button>
        <el-button size="small" type="primary" @click="downloadPdf">下载 PDF</el-button>
      </div>
      <div class="toolbar-right">
        <span class="toolbar-label">背景色</span>
        <el-color-picker v-model="backgroundColor" size="small" />
      </div>
    </div>

    <div class="page-content">
      <aside class="sidebar">
        <FakeTree
          :tree-data="treeData"
          :current-node-id="currentTreeNode.row.key || currentTreeNode.row.pointCode"
          @nodeClickItem="handleTreeSelect"
        />
        <FakeInspector
          :current-layout="active === '2' ? '纵向混合布局' : '横向树布局'"
          :selected-node="currentTreeNode"
          :last-action="lastAction"
        />
      </aside>

      <main class="graph-panel">
        <RGProvider>
          <TreeXMind
            ref="graphRef"
            :current-tree-node="currentTreeNode"
            :status-enum="statusEnum"
            :background-color="backgroundColor"
            :active="active"
            :page="page"
            :value="searchValue"
            :searching="searching"
            :search-options="searchOptions"
            :search-keyword="searchKeyword"
            @update:value="searchValue = $event"
            @handleAdd="handleAdd"
            @customBtn="handleCustomBtn"
            @remoteSearch="handleRemoteSearch"
            @select-change="handleSelectChange"
          />
        </RGProvider>
      </main>
    </div>
  </div>
</template>

<script>
import { RGProvider } from '@relation-graph/vue2';
import TreeXMind from '@/views/technicalShelves/component/relationGraph.vue';
import FakeTree from '@/views/technicalShelves/fake-components/FakeTree.vue';
import FakeInspector from '@/views/technicalShelves/fake-components/FakeInspector.vue';
import { myTreeJsonData } from '@/views/technicalShelves/component/data-2';

export default {
  name: 'TechnicalShelvesView',
  components: {
    RGProvider,
    TreeXMind,
    FakeTree,
    FakeInspector
  },
  data() {
    return {
      treeData: myTreeJsonData,
      currentTreeNode: {
        row: {
          key: '',
          pointCode: '',
          title: myTreeJsonData.text
        }
      },
      statusEnum: {
        '01': '规划技术',
        '02': '在研技术',
        '03': '已有技术',
        '04': '验证技术',
        '05': '取消技术',
        '06': '未研发技术'
      },
      backgroundColor: '#ffffff',
      active: '2',
      page: {
        btnsDom: [
          { type: 'move', domApi: 'api=technical:move' },
          { type: 'dialog-edit', domApi: 'api=technical:edit' },
          { type: 'del', domApi: 'api=technical:delete' },
          { type: 'copy', domApi: 'api=technical:copy' },
          { type: 'add', domApi: 'api=technical:add' }
        ]
      },
      searchValue: '',
      searching: false,
      searchKeyword: '',
      searchOptions: [],
      searchPool: [],
      lastAction: null
    };
  },
  created() {
    this.searchPool = this.collectSearchPool(this.treeData);
    this.searchOptions = this.searchPool.slice(0, 8);
  },
  methods: {
    collectSearchPool(rootNode) {
      const items = [];
      const walk = (node) => {
        if (!node) {
          return;
        }
        items.push({
          value: node.id,
          label: node.text
        });
        const children = Array.isArray(node.children) ? node.children : [];
        children.forEach(walk);
      };
      walk(rootNode);
      return items;
    },
    handleTreeSelect(payload) {
      this.currentTreeNode = payload;
      this.lastAction = {
        type: 'tree-select',
        row: payload.row
      };
    },
    handleCustomBtn(payload) {
      this.lastAction = payload;
      console.log('[technicalShelves customBtn]', payload);
    },
    handleAdd(payload) {
      this.lastAction = {
        type: 'add',
        row: payload
      };
      console.log('[technicalShelves handleAdd]', payload);
    },
    async handleRemoteSearch(query) {
      this.searching = true;
      this.searchKeyword = query || '';
      const keyword = this.searchKeyword.trim();
      if (!keyword) {
        this.searchOptions = this.searchPool.slice(0, 8);
        this.searching = false;
        return;
      }
      this.searchOptions = this.searchPool.filter(item => item.label.includes(keyword)).slice(0, 20);
      this.searching = false;
    },
    handleSelectChange(value) {
      this.searchValue = value || '';
      if (!value) {
        return;
      }
      const selected = this.searchPool.find(item => item.value === value);
      this.currentTreeNode = {
        row: {
          key: value,
          pointCode: value,
          title: selected ? selected.label : value
        }
      };
      this.lastAction = {
        type: 'search-select',
        row: this.currentTreeNode.row
      };
    },
    switchLayout() {
      this.active = this.active === '2' ? '1' : '2';
    },
    refreshGraph() {
      if (this.$refs.graphRef) {
        this.$refs.graphRef.getList(this.currentTreeNode);
      }
    },
    async downloadPdf() {
      if (this.$refs.graphRef) {
        await this.$refs.graphRef.downloadAdvance();
      }
    }
  }
};
</script>

<style scoped>
.technical-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #eef2f7;
}

.page-toolbar {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: #ffffff;
  border-bottom: 1px solid #d9e1ec;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toolbar-label {
  font-size: 13px;
  color: #5b6472;
}

.page-content {
  flex: 1;
  min-height: 0;
  display: flex;
}

.sidebar {
  width: 320px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  border-right: 1px solid #d9e1ec;
  background: #f7fafc;
  overflow: auto;
}

.graph-panel {
  flex: 1;
  min-width: 0;
  min-height: 0;
  padding: 12px;
}

.graph-panel > div {
  height: 100%;
}
</style>
