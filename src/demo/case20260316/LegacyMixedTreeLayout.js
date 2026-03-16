export const MIX_LAYOUT_DIRECTION = {
  VERTICAL: 'vertical',
  HORIZONTAL: 'horizontal'
}

const ROOT_GAP = {
  vertical: 180,
  horizontal: 240
}

const GROUP_GAP = {
  vertical: 96,
  horizontal: 72
}

const LINE_SHAPE_ORTHOGONAL = 44

export default class LegacyMixedTreeLayout {
  constructor(graphInstance) {
    this.graphInstance = graphInstance
  }

  async apply(jsonData, direction = MIX_LAYOUT_DIRECTION.VERTICAL) {
    if (!jsonData || !Array.isArray(jsonData.nodes) || jsonData.nodes.length === 0) {
      return
    }
    const { rootId, childrenMap } = this.buildTreeMeta(jsonData)
    if (!rootId) {
      return
    }
    const rootNode = this.graphInstance.getNodeById(rootId)
    if (!rootNode) {
      return
    }
    const level1Ids = childrenMap[rootId] || []
    this.applyLineStyles(rootId, level1Ids, direction)
    if (level1Ids.length === 0) {
      this.graphInstance.setNodePosition(rootNode, 0, 0)
      return
    }

    const allGroupNodes = []
    let nextPrimary = 0

    level1Ids.forEach((groupRootId) => {
      const groupNodes = this.getSubtreeNodes(groupRootId, childrenMap)
      if (groupNodes.length === 0) {
        return
      }
      const groupRootNode = this.graphInstance.getNodeById(groupRootId)
      if (!groupRootNode) {
        return
      }
      const anchor = direction === MIX_LAYOUT_DIRECTION.VERTICAL
        ? { x: nextPrimary, y: ROOT_GAP[direction] }
        : { x: ROOT_GAP[direction], y: nextPrimary }
      this.graphInstance.setNodePosition(groupRootNode, anchor.x, anchor.y)
      const groupLayout = this.graphInstance.createLayout(this.getGroupLayoutOptions(direction))
      groupLayout.isMainLayouer = false
      groupLayout.layoutOptions.fixedRootNode = true
      groupLayout.placeNodes(groupNodes, groupRootNode)
      allGroupNodes.push(...groupNodes)
      const groupBox = this.graphInstance.getStuffSize(groupNodes)
      nextPrimary = direction === MIX_LAYOUT_DIRECTION.VERTICAL
        ? groupBox.maxX + GROUP_GAP[direction]
        : groupBox.maxY + GROUP_GAP[direction]
    })

    if (allGroupNodes.length === 0) {
      return
    }

    const groupsBox = this.graphInstance.getStuffSize(allGroupNodes)
    const rootWidth = this.getNodeWidth(rootNode)
    const rootHeight = this.getNodeHeight(rootNode)
    if (direction === MIX_LAYOUT_DIRECTION.VERTICAL) {
      const rootX = groupsBox.minX + (groupsBox.width - rootWidth) / 2
      const rootY = groupsBox.minY - rootHeight - 120
      this.graphInstance.setNodePosition(rootNode, rootX, rootY)
      jsonData.nodes.forEach(node => {
        node.alignItems = 'left';
      })
    } else {
      const rootX = groupsBox.minX - rootWidth - 140
      const rootY = groupsBox.minY + (groupsBox.height - rootHeight) / 2
      this.graphInstance.setNodePosition(rootNode, rootX, rootY)
      jsonData.nodes.forEach(node => {
        node.alignItems = 'left';
      })
      await this.graphInstance.doLayout();
    }
  }

  buildTreeMeta(jsonData) {
    const childrenMap = {}
    const parentMap = {}
    jsonData.nodes.forEach((node) => {
      childrenMap[node.id] = []
    })
    jsonData.lines.forEach((line) => {
      if (!line.from || !line.to) {
        return
      }
      if (!childrenMap[line.from]) {
        childrenMap[line.from] = []
      }
      childrenMap[line.from].push(line.to)
      parentMap[line.to] = line.from
    })
    const rootId = jsonData.rootId || jsonData.nodes.find((node) => !parentMap[node.id])?.id
    return {
      rootId,
      childrenMap
    }
  }

  getSubtreeNodes(groupRootId, childrenMap) {
    const nodeIds = []
    const pending = [groupRootId]
    while (pending.length > 0) {
      const currentId = pending.shift()
      if (!currentId || nodeIds.includes(currentId)) {
        continue
      }
      nodeIds.push(currentId)
      const children = childrenMap[currentId] || []
      children.forEach((childId) => pending.push(childId))
    }
    return nodeIds
      .map((nodeId) => this.graphInstance.getNodeById(nodeId))
      .filter(Boolean)
  }

  getGroupLayoutOptions(direction) {
    if (direction === MIX_LAYOUT_DIRECTION.VERTICAL) {
      return {
        layoutName: 'folder',
        from: 'left',
        levelDistance: [300, 300],
        min_per_height: 100,
        max_per_height: 100,
        layoutExpansionDirection: 'bottom'
      }
    }
    return {
      layoutName: 'tree',
      from: 'left',
      treeNodeGapH: 18,
      treeNodeGapV: 120,
      layoutExpansionDirection: 'center'
    }
  }

  applyLineStyles(rootId, level1Ids, direction) {
    const level1IdSet = new Set(level1Ids)
    this.graphInstance.getLines().forEach((line) => {
      const isRootLine = line.from === rootId && level1IdSet.has(line.to)
      if (direction === MIX_LAYOUT_DIRECTION.VERTICAL) {
        line.fromJunctionPoint = isRootLine ? 'bottom' : 'bottom'
        line.toJunctionPoint = isRootLine ? 'top' : 'left'
      } else {
        line.fromJunctionPoint = isRootLine ? 'right' : 'right'
        line.toJunctionPoint = isRootLine ? 'left' : 'left'
      }
      line.lineShape = LINE_SHAPE_ORTHOGONAL
      line.showEndArrow = false
      if (!line.color) {
        line.color = '#666'
      }
    })
  }

  getNodeWidth(node) {
    return node.el_W || node.width || 140
  }

  getNodeHeight(node) {
    return node.el_H || node.height || 44
  }
}
