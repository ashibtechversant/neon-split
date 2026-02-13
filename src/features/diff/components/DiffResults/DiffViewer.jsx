import React from 'react';
import { formatPath, safeValueString } from '../../utils/diffLogic';

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

const TreeView = ({ rows }) => {
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

export default function DiffViewer({ rows, view }) {
  if (!rows || rows.length === 0) return <EmptyMessage />;

  switch (view) {
    case 'table':
      return <TableView rows={rows} />;
    case 'tree':
      return <TreeView rows={rows} />;
    default:
      return <TableView rows={rows} />;
  }
}
