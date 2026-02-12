import { useState, useEffect, useCallback } from 'react';
import { generateName } from '../../../utils/nameGenerator';

export function useHistory() {
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('neon-split-history');
    return saved ? JSON.parse(saved) : [];
  });
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [currentHistoryId, setCurrentHistoryId] = useState(null);

  useEffect(() => {
    localStorage.setItem('neon-split-history', JSON.stringify(history));
  }, [history]);

  const addToHistory = useCallback((leftJson, rightJson, totals, parentId) => {
    let resultId = null;
    let duplicateFound = false;

    setHistory((prev) => {
      const exactMatch = prev.find(
        (h) => h.leftJson === leftJson && h.rightJson === rightJson,
      );

      if (exactMatch) {
        resultId = exactMatch.id;
        duplicateFound = true;
        return prev;
      }

      let newId = generateName();
      while (prev.some((h) => h.id === newId)) {
        newId = generateName();
      }

      const newEntry = {
        id: newId,
        parentId: parentId || null,
        timestamp: Date.now(),
        leftJson,
        rightJson,
        totals,
        note: parentId ? `Derived from ${parentId}` : null,
      };

      resultId = newId;
      return [newEntry, ...prev].slice(0, 50);
    });

    return { id: resultId, duplicateFound };
  }, []);

  const toggleStar = useCallback((id) => {
    setHistory((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isStarred: !item.isStarred } : item,
      ),
    );
  }, []);

  const updateTags = useCallback((id, newTags) => {
    setHistory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, tags: newTags } : item)),
    );
  }, []);

  const clearHistory = useCallback(() => {
    if (window.confirm('Clear all history?')) {
      setHistory([]);
      setCurrentHistoryId(null);
    }
  }, []);

  return {
    history,
    setHistory,
    isHistoryOpen,
    setIsHistoryOpen,
    currentHistoryId,
    setCurrentHistoryId,
    addToHistory,
    toggleStar,
    updateTags,
    clearHistory,
  };
}
