import React from 'react';

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
      <button onClick={onCompare} className='btn-main'>
        Compute Difference
      </button>
      <button onClick={onSwap} className='btn-ghost'>
        Swap Inputs
      </button>
      <button onClick={onLoadSample} className='btn-ghost'>
        Load Example
      </button>
      <button onClick={onClear} className='btn-ghost'>
        Clear
      </button>
      <button onClick={onToggleHistory} className='btn-ghost'>
        History
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
