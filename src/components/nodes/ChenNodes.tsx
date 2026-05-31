import { Handle, Position } from 'reactflow';
import type { NodeData } from '../../types';

interface ChenNodeProps {
  data: NodeData;
  selected?: boolean;
}

export const StrongEntityNode = ({ data, selected }: ChenNodeProps) => (
  <div
    className={`px-6 py-3 border-2 rounded-none flex items-center justify-center whitespace-nowrap ${
      selected
        ? 'border-blue-500 bg-blue-50'
        : 'border-slate-800 bg-white text-slate-900'
    }`}
    style={{ minWidth: '120px', minHeight: '50px' }}
  >
    <span className="font-semibold text-sm">{data.label}</span>
    <Handle type="target" position={Position.Top} />
    <Handle type="source" position={Position.Bottom} />
    <Handle type="target" position={Position.Left} />
    <Handle type="source" position={Position.Right} />
  </div>
);

export const WeakEntityNode = ({ data, selected }: ChenNodeProps) => (
  <div
    className={`px-6 py-3 border-4 border-double rounded-none flex items-center justify-center whitespace-nowrap ${
      selected
        ? 'border-blue-500 bg-blue-50'
        : 'border-slate-800 bg-white text-slate-900'
    }`}
    style={{ minWidth: '120px', minHeight: '50px' }}
  >
    <span className="font-semibold text-sm">{data.label}</span>
    <Handle type="target" position={Position.Top} />
    <Handle type="source" position={Position.Bottom} />
    <Handle type="target" position={Position.Left} />
    <Handle type="source" position={Position.Right} />
  </div>
);

export const AttributeNode = ({ data, selected }: ChenNodeProps) => (
  <div
    className={`px-4 py-2 rounded-full border-2 flex items-center justify-center whitespace-nowrap ${
      selected
        ? 'border-blue-500 bg-blue-50'
        : 'border-slate-800 bg-white text-slate-900'
    }`}
    style={{ minWidth: '90px', minHeight: '40px' }}
  >
    <span className="text-xs font-medium">{data.label}</span>
    <Handle type="target" position={Position.Top} />
    <Handle type="source" position={Position.Bottom} />
  </div>
);

export const PrimaryKeyAttributeNode = ({ data, selected }: ChenNodeProps) => (
  <div
    className={`px-4 py-2 rounded-full border-2 flex items-center justify-center whitespace-nowrap ${
      selected
        ? 'border-blue-500 bg-blue-50'
        : 'border-slate-800 bg-white text-slate-900'
    }`}
    style={{ minWidth: '90px', minHeight: '40px' }}
  >
    <span className="text-xs font-semibold underline">{data.label}</span>
    <Handle type="target" position={Position.Top} />
    <Handle type="source" position={Position.Bottom} />
  </div>
);

export const PartialKeyAttributeNode = ({ data, selected }: ChenNodeProps) => (
  <div
    className={`px-4 py-2 rounded-full border-2 flex items-center justify-center whitespace-nowrap ${
      selected
        ? 'border-blue-500 bg-blue-50'
        : 'border-slate-800 bg-white text-slate-900'
    }`}
    style={{ minWidth: '90px', minHeight: '40px' }}
  >
    <span className="text-xs font-semibold underline decoration-dashed">
      {data.label}
    </span>
    <Handle type="target" position={Position.Top} />
    <Handle type="source" position={Position.Bottom} />
  </div>
);

export const MultivaluedAttributeNode = ({ data, selected }: ChenNodeProps) => (
  <div
    className={`px-4 py-2 rounded-full border-4 border-double flex items-center justify-center whitespace-nowrap ${
      selected
        ? 'border-blue-500 bg-blue-50'
        : 'border-slate-800 bg-white text-slate-900'
    }`}
    style={{ minWidth: '90px', minHeight: '40px' }}
  >
    <span className="text-xs font-medium">{data.label}</span>
    <Handle type="target" position={Position.Top} />
    <Handle type="source" position={Position.Bottom} />
  </div>
);

export const DerivedAttributeNode = ({ data, selected }: ChenNodeProps) => (
  <div
    className={`px-4 py-2 rounded-full border-2 border-dashed flex items-center justify-center whitespace-nowrap ${
      selected
        ? 'border-blue-500 bg-blue-50'
        : 'border-slate-800 bg-white text-slate-900'
    }`}
    style={{ minWidth: '90px', minHeight: '40px' }}
  >
    <span className="text-xs font-medium">{data.label}</span>
    <Handle type="target" position={Position.Top} />
    <Handle type="source" position={Position.Bottom} />
  </div>
);

export const RelationshipNode = ({ data, selected }: ChenNodeProps) => (
  <div
    className={`flex items-center justify-center whitespace-nowrap ${
      selected ? 'filter brightness-110' : ''
    }`}
    style={{
      width: '80px',
      height: '80px',
      clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
      border: '2px solid ' + (selected ? '#3b82f6' : '#1e293b'),
      backgroundColor: selected ? '#eff6ff' : '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <span className="text-xs font-semibold text-center text-slate-900">
      {data.label}
    </span>
    <Handle type="target" position={Position.Top} />
    <Handle type="source" position={Position.Bottom} />
    <Handle type="target" position={Position.Left} />
    <Handle type="source" position={Position.Right} />
  </div>
);

export const IdentifyingRelationshipNode = ({ data, selected }: ChenNodeProps) => (
  <div
    className={`flex items-center justify-center whitespace-nowrap ${
      selected ? 'filter brightness-110' : ''
    }`}
    style={{
      width: '90px',
      height: '90px',
      clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
      border: '4px double ' + (selected ? '#3b82f6' : '#1e293b'),
      backgroundColor: selected ? '#eff6ff' : '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <span className="text-xs font-semibold text-center text-slate-900">
      {data.label}
    </span>
    <Handle type="target" position={Position.Top} />
    <Handle type="source" position={Position.Bottom} />
    <Handle type="target" position={Position.Left} />
    <Handle type="source" position={Position.Right} />
  </div>
);

export const GenericShapeNode = ({ data, selected }: ChenNodeProps) => {
  const shape = data.shape ?? 'rectangle';
  const backgroundColor = data.fillColor ?? '#ffffff';
  const borderColor = data.strokeColor ?? '#1e293b';
  const textColor = data.textColor ?? '#0f172a';

  const style = {
    width: '160px',
    height: '90px',
    backgroundColor,
    color: textColor,
    border: `2px solid ${selected ? '#3b82f6' : borderColor}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px',
    boxSizing: 'border-box' as const,
  };

  const sharedClassName = `flex items-center justify-center whitespace-nowrap ${
    selected ? 'shadow-lg shadow-blue-200/60' : ''
  }`;

  if (shape === 'ellipse') {
    return (
      <div className={`${sharedClassName} rounded-full`} style={style}>
        <span className="text-sm font-semibold text-center">{data.label}</span>
        <Handle type="target" position={Position.Top} />
        <Handle type="source" position={Position.Bottom} />
        <Handle type="target" position={Position.Left} />
        <Handle type="source" position={Position.Right} />
      </div>
    );
  }

  if (shape === 'diamond') {
    return (
      <div
        className={sharedClassName}
        style={{
          ...style,
          clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
        }}
      >
        <span className="text-sm font-semibold text-center">{data.label}</span>
        <Handle type="target" position={Position.Top} />
        <Handle type="source" position={Position.Bottom} />
        <Handle type="target" position={Position.Left} />
        <Handle type="source" position={Position.Right} />
      </div>
    );
  }

  if (shape === 'note') {
    return (
      <div
        className={`${sharedClassName} rounded-lg`}
        style={{
          ...style,
          width: '170px',
          minHeight: '92px',
          background: `linear-gradient(180deg, ${backgroundColor} 0%, #f8fafc 100%)`,
        }}
      >
        <span className="text-sm font-semibold text-center">{data.label}</span>
        <Handle type="target" position={Position.Top} />
        <Handle type="source" position={Position.Bottom} />
        <Handle type="target" position={Position.Left} />
        <Handle type="source" position={Position.Right} />
      </div>
    );
  }

  return (
    <div className={`${sharedClassName} rounded-none`} style={style}>
      <span className="text-sm font-semibold text-center">{data.label}</span>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
};
