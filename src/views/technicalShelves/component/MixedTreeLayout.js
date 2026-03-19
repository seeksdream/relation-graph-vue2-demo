const LINE_SHAPE_ORTHOGONAL = 44;
const ROOT_TO_GROUP_GAP = 180;
const GROUP_HORIZONTAL_GAP = 96;
const ROOT_VERTICAL_OFFSET = 120;

export default class MixedTreeLayout {
  constructor(graphInstance) {
    this.graphInstance = graphInstance;
  }

  async apply() {
    const nodes = this.graphInstance.getNodes();
    if (!Array.isArray(nodes) || nodes.length === 0) {
      return;
    }
    const { rootId, childrenMap } = await this.buildTreeMeta();
    if (!rootId) {
      return;
    }
    const rootNode = this.graphInstance.getNodeById(rootId);
    if (!rootNode) {
      return;
    }
    const levelOneIds = childrenMap[rootId] || [];
    if (levelOneIds.length === 0) {
      this.graphInstance.updateNodePosition(rootNode, 0, 0);
      this.applyLineStyles(rootId, levelOneIds);
      return;
    }

    let nextGroupX = 0;
    const allGroupNodes = [];

    levelOneIds.forEach((groupRootId) => {
      const groupRootNode = this.graphInstance.getNodeById(groupRootId);
      if (!groupRootNode) {
        return;
      }
      const groupNodes = this.getSubtreeNodes(groupRootId, childrenMap);
      if (groupNodes.length === 0) {
        return;
      }
      this.graphInstance.updateNodePosition(groupRootNode, nextGroupX, ROOT_TO_GROUP_GAP);
      const layouter = this.graphInstance.createLayout({
        layoutName: 'folder',
        from: 'left',
        simpleTree: true,
        treeNodeGapH: 10,
        treeNodeGapV: 24,
        layoutExpansionDirection: 'end'
      });
      layouter.placeNodes(groupNodes, groupRootNode);
      const groupBounds = this.graphInstance.getNodesRectBox(groupNodes);
      nextGroupX = groupBounds.maxX + GROUP_HORIZONTAL_GAP;
      allGroupNodes.push(...groupNodes);
    });

    if (allGroupNodes.length === 0) {
      return;
    }

    const groupBounds = this.graphInstance.getNodesRectBox(allGroupNodes);
    const rootWidth = this.getNodeWidth(rootNode);
    const rootHeight = this.getNodeHeight(rootNode);
    const rootX = groupBounds.minX + (groupBounds.width - rootWidth) / 2;
    const rootY = groupBounds.minY - rootHeight - ROOT_VERTICAL_OFFSET;
    this.graphInstance.updateNodePosition(rootNode, rootX, rootY);
    this.applyLineStyles(rootId, levelOneIds);
  }

  buildTreeMeta() {
    const nodes = this.graphInstance.getNodes();
    const lines = this.graphInstance.getLines();
    const childrenMap = {};
    const parentMap = {};
    nodes.forEach((node) => {
      childrenMap[node.id] = [];
    });
    lines.forEach((line) => {
      if (!line || !line.from || !line.to) {
        return;
      }
      if (!childrenMap[line.from]) {
        childrenMap[line.from] = [];
      }
      childrenMap[line.from].push(line.to);
      parentMap[line.to] = line.from;
    });
    const rootId = this.graphInstance.getRootNode()?.id || nodes.find((node) => !parentMap[node.id])?.id;
    return { rootId, childrenMap };
  }

  getSubtreeNodes(groupRootId, childrenMap) {
    const nodeIds = [];
    const pending = [groupRootId];
    while (pending.length > 0) {
      const currentId = pending.shift();
      if (!currentId || nodeIds.includes(currentId)) {
        continue;
      }
      nodeIds.push(currentId);
      const children = childrenMap[currentId] || [];
      children.forEach((childId) => pending.push(childId));
    }
    return nodeIds
      .map((nodeId) => this.graphInstance.getNodeById(nodeId))
      .filter(Boolean);
  }

  applyLineStyles(rootId, levelOneIds) {
    const levelOneSet = new Set(levelOneIds);
    this.graphInstance.getLines().forEach((line) => {
      const isRootLine = line.from === rootId && levelOneSet.has(line.to);
      line.lineShape = LINE_SHAPE_ORTHOGONAL;
      line.showEndArrow = false;
      line.fromJunctionPoint = isRootLine ? 'bottom' : 'bottom';
      line.toJunctionPoint = isRootLine ? 'top' : 'left';
      if (!line.color) {
        line.color = '#666';
      }
    });
  }
  getNodeWidth(node) {
    return node.el_W || node.width || 220;
  }

  getNodeHeight(node) {
    return node.el_H || node.height || 72;
  }
}
