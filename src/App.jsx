import React, { useState, useEffect } from 'react';
import DiffInput from './components/DiffInput';
import DiffControls from './components/DiffControls';
import DiffResults from './components/DiffResults';
import {
  parseJson,
  compareValues,
  summarize,
  SAMPLE_A,
  SAMPLE_B,
} from './utils/diffLogic';
import HistorySidebar from './components/HistorySidebar';
import { generateName } from './utils/nameGenerator';

function App() {
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
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('neon-split-history');
    return saved ? JSON.parse(saved) : [];
  });
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const [currentHistoryId, setCurrentHistoryId] = useState(null);

  useEffect(() => {
    localStorage.setItem('neon-split-history', JSON.stringify(history));
  }, [history]);

  // Move handleCompare before useEffect
  const handleCompare = (
    leftInput = leftJson,
    rightInput = rightJson,
    parentId = null,
  ) => {
    const left = parseJson(leftInput, 'JSON A');
    const right = parseJson(rightInput, 'JSON B');

    if (left.error || right.error) {
      setDiffRows([]);
      setTotals({ total: 0, added: 0, removed: 0, changed: 0, unchanged: 0 });
      setStatus({ message: left.error || right.error, tone: 'error' });
      return;
    }

    const rows = [];
    const opts = { compareArraysByValue: ignoreArrayOrder };
    compareValues(left.value, right.value, '$', rows, opts);

    setDiffRows(rows);
    const newTotals = summarize(rows);
    setTotals(newTotals);
    setStatus({
      message: `Comparison complete: ${newTotals.changed} changed, ${newTotals.added} added, ${newTotals.removed} removed.`,
      tone: 'success',
    });

    // Add to history
    if (newTotals.total > 0 || (leftInput && rightInput)) {
      setHistory((prev) => {
        // Check for exact duplicate in entire history to mark connection
        const exactMatch = prev.find(
          (h) => h.leftJson === leftInput && h.rightJson === rightInput,
        );

        if (exactMatch) {
          // If perfectly identical to an existing one, just switch to it
          setCurrentHistoryId(exactMatch.id);
          setStatus({
            message: `Identical to existing log @${exactMatch.id}. Switched view.`,
            tone: 'neutral',
          });
          return prev;
        }

        // Generate unique name
        let newId = generateName();
        // Ensure uniqueness (simple collision check)
        while (prev.some((h) => h.id === newId)) {
          newId = generateName();
        }

        const newEntry = {
          id: newId,
          parentId: parentId || currentHistoryId,
          timestamp: Date.now(),
          leftJson: leftInput,
          rightJson: rightInput,
          totals: newTotals,
          note:
            parentId || currentHistoryId
              ? `Derived from ${parentId || currentHistoryId}`
              : null,
        };

        setCurrentHistoryId(newId);
        return [newEntry, ...prev].slice(0, 50); // Keep last 50
      });
    }
  };

  const handleRestoreHistory = (item) => {
    setLeftJson(item.leftJson);
    setRightJson(item.rightJson);
    // Directly set current ID to the restored item
    setCurrentHistoryId(item.id);

    // Run comparison without saving
    const left = parseJson(item.leftJson, 'JSON A');
    const right = parseJson(item.rightJson, 'JSON B');
    const rows = [];
    const opts = { compareArraysByValue: ignoreArrayOrder };
    compareValues(left.value, right.value, '$', rows, opts);
    setDiffRows(rows);
    setTotals(summarize(rows));
    setStatus({
      message: `Restored comparison from history.`,
      tone: 'neutral',
    });

    setIsHistoryOpen(false);
  };

  const handleClearHistory = () => {
    if (window.confirm('Clear all history?')) {
      setHistory([]);
      setCurrentHistoryId(null);
    }
  };

  const handleToggleStar = (id) => {
    setHistory((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isStarred: !item.isStarred } : item,
      ),
    );
  };

  const handleUpdateTags = (id, newTags) => {
    setHistory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, tags: newTags } : item)),
    );
  };

  // Initialize with samples
  useEffect(() => {
    // Set initial values
    setLeftJson(JSON.stringify(SAMPLE_A, null, 2));
    setRightJson(JSON.stringify(SAMPLE_B, null, 2));

    // Initial comparison
    // We can't call handleCompare immediately because state updates (setLeftJson) are async and handleCompare uses state defaults if not provided.
    // But here we provide explicit values.
    handleCompare(
      JSON.stringify(SAMPLE_A, null, 2),
      JSON.stringify(SAMPLE_B, null, 2),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSwap = () => {
    const temp = leftJson;
    setLeftJson(rightJson);
    setRightJson(temp);
    setStatus({ message: 'Inputs swapped.', tone: 'neutral' });
  };

  const handleLoadSample = () => {
    setLeftJson(JSON.stringify(SAMPLE_A, null, 2));
    setRightJson(JSON.stringify(SAMPLE_B, null, 2));
    setStatus({ message: 'Sample JSON loaded.', tone: 'neutral' });
  };

  const handleClear = () => {
    setLeftJson('');
    setRightJson('');
    setDiffRows([]);
    setTotals({ total: 0, added: 0, removed: 0, changed: 0, unchanged: 0 });
    setStatus({
      message: 'Cleared. Paste two JSON payloads to compare.',
      tone: 'neutral',
    });
  };

  // Helper to determine status border color
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
        onCompare={() => handleCompare()}
        onSwap={handleSwap}
        onLoadSample={handleLoadSample}
        onClear={handleClear}
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

      {/* Render results even if empty to show the "Diff Stream" header if we want, or only when we have data?
          The legacy app always showed the results section but emptied the inner list.
          Let's just render DiffResults and let it handle empty states, but if we have no rows and no totals, maybe hide specific parts?
          Actually DiffResults handles rendering logic itself.
      */}
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
        onClear={handleClearHistory}
        currentId={currentHistoryId}
        onToggleStar={handleToggleStar}
        onUpdateTags={handleUpdateTags}
      />
    </div>
  );
}

export default App;
