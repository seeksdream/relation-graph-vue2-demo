<template>
  <div ref="myPage" v-loading="loading" class="relation-graph" @click="handleClick">
    <RelationGraph
      :options="initialGraphOptions"
      @onNodeClick="onNodeClick"
      @onLineClick="onLineClick"
      @onNodeExpand="onNodeExpand"
      @onNodeCollapse="onNodeCollapse"
    >
      <template #node="{node}">
        <div
          :ref="`node-${node.id}`"
          class="c-my-rg-node"
          @click="showNodeMenus(node, $event)"
          @contextmenu.prevent.stop="showNodeMenus(node, $event)"
          @mouseover="showNodeTips(node, $event)"
          @mouseout="hideNodeTips"
        >
          <span class="node-text" :class="{ 'is-allow': isDomainNode(node) }">{{ node.text }}</span>
        </div>
      </template>
      <template #view>
        <div v-if="currentGraphOptions && currentGraphOptions.fullscreen" class="fullscreen-search">
          <div class="search-select-wrapper">
            <el-select
              v-model="currentSearchValue"
              size="small"
              filterable
              remote
              reserve-keyword
              clearable
              :popper-append-to-body="false"
              :placeholder="$t('comLab.J000010')"
              :remote-method="remoteSearch"
              :loading="searching"
              @change="handleSelectChange"
            >
              <el-option
                v-for="item in searchOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
                <span v-html="highlightKeyword(item.label, searchKeyword)" />
              </el-option>
            </el-select>
          </div>
        </div>
        <div
          v-if="isShowNodeTipsPanel && currentNode.data && currentNode.data.description === '技术点'"
          class="rg-tooltip"
          :style="{ left: `${nodeTipsPanelPosition.x}px`, top: `${nodeTipsPanelPosition.y}px` }"
          @mouseenter="onTooltipMouseEnter"
          @mouseleave="onTooltipMouseLeave"
        >
          <div class="box">
            <div class="label">{{ $t('jmLab.Y000965') }}：</div>
            <div class="text">{{ currentNode.data.solution }}</div>
          </div>
          <div class="box">
            <div class="label">{{ $t('jmLab.Y000287') }}：</div>
            <div class="text">{{ currentNode.text }}</div>
          </div>
          <div class="box">
            <div class="label">{{ $t('jmLab.Y000954') }}：</div>
            <div class="text">{{ statusEnum[currentNode.data.type] || '-' }}</div>
          </div>
          <div v-if="!isNoShowQCT" class="box">
            <div class="label">Q：</div>
            <div class="text">{{ currentNode.data.q_value }}</div>
          </div>
          <div v-if="!isNoShowQCT" class="box">
            <div class="label">C：</div>
            <div class="text">{{ currentNode.data.c_value }}</div>
          </div>
          <div v-if="!isNoShowQCT" class="box">
            <div class="label">T：</div>
            <div class="text">{{ currentNode.data.t_value }}</div>
          </div>
        </div>
      </template>
    </RelationGraph>
    <div
      v-show="page && isShowNodeMenuPanel && currentMenuNode.data && currentMenuNode.data.description === '技术点' && (btnAuth(page.btnsDom, 'move') || btnAuth(page.btnsDom, 'dialog-edit') || btnAuth(page.btnsDom, 'del') || btnAuth(page.btnsDom, 'copy'))"
      class="rg-menu"
      :style="{ left: `${nodeMenuPanelPosition.x}px`, top: `${nodeMenuPanelPosition.y}px` }"
    >
      <div v-if="page && btnAuth(page.btnsDom, 'move')" class="c-node-menu-item" @click.stop="handleClick('move')">{{ $t('comLab.J000059') }}</div>
      <div v-if="page && btnAuth(page.btnsDom, 'dialog-edit')" class="c-node-menu-item" @click.stop="handleClick('edit')">{{ $t('comLab.J000037') }}</div>
      <div v-if="page && btnAuth(page.btnsDom, 'del')" class="c-node-menu-item" @click.stop="handleClick('del')">{{ $t('jmLab.Y000138') }}</div>
      <div v-if="page && btnAuth(page.btnsDom, 'copy')" class="c-node-menu-item" @click.stop="handleClick('copy')">{{ $t('jmLab.Y000205') }}</div>
    </div>
    <div
      v-show="isShowNodeMenuPanelTechnical && currentMenuNode.data && currentMenuNode.data.description === '技术领域' && (btnAuth(page.btnsDom, 'add') || isAdmin)"
      class="rg-menu"
      :style="{ left: `${nodeMenuPanelPosition.x}px`, top: `${nodeMenuPanelPosition.y}px` }"
    >
      <div v-if="page && btnAuth(page.btnsDom, 'add')" class="c-node-menu-item" @click.stop="handleClick('add')">{{ $t('jmLab.Y000964') }}</div>
      <div v-if="showAssociated" class="c-node-menu-item" @click.stop="handleClick('associated')">{{ $t('jmLab.Y001044') }}</div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import { jsPDF } from 'jspdf';
import { RelationGraph, graphStoreMixin, RGJunctionPoint, RGLineShape } from '@relation-graph/vue2';
import { findProductCategory } from '@/utils/categoryUtils';
import { CookieUtils } from '@/utils/cookieUtil';
import MixedTreeLayout from './MixedTreeLayout';
import { blobToBase64, domToImageByModernScreenshot } from './domToImageByModernScreenshot';
import { fetchTreeJsonData } from './data';

const LEAF_STATUS_TYPES = ['01', '02', '03', '06'];

export default {
  name: 'TreeXMind',
  components: {
    RelationGraph
  },
  mixins: [graphStoreMixin],
  props: {
    currentTreeNode: {
      type: Object,
      default: null
    },
    statusEnum: {
      type: Object,
      default: () => ({})
    },
    backgroundColor: {
      type: String,
      default: '#ffffff'
    },
    active: {
      type: String,
      default: '2'
    },
    page: {
      type: Object,
      default: null
    },
    value: {
      type: String,
      default: ''
    },
    searching: {
      type: Boolean,
      default: false
    },
    searchOptions: {
      type: Array,
      default: () => []
    },
    searchKeyword: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      verticalGraphOptions: {
        backgroundImage: '',
        backgroundImageNoRepeat: true,
        allowShowMiniToolBar: true,
        allowSwitchLineShape: true,
        allowSwitchJunctionPoint: true,
        defaultExpandHolderPosition: 'right',
        defaultLineShape: RGLineShape.StandardOrthogonal,
        defaultNodeBorderWidth: 0,
        defaultNodeWidth: 220,
        defaultNodeHeight: 72,
          defaultNodeColor: 'transparent',
        layout: {
          layoutName: 'fixed'
        }
      },
      horizontalGraphOptions: {
        backgroundImage: '',
        backgroundImageNoRepeat: true,
        allowShowMiniToolBar: true,
        allowSwitchLineShape: true,
        allowSwitchJunctionPoint: true,
        defaultExpandHolderPosition: 'right',
        defaultLineShape: RGLineShape.StandardOrthogonal,
        defaultJunctionPoint: 'lr',
        defaultNodeBorderWidth: 0,
          defaultNodeColor: 'transparent',
        defaultNodeWidth: 220,
        defaultNodeHeight: 72,
        layout: {
          layoutName: 'tree',
          from: 'left',
          treeNodeGapH: 160,
          treeNodeGapV: 24
        }
      },
      jsonData: {
        rootId: '',
        nodes: [],
        lines: []
      },
      imageBase64: '',
      isShowNodeMenuPanel: false,
      nodeMenuPanelPosition: { x: 0, y: 0 },
      nodeTipsPanelPosition: { x: 0, y: 0 },
      isShowNodeTipsPanel: false,
      isShowNodeMenuPanelTechnical: false,
      currentNode: {},
      currentMenuNode: {},
      loading: false,
      hideTimer: null
    };
  },
  computed: {
    initialGraphOptions() {
      return this.getActiveGraphOptions();
    },
    currentGraphOptions() {
      return this.graphStore.options;
    },
    isAdmin() {
      return CookieUtils.getCookie('current-role') === 'ROLE_ADMIN';
    },
    roles() {
      return this.$store && this.$store.state && this.$store.state.user ? this.$store.state.user.roles : [];
    },
    showAssociated() {
      return this.roles.includes('technical_associated');
    },
    isNoShowQCT() {
      return this.roles.includes('technical_QCT');
    },
    currentSearchValue: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit('update:value', val);
      }
    }
  },
  watch: {
    currentTreeNode: {
      handler(val) {
        if (val) {
          this.getList(val);
        }
      },
      immediate: true,
      deep: true
    },
    backgroundColor: {
      handler() {
        if (this.jsonData.nodes.length > 0) {
          this.renderCurrentGraph();
        }
      },
      immediate: true
    },
    active: {
      handler() {
        if (this.jsonData.nodes.length > 0) {
          this.renderCurrentGraph();
        }
      },
      immediate: true
    }
  },
  mounted() {
    this.$nextTick(() => {
      if (this.jsonData.nodes.length > 0) {
        this.renderCurrentGraph();
        return;
      }
      this.getList(this.currentTreeNode);
    });
  },
  methods: {
    btnAuth(btnsDom, type) {
      if (!Array.isArray(btnsDom)) {
        return false;
      }
      const btn = btnsDom.find(item => item.type === type);
      if (!btn || !btn.domApi) {
        return false;
      }
      const domApi = btn.domApi.split('=')[1];
      const btnPermission = this.$store && this.$store.state && this.$store.state.user ? this.$store.state.user.btnPermission : {};
      if (!btnPermission || Object.keys(btnPermission).length === 0) {
        return true;
      }
      return !!(domApi && Object.prototype.hasOwnProperty.call(btnPermission, domApi));
    },
    isDomainNode(node) {
      return !!(node && node.data && node.data.relationCategory && node.data.description === '技术领域');
    },
    getActiveGraphOptions() {
      const activeOptions = this.active === '2' ? this.verticalGraphOptions : this.horizontalGraphOptions;
      const nextOptions = _.cloneDeep(activeOptions);
      nextOptions.backgroundColor = this.backgroundColor;
      return nextOptions;
    },
    async renderCurrentGraph() {
      if (!this.graphInstance || this.jsonData.nodes.length === 0) {
        return;
      }
      this.graphInstance.setOptions(this.getActiveGraphOptions());
      const currentJsonData = _.cloneDeep(this.jsonData);
        this.graphInstance.clearGraph();
      this.graphInstance.addNodes(currentJsonData.nodes);
      this.graphInstance.addLines(currentJsonData.lines);
      if (currentJsonData.rootId) {
          this.graphInstance.setRootNodeId(currentJsonData.rootId);
      }
      await this.layoutMyGraphData();
      this.graphInstance.moveToCenter();
      this.graphInstance.zoomToFit();
    },
    async layoutMyGraphData() {
      if (this.active === '2') {
        const mixLayout = new MixedTreeLayout(this.graphInstance);
        await mixLayout.apply();
      } else {
        await this.graphInstance.doLayout();
        this.applyHorizontalLineStyles();
      }
    },
    applyHorizontalLineStyles() {
      this.graphInstance.getLines().forEach((line) => {
        this.graphInstance.updateLine(line, {
          lineShape: RGLineShape.StandardOrthogonal,
          fromJunctionPoint: RGJunctionPoint.right,
          toJunctionPoint: RGJunctionPoint.left,
          showEndArrow: false,
          color: line.color || '#666'
        });
      });
    },
    onNodeClick(nodeObject) {
      if (!nodeObject || !nodeObject.data) {
        return;
      }
      if (nodeObject.data.description === '技术点') {
        this.$emit('customBtn', { type: 'detail', row: { ...nodeObject.data, pointName: nodeObject.text } });
      } else if (nodeObject.data.description === '技术领域' && nodeObject.data.relationCategory) {
        this.getList({ row: { key: nodeObject.data.relationCategory } });
      }
    },
    onLineClick(lineObject) {
      console.log('onLineClick:', lineObject);
    },
    async onNodeExpand() {
        // 展开收起会引起节点的可见性发生变化，在布局（为节点分配位置）之前这里需要现形的调用updateNodesVisibleProperty方法来更新节点的可见性信息
        this.graphInstance.updateNodesVisibleProperty();
        this.layoutMyGraphData();
    },
    async onNodeCollapse() {
        // 展开收起会引起节点的可见性发生变化，在布局（为节点分配位置）之前这里需要现形的调用updateNodesVisibleProperty方法来更新节点的可见性信息
        this.graphInstance.updateNodesVisibleProperty();
        this.layoutMyGraphData();
    },
    async generateImageBase64() {
      const canvasDom = await this.graphInstance.prepareForImageGeneration();
      const imageBlob = await domToImageByModernScreenshot(canvasDom, {
        backgroundColor: '#ffffff'
      });
      await this.graphInstance.restoreAfterImageGeneration();
      if (imageBlob) {
        return await blobToBase64(imageBlob);
      }
      return '';
    },
    async download() {
      if (!this.graphInstance) {
        return;
      }
      const ids = this.jsonData.lines.map(line => line.from);
      const targetNodeIds = _.uniq(ids);
      await Promise.all(targetNodeIds.map((item) => {
        const targetNode = this.graphInstance.getNodeById(item);
        return targetNode ? this.graphInstance.expandNode(targetNode) : Promise.resolve();
      }));
      this.imageBase64 = await this.generateImageBase64();
      if (!this.imageBase64) {
        return;
      }

      const img = new Image();
      img.src = this.imageBase64;
      img.onload = () => {
        const doc = new jsPDF({
          orientation: img.width > img.height ? 'landscape' : 'portrait',
          unit: 'px',
          format: [img.width, img.height]
        });
        doc.addImage(this.imageBase64, 'PNG', 0, 0, img.width, img.height);
        doc.save(`${this.$t('jmLab.Y000966')}.pdf`);
      };
    },
    showNodeMenus(nodeObject, $event) {
      if (!this.graphInstance || !nodeObject) {
        return;
      }
      this.isShowNodeTipsPanel = false;
      this.currentMenuNode = nodeObject;
      const nodeRef = this.$refs[`node-${nodeObject.id}`];
      const nodeDom = Array.isArray(nodeRef) ? nodeRef[0] : nodeRef;
      if (!nodeDom) {
        return;
      }
      const basePosition = this.graphInstance.options.fullscreen ? { x: 0, y: 0 } : this.$refs.myPage.getBoundingClientRect();
      const nodePosition = nodeDom.getBoundingClientRect();
      const offsetTop = nodePosition.top - basePosition.top;
      const offsetLeft = nodePosition.left - basePosition.left;
      let y = offsetTop + 20;
      this.isShowNodeMenuPanel = false;
      this.isShowNodeMenuPanelTechnical = false;
      if (nodeObject.data.description === '技术点') {
        this.isShowNodeMenuPanel = true;
        if (basePosition.bottom && basePosition.bottom - nodePosition.bottom < 80) {
          y = offsetTop - 80;
        }
      } else if (nodeObject.data.description === '技术领域') {
        this.isShowNodeMenuPanelTechnical = true;
      }
      if (this.graphInstance.options.fullscreen) {
        this.nodeMenuPanelPosition.x = $event.clientX - basePosition.x + 10;
        this.nodeMenuPanelPosition.y = $event.clientY - basePosition.y + 10;
      } else {
        this.nodeMenuPanelPosition.x = offsetLeft + 1;
        this.nodeMenuPanelPosition.y = y;
      }
    },
    handleClick(type) {
      this.isShowNodeMenuPanel = false;
      this.isShowNodeMenuPanelTechnical = false;
      if (this.currentMenuNode.data && this.currentMenuNode.data.description === '技术点' && typeof type === 'string') {
        switch (type) {
        case 'edit':
          this.$emit('customBtn', { type: 'dialog-edit', row: { pointCode: this.currentMenuNode.data.cid, pointName: this.currentMenuNode.text, description: this.currentMenuNode.data.description } });
          break;
        case 'del':
          this.$emit('customBtn', { type: 'del', row: { pointCode: this.currentMenuNode.data.cid, pointName: this.currentMenuNode.text } });
          break;
        case 'move': {
          const path = (this.currentMenuNode.data.categoryPath || '').split('/').filter(Boolean);
          const categoryPath = path.length >= 2 ? `${path[0]}/${path[1]}` : path[0] || '';
          const technicalCode = findProductCategory(this.jsonData.nodes, this.currentMenuNode.text, 1);
          this.$emit('customBtn', {
            type: 'move',
            row: {
              pointCode: this.currentMenuNode.data.cid,
              pointName: this.currentMenuNode.text,
              ...this.currentMenuNode.data,
              categoryPath,
              technicalCode
            }
          });
          break;
        }
        case 'copy':
          this.$emit('customBtn', {
            type: 'copy',
            row: {
              pointCode: this.currentMenuNode.data.cid,
              pointName: this.currentMenuNode.text,
              ...this.currentMenuNode.data,
              rootId: this.jsonData.rootId
            }
          });
          break;
        default:
          break;
        }
        return;
      }
      if (this.currentMenuNode.data && this.currentMenuNode.data.description === '技术领域' && typeof type === 'string') {
        switch (type) {
        case 'add':
          this.$emit('handleAdd', { ...this.currentMenuNode.data, rootId: this.jsonData.rootId });
          break;
        case 'associated':
          this.$emit('customBtn', {
            type: 'associated',
            row: {
              pointCode: this.currentMenuNode.data.cid,
              pointName: this.currentMenuNode.text,
              ...this.currentMenuNode.data,
              rootId: this.jsonData.rootId
            }
          });
          break;
        default:
          break;
        }
      }
    },
    showNodeTips(nodeObject, $event) {
      if (!this.graphInstance || !nodeObject || !nodeObject.data || nodeObject.data.description !== '技术点') {
        return;
      }
      if (this.hideTimer) {
        clearTimeout(this.hideTimer);
        this.hideTimer = null;
      }
      this.currentNode = nodeObject;
      this.isShowNodeTipsPanel = true;
      const nodeRef = this.$refs[`node-${nodeObject.id}`];
      const nodeDom = Array.isArray(nodeRef) ? nodeRef[0] : nodeRef;
      if (!nodeDom) {
        return;
      }
      const basePosition = this.graphInstance.options.fullscreen ? { x: 0, y: 0 } : this.$refs.myPage.getBoundingClientRect();
      const nodePosition = nodeDom.getBoundingClientRect();
      const offsetTop = nodePosition.top - basePosition.top;
      const offsetLeft = nodePosition.left - basePosition.left;
      const boundaryThreshold = 180;
      const x = basePosition.right && basePosition.right - nodePosition.right < boundaryThreshold ? offsetLeft - 180 : offsetLeft + 30;
      if (this.graphInstance.options.fullscreen) {
        this.nodeTipsPanelPosition.x = $event.clientX - basePosition.x + 10;
        this.nodeTipsPanelPosition.y = $event.clientY - basePosition.y + 10;
      } else {
        this.nodeTipsPanelPosition.x = x;
        this.nodeTipsPanelPosition.y = offsetTop - 90;
      }
    },
    hideNodeTips() {
      this.hideTimer = setTimeout(() => {
        this.isShowNodeTipsPanel = false;
      }, 100);
    },
    onTooltipMouseEnter() {
      if (this.hideTimer) {
        clearTimeout(this.hideTimer);
        this.hideTimer = null;
      }
    },
    onTooltipMouseLeave() {
      this.isShowNodeTipsPanel = false;
    },
    async getList(obj) {
      try {
        this.loading = true;
        this.isShowNodeTipsPanel = false;
        this.isShowNodeMenuPanel = false;
        this.isShowNodeMenuPanelTechnical = false;
        const targetTree = await this.resolveTreeRoot(obj);
        this.jsonData = this.transformTreeToGraphData(targetTree);
        await this.renderCurrentGraph();
      } catch (e) {
        console.warn(e);
      } finally {
        this.loading = false;
      }
    },
    async resolveTreeRoot(obj) {
      const treeRoot = await fetchTreeJsonData(obj);
      const targetId = obj && obj.row ? obj.row.key || obj.row.pointCode : '';
      if (!targetId) {
        return _.cloneDeep(treeRoot);
      }
      const targetTree = this.findTreeNodeById(treeRoot, targetId);
      return _.cloneDeep(targetTree || treeRoot);
    },
    findTreeNodeById(treeNode, targetId) {
      if (!treeNode) {
        return null;
      }
      if (treeNode.id === targetId) {
        return treeNode;
      }
      const children = Array.isArray(treeNode.children) ? treeNode.children : [];
      for (const child of children) {
        const matched = this.findTreeNodeById(child, targetId);
        if (matched) {
          return matched;
        }
      }
      return null;
    },
    transformTreeToGraphData(rootTree) {
      const nodes = [];
      const lines = [];
      this.flattenTree(rootTree, null, [], nodes, lines);
      return {
        rootId: rootTree.id,
        nodes,
        lines
      };
    },
    flattenTree(treeNode, parentNode, pathTexts, nodes, lines) {
      const children = Array.isArray(treeNode.children) ? treeNode.children : [];
      const isLeaf = children.length === 0;
      const baseData = treeNode.data || {};
      const currentPathTexts = pathTexts.concat(treeNode.text);
      const description = baseData.description || (isLeaf ? '技术点' : '技术领域');
      const pointCode = baseData.cid || treeNode.id;
      const type = baseData.type || (isLeaf ? this.getLeafType(treeNode.id) : '');
      nodes.push({
        id: treeNode.id,
        text: treeNode.text,
        data: {
          ...baseData,
          cid: pointCode,
          pid: parentNode ? parentNode.id : (baseData.pid || ''),
          pointCode,
          description,
          relationCategory: baseData.relationCategory || (!isLeaf && description === '技术领域' ? pointCode : ''),
          categoryPath: baseData.categoryPath || currentPathTexts.join('/'),
          categoryNamePath: currentPathTexts.join(' / '),
          solution: baseData.solution || currentPathTexts.join(' / '),
          type,
          q_value: baseData.q_value ?? '',
          c_value: baseData.c_value ?? '',
          t_value: baseData.t_value ?? ''
        },
        className: this.getNodeClassName(description, type),
        width: description === '技术货架' ? 240 : 220,
        height: 72
      });
      if (parentNode) {
        lines.push({
          from: parentNode.id,
          to: treeNode.id,
          color: '#666',
          lineShape: RGLineShape.StandardOrthogonal,
          showEndArrow: false
        });
      }
      children.forEach((child) => {
        this.flattenTree(child, treeNode, currentPathTexts, nodes, lines);
      });
    },
    getLeafType(nodeId) {
      const hash = String(nodeId || '').split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
      return LEAF_STATUS_TYPES[hash % LEAF_STATUS_TYPES.length];
    },
    getNodeClassName(description, type) {
      if (description === '技术货架') {
        return 'tree-root';
      }
      if (description !== '技术点') {
        return 'technical';
      }
      switch (type) {
      case '03':
        return 'existing';
      case '02':
        return 'under-research';
      case '01':
        return 'planning';
      case '05':
        return 'cancel';
      case '06':
        return 'undeveloped-technology';
      default:
        return 'existing';
      }
    },
    remoteSearch(query) {
      this.$emit('remoteSearch', query);
    },
    handleSelectChange(value) {
      this.$emit('select-change', value);
    },
    highlightKeyword(text, keyword) {
      if (!keyword) {
        return text;
      }
      const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapedKeyword})`, 'gi');
      return text.replace(regex, '<span style="color: #3685f2">$1</span>');
    }
  }
};
</script>

<style scoped lang="scss">
.relation-graph {
  width: 100%;
  height: 100%;

  .c-my-rg-node {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 12px;
    text-align: center;
    font-size: 14px;
    line-height: 1.4;
    border: 1px solid #868181;
    color: #333;
    background-color: #fff;
  }

  .node-text {
    display: -webkit-box;
    overflow: hidden;
    text-overflow: ellipsis;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .is-allow {
    cursor: pointer;
  }

  ::v-deep .tree-root .c-my-rg-node {
    background: #1d4ed8;
    border-color: #1d4ed8;
    color: #fff;
    font-weight: 600;
  }

  ::v-deep .technical .c-my-rg-node {
    background-color: #fff;
    border-color: #9ca3af;
  }

  ::v-deep .under-research .c-my-rg-node {
    background-color: #bdd199;
    color: #fff;
    border-color: transparent;
  }

  ::v-deep .planning .c-my-rg-node {
    background-color: #ff8080;
    color: #fff;
    border-color: transparent;
  }

  ::v-deep .cancel .c-my-rg-node {
    background-color: #eee;
    color: #4b4a4b;
    border-color: transparent;
  }

  ::v-deep .undeveloped-technology .c-my-rg-node {
    background-color: #0288d1;
    color: #fff;
    border-color: transparent;
  }

  ::v-deep .existing .c-my-rg-node {
    background-color: #4b74ff;
    color: #fff;
    border-color: transparent;
  }

  .rg-tooltip {
    position: absolute;
    background-color: #303133;
    color: #fff;
    border-radius: 4px;
    padding: 6px;
    z-index: 2000;
    font-size: 10px;
    line-height: 1.2;
    min-width: 10px;
    word-wrap: break-word;

    .box {
      display: flex;
      align-items: center;
      margin-bottom: 2px;

      &:last-of-type {
        margin-bottom: 0;
      }

      .label,
      .text {
        white-space: nowrap;
      }
    }
  }

  .rg-menu {
    position: absolute;
    border-radius: 2px;
    z-index: 999;
    padding: 0;
    font-size: 11px;
    background-color: #fff;
    border: #eee solid 1px;
    min-width: 5.4rem;
    max-width: 14rem;

    .c-node-menu-item {
      text-align: center;
      line-height: 24px;
      padding: 0 4px;
      cursor: pointer;
    }

    .c-node-menu-item:hover {
      background-color: #edf3fa;
    }
  }
}

.fullscreen-search {
  position: absolute;
  top: 30px;
  left: 60px;
  z-index: 100;

  .search-select-wrapper {
    width: 300px;
    padding: 0 0 8px 10px;
    pointer-events: all;
  }
}
</style>
