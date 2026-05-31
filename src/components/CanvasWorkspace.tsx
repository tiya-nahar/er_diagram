import { useMemo, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Connection,
  type Edge,
  type Node,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  StrongEntityNode,
  WeakEntityNode,
  AttributeNode,
  PrimaryKeyAttributeNode,
  PartialKeyAttributeNode,
  MultivaluedAttributeNode,
  DerivedAttributeNode,
  RelationshipNode,
  IdentifyingRelationshipNode,
  GenericShapeNode,
} from './nodes/ChenNodes';
import { generateChenDiagram } from '../utils/generateChenDiagram';
import type {
  Attribute,
  AttributeType,
  ERDiagramData,
  Entity,
  EntityType,
  Relationship,
  RelationshipType,
} from '../types';

interface CanvasWorkspaceProps {
  initialData: ERDiagramData;
  onDataChange: (data: ERDiagramData) => void;
  onBackToForm: () => void;
}

type CanvasTool = 'select' | 'connect';
type CustomShape = 'rectangle' | 'ellipse' | 'diamond' | 'note';

type SelectedItem =
  | { kind: 'entity'; id: string }
  | { kind: 'attribute'; entityId: string; attributeId: string }
  | { kind: 'relationship'; id: string }
  | { kind: 'customNode'; id: string }
  | { kind: 'customEdge'; id: string }
  | null;

const nodeTypes = {
  strongEntity: StrongEntityNode,
  weakEntity: WeakEntityNode,
  attribute: AttributeNode,
  primaryKeyAttribute: PrimaryKeyAttributeNode,
  partialKeyAttribute: PartialKeyAttributeNode,
  multivaluedAttribute: MultivaluedAttributeNode,
  derivedAttribute: DerivedAttributeNode,
  relationship: RelationshipNode,
  identifyingRelationship: IdentifyingRelationshipNode,
  genericShape: GenericShapeNode,
};

const createEntity = (type: EntityType): Entity => ({
  id: `entity-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  name: 'Entity Name',
  type,
  attributes: [],
});

const createAttribute = (): Attribute => ({
  id: `attr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  name: 'Attribute Name',
  type: 'regular',
});

const createRelationship = (entity1Id: string, entity2Id: string): Relationship => ({
  id: `rel-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  name: 'Relationship Name',
  type: 'non-identifying',
  entity1: {
    id: entity1Id,
    cardinality: '1',
    participation: 'partial',
  },
  entity2: {
    id: entity2Id,
    cardinality: 'N',
    participation: 'partial',
  },
});

const createCustomShapeNode = (shape: CustomShape, index: number): Node => {
  const baseId = `shape-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  return {
    id: baseId,
    type: 'genericShape',
    position: {
      x: 80 + index * 30,
      y: 120 + index * 30,
    },
    draggable: true,
    data: {
      label:
        shape === 'rectangle'
          ? 'Rectangle'
          : shape === 'ellipse'
            ? 'Ellipse'
            : shape === 'diamond'
              ? 'Diamond'
              : 'Note',
      type: 'shape',
      shape,
      fillColor: '#ffffff',
      strokeColor: '#0f172a',
      textColor: '#0f172a',
    },
  };
};

const createCustomEdge = (source: string, target: string): Edge => ({
  id: `edge-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  source,
  target,
  animated: false,
  type: 'default',
  data: {
    label: '',
    strokeColor: '#0f172a',
    strokeWidth: 2,
    dashed: false,
  },
  style: {
    stroke: '#0f172a',
    strokeWidth: 2,
  },
});

const parseAttributeNodeId = (nodeId: string) => {
  const match = nodeId.match(/^(.*)-attr-(.*)$/);
  if (!match) {
    return null;
  }

  return {
    entityId: match[1],
    attributeId: match[2],
  };
};

const isEntityNode = (nodeType?: string) =>
  nodeType === 'strongEntity' || nodeType === 'weakEntity';

const isAttributeNode = (nodeType?: string) => Boolean(nodeType?.includes('Attribute'));

const isRelationshipNode = (nodeType?: string) =>
  nodeType === 'relationship' || nodeType === 'identifyingRelationship';

const isSelectedNode = (node: Node, selectedItem: SelectedItem) => {
  if (!selectedItem) {
    return false;
  }

  if (selectedItem.kind === 'entity') {
    return node.id === selectedItem.id;
  }

  if (selectedItem.kind === 'attribute') {
    return node.id === `${selectedItem.entityId}-attr-${selectedItem.attributeId}`;
  }

  return node.id === selectedItem.id;
};

export const CanvasWorkspace = ({ initialData, onDataChange, onBackToForm }: CanvasWorkspaceProps) => {
  const [entities, setEntities] = useState<Entity[]>(initialData.entities);
  const [relationships, setRelationships] = useState<Relationship[]>(initialData.relationships);
  const [customNodes, setCustomNodes] = useState<Node[]>([]);
  const [customEdges, setCustomEdges] = useState<Edge[]>([]);
  const [selectedItem, setSelectedItem] = useState<SelectedItem>(null);
  const [activeTool, setActiveTool] = useState<CanvasTool>('select');

  const commitDiagram = (nextEntities: Entity[], nextRelationships: Relationship[]) => {
    setEntities(nextEntities);
    setRelationships(nextRelationships);
    onDataChange({ entities: nextEntities, relationships: nextRelationships });
  };

  const addEntity = (type: EntityType) => {
    const nextEntity = createEntity(type);
    commitDiagram([...entities, nextEntity], relationships);
    setSelectedItem({ kind: 'entity', id: nextEntity.id });
  };

  const updateEntity = (id: string, name: string, type: EntityType) => {
    commitDiagram(
      entities.map(entity => (entity.id === id ? { ...entity, name, type } : entity)),
      relationships
    );
  };

  const deleteEntity = (id: string) => {
    const nextEntities = entities.filter(entity => entity.id !== id);
    const nextRelationships = relationships.filter(
      relationship => relationship.entity1.id !== id && relationship.entity2.id !== id
    );

    commitDiagram(nextEntities, nextRelationships);
    setSelectedItem(null);
  };

  const addAttribute = (entityId: string) => {
    const nextAttribute = createAttribute();

    commitDiagram(
      entities.map(entity => {
        if (entity.id !== entityId) {
          return entity;
        }

        return {
          ...entity,
          attributes: [...entity.attributes, nextAttribute],
        };
      }),
      relationships
    );

    setSelectedItem({
      kind: 'attribute',
      entityId,
      attributeId: nextAttribute.id,
    });
  };

  const updateAttribute = (
    entityId: string,
    attributeId: string,
    name: string,
    type: AttributeType
  ) => {
    commitDiagram(
      entities.map(entity => {
        if (entity.id !== entityId) {
          return entity;
        }

        return {
          ...entity,
          attributes: entity.attributes.map(attribute =>
            attribute.id === attributeId ? { ...attribute, name, type } : attribute
          ),
        };
      }),
      relationships
    );
  };

  const deleteAttribute = (entityId: string, attributeId: string) => {
    commitDiagram(
      entities.map(entity => {
        if (entity.id !== entityId) {
          return entity;
        }

        return {
          ...entity,
          attributes: entity.attributes.filter(attribute => attribute.id !== attributeId),
        };
      }),
      relationships
    );

    if (
      selectedItem?.kind === 'attribute' &&
      selectedItem.entityId === entityId &&
      selectedItem.attributeId === attributeId
    ) {
      setSelectedItem(null);
    }
  };

  const addRelationship = (entity1Id: string, entity2Id: string) => {
    if (entity1Id === entity2Id) {
      return;
    }

    const nextRelationship = createRelationship(entity1Id, entity2Id);
    commitDiagram(entities, [...relationships, nextRelationship]);
    setSelectedItem({ kind: 'relationship', id: nextRelationship.id });
  };

  const updateRelationship = (id: string, field: string, value: string) => {
    commitDiagram(
      entities,
      relationships.map(relationship => {
        if (relationship.id !== id) {
          return relationship;
        }

        if (field === 'name') {
          return { ...relationship, name: value };
        }

        if (field === 'type') {
          return { ...relationship, type: value as RelationshipType };
        }

        if (field.startsWith('entity1.')) {
          const subField = field.split('.')[1] as 'id' | 'cardinality' | 'participation';
          return {
            ...relationship,
            entity1: {
              ...relationship.entity1,
              [subField]: value,
            },
          };
        }

        if (field.startsWith('entity2.')) {
          const subField = field.split('.')[1] as 'id' | 'cardinality' | 'participation';
          return {
            ...relationship,
            entity2: {
              ...relationship.entity2,
              [subField]: value,
            },
          };
        }

        return relationship;
      })
    );
  };

  const deleteRelationship = (id: string) => {
    commitDiagram(
      entities,
      relationships.filter(relationship => relationship.id !== id)
    );

    if (selectedItem?.kind === 'relationship' && selectedItem.id === id) {
      setSelectedItem(null);
    }
  };

  const addCustomShape = (shape: CustomShape) => {
    const nextNode = createCustomShapeNode(shape, customNodes.length);
    setCustomNodes(prev => [...prev, nextNode]);
    setSelectedItem({ kind: 'customNode', id: nextNode.id });
  };

  const updateCustomNode = (id: string, patch: Partial<Node['data']>) => {
    setCustomNodes(prev =>
      prev.map(node =>
        node.id === id
          ? {
              ...node,
              data: {
                ...node.data,
                ...patch,
              },
            }
          : node
      )
    );
  };

  const deleteCustomNode = (id: string) => {
    setCustomNodes(prev => prev.filter(node => node.id !== id));
    setCustomEdges(prev => prev.filter(edge => edge.source !== id && edge.target !== id));

    if (selectedItem?.kind === 'customNode' && selectedItem.id === id) {
      setSelectedItem(null);
    }
  };

  const updateCustomEdge = (id: string, patch: Partial<Edge['data']>) => {
    setCustomEdges(prev =>
      prev.map(edge => {
        if (edge.id !== id) {
          return edge;
        }

        const nextData = {
          ...(edge.data as Edge['data']),
          ...patch,
        };

        return {
          ...edge,
          data: nextData,
          style: {
            stroke: nextData.strokeColor ?? '#0f172a',
            strokeWidth: nextData.strokeWidth ?? 2,
            strokeDasharray: nextData.dashed ? '8 4' : undefined,
          },
        };
      })
    );
  };

  const deleteCustomEdge = (id: string) => {
    setCustomEdges(prev => prev.filter(edge => edge.id !== id));

    if (selectedItem?.kind === 'customEdge' && selectedItem.id === id) {
      setSelectedItem(null);
    }
  };

  const handleConnect = (connection: Connection) => {
    if (!connection.source || !connection.target || connection.source === connection.target) {
      return;
    }

    const sourceIsEntity = entities.some(entity => entity.id === connection.source);
    const targetIsEntity = entities.some(entity => entity.id === connection.target);

    if (sourceIsEntity && targetIsEntity) {
      addRelationship(connection.source, connection.target);
      return;
    }

    const nextEdge = createCustomEdge(connection.source, connection.target);
    setCustomEdges(prev => [...prev, nextEdge]);
    setSelectedItem({ kind: 'customEdge', id: nextEdge.id });
  };

  const generatedDiagram = useMemo(
    () => generateChenDiagram({ entities, relationships }),
    [entities, relationships]
  );

  const selectedEntity = useMemo(() => {
    if (!selectedItem) {
      return null;
    }

    if (selectedItem.kind === 'entity') {
      return entities.find(entity => entity.id === selectedItem.id) ?? null;
    }

    if (selectedItem.kind === 'attribute') {
      return entities.find(entity => entity.id === selectedItem.entityId) ?? null;
    }

    return null;
  }, [entities, selectedItem]);

  const selectedAttribute = useMemo(() => {
    if (!selectedItem || selectedItem.kind !== 'attribute') {
      return null;
    }

    const owner = entities.find(entity => entity.id === selectedItem.entityId);
    return owner?.attributes.find(attribute => attribute.id === selectedItem.attributeId) ?? null;
  }, [entities, selectedItem]);

  const selectedRelationship = useMemo(() => {
    if (!selectedItem || selectedItem.kind !== 'relationship') {
      return null;
    }

    return relationships.find(relationship => relationship.id === selectedItem.id) ?? null;
  }, [relationships, selectedItem]);

  const selectedCustomNode = useMemo(() => {
    if (!selectedItem || selectedItem.kind !== 'customNode') {
      return null;
    }

    return customNodes.find(node => node.id === selectedItem.id) ?? null;
  }, [customNodes, selectedItem]);

  const selectedCustomEdge = useMemo(() => {
    if (!selectedItem || selectedItem.kind !== 'customEdge') {
      return null;
    }

    return customEdges.find(edge => edge.id === selectedItem.id) ?? null;
  }, [customEdges, selectedItem]);

  const nodes = useMemo(() => {
    const generatedNodes = generatedDiagram.nodes.map(node => ({
      ...node,
      draggable: false,
      selected: isSelectedNode(node, selectedItem),
    }));

    const manualNodes = customNodes.map(node => ({
      ...node,
      draggable: true,
      selected: isSelectedNode(node, selectedItem),
    }));

    return [...generatedNodes, ...manualNodes];
  }, [customNodes, generatedDiagram.nodes, selectedItem]);

  const edges = useMemo(() => {
    const generatedEdges = generatedDiagram.edges.map(edge => ({
      ...edge,
      selected: selectedItem?.kind === 'relationship' && edge.id.includes(selectedItem.id),
    }));

    const manualEdges = customEdges.map(edge => ({
      ...edge,
      selected: selectedItem?.kind === 'customEdge' && edge.id === selectedItem.id,
      style: {
        stroke: edge.data?.strokeColor ?? '#0f172a',
        strokeWidth: edge.data?.strokeWidth ?? 2,
        strokeDasharray: edge.data?.dashed ? '8 4' : undefined,
      },
    }));

    return [...generatedEdges, ...manualEdges];
  }, [customEdges, generatedDiagram.edges, selectedItem]);

  const handleNodeClick = (_event: React.MouseEvent, node: Node) => {
    if (node.type === 'genericShape') {
      setSelectedItem({ kind: 'customNode', id: node.id });
      return;
    }

    if (isRelationshipNode(node.type)) {
      setSelectedItem({ kind: 'relationship', id: node.id });
      return;
    }

    if (isAttributeNode(node.type)) {
      const parsedAttribute = parseAttributeNodeId(node.id);
      if (parsedAttribute) {
        setSelectedItem({
          kind: 'attribute',
          entityId: parsedAttribute.entityId,
          attributeId: parsedAttribute.attributeId,
        });
        return;
      }
    }

    setSelectedItem({ kind: 'entity', id: node.id });
  };

  const handleEdgeClick = (_event: React.MouseEvent, edge: Edge) => {
    const relatedRelationship = relationships.find(relationship => edge.id.includes(relationship.id));
    if (relatedRelationship) {
      setSelectedItem({ kind: 'relationship', id: relatedRelationship.id });
      return;
    }

    const manualEdge = customEdges.find(item => item.id === edge.id);
    if (manualEdge) {
      setSelectedItem({ kind: 'customEdge', id: manualEdge.id });
    }
  };

  const handleNodeDragStop = (_event: React.MouseEvent, node: Node) => {
    if (node.type !== 'genericShape') {
      return;
    }

    setCustomNodes(prev =>
      prev.map(item => (item.id === node.id ? { ...item, position: node.position } : item))
    );
  };

  return (
    <div className="w-full h-full flex bg-slate-100 overflow-hidden">
      <aside className="w-72 shrink-0 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">
            Tools
          </p>
          <h2 className="mt-1 text-lg font-bold text-slate-900">Canvas Workspace</h2>
          <p className="mt-1 text-sm text-slate-500">
            Build ER diagrams or freeform diagrams with shapes, connectors, colors, and edits.
          </p>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase mb-2">
              Mode
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setActiveTool('select')}
                className={`px-3 py-2 rounded-lg border text-left text-sm font-medium ${
                  activeTool === 'select'
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-300 hover:bg-slate-50'
                }`}
              >
                Select
              </button>
              <button
                onClick={() => setActiveTool('connect')}
                className={`px-3 py-2 rounded-lg border text-left text-sm font-medium ${
                  activeTool === 'connect'
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-300 hover:bg-slate-50'
                }`}
              >
                Connect
              </button>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase mb-2">
              Shapes
            </p>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => addCustomShape('rectangle')}
                className="px-3 py-2 rounded-lg border border-slate-300 text-left hover:bg-slate-50 text-sm font-medium"
              >
                + Rectangle
              </button>
              <button
                onClick={() => addCustomShape('ellipse')}
                className="px-3 py-2 rounded-lg border border-slate-300 text-left hover:bg-slate-50 text-sm font-medium"
              >
                + Ellipse
              </button>
              <button
                onClick={() => addCustomShape('diamond')}
                className="px-3 py-2 rounded-lg border border-slate-300 text-left hover:bg-slate-50 text-sm font-medium"
              >
                + Diamond
              </button>
              <button
                onClick={() => addCustomShape('note')}
                className="px-3 py-2 rounded-lg border border-slate-300 text-left hover:bg-slate-50 text-sm font-medium"
              >
                + Note
              </button>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase mb-2">
              ER Elements
            </p>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => addEntity('strong')}
                className="px-3 py-2 rounded-lg border border-slate-300 text-left hover:bg-slate-50 text-sm font-medium"
              >
                + Strong Entity
              </button>
              <button
                onClick={() => addEntity('weak')}
                className="px-3 py-2 rounded-lg border border-slate-300 text-left hover:bg-slate-50 text-sm font-medium"
              >
                + Weak Entity
              </button>
              <button
                onClick={() => {
                  if (entities.length >= 2) {
                    addRelationship(entities[0].id, entities[1].id);
                  }
                }}
                disabled={entities.length < 2}
                className="px-3 py-2 rounded-lg bg-slate-900 text-white text-left hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-sm font-medium"
              >
                + Relationship
              </button>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase mb-2">
              Tip
            </p>
            <p className="text-xs leading-5 text-slate-500">
              Select any node or edge to change its label, color, shape, or line style. ER nodes stay layouted while freeform shapes can be dragged.
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 space-y-3">
          <button
            onClick={onBackToForm}
            className="w-full px-3 py-2 rounded-lg border border-slate-900 text-slate-900 hover:bg-slate-50 text-sm font-semibold"
          >
            Back to Form
          </button>
          <button
            onClick={() => {
              commitDiagram([], []);
              setCustomNodes([]);
              setCustomEdges([]);
              setSelectedItem(null);
            }}
            className="w-full px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold"
          >
            Clear Canvas
          </button>
        </div>
      </aside>

      <div className="flex-1 relative min-w-0 bg-slate-50">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          nodesDraggable
          onNodeClick={handleNodeClick}
          onEdgeClick={handleEdgeClick}
          onPaneClick={() => setSelectedItem(null)}
          onConnect={handleConnect}
          onNodeDragStop={handleNodeDragStop}
        >
          <Background color="#e5e7eb" gap={16} size={1} />
          <Controls />
          <MiniMap
            nodeColor={node => {
              if (node.type === 'strongEntity' || node.type === 'weakEntity') {
                return '#1d4ed8';
              }
              if (node.type?.includes('Attribute')) {
                return '#dc2626';
              }
              if (node.type?.includes('Relationship')) {
                return '#059669';
              }
              if (node.type === 'genericShape') {
                return '#0f172a';
              }
              return '#94a3b8';
            }}
            maskColor="rgba(15, 23, 42, 0.12)"
            position="bottom-right"
          />
        </ReactFlow>
      </div>

      <aside className="w-80 shrink-0 bg-white border-l border-slate-200 p-5 overflow-y-auto">
        {!selectedItem && (
          <div className="h-full flex items-center justify-center text-center text-slate-500 text-sm">
            Select a shape, node, or connection to edit its properties.
          </div>
        )}

        {selectedItem?.kind === 'entity' && selectedEntity && (
          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                Entity Properties
              </p>
              <h3 className="mt-1 text-xl font-bold text-slate-900">{selectedEntity.name}</h3>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-900">
                Name
                <input
                  type="text"
                  value={selectedEntity.name}
                  onChange={event => updateEntity(selectedEntity.id, event.target.value, selectedEntity.type)}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </label>

              <label className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <input
                  type="checkbox"
                  checked={selectedEntity.type === 'weak'}
                  onChange={event =>
                    updateEntity(
                      selectedEntity.id,
                      selectedEntity.name,
                      event.target.checked ? 'weak' : 'strong'
                    )
                  }
                  className="h-4 w-4"
                />
                Weak Entity
              </label>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-slate-900">Attributes</h4>
                <button
                  onClick={() => addAttribute(selectedEntity.id)}
                  className="px-3 py-1 rounded-md bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
                >
                  + Add
                </button>
              </div>

              {selectedEntity.attributes.length === 0 ? (
                <p className="text-sm text-slate-500">No attributes added yet.</p>
              ) : (
                <div className="space-y-2">
                  {selectedEntity.attributes.map(attribute => (
                    <div key={attribute.id} className="rounded-lg border border-slate-200 p-3 space-y-2">
                      <input
                        type="text"
                        value={attribute.name}
                        onChange={event =>
                          updateAttribute(
                            selectedEntity.id,
                            attribute.id,
                            event.target.value,
                            attribute.type
                          )
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                      <select
                        value={attribute.type}
                        onChange={event =>
                          updateAttribute(
                            selectedEntity.id,
                            attribute.id,
                            attribute.name,
                            event.target.value as AttributeType
                          )
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      >
                        <option value="regular">Simple</option>
                        <option value="primary-key">Primary Key</option>
                        <option value="partial-key">Partial Key</option>
                        <option value="multivalued">Multivalued</option>
                        <option value="derived">Derived</option>
                        <option value="composite">Composite</option>
                      </select>
                      <button
                        onClick={() => deleteAttribute(selectedEntity.id, attribute.id)}
                        className="text-left text-xs font-semibold text-red-600 hover:text-red-700"
                      >
                        Delete Attribute
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => deleteEntity(selectedEntity.id)}
              className="w-full px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold"
            >
              Delete Entity
            </button>
          </div>
        )}

        {selectedItem?.kind === 'attribute' && selectedAttribute && (
          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                Attribute Properties
              </p>
              <h3 className="mt-1 text-xl font-bold text-slate-900">{selectedAttribute.name}</h3>
            </div>

            <label className="block text-sm font-semibold text-slate-900">
              Name
              <input
                type="text"
                value={selectedAttribute.name}
                onChange={event =>
                  updateAttribute(
                    selectedItem.entityId,
                    selectedItem.attributeId,
                    event.target.value,
                    selectedAttribute.type
                  )
                }
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </label>

            <label className="block text-sm font-semibold text-slate-900">
              Type
              <select
                value={selectedAttribute.type}
                onChange={event =>
                  updateAttribute(
                    selectedItem.entityId,
                    selectedItem.attributeId,
                    selectedAttribute.name,
                    event.target.value as AttributeType
                  )
                }
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="regular">Simple</option>
                <option value="primary-key">Primary Key</option>
                <option value="partial-key">Partial Key</option>
                <option value="multivalued">Multivalued</option>
                <option value="derived">Derived</option>
                <option value="composite">Composite</option>
              </select>
            </label>

            <button
              onClick={() => deleteAttribute(selectedItem.entityId, selectedItem.attributeId)}
              className="w-full px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold"
            >
              Delete Attribute
            </button>
          </div>
        )}

        {selectedItem?.kind === 'relationship' && selectedRelationship && (
          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                Relationship Properties
              </p>
              <h3 className="mt-1 text-xl font-bold text-slate-900">{selectedRelationship.name}</h3>
            </div>

            <label className="block text-sm font-semibold text-slate-900">
              Name
              <input
                type="text"
                value={selectedRelationship.name}
                onChange={event => updateRelationship(selectedRelationship.id, 'name', event.target.value)}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </label>

            <label className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <input
                type="checkbox"
                checked={selectedRelationship.type === 'identifying'}
                onChange={event =>
                  updateRelationship(
                    selectedRelationship.id,
                    'type',
                    event.target.checked ? 'identifying' : 'non-identifying'
                  )
                }
                className="h-4 w-4"
              />
              Identifying Relationship
            </label>

            <div className="grid grid-cols-1 gap-4">
              <label className="block text-sm font-semibold text-slate-900">
                Entity 1
                <select
                  value={selectedRelationship.entity1.id}
                  onChange={event => updateRelationship(selectedRelationship.id, 'entity1.id', event.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  {entities.map(entity => (
                    <option key={entity.id} value={entity.id}>
                      {entity.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-semibold text-slate-900">
                Entity 2
                <select
                  value={selectedRelationship.entity2.id}
                  onChange={event => updateRelationship(selectedRelationship.id, 'entity2.id', event.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  {entities.map(entity => (
                    <option key={entity.id} value={entity.id}>
                      {entity.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <label className="block text-sm font-semibold text-slate-900">
                Entity 1 Cardinality
                <select
                  value={selectedRelationship.entity1.cardinality}
                  onChange={event =>
                    updateRelationship(selectedRelationship.id, 'entity1.cardinality', event.target.value)
                  }
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="1">1</option>
                  <option value="N">N</option>
                  <option value="M">M</option>
                </select>
              </label>

              <label className="block text-sm font-semibold text-slate-900">
                Entity 1 Participation
                <select
                  value={selectedRelationship.entity1.participation}
                  onChange={event =>
                    updateRelationship(selectedRelationship.id, 'entity1.participation', event.target.value)
                  }
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="partial">Partial</option>
                  <option value="total">Total</option>
                </select>
              </label>

              <label className="block text-sm font-semibold text-slate-900">
                Entity 2 Cardinality
                <select
                  value={selectedRelationship.entity2.cardinality}
                  onChange={event =>
                    updateRelationship(selectedRelationship.id, 'entity2.cardinality', event.target.value)
                  }
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="1">1</option>
                  <option value="N">N</option>
                  <option value="M">M</option>
                </select>
              </label>

              <label className="block text-sm font-semibold text-slate-900">
                Entity 2 Participation
                <select
                  value={selectedRelationship.entity2.participation}
                  onChange={event =>
                    updateRelationship(selectedRelationship.id, 'entity2.participation', event.target.value)
                  }
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="partial">Partial</option>
                  <option value="total">Total</option>
                </select>
              </label>
            </div>

            <button
              onClick={() => deleteRelationship(selectedRelationship.id)}
              className="w-full px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold"
            >
              Delete Relationship
            </button>
          </div>
        )}

        {selectedItem?.kind === 'customNode' && selectedCustomNode && (
          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                Shape Properties
              </p>
              <h3 className="mt-1 text-xl font-bold text-slate-900">{selectedCustomNode.data.label}</h3>
            </div>

            <label className="block text-sm font-semibold text-slate-900">
              Label
              <input
                type="text"
                value={selectedCustomNode.data.label}
                onChange={event =>
                  updateCustomNode(selectedCustomNode.id, { label: event.target.value })
                }
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </label>

            <label className="block text-sm font-semibold text-slate-900">
              Shape
              <select
                value={selectedCustomNode.data.shape ?? 'rectangle'}
                onChange={event =>
                  updateCustomNode(selectedCustomNode.id, {
                    shape: event.target.value as CustomShape,
                  })
                }
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="rectangle">Rectangle</option>
                <option value="ellipse">Ellipse</option>
                <option value="diamond">Diamond</option>
                <option value="note">Note</option>
              </select>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm font-semibold text-slate-900">
                Fill
                <input
                  type="color"
                  value={selectedCustomNode.data.fillColor ?? '#ffffff'}
                  onChange={event =>
                    updateCustomNode(selectedCustomNode.id, { fillColor: event.target.value })
                  }
                  className="mt-1 h-11 w-full rounded-lg border border-slate-300 bg-white"
                />
              </label>
              <label className="block text-sm font-semibold text-slate-900">
                Border
                <input
                  type="color"
                  value={selectedCustomNode.data.strokeColor ?? '#0f172a'}
                  onChange={event =>
                    updateCustomNode(selectedCustomNode.id, { strokeColor: event.target.value })
                  }
                  className="mt-1 h-11 w-full rounded-lg border border-slate-300 bg-white"
                />
              </label>
            </div>

            <label className="block text-sm font-semibold text-slate-900">
              Text Color
              <input
                type="color"
                value={selectedCustomNode.data.textColor ?? '#0f172a'}
                onChange={event =>
                  updateCustomNode(selectedCustomNode.id, { textColor: event.target.value })
                }
                className="mt-1 h-11 w-full rounded-lg border border-slate-300 bg-white"
              />
            </label>

            <button
              onClick={() => deleteCustomNode(selectedCustomNode.id)}
              className="w-full px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold"
            >
              Delete Shape
            </button>
          </div>
        )}

        {selectedItem?.kind === 'customEdge' && selectedCustomEdge && (
          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                Line Properties
              </p>
              <h3 className="mt-1 text-xl font-bold text-slate-900">Connector</h3>
            </div>

            <label className="block text-sm font-semibold text-slate-900">
              Label
              <input
                type="text"
                value={selectedCustomEdge.data?.label ?? ''}
                onChange={event =>
                  updateCustomEdge(selectedCustomEdge.id, { label: event.target.value })
                }
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm font-semibold text-slate-900">
                Line Color
                <input
                  type="color"
                  value={selectedCustomEdge.data?.strokeColor ?? '#0f172a'}
                  onChange={event =>
                    updateCustomEdge(selectedCustomEdge.id, { strokeColor: event.target.value })
                  }
                  className="mt-1 h-11 w-full rounded-lg border border-slate-300 bg-white"
                />
              </label>
              <label className="block text-sm font-semibold text-slate-900">
                Thickness
                <input
                  type="number"
                  min="1"
                  max="10"
                  step="1"
                  value={selectedCustomEdge.data?.strokeWidth ?? 2}
                  onChange={event =>
                    updateCustomEdge(selectedCustomEdge.id, {
                      strokeWidth: Number(event.target.value || 2),
                    })
                  }
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </label>
            </div>

            <label className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <input
                type="checkbox"
                checked={Boolean(selectedCustomEdge.data?.dashed)}
                onChange={event =>
                  updateCustomEdge(selectedCustomEdge.id, { dashed: event.target.checked })
                }
                className="h-4 w-4"
              />
              Dashed line
            </label>

            <button
              onClick={() => deleteCustomEdge(selectedCustomEdge.id)}
              className="w-full px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold"
            >
              Delete Connector
            </button>
          </div>
        )}
      </aside>
    </div>
  );
};
