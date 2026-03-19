const flatTreeNode = (orign_nodes, parentNode, nodesCollect, linesCollect) => {
    orign_nodes.forEach(thisOrignNode => {
        nodesCollect.push({
            ...thisOrignNode,
            children: undefined
        });
        if (parentNode) {
            linesCollect.push({
                from: parentNode.id,
                to: thisOrignNode.id
            });
        }
        const _childs = thisOrignNode.children;
        if (_childs && _childs.length > 0) {
            flatTreeNode(_childs, thisOrignNode, nodesCollect, linesCollect);
        }
    });
}

const styleClass = (type) => {
    switch (type) {
        case '03': // 已有技术
            return 'existing'
        case '02': // 在研技术
            return 'under-research'
        case '01': // 规划技术
            return 'planning'
        case '05': // 取消技术
            return 'cancel'
        case '06': // 未研发技术
            return 'undeveloped-technology'
    }
}
export async function getPointClassificationTree(myTreeJsonData) {
    const nodes = [];
    const lines = [];
    flatTreeNode([myTreeJsonData], null, nodes, lines);
    nodes.forEach(item => {
        // item.data = {};
        item.styleClass = ['技术货架', '产品大类', '技术领域'].includes(item.data.description) ? 'technical' : styleClass(item.data.type)
    })
    return {
        rootId: myTreeJsonData.id,
        nodes,
        lines
    };
}
