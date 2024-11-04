<template>
  <div ref="graphContainer" style="width: 100%; height: 600px;"></div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import G6 from '@antv/g6';


// 接收父组件传递的 jsonPath 属性
const props = defineProps({
  jsonPath: {
    type: String,
    required: false, // 如果没有选中的课程图表，jsonPath 可能为 null
  }
});

const graphContainer = ref(null);
let graph = null;

// 动态导入 src/assets/data/sample-graph-data/ 中的所有 JSON 文件
const graphFiles = import.meta.glob('../assets/data/sample-graph-data/*.json');

// 打印所有匹配的文件路径（调试）
console.log('匹配的 JSON 文件:', graphFiles);

// 递归解析 JSON 数据为 G6 可用的 nodes 和 edges
const parseData = (data, parentId = null, nodes = [], edges = []) => {
  const nodeId = data.name; // 使用 name 作为节点的 id
  nodes.push({
    id: nodeId,
    label: data.name,
  });

  if (parentId) {
    edges.push({
      source: parentId,
      target: nodeId,
    });
  }

  if (data.children) {
    data.children.forEach((child) => {
      parseData(child, nodeId, nodes, edges);
    });
  }

  return { nodes, edges };
};

// 初始化 G6 图表
const initializeGraph = (graphData) => {
  if (graph) {
    graph.destroy(); // 销毁之前的图表实例，避免重复渲染
  }

  // 创建 G6 图表实例
  graph = new G6.Graph({
    container: graphContainer.value,
    width: graphContainer.value.clientWidth,
    height: 600,
    layout: {
      type: 'force', // 力导向布局
      preventOverlap: true,
    },
    defaultNode: {
      size: 30,
      style: {
        fill: '#40a9ff',
        stroke: '#096dd9',
      },
      labelCfg: {
        position: 'bottom',
        offset: 5,
        style: {
          fontSize: 12,
          fill: '#000',
        },
      },
    },
    defaultEdge: {
      style: {
        stroke: '#e2e2e2',
        endArrow: true,
      },
    },
    modes: {
      default: ['drag-canvas', 'zoom-canvas'], // 支持拖拽和缩放
    },
  });

  // 加载数据并渲染图表
  graph.data(graphData);
  graph.render();
};

// 根据 jsonPath 动态加载 JSON 数据
const loadGraphData = async () => {
  if (!props.jsonPath) {
    console.warn('没有传递 jsonPath'); // 调试输出
    return; // 如果没有传递 jsonPath，直接返回
  }

  // 手动处理路径拼接，确保没有多余的斜杠
  const filePath = `../assets/data/sample-graph-data/${props.jsonPath}`.replace(/\/{2,}/g, '/');

  // 调试输出：查看路径和是否找到对应的文件
  console.log('构造的文件路径:', filePath);

  try {
    // 检查文件是否存在于 graphFiles 中
    const loadFile = graphFiles[filePath];

    if (!loadFile) {
      throw new Error(`文件 ${filePath} 未找到`);
    }

    // 动态导入 JSON 文件
    const rawData = await loadFile();

    // 调试输出：查看加载的文件内容
    console.log('加载的文件内容:', rawData);

    // 解析数据为 G6 所需的格式
    const { nodes, edges } = parseData(rawData.default); // Vite 会在默认导出中包含 JSON 数据
    const graphData = { nodes, edges };

    // 初始化并渲染图表
    initializeGraph(graphData);
  } catch (error) {
    // 调试输出：捕获并显示错误信息
    console.error('加载图表数据出错:', error);
  }
};

// 监听 jsonPath 的变化，动态加载对应的图表数据
watch(() => props.jsonPath, (newPath) => {
  console.log('监听到 jsonPath 变化:', newPath); // 调试输出
  if (newPath) {
    loadGraphData();
  }
});

// 在组件挂载时加载初始图表
onMounted(() => {
  loadGraphData();
});
</script>

<style scoped>
/* 样式 */
</style>
