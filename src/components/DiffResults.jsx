import React, { useState } from 'react';
import DiffSummary from './DiffSummary';
import DiffViewer from './DiffViewer';
import TextDiffViewer from './TextDiffViewer';
import { formatPath, safeValueString } from '../utils/diffLogic';

export default function DiffResults({
  rows,
  totals,
  leftJson,
  rightJson,
  ignoreArrayOrder,
}) {
  // We need leftJson and rightJson props passed down from App
  const [view, setView] = useState('split'); // Default to split since user requested it
  const [hideUnchanged, setHideUnchanged] = useState(false); // Text diff usually shows context
  const [filterTypes, setFilterTypes] = useState([
    'added',
    'removed',
    'changed',
    'unchanged',
  ]);
  const [pathSearch, setPathSearch] = useState('');

  const toggleFilter = (type) => {
    setFilterTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const filteredRows = rows
    .filter((r) => {
      if (hideUnchanged && r.type === 'unchanged') return false;
      if (!filterTypes.includes(r.type)) return false;
      if (
        pathSearch &&
        !formatPath(r.path).toLowerCase().includes(pathSearch.toLowerCase())
      )
        return false;
      return true;
    })
    .sort((a, b) => {
      const order = { changed: 0, added: 1, removed: 2, unchanged: 3 };
      if (order[a.type] !== order[b.type]) return order[a.type] - order[b.type];
      return (a.path || '').localeCompare(b.path || '');
    });

  const generateExport = () => {
    const payload = filteredRows.map((r) => ({
      path: formatPath(r.path),
      type: r.type,
      jsonA: r.left,
      jsonB: r.right,
    }));
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'diff-export.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const copyDiff = () => {
    const lines = filteredRows.map(
      (r) =>
        formatPath(r.path) +
        '\t' +
        r.type +
        '\t' +
        safeValueString(r.left) +
        '\t' +
        safeValueString(r.right),
    );
    navigator.clipboard.writeText(lines.join('\n')).then(
      () => alert('Diff copied to clipboard.'),
      () => alert('Copy failed.'),
    );
  };

  return (
    <section className='results reveal reveal-5'>
      <div className='result-head'>
        <h2>Diff Stream</h2>
        <div className='result-tools'>
          <label className='toggle-wrap'>
            <input
              type='checkbox'
              checked={hideUnchanged}
              onChange={(e) => setHideUnchanged(e.target.checked)}
            />
            Hide unchanged
          </label>
          <input
            type='search'
            placeholder='Filter by path…'
            className='path-search'
            value={pathSearch}
            onChange={(e) => setPathSearch(e.target.value)}
          />
          <div
            className='legend filter-legend'
            role='group'
            aria-label='Filter by status'
          >
            {['added', 'removed', 'changed', 'unchanged'].map((type) => (
              <button
                key={type}
                type='button'
                className={`chip filter-chip ${type} ${filterTypes.includes(type) ? 'active' : ''}`}
                onClick={() => toggleFilter(type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
          <div className='view-actions'>
            <button
              type='button'
              onClick={copyDiff}
              className='btn-ghost btn-sm'
            >
              Copy diff
            </button>
            <button
              type='button'
              onClick={generateExport}
              className='btn-ghost btn-sm'
            >
              Export
            </button>
          </div>
        </div>
      </div>

      <DiffSummary totals={totals} />

      <div className='diff-view-tabs' role='tablist'>
        {['split', 'unified', 'table', 'tree'].map((v) => (
          <button
            key={v}
            type='button'
            className={`tab-btn ${view === v ? 'active' : ''}`}
            onClick={() => setView(v)}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>

      <div className='diff-list' role='tabpanel'>
        {view === 'split' || view === 'unified' ? (
          <TextDiffViewer
            left={leftJson}
            right={rightJson}
            mode={view}
            ignoreArrayOrder={ignoreArrayOrder}
          />
        ) : (
          <DiffViewer rows={filteredRows} view={view} />
        )}
      </div>
    </section>
  );
}
