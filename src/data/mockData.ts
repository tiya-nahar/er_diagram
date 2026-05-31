import type { ERDiagramData } from '../types';

export const mockERDiagramData: ERDiagramData = {
  entities: [
    {
      id: 'entity-1',
      name: 'User',
      type: 'strong',
      attributes: [
        { id: 'attr-1', name: 'UserID', type: 'primary-key' },
        { id: 'attr-2', name: 'Email', type: 'regular' },
        { id: 'attr-3', name: 'Name', type: 'regular' },
        { id: 'attr-4', name: 'Phone', type: 'multivalued' },
      ],
    },
    {
      id: 'entity-2',
      name: 'Order',
      type: 'strong',
      attributes: [
        { id: 'attr-5', name: 'OrderID', type: 'primary-key' },
        { id: 'attr-6', name: 'OrderDate', type: 'regular' },
        { id: 'attr-7', name: 'TotalAmount', type: 'derived' },
      ],
    },
    {
      id: 'entity-3',
      name: 'Product',
      type: 'strong',
      attributes: [
        { id: 'attr-8', name: 'ProductID', type: 'primary-key' },
        { id: 'attr-9', name: 'ProductName', type: 'regular' },
        { id: 'attr-10', name: 'Price', type: 'regular' },
      ],
    },
  ],
  relationships: [
    {
      id: 'rel-1',
      name: 'Places',
      type: 'non-identifying',
      entity1: {
        id: 'entity-1',
        cardinality: '1',
        participation: 'total',
      },
      entity2: {
        id: 'entity-2',
        cardinality: 'N',
        participation: 'total',
      },
    },
    {
      id: 'rel-2',
      name: 'Contains',
      type: 'non-identifying',
      entity1: {
        id: 'entity-2',
        cardinality: '1',
        participation: 'total',
      },
      entity2: {
        id: 'entity-3',
        cardinality: 'N',
        participation: 'partial',
      },
    },
  ],
};
