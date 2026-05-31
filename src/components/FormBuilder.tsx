import { useState } from 'react';
import type { Entity, Relationship, AttributeType } from '../types';

interface FormBuilderProps {
  initialEntities: Entity[];
  initialRelationships: Relationship[];
  onGenerateDiagram: (entities: Entity[], relationships: Relationship[]) => void;
  onCanvasMode: (entities: Entity[], relationships: Relationship[]) => void;
}

export const FormBuilder = ({
  initialEntities,
  initialRelationships,
  onGenerateDiagram,
  onCanvasMode,
}: FormBuilderProps) => {
  const [entities, setEntities] = useState<Entity[]>(initialEntities);
  const [relationships, setRelationships] = useState<Relationship[]>(initialRelationships);
  const [expandedEntity, setExpandedEntity] = useState<string | null>(null);
  const [expandedRel, setExpandedRel] = useState<string | null>(null);

  const addEntity = () => {
    const newEntity: Entity = {
      id: `entity-${Date.now()}`,
      name: 'Entity Name',
      type: 'strong',
      attributes: [],
    };
    setEntities([...entities, newEntity]);
  };

  const updateEntity = (id: string, name: string, type: 'strong' | 'weak') => {
    setEntities(entities.map(e => (e.id === id ? { ...e, name, type } : e)));
  };

  const deleteEntity = (id: string) => {
    setEntities(entities.filter(e => e.id !== id));
    setRelationships(relationships.filter(r => r.entity1.id !== id && r.entity2.id !== id));
  };

  const addAttribute = (entityId: string) => {
    setEntities(
      entities.map(e => {
        if (e.id === entityId) {
          return {
            ...e,
            attributes: [
              ...e.attributes,
              {
                id: `attr-${Date.now()}`,
                name: 'Attribute Name',
                type: 'regular' as AttributeType,
              },
            ],
          };
        }
        return e;
      })
    );
  };

  const updateAttribute = (
    entityId: string,
    attrId: string,
    name: string,
    type: AttributeType
  ) => {
    setEntities(
      entities.map(e => {
        if (e.id === entityId) {
          return {
            ...e,
            attributes: e.attributes.map(a =>
              a.id === attrId ? { ...a, name, type } : a
            ),
          };
        }
        return e;
      })
    );
  };

  const deleteAttribute = (entityId: string, attrId: string) => {
    setEntities(
      entities.map(e => {
        if (e.id === entityId) {
          return {
            ...e,
            attributes: e.attributes.filter(a => a.id !== attrId),
          };
        }
        return e;
      })
    );
  };

  const addRelationship = () => {
    if (entities.length < 2) return;
    const newRel: Relationship = {
      id: `rel-${Date.now()}`,
      name: 'Relationship Name',
      type: 'non-identifying',
      entity1: {
        id: entities[0].id,
        cardinality: '1',
        participation: 'partial',
      },
      entity2: {
        id: entities[1].id,
        cardinality: 'N',
        participation: 'partial',
      },
    };
    setRelationships([...relationships, newRel]);
  };

  const updateRelationship = (
    id: string,
    field: string,
    value: string
  ) => {
    setRelationships(
      relationships.map(r => {
        if (r.id === id) {
          if (field === 'name') return { ...r, name: value };
          if (field === 'type') return { ...r, type: value as any };
          if (field.startsWith('entity1.')) {
            const subField = field.split('.')[1];
            return {
              ...r,
              entity1: { ...r.entity1, [subField]: value },
            };
          }
          if (field.startsWith('entity2.')) {
            const subField = field.split('.')[1];
            return {
              ...r,
              entity2: { ...r.entity2, [subField]: value },
            };
          }
        }
        return r;
      })
    );
  };

  const deleteRelationship = (id: string) => {
    setRelationships(relationships.filter(r => r.id !== id));
  };

  const handleCreateDiagram = () => {
    onGenerateDiagram(entities, relationships);
  };

  const handleOpenCanvas = () => {
    onCanvasMode(entities, relationships);
  };

  const handleResetAll = () => {
    setEntities([]);
    setRelationships([]);
    setExpandedEntity(null);
    setExpandedRel(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              ER Diagram Builder
            </h1>
            <p className="text-slate-600">
              Define entities, attributes, and relationships — then generate your diagram
            </p>
          </div>
          <button
            onClick={handleOpenCanvas}
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-900 rounded-lg hover:bg-slate-50 font-semibold text-slate-900 transition-colors"
          >
            Canvas Mode <span className="text-xl">→</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ENTITIES SECTION */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Entities</h2>
              <button
                onClick={addEntity}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 text-sm font-semibold transition-colors"
              >
                + Add Entity
              </button>
            </div>

            <div className="space-y-4">
              {entities.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-500">No entities yet</p>
                  <button
                    onClick={addEntity}
                    className="mt-4 px-4 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 text-sm font-medium transition-colors"
                  >
                    + Add Your First Entity
                  </button>
                </div>
              ) : (
                entities.map(entity => (
                  <div
                    key={entity.id}
                    className="border border-slate-200 rounded-lg overflow-hidden hover:border-slate-300 transition-colors"
                  >
                    <div
                      className="bg-slate-50 p-4 cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() =>
                        setExpandedEntity(
                          expandedEntity === entity.id ? null : entity.id
                        )
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-slate-600 text-lg">
                            {expandedEntity === entity.id ? '▼' : '▶'}
                          </span>
                          <input
                            type="text"
                            value={entity.name}
                            onChange={e =>
                              updateEntity(entity.id, e.target.value, entity.type)
                            }
                            onClick={e => e.stopPropagation()}
                            className="font-semibold text-slate-900 bg-transparent border-0 outline-none flex-1"
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={entity.type === 'weak'}
                              onChange={e =>
                                updateEntity(
                                  entity.id,
                                  entity.name,
                                  e.target.checked ? 'weak' : 'strong'
                                )
                              }
                              onClick={e => e.stopPropagation()}
                              className="w-4 h-4 cursor-pointer"
                            />
                            <span className="text-slate-700">Weak Entity</span>
                          </label>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              deleteEntity(entity.id);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>

                    {expandedEntity === entity.id && (
                      <div className="p-4 bg-white border-t border-slate-200">
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-semibold text-slate-900">Attributes</h4>
                            <button
                              onClick={() => addAttribute(entity.id)}
                              className="flex items-center gap-1 text-xs px-3 py-1 bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition-colors font-medium"
                            >
                              + Add Attribute
                            </button>
                          </div>

                          {entity.attributes.length === 0 ? (
                            <p className="text-sm text-slate-500">
                              No attributes added yet
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {entity.attributes.map(attr => (
                                <div
                                  key={attr.id}
                                  className="flex gap-2 items-center bg-slate-50 p-3 rounded border border-slate-200"
                                >
                                  <input
                                    type="text"
                                    value={attr.name}
                                    onChange={e =>
                                      updateAttribute(
                                        entity.id,
                                        attr.id,
                                        e.target.value,
                                        attr.type
                                      )
                                    }
                                    className="flex-1 text-sm bg-transparent border-0 outline-none text-slate-900"
                                  />
                                  <select
                                    value={attr.type}
                                    onChange={e =>
                                      updateAttribute(
                                        entity.id,
                                        attr.id,
                                        attr.name,
                                        e.target.value as AttributeType
                                      )
                                    }
                                    className="text-xs px-2 py-1 border border-slate-300 rounded bg-white text-slate-700"
                                  >
                                    <option value="regular">Simple</option>
                                    <option value="primary-key">Primary Key</option>
                                    <option value="partial-key">Partial Key</option>
                                    <option value="multivalued">Multivalued</option>
                                    <option value="derived">Derived</option>
                                    <option value="composite">Composite</option>
                                  </select>
                                  <button
                                    onClick={() =>
                                      deleteAttribute(entity.id, attr.id)
                                    }
                                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* RELATIONSHIPS SECTION */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Relationships</h2>
              <button
                onClick={addRelationship}
                disabled={entities.length < 2}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed text-sm font-semibold transition-colors"
              >
                + Add Relationship
              </button>
            </div>

            <div className="space-y-4">
              {relationships.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-500">
                    {entities.length < 2
                      ? 'Add at least 2 entities to create relationships'
                      : 'No relationships yet'}
                  </p>
                  {entities.length >= 2 && (
                    <button
                      onClick={addRelationship}
                      className="mt-4 px-4 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 text-sm font-medium transition-colors"
                    >
                      + Add Your First Relationship
                    </button>
                  )}
                </div>
              ) : (
                relationships.map(rel => (
                  <div
                    key={rel.id}
                    className="border border-slate-200 rounded-lg overflow-hidden hover:border-slate-300 transition-colors"
                  >
                    <div
                      className="bg-slate-50 p-4 cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() =>
                        setExpandedRel(expandedRel === rel.id ? null : rel.id)
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-slate-600">
                            {expandedRel === rel.id ? '▼' : '▶'}
                          </span>
                          <input
                            type="text"
                            value={rel.name}
                            onChange={e =>
                              updateRelationship(rel.id, 'name', e.target.value)
                            }
                            onClick={e => e.stopPropagation()}
                            className="font-semibold text-slate-900 bg-transparent border-0 outline-none flex-1"
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={rel.type === 'identifying'}
                              onChange={e =>
                                updateRelationship(
                                  rel.id,
                                  'type',
                                  e.target.checked ? 'identifying' : 'non-identifying'
                                )
                              }
                              onClick={e => e.stopPropagation()}
                              className="w-4 h-4 cursor-pointer"
                            />
                            <span className="text-slate-700">Identifying</span>
                          </label>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              deleteRelationship(rel.id);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>

                    {expandedRel === rel.id && (
                      <div className="p-4 bg-white border-t border-slate-200 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-slate-900 mb-2">
                              Entity 1
                            </label>
                            <select
                              value={rel.entity1.id}
                              onChange={e =>
                                updateRelationship(
                                  rel.id,
                                  'entity1.id',
                                  e.target.value
                                )
                              }
                              className="w-full text-sm px-3 py-2 border border-slate-300 rounded bg-white text-slate-900"
                            >
                              {entities.map(e => (
                                <option key={e.id} value={e.id}>
                                  {e.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-900 mb-2">
                              Entity 2
                            </label>
                            <select
                              value={rel.entity2.id}
                              onChange={e =>
                                updateRelationship(
                                  rel.id,
                                  'entity2.id',
                                  e.target.value
                                )
                              }
                              className="w-full text-sm px-3 py-2 border border-slate-300 rounded bg-white text-slate-900"
                            >
                              {entities.map(e => (
                                <option key={e.id} value={e.id}>
                                  {e.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-900 mb-1">
                              Entity 1 Cardinality
                            </label>
                            <select
                              value={rel.entity1.cardinality}
                              onChange={e =>
                                updateRelationship(
                                  rel.id,
                                  'entity1.cardinality',
                                  e.target.value
                                )
                              }
                              className="w-full text-xs px-2 py-1 border border-slate-300 rounded bg-white text-slate-900"
                            >
                              <option value="1">1</option>
                              <option value="N">N</option>
                              <option value="M">M</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-900 mb-1">
                              Entity 1 Participation
                            </label>
                            <select
                              value={rel.entity1.participation}
                              onChange={e =>
                                updateRelationship(
                                  rel.id,
                                  'entity1.participation',
                                  e.target.value
                                )
                              }
                              className="w-full text-xs px-2 py-1 border border-slate-300 rounded bg-white text-slate-900"
                            >
                              <option value="partial">Partial</option>
                              <option value="total">Total</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-900 mb-1">
                              Entity 2 Cardinality
                            </label>
                            <select
                              value={rel.entity2.cardinality}
                              onChange={e =>
                                updateRelationship(
                                  rel.id,
                                  'entity2.cardinality',
                                  e.target.value
                                )
                              }
                              className="w-full text-xs px-2 py-1 border border-slate-300 rounded bg-white text-slate-900"
                            >
                              <option value="1">1</option>
                              <option value="N">N</option>
                              <option value="M">M</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-900 mb-1">
                              Entity 2 Participation
                            </label>
                            <select
                              value={rel.entity2.participation}
                              onChange={e =>
                                updateRelationship(
                                  rel.id,
                                  'entity2.participation',
                                  e.target.value
                                )
                              }
                              className="w-full text-xs px-2 py-1 border border-slate-300 rounded bg-white text-slate-900"
                            >
                              <option value="partial">Partial</option>
                              <option value="total">Total</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM BUTTONS */}
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={handleCreateDiagram}
            disabled={entities.length === 0}
            className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed font-semibold text-lg transition-colors"
          >
            🎨 Create ER Diagram
          </button>
          <button
            onClick={handleResetAll}
            className="px-8 py-3 border-2 border-slate-900 text-slate-900 rounded-lg hover:bg-slate-100 font-semibold transition-colors"
          >
            Reset All
          </button>
        </div>
      </div>
    </div>
  );
};
