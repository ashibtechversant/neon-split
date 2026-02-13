import React, { useEffect, useCallback } from 'react';
import { useDiff } from '../hooks/useDiff';
import DiffInput from './DiffInput';
import DiffControls from './DiffControls';
import DiffResults from './DiffResults';
import { SAMPLE_A, SAMPLE_B } from '../utils/diffLogic';
import { useHistory, HistorySidebar } from '../../history';

export default function DiffLayout() {
  const {
    leftJson,
    setLeftJson,
    rightJson,
    setRightJson,
    diffRows,
    totals,
    status,
    setStatus,
    ignoreArrayOrder,
    setIgnoreArrayOrder,
    performCompare,
    clear,
  } = useDiff();
  // ... (rest is same)

  const {
    history,
    isHistoryOpen,
    setIsHistoryOpen,
    currentHistoryId,
    setCurrentHistoryId,
    addToHistory,
    toggleStar,
    updateTags,
    clearHistory,
  } = useHistory('neon-split-history');

  // Initial comparison with samples or history
  useEffect(() => {
    if (history.length > 0) {
      const latest = history[0];
      setLeftJson(latest.leftJson);
      setRightJson(latest.rightJson);
      setCurrentHistoryId(latest.id);
      performCompare(latest.leftJson, latest.rightJson, ignoreArrayOrder);
      setStatus({
        message: 'Restored last session from history.',
        tone: 'neutral',
      });
    } else {
      const leftText = JSON.stringify(SAMPLE_A, null, 2);
      const rightText = JSON.stringify(SAMPLE_B, null, 2);

      setLeftJson(leftText);
      setRightJson(rightText);

      const initialTotals = performCompare(leftText, rightText, false);
      if (initialTotals) {
        addToHistory(leftText, rightText, initialTotals, null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCompareAction = useCallback(
    (parentId = null) => {
      const newTotals = performCompare(leftJson, rightJson, ignoreArrayOrder);

      if (newTotals && (newTotals.total > 0 || (leftJson && rightJson))) {
        const { id, duplicateFound } = addToHistory(
          leftJson,
          rightJson,
          newTotals,
          parentId || currentHistoryId,
        );

        setCurrentHistoryId(id);

        if (duplicateFound) {
          setStatus({
            message: `Identical to existing log @${id}. Switched view.`,
            tone: 'neutral',
          });
        }
      }
    },
    [
      leftJson,
      rightJson,
      ignoreArrayOrder,
      currentHistoryId,
      performCompare,
      addToHistory,
      setCurrentHistoryId,
      setStatus,
    ],
  );

  const handleRestoreHistory = useCallback(
    (item) => {
      setLeftJson(item.leftJson);
      setRightJson(item.rightJson);
      setCurrentHistoryId(item.id);
      performCompare(item.leftJson, item.rightJson, ignoreArrayOrder);
      setStatus({
        message: `Restored comparison from history.`,
        tone: 'neutral',
      });
      setIsHistoryOpen(false);
    },
    [
      setLeftJson,
      setRightJson,
      setCurrentHistoryId,
      performCompare,
      ignoreArrayOrder,
      setStatus,
      setIsHistoryOpen,
    ],
  );

  const handleSwap = useCallback(() => {
    const temp = leftJson;
    setLeftJson(rightJson);
    setRightJson(temp);
    setStatus({ message: 'Inputs swapped.', tone: 'neutral' });
  }, [leftJson, rightJson, setLeftJson, setRightJson, setStatus]);

  const handleLoadSample = useCallback(() => {
    const leftText = JSON.stringify(SAMPLE_A, null, 2);
    const rightText = JSON.stringify(SAMPLE_B, null, 2);
    setLeftJson(leftText);
    setRightJson(rightText);
    setStatus({ message: 'Sample JSON loaded.', tone: 'neutral' });
  }, [setLeftJson, setRightJson, setStatus]);

  const getStatusBorderColor = () => {
    switch (status.tone) {
      case 'error':
        return 'var(--c-removed)';
      case 'success':
        return 'var(--c-added)';
      case 'neutral':
      default:
        return 'var(--c-unchanged)';
    }
  };

  return (
    <>
      <section className='composer reveal reveal-2'>
        <DiffInput
          label='JSON A'
          id='left-json'
          value={leftJson}
          onChange={setLeftJson}
        />
        <DiffInput
          label='JSON B'
          id='right-json'
          value={rightJson}
          onChange={setRightJson}
        />
      </section>

      <DiffControls
        onCompare={() => handleCompareAction()}
        onSwap={handleSwap}
        onLoadSample={handleLoadSample}
        onClear={clear}
        ignoreArrayOrder={ignoreArrayOrder}
        setIgnoreArrayOrder={setIgnoreArrayOrder}
        onToggleHistory={() => setIsHistoryOpen(true)}
      />

      <section
        className='status reveal reveal-4'
        aria-live='polite'
        style={{ borderLeftColor: getStatusBorderColor() }}
      >
        <p id='status-text'>{status.message}</p>
      </section>

      <DiffResults
        rows={diffRows}
        totals={totals}
        leftJson={leftJson}
        rightJson={rightJson}
        ignoreArrayOrder={ignoreArrayOrder}
      />

      <HistorySidebar
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onRestore={handleRestoreHistory}
        onClear={clearHistory}
        currentId={currentHistoryId}
        onToggleStar={toggleStar}
        onUpdateTags={updateTags}
        headerTitle='COMPARISON LOG'
      />
    </>
  );
}
