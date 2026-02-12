import { useState, useCallback } from 'react';
import { parseJson, compareValues, summarize } from '../../../utils/diffLogic';

export function useDiff() {
  const [leftJson, setLeftJson] = useState('');
  const [rightJson, setRightJson] = useState('');
  const [diffRows, setDiffRows] = useState([]);
  const [totals, setTotals] = useState({
    total: 0,
    added: 0,
    removed: 0,
    changed: 0,
    unchanged: 0,
  });
  const [status, setStatus] = useState({
    message: 'Awaiting comparison input.',
    tone: 'neutral',
  });
  const [ignoreArrayOrder, setIgnoreArrayOrder] = useState(false);

  const performCompare = useCallback((leftInput, rightInput, ignoreOrder) => {
    const left = parseJson(leftInput, 'JSON A');
    const right = parseJson(rightInput, 'JSON B');

    if (left.error || right.error) {
      setDiffRows([]);
      setTotals({ total: 0, added: 0, removed: 0, changed: 0, unchanged: 0 });
      setStatus({ message: left.error || right.error, tone: 'error' });
      return null;
    }

    const rows = [];
    const opts = { compareArraysByValue: ignoreOrder };
    compareValues(left.value, right.value, '$', rows, opts);

    const newTotals = summarize(rows);
    setDiffRows(rows);
    setTotals(newTotals);
    setStatus({
      message: `Comparison complete: ${newTotals.changed} changed, ${newTotals.added} added, ${newTotals.removed} removed.`,
      tone: 'success',
    });

    return newTotals;
  }, []);

  const clear = useCallback(() => {
    setLeftJson('');
    setRightJson('');
    setDiffRows([]);
    setTotals({ total: 0, added: 0, removed: 0, changed: 0, unchanged: 0 });
    setStatus({
      message: 'Cleared. Paste two JSON payloads to compare.',
      tone: 'neutral',
    });
  }, []);

  return {
    leftJson,
    setLeftJson,
    rightJson,
    setRightJson,
    diffRows,
    setDiffRows,
    totals,
    setTotals,
    status,
    setStatus,
    ignoreArrayOrder,
    setIgnoreArrayOrder,
    performCompare,
    clear,
  };
}
