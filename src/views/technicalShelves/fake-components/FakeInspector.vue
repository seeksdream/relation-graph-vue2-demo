<template>
  <div class="fake-inspector">
    <div class="panel-title">Fake Inspector</div>
    <div class="info-row">
      <span class="label">当前布局</span>
      <span class="value">{{ currentLayout }}</span>
    </div>
    <div class="info-row">
      <span class="label">当前节点</span>
      <span class="value">{{ selectedNodeText }}</span>
    </div>
    <div class="payload">
      <div class="label">最近动作</div>
      <pre>{{ actionText }}</pre>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FakeInspector',
  props: {
    currentLayout: {
      type: String,
      default: ''
    },
    selectedNode: {
      type: Object,
      default: null
    },
    lastAction: {
      type: Object,
      default: null
    }
  },
  computed: {
    selectedNodeText() {
      return this.selectedNode && this.selectedNode.row
        ? this.selectedNode.row.title || this.selectedNode.row.key || this.selectedNode.row.pointCode || '根节点'
        : '根节点';
    },
    actionText() {
      if (!this.lastAction) {
        return '暂无动作';
      }
      return JSON.stringify(this.lastAction, null, 2);
    }
  }
};
</script>

<style scoped>
.fake-inspector {
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid #d9e1ec;
  padding: 12px;
}

.panel-title {
  font-size: 15px;
  font-weight: 600;
  color: #243042;
  margin-bottom: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
  font-size: 13px;
}

.label {
  color: #64748b;
}

.value {
  color: #1f2937;
  text-align: right;
}

.payload {
  margin-top: 12px;
}

.payload pre {
  margin: 8px 0 0;
  padding: 10px;
  border-radius: 8px;
  background: #0f172a;
  color: #dbeafe;
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
