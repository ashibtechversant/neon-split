import { FileText } from 'lucide-react';

export default function JsonInputPanel({
  value,
  onChange,
  dragActive,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
}) {
  return (
    <div
      className='json-input-wrapper panel'
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <FileText size={14} />
        <span>SOURCE JSON</span>
      </label>
      {dragActive && (
        <div className='json-drop-zone'>
          <p>Drop JSON file here</p>
        </div>
      )}
      <textarea
        placeholder='Paste JSON or JS object here...'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck='false'
      />
    </div>
  );
}
