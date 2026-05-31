import { useState } from 'react';
import { CanvasWorkspace } from './components/CanvasWorkspace';
import { FormBuilder } from './components/FormBuilder';
import type { ERDiagramData, Entity, Relationship } from './types';

function App() {
  const [mode, setMode] = useState<'form' | 'canvas'>('form');
  const [diagramData, setDiagramData] = useState<ERDiagramData>({
    entities: [],
    relationships: [],
  });

  const handleGenerateDiagram = (entities: Entity[], relationships: Relationship[]) => {
    setDiagramData({ entities, relationships });
    setMode('canvas');
  };

  const handleCanvasMode = handleGenerateDiagram;

  const handleBackToForm = () => {
    setMode('form');
  };

  return (
    <div className="w-full h-screen">
      {mode === 'form' ? (
        <FormBuilder
          initialEntities={diagramData.entities}
          initialRelationships={diagramData.relationships}
          onGenerateDiagram={handleGenerateDiagram}
          onCanvasMode={handleCanvasMode}
        />
      ) : (
        <CanvasWorkspace
          initialData={diagramData}
          onDataChange={setDiagramData}
          onBackToForm={handleBackToForm}
        />
      )}
    </div>
  );
}

export default App;