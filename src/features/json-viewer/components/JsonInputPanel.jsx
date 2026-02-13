import React from 'react';

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
      style={{
        height: '100%',
        overflow: 'hidden',
        display: 'grid',
        gridTemplateRows: 'auto 1fr',
      }}
    >
      <label>SOURCE JSON</label>
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
        style={{
          resize: 'none',
          height: '100%',
          minHeight: 0,
        }}
      />
    </div>
  );
}
