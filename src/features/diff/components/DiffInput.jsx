import { Database } from 'lucide-react';

export default function DiffInput({ value, onChange, label, id }) {
  return (
    <div className='panel'>
      <label
        htmlFor={id}
        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        <Database size={14} />
        <span>{label}</span>
      </label>
      <textarea
        id={id}
        spellCheck='false'
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
