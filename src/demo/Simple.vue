<template>
  <div class="simple-page">
    <div class="demo-toolbar">
      <button class="btn" @click="active = active === '2' ? '1' : '2'">
        切换布局: {{ active === '2' ? '纵向' : '横向' }}
      </button>
      <button class="btn" @click="backgroundColor = backgroundColor === '#f7fafc' ? '#ffffff' : '#f7fafc'">
        切换背景
      </button>
    </div>
    <div class="graph-container">
      <TreeXMind
        :current-tree-node="currentTreeNode"
        :status-enum="statusEnum"
        :background-color="backgroundColor"
        :active="active"
        :page="page"
        :value="value"
        :searching="searching"
        :search-options="searchOptions"
        :search-keyword="searchKeyword"
        @update:value="value = $event"
        @customBtn="handleCustomBtn"
        @handleAdd="handleAdd"
        @remoteSearch="handleRemoteSearch"
        @select-change="handleSelectChange"
      />
    </div>
  </div>
</template>

<script>
import TreeXMind from './TreeXMind.vue';

export default {
  name: "Demo",
  components: {
    TreeXMind
  },
  data() {
    return {
      currentTreeNode: {
          row: {
              key: '',
              pointCode: ''
          }
      },
      statusEnum: {
        '01': '规划技术',
        '02': '在研技术',
        '03': '已有技术',
        '05': '取消技术',
        '06': '未研发技术'
      },
      backgroundColor: '#f7fafc',
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
      value: '',
      searching: false,
      searchKeyword: '',
      searchOptions: [],
      searchPool: [
        { value: 'node-1', label: '基础能力' },
        { value: 'node-2', label: '数据治理' },
        { value: 'node-3', label: '可视化' },
        { value: 'node-4', label: '模型服务' },
        { value: 'node-5', label: '平台工程' }
      ]
    };
  },
  mounted() {
    this.searchOptions = this.searchPool.slice(0, 3);
      setTimeout(() => {

          this.currentTreeNode.row.key = 'mock-domain';
    }, 2000)
  },
  methods: {
    handleCustomBtn(payload) {
      console.log('[TreeXMind customBtn]', payload);
    },
    handleAdd(payload) {
      console.log('[TreeXMind handleAdd]', payload);
    },
    handleRemoteSearch(query) {
      this.searching = true;
      this.searchKeyword = query || '';
      const keyword = this.searchKeyword.trim();
      if (!keyword) {
        this.searchOptions = this.searchPool.slice(0, 3);
        this.searching = false;
        return;
      }
      this.searchOptions = this.searchPool.filter((item) => item.label.includes(keyword));
      this.searching = false;
    },
    handleSelectChange(value) {
      console.log('[TreeXMind select-change]', value);
    }
  }
};
</script>

<style scoped>
.simple-page {
  height: 100vh;
  background: #eef2f7;
}

.demo-toolbar {
  height: 50px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 12px;
  border-bottom: 1px solid #d9e1ec;
  background: #fff;
}

.btn {
  height: 32px;
  padding: 0 12px;
  border: 1px solid #c7d2e2;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
}

.graph-container {
  height: calc(100vh - 50px);
  padding: 8px;
}
</style>
