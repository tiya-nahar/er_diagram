export type EntityType = 'strong' | 'weak';
export type AttributeType =
  | 'regular'
  | 'primary-key'
  | 'partial-key'
  | 'multivalued'
  | 'derived'
  | 'composite';
export type RelationshipType = 'identifying' | 'non-identifying';
export type Cardinality = '1' | 'N' | 'M';
export type Participation = 'total' | 'partial';

export interface Attribute {
  id: string;
  name: string;
  type: AttributeType;
}

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  attributes: Attribute[];
}

export interface Relationship {
  id: string;
  name: string;
  type: RelationshipType;
  entity1: {
    id: string;
    cardinality: Cardinality;
    participation: Participation;
  };
  entity2: {
    id: string;
    cardinality: Cardinality;
    participation: Participation;
  };
}

export interface ERDiagramData {
  entities: Entity[];
  relationships: Relationship[];
}

export interface NodeData {
  label: string;
  type: 'entity' | 'attribute' | 'relationship';
  entityType?: EntityType;
  attributeType?: AttributeType;
  relationshipType?: RelationshipType;
  shape?: 'rectangle' | 'ellipse' | 'diamond' | 'note';
  fillColor?: string;
  strokeColor?: string;
  textColor?: string;
}

export interface EdgeData {
  label?: string;
  cardinality1?: Cardinality;
  cardinality2?: Cardinality;
  participation1?: Participation;
  participation2?: Participation;
  strokeColor?: string;
  strokeWidth?: number;
  dashed?: boolean;
}
