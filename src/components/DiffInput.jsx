import React from 'react';

export default function DiffInput({ value, onChange, label, id }) {
  return (
    <div className='panel'>
      <label htmlFor={id}>{label}</label>
      <textarea
        id={id}
        spellCheck='false'
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
