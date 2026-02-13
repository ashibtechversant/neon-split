import { Monitor } from 'lucide-react';
import JsonNode from './JsonNode';

export default function JsonTreePanel({ parsedData, error, jsonInput }) {
  return (
    <div className='panel json-tree-panel'>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Monitor size={14} />
        <span>PARSED RESULT</span>
      </label>
      <div className='json-tree-container'>
        {parsedData ? (
          <JsonNode
            name='root'
            value={parsedData}
            initialExpandLevel={1}
            depth={0}
          />
        ) : (
          <div className='empty-state'>
            {jsonInput ? (
              <span style={{ color: 'var(--c-removed)' }}>
                Invalid JSON: {error}
              </span>
            ) : (
              'Waiting for data...'
            )}
          </div>
        )}
      </div>
    </div>
  );
}
