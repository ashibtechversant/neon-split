import React from 'react';
import { formatPath, safeValueString } from '../utils/diffLogic';

const StatusChip = ({ type }) => (
  <span className={`table-chip ${type}`}>
    {type.charAt(0).toUpperCase() + type.slice(1)}
  </span>
);

const PathCode = ({ path }) => (
  <code className='path-code'>{formatPath(path)}</code>
);

const ValuePre = ({ value }) => <pre>{safeValueString(value)}</pre>;

const EmptyMessage = () => (
  <div className='empty'>
    No rows match the current filters. Adjust filters or path search.
  </div>
);

const TableView = ({ rows }) => (
  <table className='diff-table'>
    <thead>
      <tr>
        <th>Status</th>
        <th>Path</th>
        <th>JSON A</th>
        <th>JSON B</th>
      </tr>
    </thead>
    <tbody>
      {rows.map((row, i) => (
        <tr key={i} className={`diff-row ${row.type}`}>
          <td>
            <StatusChip type={row.type} />
            {row.note && <span className='status-note'>{row.note}</span>}
          </td>
          <td>
            <PathCode path={row.path} />
          </td>
          <td>
            <ValuePre value={row.left} />
          </td>
          <td>
            <ValuePre value={row.right} />
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

const UnifiedView = ({ rows }) => {
  const getLineContent = (path, value) => {
    // Extract the last segment of the path to resemble a key
    // e.g. $.users[0].name -> "name"
    // e.g. $.users[0] -> "[0]" (or just show value if it's an array item)
    const normalized = formatPath(path);
    const segments = normalized.split(/[.[\]]+/).filter(Boolean);
    const key = segments[segments.length - 1];

    // Construct a pseudo-line.
    // If it looks like an array index, just show the value?
    // Or if it's an object property: "key": value
    // Let's check if the original path ends with ] to determine if it is an array item.

    const valString = safeValueString(value);

    if (path === '$' || path === 'root') return valString;

    // Simple heuristic: if key is numeric, treat as array index
    if (!isNaN(key)) {
      // return `- ${valString}`; // GitHub usually shows context but for just value...
      return valString;
    }

    return `"${key}": ${valString}`;
  };

  return (
    <div className='diff-unified'>
      {rows.map((row, i) => (
        <React.Fragment key={i}>
          {/* Header showing the full path context if needed, or maybe just tooltip? 
               GitHub shows "@@ -1,4 +1,4 @@" chunks. 
               Here we are showing a stream of diffs. 
               Let's show the path as a comment/header if it's complex, 
               or just rely on the key if it's clear. 
               The user wants "along with the key". 
               Let's render the full path as a subtle comment above if it helps, 
               but for the main diff lines, look like code. 
           */}

          {(row.type === 'changed' || row.type === 'removed') && (
            <div className='unified-line removed'>
              <span className='line-marker'>-</span>
              <span className='line-content'>
                {getLineContent(row.path, row.left)}
              </span>
              <span className='line-path-context'>
                {' '}
                // {formatPath(row.path)}
              </span>
            </div>
          )}

          {(row.type === 'changed' || row.type === 'added') && (
            <div className='unified-line added'>
              <span className='line-marker'>+</span>
              <span className='line-content'>
                {getLineContent(row.path, row.right)}
              </span>
              <span className='line-path-context'>
                {' '}
                // {formatPath(row.path)}
              </span>
            </div>
          )}

          {row.type === 'unchanged' && (
            <div className='unified-line unchanged'>
              <span className='line-marker'>&nbsp;</span>
              <span className='line-content'>
                {getLineContent(row.path, row.left)}
              </span>
              <span className='line-path-context'>
                {' '}
                // {formatPath(row.path)}
              </span>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const SideBySideView = ({ rows }) => (
  <table className='diff-table diff-sidebyside'>
    <thead>
      <tr>
        <th>Path</th>
        <th>JSON A</th>
        <th>JSON B</th>
      </tr>
    </thead>
    <tbody>
      {rows.map((row, i) => (
        <tr key={i} className={`diff-row ${row.type}`}>
          <td>
            <StatusChip type={row.type} /> <PathCode path={row.path} />
          </td>
          <td>
            <ValuePre value={row.left} />
          </td>
          <td>
            <ValuePre value={row.right} />
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

const TreeView = ({ rows }) => {
  // Grouping logic isn't strictly necessary for a flat list unless we want to rebuild the tree structure.
  // The original app just sorted by path and used <details> for each item.
  // Let's replicate the original behavior.
  const sortedRows = [...rows].sort((a, b) =>
    formatPath(a.path).localeCompare(formatPath(b.path)),
  );

  return (
    <div className='diff-tree'>
      {sortedRows.map((row, i) => (
        <details key={i} className={`tree-item ${row.type}`}>
          <summary>
            <StatusChip type={row.type} /> <PathCode path={row.path} />
          </summary>
          <div className='tree-body'>
            <pre>{`A: ${safeValueString(row.left)}\nB: ${safeValueString(row.right)}`}</pre>
          </div>
        </details>
      ))}
    </div>
  );
};

const SummaryView = ({ rows }) => (
  <div className='diff-summary-view'>
    {['changed', 'added', 'removed', 'unchanged'].map((type) => {
      const typeRows = rows.filter((r) => r.type === type);
      if (typeRows.length === 0) return null;
      return (
        <details key={type} className={`summary-section ${type}`}>
          <summary>
            <StatusChip type={type} /> ({typeRows.length})
          </summary>
          <div className='summary-section-list'>
            {typeRows.map((row, i) => (
              <div key={i} className='summary-line'>
                <code>{formatPath(row.path)}</code> {safeValueString(row.left)}{' '}
                → {safeValueString(row.right)}
              </div>
            ))}
          </div>
        </details>
      );
    })}
  </div>
);

const CardsView = ({ rows }) => (
  <div className='diff-cards'>
    {rows.map((row, i) => (
      <div key={i} className={`diff-card ${row.type}`}>
        <div className='card-header'>
          <StatusChip type={row.type} />
          <PathCode path={row.path} />
        </div>
        <div className='card-body'>
          <pre>{`A: ${safeValueString(row.left)}\nB: ${safeValueString(row.right)}`}</pre>
        </div>
      </div>
    ))}
  </div>
);

export default function DiffViewer({ rows, view }) {
  if (!rows || rows.length === 0) return <EmptyMessage />;

  switch (view) {
    case 'table':
      return <TableView rows={rows} />;
    case 'unified':
      return <UnifiedView rows={rows} />;
    case 'sidebyside':
      return <SideBySideView rows={rows} />;
    case 'tree':
      return <TreeView rows={rows} />;
    case 'summary':
      return <SummaryView rows={rows} />;
    case 'cards':
      return <CardsView rows={rows} />;
    default:
      return <TableView rows={rows} />;
  }
}
