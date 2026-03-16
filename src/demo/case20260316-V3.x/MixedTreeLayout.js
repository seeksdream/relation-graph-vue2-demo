const LINE_SHAPE_ORTHOGONAL = 44;
const ROOT_TO_GROUP_GAP = 180;
const GROUP_HORIZONTAL_GAP = 96;
const ROOT_VERTICAL_OFFSET = 120;

export default class MixedTreeLayout {
  constructor(graphInstance) {
    this.graphInstance = graphInstance;
  }

  async apply(jsonData) {
    if (!jsonData || !Array.isArray(jsonData.nodes) || jsonData.nodes.length === 0) {
      return;
    }
    const { rootId, childrenMap } = this.buildTreeMeta(jsonData);
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
      this.graphInstance.dataUpdated();
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
        treeNodeGapH: 150,
        treeNodeGapV: 24,
        layoutExpansionDirection: 'end'
      });
      layouter.placeNodes(groupNodes, groupRootNode);
      const groupBounds = this.getNodesBounds(groupNodes);
      nextGroupX = groupBounds.maxX + GROUP_HORIZONTAL_GAP;
      allGroupNodes.push(...groupNodes);
    });

    if (allGroupNodes.length === 0) {
      return;
    }

    const groupBounds = this.getNodesBounds(allGroupNodes);
    const rootWidth = this.getNodeWidth(rootNode);
    const rootHeight = this.getNodeHeight(rootNode);
    const rootX = groupBounds.minX + (groupBounds.width - rootWidth) / 2;
    const rootY = groupBounds.minY - rootHeight - ROOT_VERTICAL_OFFSET;
    this.graphInstance.updateNodePosition(rootNode, rootX, rootY);
    this.applyLineStyles(rootId, levelOneIds);
    this.graphInstance.dataUpdated();
  }

  buildTreeMeta(jsonData) {
    const childrenMap = {};
    const parentMap = {};
    jsonData.nodes.forEach((node) => {
      childrenMap[node.id] = [];
    });
    jsonData.lines.forEach((line) => {
      if (!line || !line.from || !line.to) {
        return;
      }
      if (!childrenMap[line.from]) {
        childrenMap[line.from] = [];
      }
      childrenMap[line.from].push(line.to);
      parentMap[line.to] = line.from;
    });
    const rootId = jsonData.rootId || jsonData.nodes.find((node) => !parentMap[node.id])?.id;
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
      line.fromJunctionPoint = isRootLine ? 'bottom' : 'right';
      line.toJunctionPoint = isRootLine ? 'top' : 'left';
      if (!line.color) {
        line.color = '#666';
      }
    });
  }

  getNodesBounds(nodes) {
    if (!Array.isArray(nodes) || nodes.length === 0) {
      return {
        minX: 0,
        minY: 0,
        maxX: 0,
        maxY: 0,
        width: 0,
        height: 0
      };
    }
    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    nodes.forEach((node) => {
      const nodeX = typeof node.x === 'number' ? node.x : 0;
      const nodeY = typeof node.y === 'number' ? node.y : 0;
      const nodeWidth = this.getNodeWidth(node);
      const nodeHeight = this.getNodeHeight(node);
      minX = Math.min(minX, nodeX);
      minY = Math.min(minY, nodeY);
      maxX = Math.max(maxX, nodeX + nodeWidth);
      maxY = Math.max(maxY, nodeY + nodeHeight);
    });

    return {
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  getNodeWidth(node) {
    return node.el_W || node.width || 220;
  }

  getNodeHeight(node) {
    return node.el_H || node.height || 72;
  }
}
