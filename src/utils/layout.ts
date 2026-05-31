import dagre from 'dagre';
import type { Node, Edge } from 'reactflow';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

export const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  direction = 'TB'
) => {
  dagreGraph.setGraph({
    rankdir: direction,
    ranksep: 100,
    nodesep: 80,
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: node.width || 150,
      height: node.height || 80,
    });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - (node.width || 150) / 2,
        y: nodeWithPosition.y - (node.height || 80) / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

export const calculateEntityAttributePositions = (
  attributeCount: number,
  entityPosition: { x: number; y: number }
) => {
  const positions = [];
  const radius = 150;
  const angleStep = (Math.PI * 2) / attributeCount;

  for (let i = 0; i < attributeCount; i++) {
    const angle = angleStep * i - Math.PI / 2;
    const x = entityPosition.x + Math.cos(angle) * radius;
    const y = entityPosition.y + Math.sin(angle) * radius;
    positions.push({ x, y });
  }

  return positions;
};

export const calculateRelationshipPosition = (
  entity1Pos: { x: number; y: number },
  entity2Pos: { x: number; y: number }
) => {
  return {
    x: (entity1Pos.x + entity2Pos.x) / 2,
    y: (entity1Pos.y + entity2Pos.y) / 2,
  };
};
