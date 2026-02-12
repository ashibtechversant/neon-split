import React from 'react';

export default function DiffSummary({ totals }) {
  if (!totals) return null;

  return (
    <div className='summary'>
      <div className='summary-card total'>Total: {totals.total}</div>
      <div className='summary-card added'>Added: {totals.added}</div>
      <div className='summary-card removed'>Removed: {totals.removed}</div>
      <div className='summary-card changed'>Changed: {totals.changed}</div>
      <div className='summary-card unchanged'>
        Unchanged: {totals.unchanged}
      </div>
    </div>
  );
}
