<template>
  <div ref="myPage" v-loading="loading" class="relation-graph" @click="handleClick">
    <RelationGraph
      ref="graphRef"
      :options="graphOptions"
      :on-node-click="onNodeClick"
      :on-line-click="onLineClick"
    >
      <template #node="{node}">
        <div
          :ref="`node-${node.id}`"
          class="c-my-rg-node"
          @click="showNodeMenus(node, $event)"
          @contextmenu.prevent.stop="showNodeMenus(node, $event)"
          @mouseover="showNodeTips(node, $event)"
          @mouseout="hideNodeTips(node, $event)"
        >
          <span class="node-text ellipsis-1" :class="{ 'is-allow': node.data && node.data.relationCategory && node.data.description === '技术领域' }">{{ node.text }}</span>
        </div>
      </template>
      <!--  由于组件问题，不允许在dom里面进行逻辑判断，因此右键菜单dom分两个写  -->
      <!--  技术点的右键菜单  -->
      <div slot="graph-plug">
        <div v-if="$refs.graphRef" class="fullscreen-search">
          <div v-if="$refs.graphRef.getInstance().options.fullscreen" class="search-select-wrapper">
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
          v-if="isShowNodeTipsPanel && currentNode.data.description === '技术点'"
          class="rg-tooltip"
          :style="{left: nodeTipsPanelPosition.x + 'px', top: nodeTipsPanelPosition.y + 'px' }"
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
            <div class="text">{{ statusEnum[currentNode.data.type] }}</div>
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
      </div>
    </RelationGraph>
    <div
      v-show="(page && (isShowNodeMenuPanel && currentMenuNode.data.description === '技术点' && (btnAuth(page.btnsDom, 'move') ||
        btnAuth(page.btnsDom, 'dialog-edit') || btnAuth(page.btnsDom, 'del') || btnAuth(page.btnsDom, 'copy'))))"
      class="rg-menu"
      :style="{left: nodeMenuPanelPosition.x + 'px', top: nodeMenuPanelPosition.y + 'px' }"
    >
      <div v-if="page && btnAuth(page.btnsDom, 'move')" class="c-node-menu-item" @click.stop="handleClick('move')">{{ $t('comLab.J000059') }}</div>
      <div v-if="page && btnAuth(page.btnsDom, 'dialog-edit')" class="c-node-menu-item" @click.stop="handleClick('edit')">{{ $t('comLab.J000037') }}</div>
      <div v-if="page && btnAuth(page.btnsDom, 'del')" class="c-node-menu-item" @click.stop="handleClick('del')">{{ $t('jmLab.Y000138') }}</div>
      <div v-if="page && btnAuth(page.btnsDom, 'copy')" class="c-node-menu-item" @click.stop="handleClick('copy')">{{ $t('jmLab.Y000205') }}</div>
    </div>
    <!--  技术领域的右键菜单  -->
    <div
      v-show="isShowNodeMenuPanelTechnical && currentMenuNode.data.description === '技术领域' && (btnAuth(page.btnsDom, 'add') || isAdmin)"
      class="rg-menu"
      :style="{left: nodeMenuPanelPosition.x + 'px', top: nodeMenuPanelPosition.y + 'px' }"
    >
      <div v-if="page && btnAuth(page.btnsDom, 'add')" class="c-node-menu-item" @click.stop="handleClick('add')">{{ $t('jmLab.Y000964') }}</div>
      <div v-if="showAssociated" class="c-node-menu-item" @click.stop="handleClick('associated')">{{ $t('jmLab.Y001044') }}</div>
    </div>
  </div>
</template>
<script>
import _ from 'lodash';
import { jsPDF } from 'jspdf';
import { getPointClassificationTree } from './technical-shelves';
import { findProductCategory } from '@/utils/categoryUtils';
import { CookieUtils } from '@/utils/cookieUtil';
import RelationGraph from 'relation-graph-vue2';
import LegacyMixedTreeLayout, { MIX_LAYOUT_DIRECTION } from './LegacyMixedTreeLayout';
import {getSearchResult} from "@/demo/case20260316/searchData";

export default {
  name: 'TreeXMind',
    components: {RelationGraph},
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
      graphOptionsLr: {
        backgroundImage: '',
        backgroundImageNoRepeat: true,
        allowShowMiniToolBar: true,
        allowSwitchLineShape: true,
        allowSwitchJunctionPoint: true,
        defaultExpandHolderPosition: 'bottom',
        useAnimationWhenRefresh: true,
        defaultNodeBorderWidth: 1,
        defaultNodeShape: 1,
        defaultJunctionPoint: 'tb',
        lineUseTextPath: true,
        graphOffset_y: '-50',
        canvasZoom: 60,
        moveToCenterWhenRefresh: true,
        zoomToFitWhenRefresh: true,
        backgroundColor: '',
        defaultLineShape: 44,
        defaultLineMarker: {
          markerWidth: 12,
          markerHeight: 12,
          refX: 6,
          refY: 6,
          data: 'M2,2 L10,6 L2,10 L6,6 L2,2'
        },
        layout: {
          layoutName: 'tree',
            from: 'left',
            levelDistance: [400, 400, 400, 400]
        }
      },
      graphOptions: {
        backgroundImage: '',
        backgroundImageNoRepeat: true,
        allowShowMiniToolBar: true,
        allowSwitchLineShape: true,
        allowSwitchJunctionPoint: true,
        defaultExpandHolderPosition: 'right',
        useAnimationWhenRefresh: true,
        defaultNodeBorderWidth: 1,
        defaultLineShape: 44,
        defaultNodeShape: 1,
        defaultJunctionPoint: 'lr',
        lineUseTextPath: true,
        graphOffset_y: '-50',
        canvasZoom: 60,
        moveToCenterWhenRefresh: true,
        zoomToFitWhenRefresh: true,
        defaultLineMarker: {
          markerWidth: 12,
          markerHeight: 12,
          refX: 6,
          refY: 6,
          data: 'M2,2 L10,6 L2,10 L6,6 L2,2'
        },
        layout: {
          layoutName: 'fixed'
        },
        backgroundColor: ''
      },
      jsonData: {
        rootId: '',
        nodes: [],
        lines: []
      },
      imageBase64: '',
      isShowCodePanel: false,
      isShowNodeMenuPanel: false,
      nodeMenuPanelPosition: { x: 0, y: 0 },
      nodeTipsPanelPosition: { x: 0, y: 0 },
      isShowNodeTipsPanel: false,
      isShowNodeMenuPanelTechnical: false,
      currentNode: {},
      currentMenuNode: {},
      loading: false,
      hideTimer: null,
      hideMenuTimer: null
    }
  },
  computed: {
    isAdmin() {
      return CookieUtils.getCookie('current-role') === 'ROLE_ADMIN'
    },
    roles() {
      return this.$store.state.user.roles
    },
    // 获取具有关联权限
    showAssociated() {
      return this.roles.includes('technical_associated')
    },
    // 获取用户是否不允许查看QCT
    isNoShowQCT() {
      return this.roles.includes('technical_QCT')
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
        if (val && val.row && (val.row.key || val.row.pointCode)) {
          this.getList(val)
        }
      },
      immediate: true,
      deep: true
    },
    // 修改背景色
    backgroundColor: {
      async handler(val) {
        await this.$nextTick()
        const graphInstance = this.$refs.graphRef && this.$refs.graphRef.getInstance()
        if (!graphInstance) {
          return
        }
        await graphInstance.setOptions(this.getActiveGraphOptions(), true)
      },
      immediate: true
    },
    // 修改结构
    active: {
      async handler() {
        await this.$nextTick()
        if (!this.$refs.graphRef || this.jsonData.nodes.length === 0) {
          return
        }
        await this.renderCurrentGraph()
      },
      immediate: true
    }
  },
  mounted() {
    this.$nextTick(() => {
      setTimeout(() => {
        if (this.jsonData.nodes.length > 0) {
          this.renderCurrentGraph()
          return
        }
        this.showGraph()
      })
    })
  },
  methods: {
    // 获取配置的按钮权限数据，进行判断树图的按钮是否显示
    async btnAuth(btnsDom, type) {
      await this.$nextTick()
      const btn = btnsDom.find(item => item.type === type)
      const domApi = btn && btn.domApi && btn.domApi.split('=')[1]
      return domApi && Object.keys(this.$store.state.user.btnPermission).includes(domApi)
    },
    getActiveGraphOptions() {
      const activeOptions = this.active === '2' ? this.graphOptions : this.graphOptionsLr
      const nextOptions = _.cloneDeep(activeOptions)
      nextOptions.backgroundColor = this.backgroundColor
      return nextOptions
    },
    getCurrentLayoutDirection() {
      return this.active === '2' ? MIX_LAYOUT_DIRECTION.VERTICAL : MIX_LAYOUT_DIRECTION.HORIZONTAL
    },
    async renderCurrentGraph() {
      const graphRef = this.$refs.graphRef
      if (!graphRef) {
        return
      }
      const graphInstance = graphRef.getInstance()
      await graphInstance.setOptions(this.getActiveGraphOptions())
      if (this.jsonData.nodes.length === 0) {
        return
      }
      const searchedData = _.cloneDeep(await getSearchResult());
      await graphRef.setJsonData(searchedData)
      // await graphRef.setJsonData(_.cloneDeep(this.jsonData))
      const mixLayout = new LegacyMixedTreeLayout(graphInstance)
      await mixLayout.apply(searchedData, this.getCurrentLayoutDirection())
        await graphInstance.setZoom(100);
        await graphInstance.moveToCenter()
        await graphInstance.zoomToFit()
    },
    async showGraph() {
      this.jsonData = {
        rootId: '1',
        nodes: [
          {
            id: '1',
            text: this.$t('jmLab.Y001011')
          },
          {
            id: '2',
            text: this.$t('jmLab.Y000833')
          },
          {
            id: '3',
            text: this.$t('jmLab.Y000949')
          },
          {
            id: '3-1',
            text: this.$t('jmLab.Y000949')
          },
          {
            id: '3-2',
            text: this.$t('jmLab.Y001012')
          },
          {
            id: '3-1-1',
            text: this.$t('jmLab.Y001012')
          }
        ],
        lines: [
          {
            from: '1',
            to: '2',
            color: '#666',
            showEndArrow: false
          },
          {
            from: '2',
            to: '3',
            color: '#666',
            showEndArrow: false
          },
          {
            from: '3',
            to: '3-1',
            color: '#666',
            showEndArrow: false
          },
          {
            from: '3',
            to: '3-2',
            color: '#666',
            showEndArrow: false
          },
          {
            from: '3-1',
            to: '3-1-1',
            color: '#666',
            showEndArrow: false
          }
        ]
      }
      await this.renderCurrentGraph()
    },
    onNodeClick(nodeObject, $event) {
      if (!this.currentTreeNode) return
      if (nodeObject.data.description === '技术点') {
        this.$emit('customBtn', { type: 'detail', row: { ...nodeObject.data, pointName: nodeObject.text }})
      } else if (nodeObject.data.description === '技术领域' && nodeObject.data.relationCategory) {
        this.getList({ row: { key: nodeObject.data.relationCategory }})
      }
    },
    onLineClick(lineObject, $event) {
      console.log('onLineClick:', lineObject)
    },
    async download() {
      const ids = this.jsonData.lines.map(line => line.from)
      const targetNodeIds = _.uniq(ids)
      const graphInstance = this.$refs.graphRef.getInstance();
      const targetNodeFun = async(item) => {
        const targetNode = graphInstance.getNodeById(item);
        await graphInstance.expandNode(targetNode);
      }
      await Promise.all(targetNodeIds.map(targetNodeFun))
      // 获取canvas元素
      this.imageBase64 = await graphInstance.getImageBase64()

      // 创建图片对象以获取实际尺寸
      const img = new Image();
      img.src = this.imageBase64;

      img.onload = () => {
        // 使用图片实际尺寸创建PDF
        const doc = new jsPDF({
          orientation: img.width > img.height ? 'landscape' : 'portrait',
          unit: 'px',
          format: [img.width, img.height]
        });

        // 添加图像到PDF，使用实际尺寸
        doc.addImage(this.imageBase64, 'PNG', 0, 0, img.width, img.height);

        // 保存PDF
        doc.save(`${this.$t('jmLab.Y000966')}.pdf`);
      };
    },
    // 右键菜单
    showNodeMenus(nodeObject, $event) {
      if (!this.currentTreeNode) return
      this.isShowNodeTipsPanel = false;
      this.currentMenuNode = nodeObject;
      const _base_position = this.$refs.graphRef.getInstance().options.fullscreen ? { x: 0, y: 0 } : this.$refs.myPage.getBoundingClientRect();
      const node_position = this.$refs[`node-${nodeObject.id}`].getBoundingClientRect()
      const offsetTop = node_position.top - _base_position.top
      const offsetLeft = node_position.left - _base_position.left
      // console.log('showNodeMenus:', node_position, offsetTop, offsetLeft, _base_position);
      let y
      if (nodeObject.data.description === '技术点') {
        this.isShowNodeMenuPanel = true;
        if (_base_position.bottom - node_position.bottom < 80) {
          y = offsetTop - 80;
        } else {
          y = offsetTop + 20;
        }
      } else if (nodeObject.data.description === '技术领域') {
        this.isShowNodeMenuPanelTechnical = true;
        y = offsetTop + 20;
      }
      if (this.$refs.graphRef.getInstance().options.fullscreen) {
        this.nodeMenuPanelPosition.x = $event.clientX - _base_position.x + 10;
        this.nodeMenuPanelPosition.y = $event.clientY - _base_position.y + 10;
      } else {
        this.nodeMenuPanelPosition.x = offsetLeft + 1;
        this.nodeMenuPanelPosition.y = y
      }
    },
    // 右键菜单点击
    handleClick(type) {
      if (!this.currentTreeNode) return
      if (this.currentMenuNode.data && this.currentMenuNode.data.description) {
        if (this.currentMenuNode.data.description === '技术点') {
          this.isShowNodeMenuPanel = false;
        } else if (this.currentMenuNode.data.description === '技术领域') {
          this.isShowNodeMenuPanelTechnical = false;
        }
      }
      switch (type) {
        case 'add':
          this.$emit('handleAdd', { ...this.currentMenuNode.data, rootId: this.jsonData.rootId })
          break
        case 'edit':
          this.$emit('customBtn', { type: 'dialog-edit', row: { pointCode: this.currentMenuNode.data.cid, pointName: this.currentMenuNode.text, description: this.currentMenuNode.data.description }})
          break
        case 'del':
          this.$emit('customBtn', { type: 'del', row: { pointCode: this.currentMenuNode.data.cid, pointName: this.currentMenuNode.text }})
          break
        case 'move':
        {
          const path = this.currentMenuNode.data.categoryPath.split('/')
          const categoryPath = `${path[0]}/${path[1]}`
          const technicalCode = findProductCategory(this.jsonData.nodes, this.currentMenuNode.text, 1)
          this.$emit('customBtn',
              { type: 'move',
                row: {
                  pointCode: this.currentMenuNode.data.cid,
                  pointName: this.currentMenuNode.text,
                  ...this.currentMenuNode.data,
                  categoryPath,
                  technicalCode
                }})
        }
          break
        case 'copy':
          this.$emit('customBtn',
              { type: 'copy',
                row: {
                  pointCode: this.currentMenuNode.data.cid,
                  pointName: this.currentMenuNode.text,
                  ...this.currentMenuNode.data,
                  rootId: this.jsonData.rootId
                }})
          break
        case 'associated':
          this.$emit('customBtn', {
            type: 'associated',
            row: {
              pointCode: this.currentMenuNode.data.cid,
              pointName: this.currentMenuNode.text,
              ...this.currentMenuNode.data,
              rootId: this.jsonData.rootId
            }
          })
      }
    },
    // 鼠标悬浮显示浮层
    showNodeTips(nodeObject, $event) {
      if (!this.currentTreeNode) return
      // Clear any existing hide timer
      if (this.hideTimer) {
        clearTimeout(this.hideTimer);
        this.hideTimer = null;
      }
      this.currentNode = nodeObject
      this.isShowNodeTipsPanel = true;
      const _base_position = this.$refs.graphRef.getInstance().options.fullscreen ? { x: 0, y: 0 } : this.$refs.myPage.getBoundingClientRect();
      const node_position = this.$refs[`node-${nodeObject.id}`].getBoundingClientRect()
      const offsetTop = node_position.top - _base_position.top
      const offsetLeft = node_position.left - _base_position.left
      const boundaryThreshold = 120; // Add buffer to prevent flickering
      let x
      if (_base_position.right - node_position.right < boundaryThreshold) {
        x = offsetLeft - 150;
      } else {
        x = offsetLeft + 30;
      }
      if (this.$refs.graphRef.getInstance().options.fullscreen) {
        this.nodeTipsPanelPosition.x = $event.clientX - _base_position.x + 10;
        this.nodeTipsPanelPosition.y = $event.clientY - _base_position.y + 10;
      } else {
        this.nodeTipsPanelPosition.x = x
        this.nodeTipsPanelPosition.y = offsetTop - 80;
      }
    },
    // 鼠标移出关闭悬浮框
    hideNodeTips(nodeObject, $event) {
      // Use a timer to delay hiding the tooltip
      this.hideTimer = setTimeout(() => {
        this.isShowNodeTipsPanel = false;
      }, 100);
    },
    // 鼠标进入悬浮框
    onTooltipMouseEnter() {
      // Cancel any pending hide operations when mouse enters the tooltip
      if (this.hideTimer) {
        clearTimeout(this.hideTimer);
        this.hideTimer = null;
      }
    },
    // 鼠标移出悬浮框
    onTooltipMouseLeave() {
      // Hide tooltip when mouse leaves it
      this.isShowNodeTipsPanel = false;
    },
    async getList(obj) {
      try {
        this.isShowNodeTipsPanel = false;
        this.isShowNodeMenuPanel = false;
        this.isShowNodeMenuPanelTechnical = false;
        // this.loading = true
        const { data: treeData } = await getPointClassificationTree({
          cid: obj.row.key,
          pointCode: obj.row.pointCode
        })
        if (!treeData || treeData.length === 0) {
          this.jsonData = {
            rootId: '',
            nodes: [],
            lines: []
          }
          return
        }
        this.jsonData = treeData
        await this.renderCurrentGraph()
      } catch (e) {
        console.warn(e)
      } finally {
        this.loading = false
      }
    },
    remoteSearch(query) {
      this.$emit('remoteSearch', query);
    },
    handleSelectChange(value) {
      this.$emit('select-change', value);
    },
    // 树图下拉项关键词高亮
    highlightKeyword(text, keyword) {
      if (!keyword) return text;
      const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapedKeyword})`, 'gi');
      return text.replace(regex, '<span style="color: #3685f2">$1</span>');
    }
  }
}
</script>
<style scoped lang="scss">
.relation-graph {
  width: 100%;
  height: 100%;
  .c-my-rg-node {
    border-radius: 4px;
    line-height: 28px;
      height: 80px;
      width: 200px;
      display: flex;
      place-items: center;
      justify-content: center;
    font-size: 14px;
    border: 1px solid #868181;
    color: #333;
    background-color: #fff;
    .node-text {
      display: block;
      padding: 2px 4px;
    }
    .is-allow {
      cursor: pointer;
    }
  }
  .technical .c-my-rg-node {
    border: none;
  }
  ::v-deep {
    .technical {
      background-color: #fff !important;
    }
    .under-research {
      background-color: #BDD199 !important;
    }
    .planning {
      background-color: #FF8080 !important;
    }
    .cancel {
      background-color: #eee !important;
    }
    .undeveloped-technology {
      background-color: #0288D1 !important;
    }
  }
  .under-research .c-my-rg-node {
    background-color: #BDD199;
    color: #fff;
    border: transparent;
  }
  .planning .c-my-rg-node {
    background-color: #FF8080;
    color: #fff;
    border: transparent;
  }
  .cancel .c-my-rg-node {
    background-color: #eee;
    color: #4B4A4B;
    border: transparent;
  }
  .undeveloped-technology .c-my-rg-node {
    background-color: #0288D1;
    color: #fff;
    border: transparent;
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
      .label, .text {
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
    background-color: #ffffff;
    border:#eeeeee solid 1px;
    min-width: 5.4rem;
    max-width: 14rem;
    .c-node-menu-item{
      text-align: center;
      line-height: 24px;
      padding: 0 4px;
      cursor: pointer;
    }
    .c-node-menu-item:hover{
      background-color: #EDF3FA;
    }
  }
}
.fullscreen-search {
  position:absolute;
  top:30px;
  left:60px;
  z-index:100;
  .search-select-wrapper {
    padding: 0 0 8px 10px;
    width: 300px;
  }
}
</style>
