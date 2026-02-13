import React, { useEffect } from 'react';
import { DiffLayout } from '../features/diff';
import { JsonViewerLayout } from '../features/json-viewer';
import '../styles/globals.css';

import { Split, FileCode } from 'lucide-react';

function App() {
  const [view, setView] = React.useState(() => {
    try {
      return localStorage.getItem('neon-split-view') || 'diff';
    } catch {
      return 'diff';
    }
  });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      document.documentElement.style.setProperty('--mouse-x', `${x}%`);
      document.documentElement.style.setProperty('--mouse-y', `${y}%`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
        <p className='eyebrow'>made with love :)</p>
        <h1>
          <span className='glitch-text' data-text='NEON SPLIT'>
            NEON SPLIT
          </span>
        </h1>
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
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Split size={18} strokeWidth={2.5} />
            <span>DIFF TOOL</span>
          </button>
          <button
            onClick={() => setView('explorer')}
            className={view === 'explorer' ? 'btn-main' : 'btn-ghost'}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <FileCode size={18} strokeWidth={2.5} />
            <span>JSON EXPLORER</span>
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
