import React, { useState, useEffect } from 'react';
import { useJsonViewer } from '../hooks/useJsonViewer';
import { useHistory, HistorySidebar } from '../../history';
import JsonInputPanel from './JsonInputPanel';
import JsonTreePanel from './JsonTreePanel';
import JsonToolbar from './JsonToolbar';
import '../styles/JsonViewer.css';

export default function JsonViewerLayout() {
  const {
    history,
    isHistoryOpen,
    setIsHistoryOpen,
    currentHistoryId,
    addToHistory,
    toggleStar,
    updateTags,
    clearHistory,
    setCurrentHistoryId,
  } = useHistory('neon-split-json-history');

  const {
    jsonInput,
    parsedData,
    error,
    handleInputChange,
    handleFileUpload,
    formatInput,
    clear,
  } = useJsonViewer(history[0]?.leftJson || '');

  const [dragActive, setDragActive] = useState(false);

  // Force sidebar closed on mount
  useEffect(() => {
    setIsHistoryOpen(false);
  }, [setIsHistoryOpen]);

  const handleSaveHistory = () => {
    if (jsonInput && !error) {
      const { id } = addToHistory(jsonInput, null, null, currentHistoryId);
      setCurrentHistoryId(id);
    }
  };

  const handleRestore = (item) => {
    handleInputChange(item.leftJson);
    setCurrentHistoryId(item.id);
    setIsHistoryOpen(false);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleCopy = () => {
    if (parsedData) {
      navigator.clipboard.writeText(JSON.stringify(parsedData, null, 2));
    }
  };

  const fileInputRef = React.useRef(null);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <>
      <section className='reveal reveal-2'>
        <div className='json-viewer-split'>
          <JsonInputPanel
            value={jsonInput}
            onChange={handleInputChange}
            dragActive={dragActive}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          />
          <JsonTreePanel
            parsedData={parsedData}
            error={error}
            jsonInput={jsonInput}
          />
        </div>
      </section>

      <section
        className='controls reveal reveal-3'
        style={{ justifyContent: 'center', marginTop: '0.5rem' }}
      >
        <input
          type='file'
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
          accept='.json,.js,.txt,.ts'
        />
        <button
          onClick={handleFileClick}
          className='btn-ghost'
          title='Load JSON from file'
        >
          Load File
        </button>
        <button
          onClick={formatInput}
          className='btn-ghost'
          disabled={!jsonInput}
          title='Format / Extract JSON'
        >
          Format
        </button>
        <button
          onClick={handleCopy}
          className='btn-ghost'
          disabled={!parsedData}
          title='Copy Parsed Result'
        >
          Copy Result
        </button>
        <button
          onClick={() => setIsHistoryOpen(true)}
          className='btn-ghost'
          title='View History'
        >
          History
        </button>
        <button
          onClick={handleSaveHistory}
          className='btn-ghost'
          disabled={!parsedData}
          title='Save Snapshot'
        >
          Save
        </button>
        <button onClick={clear} className='btn-ghost'>
          Clear
        </button>
      </section>

      <HistorySidebar
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onRestore={handleRestore}
        onClear={clearHistory}
        currentId={currentHistoryId}
        onToggleStar={toggleStar}
        onUpdateTags={updateTags}
        headerTitle='JSON HISTORY'
      />
    </>
  );
}
