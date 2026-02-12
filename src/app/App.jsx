import React, { useEffect, useCallback } from 'react';
import { useDiff } from './features/diff/hooks/useDiff';
import { useHistory } from './features/history/hooks/useHistory';
import DiffInput from './features/diff/components/DiffInput';
import DiffControls from './features/diff/components/DiffControls';
import DiffResults from './features/diff/components/DiffResults';
import HistorySidebar from './features/history/components/HistorySidebar';
import { SAMPLE_A, SAMPLE_B } from './utils/diffLogic';
import '../styles/globals.css';

function App() {
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
  } = useHistory();

  // Initial comparison with samples
  useEffect(() => {
    const leftText = JSON.stringify(SAMPLE_A, null, 2);
    const rightText = JSON.stringify(SAMPLE_B, null, 2);

    setLeftJson(leftText);
    setRightJson(rightText);

    const initialTotals = performCompare(leftText, rightText, false);
    if (initialTotals) {
      addToHistory(leftText, rightText, initialTotals, null);
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
    <div className='shell'>
      <div className='bg-mesh'></div>
      <div className='bg-grid'></div>
      <div className='noise-overlay'></div>

      <header className='hero reveal reveal-1'>
        <p className='eyebrow'>RETRO FUTURIST / MAXIMAL MODE</p>
        <h1>NEON SPLIT</h1>
        <p className='subline'>
          Compare two JSON payloads with cinematic clarity. Track adds, removes,
          changes, and untouched values instantly.
        </p>
      </header>

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
      />
    </div>
  );
}

export default App;
