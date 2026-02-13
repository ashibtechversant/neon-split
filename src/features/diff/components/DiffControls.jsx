import { Cpu, Shuffle, FileJson, Trash2, Clock } from 'lucide-react';

export default function DiffControls({
  onCompare,
  onSwap,
  onLoadSample,
  onClear,
  ignoreArrayOrder,
  setIgnoreArrayOrder,
  onToggleHistory,
}) {
  return (
    <section className='controls reveal reveal-3'>
      <button
        onClick={onCompare}
        className='btn-main'
        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        <Cpu size={14} />
        <span>Compute Difference</span>
      </button>
      <button
        onClick={onSwap}
        className='btn-ghost'
        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        <Shuffle size={14} />
        <span>Swap Inputs</span>
      </button>
      <button
        onClick={onLoadSample}
        className='btn-ghost'
        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        <FileJson size={14} />
        <span>Load Example</span>
      </button>
      <button
        onClick={onClear}
        className='btn-ghost'
        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        <Trash2 size={14} />
        <span>Clear</span>
      </button>
      <button
        onClick={onToggleHistory}
        className='btn-ghost'
        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        <Clock size={14} />
        <span>History</span>
      </button>
      <label className='toggle-wrap' htmlFor='ignore-array-order'>
        <input
          id='ignore-array-order'
          type='checkbox'
          checked={ignoreArrayOrder}
          onChange={(e) => setIgnoreArrayOrder(e.target.checked)}
        />
        Compare arrays by value (ignore order)
      </label>
    </section>
  );
}
