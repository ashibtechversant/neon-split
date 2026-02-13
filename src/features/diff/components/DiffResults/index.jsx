import React, { useState } from 'react';
import DiffSummary from './DiffSummary';
import DiffViewer from './DiffViewer';
import TextDiffViewer from './TextDiffViewer';
import { formatPath, safeValueString } from '../../utils/diffLogic';

export default function DiffResults({
  rows,
  totals,
  leftJson,
  rightJson,
  ignoreArrayOrder,
}) {
  const [view, setView] = useState('split');
  const [filterTypes, setFilterTypes] = useState([
    'added',
    'removed',
    'changed',
  ]);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleFilter = (type) => {
    setFilterTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const filteredRows = rows
    .filter((r) => {
      if (!filterTypes.includes(r.type)) return false;
      if (
        searchQuery &&
        !formatPath(r.path).toLowerCase().includes(searchQuery.toLowerCase())
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
          {(view === 'table' || view === 'tree') && (
            <>
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

              <div
                className='separator'
                style={{
                  width: '1px',
                  height: '24px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  margin: '0 0.2rem',
                }}
              />
            </>
          )}

          <div
            className='view-actions'
            style={{ display: 'flex', gap: '0.6rem' }}
          >
            <button
              type='button'
              onClick={copyDiff}
              className='tab-btn'
              title='Copy diff to clipboard'
            >
              COPY DIFF
            </button>
            <button
              type='button'
              onClick={generateExport}
              className='tab-btn'
              title='Export diff as JSON'
            >
              EXPORT
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

      <div className='view-search-bar reveal reveal-5'>
        <input
          type='search'
          placeholder={
            view === 'split' || view === 'unified'
              ? 'Search text in diff...'
              : 'Filter by path...'
          }
          className='path-search full-width'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className='diff-list' role='tabpanel'>
        {view === 'split' || view === 'unified' ? (
          <TextDiffViewer
            left={leftJson}
            right={rightJson}
            mode={view}
            ignoreArrayOrder={ignoreArrayOrder}
            searchQuery={searchQuery}
          />
        ) : (
          <DiffViewer rows={filteredRows} view={view} />
        )}
      </div>
    </section>
  );
}
