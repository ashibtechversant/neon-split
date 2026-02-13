import React, { useMemo, useCallback } from 'react';
import * as Diff from 'diff';
import JSON5 from 'json5';
import '../../styles/TextDiff.css';

const TextDiffViewer = ({
  left,
  right,
  mode = 'split',
  ignoreArrayOrder = false,
  searchQuery = '',
}) => {
  const { leftText, rightText } = useMemo(() => {
    const canonicalize = (value) => {
      if (value === null || typeof value !== 'object') {
        return value;
      }

      if (Array.isArray(value)) {
        const processedArray = value.map(canonicalize);
        if (ignoreArrayOrder) {
          return processedArray.sort((a, b) => {
            return JSON.stringify(a).localeCompare(JSON.stringify(b));
          });
        }
        return processedArray;
      }

      const sortedObj = {};
      Object.keys(value)
        .sort()
        .forEach((key) => {
          sortedObj[key] = canonicalize(value[key]);
        });
      return sortedObj;
    };

    try {
      const lObj = typeof left === 'string' ? JSON5.parse(left) : left;
      const rObj = typeof right === 'string' ? JSON5.parse(right) : right;
      return {
        leftText: JSON.stringify(canonicalize(lObj), null, 2),
        rightText: JSON.stringify(canonicalize(rObj), null, 2),
      };
    } catch {
      return {
        leftText:
          typeof left === 'string' ? left : JSON.stringify(left, null, 2),
        rightText:
          typeof right === 'string' ? right : JSON.stringify(right, null, 2),
      };
    }
  }, [left, right, ignoreArrayOrder]);

  const changes = useMemo(() => {
    return Diff.diffLines(leftText, rightText);
  }, [leftText, rightText]);

  const highlightMatch = useCallback(
    (text) => {
      if (!searchQuery.trim()) return text;
      const lowerQuery = searchQuery.toLowerCase();
      const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
      return parts.map((part, i) =>
        part.toLowerCase() === lowerQuery ? (
          <mark key={i} className='search-highlight'>
            {part}
          </mark>
        ) : (
          part
        ),
      );
    },
    [searchQuery],
  );

  const unifiedRows = useMemo(() => {
    const rows = [];
    let leftLineNum = 1;
    let rightLineNum = 1;

    changes.forEach((part) => {
      const lines = part.value.split('\n');
      if (lines[lines.length - 1] === '') lines.pop();

      lines.forEach((line) => {
        if (part.added) {
          rows.push({
            type: 'added',
            leftLine: null,
            rightLine: rightLineNum++,
            content: line,
          });
        } else if (part.removed) {
          rows.push({
            type: 'removed',
            leftLine: leftLineNum++,
            rightLine: null,
            content: line,
          });
        } else {
          rows.push({
            type: 'unchanged',
            leftLine: leftLineNum++,
            rightLine: rightLineNum++,
            content: line,
          });
        }
      });
    });

    if (!searchQuery.trim()) return rows;

    const q = searchQuery.toLowerCase();
    const visible = new Set();
    rows.forEach((row, i) => {
      if (row.content.toLowerCase().includes(q)) {
        visible.add(i);
        const matchIndent = row.content.search(/\S/);
        if (matchIndent !== -1) {
          for (let j = i + 1; j < rows.length; j++) {
            const rowIndent = rows[j].content.search(/\S/);
            if (
              rowIndent > matchIndent ||
              rows[j].content.trim() === '' ||
              /^[\s]*[}\]],?$/.test(rows[j].content)
            ) {
              visible.add(j);
              if (
                rowIndent === matchIndent &&
                /^[\s]*[}\]],?$/.test(rows[j].content)
              )
                break;
            } else if (rowIndent !== -1) break;
          }
          let currentIndent = matchIndent;
          for (let j = i - 1; j >= 0; j--) {
            const rowIndent = rows[j].content.search(/\S/);
            if (rowIndent < currentIndent && rowIndent !== -1) {
              visible.add(j);
              currentIndent = rowIndent;
            }
          }
        }
      }
    });

    return rows.filter((_, i) => visible.has(i));
  }, [changes, searchQuery]);

  const splitRows = useMemo(() => {
    const rows = [];
    let leftLineNum = 1;
    let rightLineNum = 1;

    let i = 0;
    while (i < changes.length) {
      const part = changes[i];
      const lines = part.value.split('\n');
      if (lines[lines.length - 1] === '') lines.pop();

      if (part.added) {
        lines.forEach((line) => {
          rows.push({
            left: null,
            right: { lineNum: rightLineNum++, content: line, type: 'added' },
          });
        });
        i++;
      } else if (part.removed) {
        if (i + 1 < changes.length && changes[i + 1].added) {
          const nextPart = changes[i + 1];
          const nextLines = nextPart.value.split('\n');
          if (nextLines[nextLines.length - 1] === '') nextLines.pop();

          const max = Math.max(lines.length, nextLines.length);
          for (let j = 0; j < max; j++) {
            const leftContent = lines[j];
            const rightContent = nextLines[j];

            rows.push({
              left:
                leftContent !== undefined
                  ? {
                      lineNum: leftLineNum++,
                      content: leftContent,
                      type: 'removed',
                    }
                  : null,
              right:
                rightContent !== undefined
                  ? {
                      lineNum: rightLineNum++,
                      content: rightContent,
                      type: 'added',
                    }
                  : null,
            });
          }
          i += 2;
        } else {
          lines.forEach((line) => {
            rows.push({
              left: { lineNum: leftLineNum++, content: line, type: 'removed' },
              right: null,
            });
          });
          i++;
        }
      } else {
        lines.forEach((line) => {
          rows.push({
            left: { lineNum: leftLineNum++, content: line, type: 'unchanged' },
            right: {
              lineNum: rightLineNum++,
              content: line,
              type: 'unchanged',
            },
          });
        });
        i++;
      }
    }

    if (!searchQuery.trim()) return rows;

    const q = searchQuery.toLowerCase();
    const visible = new Set();
    rows.forEach((row, i) => {
      const leftContent = row.left ? row.left.content : '';
      const rightContent = row.right ? row.right.content : '';
      if (
        leftContent.toLowerCase().includes(q) ||
        rightContent.toLowerCase().includes(q)
      ) {
        visible.add(i);
        const matchContent = leftContent || rightContent;
        const matchIndent = matchContent.search(/\S/);
        if (matchIndent !== -1) {
          for (let j = i + 1; j < rows.length; j++) {
            const rowContent =
              (rows[j].left ? rows[j].left.content : '') ||
              (rows[j].right ? rows[j].right.content : '');
            const rowIndent = rowContent.search(/\S/);
            if (
              rowIndent > matchIndent ||
              rowContent.trim() === '' ||
              /^[\s]*[}\]],?$/.test(rowContent)
            ) {
              visible.add(j);
              if (
                rowIndent === matchIndent &&
                /^[\s]*[}\]],?$/.test(rowContent)
              )
                break;
            } else if (rowIndent !== -1) break;
          }
          let currentIndent = matchIndent;
          for (let j = i - 1; j >= 0; j--) {
            const rowContent =
              (rows[j].left ? rows[j].left.content : '') ||
              (rows[j].right ? rows[j].right.content : '');
            const rowIndent = rowContent.search(/\S/);
            if (rowIndent < currentIndent && rowIndent !== -1) {
              visible.add(j);
              currentIndent = rowIndent;
            }
          }
        }
      }
    });

    return rows.filter((_, i) => visible.has(i));
  }, [changes, searchQuery]);

  if (mode === 'unified') {
    return (
      <div className='text-diff-container unified'>
        <table className='diff-table text-diff-table'>
          <colgroup>
            <col width='40' />
            <col width='40' />
            <col />
          </colgroup>
          <tbody>
            {unifiedRows.map((row, idx) => (
              <tr key={idx} className={`diff-line ${row.type}`}>
                <td className='line-num'>{row.leftLine || ''}</td>
                <td className='line-num'>{row.rightLine || ''}</td>
                <td className='line-code'>
                  <span className='line-marker'>
                    {row.type === 'added'
                      ? '+'
                      : row.type === 'removed'
                        ? '-'
                        : ' '}
                  </span>
                  {highlightMatch(row.content)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className='text-diff-container split'>
      <table className='diff-table text-diff-table split-view'>
        <colgroup>
          <col width='40' />
          <col width='50%' />
          <col width='40' />
          <col width='50%' />
        </colgroup>
        <tbody>
          {splitRows.map((row, idx) => (
            <tr key={idx} className='diff-line-split'>
              <td className={`line-num ${row.left ? row.left.type : 'empty'}`}>
                {row.left ? row.left.lineNum : ''}
              </td>
              <td className={`line-code ${row.left ? row.left.type : 'empty'}`}>
                {row.left && (
                  <>
                    <span className='line-marker'>
                      {row.left.type === 'removed' ? '-' : ' '}
                    </span>
                    {highlightMatch(row.left.content)}
                  </>
                )}
              </td>
              <td
                className={`line-num ${row.right ? row.right.type : 'empty'}`}
              >
                {row.right ? row.right.lineNum : ''}
              </td>
              <td
                className={`line-code ${row.right ? row.right.type : 'empty'}`}
              >
                {row.right && (
                  <>
                    <span className='line-marker'>
                      {row.right.type === 'added' ? '+' : ' '}
                    </span>
                    {highlightMatch(row.right.content)}
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TextDiffViewer;
