import React, { useMemo } from 'react';
import * as Diff from 'diff';
import './TextDiff.css';

import JSON5 from 'json5'; // Import JSON5 for lenient parsing

const TextDiffViewer = ({
  left,
  right,
  mode = 'split',
  ignoreArrayOrder = false,
}) => {
  // 1. Prepare formatted/canonicalized text
  const { leftText, rightText } = useMemo(() => {
    const canonicalize = (value) => {
      if (value === null || typeof value !== 'object') {
        return value;
      }

      if (Array.isArray(value)) {
        const processedArray = value.map(canonicalize);
        if (ignoreArrayOrder) {
          // Sort array by string representation to ensure consistent order
          return processedArray.sort((a, b) => {
            return JSON.stringify(a).localeCompare(JSON.stringify(b));
          });
        }
        return processedArray;
      }

      // Object: sort keys
      const sortedObj = {};
      Object.keys(value)
        .sort()
        .forEach((key) => {
          sortedObj[key] = canonicalize(value[key]);
        });
      return sortedObj;
    };

    try {
      // Use JSON5 for lenient parsing (handles unquoted keys, trailing commas, etc.)
      const lObj = typeof left === 'string' ? JSON5.parse(left) : left;
      const rObj = typeof right === 'string' ? JSON5.parse(right) : right;
      return {
        leftText: JSON.stringify(canonicalize(lObj), null, 2),
        rightText: JSON.stringify(canonicalize(rObj), null, 2),
      };
      // eslint-disable-next-line no-unused-vars
    } catch (e) {
      // Fallback to raw text if parsing fails even with JSON5
      return {
        leftText:
          typeof left === 'string' ? left : JSON.stringify(left, null, 2),
        rightText:
          typeof right === 'string' ? right : JSON.stringify(right, null, 2),
      };
    }
  }, [left, right, ignoreArrayOrder]);

  // 2. Compute Raw Diff
  const changes = useMemo(() => {
    return Diff.diffLines(leftText, rightText);
  }, [leftText, rightText]);

  // 3. Compute Unified Rows
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
    return rows;
  }, [changes]);

  // 4. Compute Split Rows
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
    return rows;
  }, [changes]);

  // Render View
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
                  {row.content}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Split Mode
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
              {/* Left Side */}
              <td className={`line-num ${row.left ? row.left.type : 'empty'}`}>
                {row.left ? row.left.lineNum : ''}
              </td>
              <td className={`line-code ${row.left ? row.left.type : 'empty'}`}>
                {row.left && (
                  <>
                    <span className='line-marker'>
                      {row.left.type === 'removed' ? '-' : ' '}
                    </span>
                    {row.left.content}
                  </>
                )}
              </td>

              {/* Right Side */}
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
                    {row.right.content}
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
