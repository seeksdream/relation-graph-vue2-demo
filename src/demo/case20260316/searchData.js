export const getSearchResult = async() => {
    return {
        "rootId": "J202506241737440001",
        "nodes": [
            {
                "id": "J202506241737440001",
                "text": "技术货架3",
                "textEn": "En-技术货架3",
                "data": {
                    "cid": "J202506241737440001",
                    "pid": "ICM",
                    "description": "技术货架",
                    "type": null,
                    "solution": null,
                    "q_value": null,
                    "c_value": null,
                    "t_value": null,
                    "categoryPath": null,
                    "categoryId": null,
                    "relationCategory": null
                },
                "styleClass": "technical",
                "width": 120
            },
            {
                "id": "P202603161552130001",
                "text": "智能卫浴",
                "textEn": null,
                "data": {
                    "cid": "P202603161552130001",
                    "pid": "J202506241737440001",
                    "description": "产品大类",
                    "type": null,
                    "solution": null,
                    "q_value": null,
                    "c_value": null,
                    "t_value": null,
                    "categoryPath": null,
                    "categoryId": null,
                    "relationCategory": null
                },
                "styleClass": "technical",
                "width": 120
            },
            {
                "id": "P202603161625260779",
                "text": "智能座便器",
                "textEn": null,
                "data": {
                    "cid": "P202603161625260779",
                    "pid": "P202603161552130001",
                    "description": "产品大类",
                    "type": null,
                    "solution": null,
                    "q_value": null,
                    "c_value": null,
                    "t_value": null,
                    "categoryPath": null,
                    "categoryId": null,
                    "relationCategory": null
                },
                "styleClass": "technical",
                "width": 120
            },
            {
                "id": "D202603161625260780",
                "text": "康养系统",
                "textEn": null,
                "data": {
                    "cid": "D202603161625260780",
                    "pid": "P202603161625260779",
                    "description": "技术领域",
                    "type": null,
                    "solution": null,
                    "q_value": null,
                    "c_value": null,
                    "t_value": null,
                    "categoryPath": null,
                    "categoryId": null,
                    "relationCategory": null
                },
                "styleClass": "technical",
                "width": 120
            },
            {
                "id": "D202603161625260782",
                "text": "材料子系统",
                "textEn": null,
                "data": {
                    "cid": "D202603161625260782",
                    "pid": "D202603161625260780",
                    "description": "技术领域",
                    "type": null,
                    "solution": null,
                    "q_value": null,
                    "c_value": null,
                    "t_value": null,
                    "categoryPath": null,
                    "categoryId": null,
                    "relationCategory": null
                },
                "styleClass": "technical",
                "width": 120
            },
            {
                "id": "D202603161625260783",
                "text": "驱动模块",
                "textEn": null,
                "data": {
                    "cid": "D202603161625260783",
                    "pid": "D202603161625260782",
                    "description": "技术领域",
                    "type": null,
                    "solution": null,
                    "q_value": null,
                    "c_value": null,
                    "t_value": null,
                    "categoryPath": null,
                    "categoryId": null,
                    "relationCategory": null
                },
                "styleClass": "technical",
                "width": 120
            },
            {
                "id": "D202603161625260784",
                "text": "铰链组件",
                "textEn": null,
                "data": {
                    "cid": "D202603161625260784",
                    "pid": "D202603161625260783",
                    "description": "技术领域",
                    "type": null,
                    "solution": null,
                    "q_value": null,
                    "c_value": null,
                    "t_value": null,
                    "categoryPath": null,
                    "categoryId": null,
                    "relationCategory": null
                },
                "styleClass": "technical",
                "width": 120
            },
            {
                "id": "D202603161625260785",
                "text": "不锈钢",
                "textEn": null,
                "data": {
                    "cid": "D202603161625260785",
                    "pid": "D202603161625260784",
                    "description": "技术领域",
                    "type": null,
                    "solution": null,
                    "q_value": null,
                    "c_value": null,
                    "t_value": null,
                    "categoryPath": null,
                    "categoryId": null,
                    "relationCategory": null
                },
                "styleClass": "technical",
                "width": 120
            },
            {
                "id": "JSD202603161625260786",
                "text": "高亮不锈钢铰链技术（2024）",
                "textEn": null,
                "data": {
                    "cid": "JSD202603161625260786",
                    "pid": "D202603161625260785",
                    "description": "技术点",
                    "type": "06",
                    "solution": null,
                    "q_value": null,
                    "c_value": null,
                    "t_value": null,
                    "categoryPath": "技术货架3/智能卫浴/智能座便器/康养系统/材料子系统/驱动模块/铰链组件/不锈钢",
                    "categoryId": 1122,
                    "relationCategory": null
                },
                "styleClass": "undeveloped-technology",
                "width": 120
            }
        ],
        "lines": [
            {
                "from": "J202506241737440001",
                "to": "P202603161552130001"
            },
            {
                "from": "P202603161552130001",
                "to": "P202603161625260779"
            },
            {
                "from": "P202603161625260779",
                "to": "D202603161625260780"
            },
            {
                "from": "D202603161625260780",
                "to": "D202603161625260782"
            },
            {
                "from": "D202603161625260782",
                "to": "D202603161625260783"
            },
            {
                "from": "D202603161625260783",
                "to": "D202603161625260784"
            },
            {
                "from": "D202603161625260784",
                "to": "D202603161625260785"
            },
            {
                "from": "D202603161625260785",
                "to": "JSD202603161625260786"
            }
        ]
    }
}
