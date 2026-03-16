const mockTreeData = [
  {
    id: "root",
    text: "技术货架",
    data: {
      cid: "root",
      pid: "",
      description: "技术领域",
      type: "03",
      relationCategory: "mock-domain"
    }
  },
  {
    id: "node-1",
    text: "基础能力",
    data: {
      cid: "node-1",
      pid: "root",
      description: "技术点",
      type: "02",
      solution: "能力沉淀",
      q_value: "Q1",
      c_value: "C1",
      t_value: "T1"
    }
  },
  {
    id: "node-2",
    text: "数据治理",
    data: {
      cid: "node-2",
      pid: "root",
      description: "技术点",
      type: "01",
      solution: "标准化治理",
      q_value: "Q2",
      c_value: "C2",
      t_value: "T2"
    }
  },
  {
    id: "node-3",
    text: "可视化",
    data: {
      cid: "node-3",
      pid: "node-2",
      description: "技术点",
      type: "06",
      solution: "图谱展示",
      q_value: "Q3",
      c_value: "C3",
      t_value: "T3"
    }
  }
];

export async function getPointClassificationTree() {
  return {
    data: mockTreeData
  };
}

export async function searchPoints() {
  return {
    data: []
  };
}
