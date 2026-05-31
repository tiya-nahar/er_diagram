import type { Node, Edge } from 'reactflow';
import type { ERDiagramData, Entity, Relationship, Attribute } from '../types';
import { getLayoutedElements, calculateEntityAttributePositions, calculateRelationshipPosition } from './layout';

export const generateChenDiagram = (data: ERDiagramData) => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const entityPositions: { [key: string]: { x: number; y: number } } = {};

  // Calculate initial entity positions (horizontally spaced)
  const entitySpacing = 300;
  data.entities.forEach((entity, index) => {
    entityPositions[entity.id] = {
      x: index * entitySpacing,
      y: 0,
    };
  });

  // Create entity nodes
  data.entities.forEach((entity: Entity) => {
    const pos = entityPositions[entity.id];
    nodes.push({
      id: entity.id,
      data: {
        label: entity.name,
        type: 'entity',
        entityType: entity.type,
      },
      position: pos,
      type: entity.type === 'strong' ? 'strongEntity' : 'weakEntity',
      width: 150,
      height: 80,
    });

    // Create attribute nodes and edges
    if (entity.attributes.length > 0) {
      const attributePositions = calculateEntityAttributePositions(
        entity.attributes.length,
        pos
      );

      entity.attributes.forEach((attr: Attribute, attrIndex: number) => {
        const attrPos = attributePositions[attrIndex];
        const nodeType = getAttributeNodeType(attr.type);
        const nodeId = `${entity.id}-attr-${attr.id}`;

        nodes.push({
          id: nodeId,
          data: {
            label: attr.name,
            type: 'attribute',
            attributeType: attr.type,
          },
          position: attrPos,
          type: nodeType,
          width: 120,
          height: 60,
        });

        // Edge from entity to attribute
        edges.push({
          id: `${entity.id}-${nodeId}`,
          source: entity.id,
          target: nodeId,
          animated: false,
        });
      });
    }
  });

  // Create relationship nodes and edges
  data.relationships.forEach((rel: Relationship) => {
    const entity1Pos = entityPositions[rel.entity1.id];
    const entity2Pos = entityPositions[rel.entity2.id];
    const relPos = calculateRelationshipPosition(entity1Pos, entity2Pos);

    nodes.push({
      id: rel.id,
      data: {
        label: rel.name,
        type: 'relationship',
        relationshipType: rel.type,
      },
      position: relPos,
      type: rel.type === 'identifying' ? 'identifyingRelationship' : 'relationship',
      width: 100,
      height: 100,
    });

    // Edge from entity1 to relationship
    edges.push({
      id: `${rel.entity1.id}-${rel.id}`,
      source: rel.entity1.id,
      target: rel.id,
      data: {
        cardinality: rel.entity1.cardinality,
        participation: rel.entity1.participation,
      },
      label: `${rel.entity1.cardinality},${rel.entity1.participation[0].toUpperCase()}`,
    });

    // Edge from relationship to entity2
    edges.push({
      id: `${rel.id}-${rel.entity2.id}`,
      source: rel.id,
      target: rel.entity2.id,
      data: {
        cardinality: rel.entity2.cardinality,
        participation: rel.entity2.participation,
      },
      label: `${rel.entity2.cardinality},${rel.entity2.participation[0].toUpperCase()}`,
    });
  });

  // Apply layout algorithm
  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
    nodes,
    edges,
    'TB'
  );

  return {
    nodes: layoutedNodes,
    edges: layoutedEdges,
  };
};

const getAttributeNodeType = (attributeType: string): string => {
  switch (attributeType) {
    case 'primary-key':
      return 'primaryKeyAttribute';
    case 'partial-key':
      return 'partialKeyAttribute';
    case 'multivalued':
      return 'multivaluedAttribute';
    case 'derived':
      return 'derivedAttribute';
    default:
      return 'attribute';
  }
};
