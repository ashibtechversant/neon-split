import React, { useEffect } from 'react';
import { DiffLayout } from '../features/diff';
import { JsonViewerLayout } from '../features/json-viewer';
import '../styles/globals.css';

function App() {
  const [view, setView] = React.useState(() => {
    try {
      return localStorage.getItem('neon-split-view') || 'diff';
    } catch {
      return 'diff';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('neon-split-view', view);
    } catch (e) {
      console.warn('Failed to save view preference:', e);
    }
  }, [view]);

  return (
    <div className='shell'>
      <div className='bg-mesh'></div>
      <div className='bg-grid'></div>
      <div className='noise-overlay'></div>

      <header className='hero reveal reveal-1'>
        <p className='eyebrow'>RETRO FUTURIST / MAXIMAL MODE</p>
        <h1>NEON SPLIT</h1>
        <div
          className='view-tabs'
          style={{
            display: 'flex',
            gap: '1rem',
            marginTop: '1.5rem',
            justifyContent: 'center',
          }}
        >
          <button
            onClick={() => setView('diff')}
            className={view === 'diff' ? 'btn-main' : 'btn-ghost'}
          >
            DIFF TOOL
          </button>
          <button
            onClick={() => setView('explorer')}
            className={view === 'explorer' ? 'btn-main' : 'btn-ghost'}
          >
            JSON EXPLORER
          </button>
        </div>
        <p></p>
        <p className='subline'>
          {view === 'diff'
            ? 'Compare two JSON payloads with cinematic clarity. Track adds, removes, changes, and untouched values instantly.'
            : 'Explore complex JSON structures with a high-performance, collapsible tree viewer.'}
        </p>
      </header>

      {view === 'diff' ? <DiffLayout /> : <JsonViewerLayout />}
    </div>
  );
}

export default App;
